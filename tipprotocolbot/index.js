// bot/index.js
import { TipProtocolClient } from './contract-client.js';
import { TwitterBotClient } from './twitter-client-polling.js'; // Updated to use polling client
import { BOT_TWITTER_HANDLE, BOT_WALLET_ADDRESS, DEFAULT_TOKEN_ADDRESS, DEFAULT_TOKEN_SYMBOL, DEFAULT_TOKEN_DECIMALS } from './config.js';
import { parseEther, formatEther } from 'viem';
import { parseUnits, formatUnits } from 'viem';

console.log('Starting Tip Protocol Bot...');

const tipProtocolClient = new TipProtocolClient();
const twitterBotClient = new TwitterBotClient();

// Regex to match the bot's handle at the beginning of a tweet, followed by any whitespace
// The 'i' flag makes it case-insensitive.
const BOT_HANDLE_REGEX = new RegExp(`^${BOT_TWITTER_HANDLE}\\s*`, 'i');

// --- Helper Functions ---

/**
 * Parses a tweet text for commands.
 * Expected format: "@BotHandle command @TargetUser Amount [message]"
 * @param {string} tweetText The full text of the tweet.
 * @returns {Object|null} An object containing the parsed command, target, amount, and message, or null if invalid.
 */
function parseCommand(tweetText) {
  let cleanText = tweetText.replace(BOT_HANDLE_REGEX, '').trim();
  const parts = cleanText.split(/\s+/);
  const command = parts[0]?.toLowerCase();

  if (!command) return null;

  switch (command) {
    case 'tip':
      if (parts.length < 3) return null;

      const targetHandleWithAt = parts[1];
      if (!targetHandleWithAt || !targetHandleWithAt.startsWith('@')) return null;

      const targetHandle = targetHandleWithAt.slice(1);

      let amountString = parts[2];
      let amount;
      try {
        amount = parseTokenAmount(amountString, DEFAULT_TOKEN_DECIMALS);
      } catch (e) {
        console.error("Invalid amount format:", amountString, e);
        return null;
      }

      const message = parts.slice(3).join(' ');
      return { command, targetHandle, amount, message: message || '' };

    case 'help':
    case 'status':
    case 'register':
    case 'balance':
      return { command };

    default:
      return null;
  }
}

function parseTokenAmount(amountString, decimals = DEFAULT_TOKEN_DECIMALS) {
  // Handle dollar amounts
  if (amountString.startsWith('$')) {
    const dollarAmount = parseFloat(amountString.slice(1));
    if (isNaN(dollarAmount) || dollarAmount <= 0) {
      throw new Error("Invalid dollar amount");
    }
    
    // For USDT, $1 = 1 USDT (assuming 1:1 peg)
    if (DEFAULT_TOKEN_SYMBOL === "USDT") {
      return parseUnits(dollarAmount.toString(), decimals);
    } else {
      // For ETH, you'd need price conversion
      throw new Error("Dollar amounts only supported for USDT currently");
    }
  } else {
    // Direct token amount
    return parseUnits(amountString, decimals);
  }
}

function formatTokenAmount(amount, decimals = DEFAULT_TOKEN_DECIMALS, symbol = DEFAULT_TOKEN_SYMBOL) {
  return `${formatUnits(amount, decimals)} ${symbol}`;
}

/**
 * Handles the 'tip' command: resolves addresses, checks authorization and balance, then executes tip.
 * @param {Object} tweet The original tweet object.
 * @param {Object} tipperTwitterUser The Twitter user who sent the tweet.
 * @param {string} creatorTwitterHandle The Twitter handle of the intended recipient (from the tweet).
 * @param {bigint} amount The amount to tip in wei (bigint).
 * @param {string} message The optional message for the tip.
 */
async function handleTipCommand(tweet, tipperTwitterUser, creatorTwitterHandle, amount, message) {
  const tweetId = tweet.id;
  const tipperUsername = tipperTwitterUser.username;
  let replyText = `@${tipperUsername} `;

  try {
    // 1. Resolve Tipper's EVM address
    const tipperEVMAddress = await tipProtocolClient.getUserAddressByTwitterHandle(tipperUsername);
    if (!tipperEVMAddress) {
      replyText += `You are not registered on TipProtocol. Please register on our dApp first.`;
      await twitterBotClient.replyToTweet(tweetId, replyText);
      return;
    }

    // 2. Check authorization
    const isAuthorized = await tipProtocolClient.isOperatorAuthorized(tipperEVMAddress, BOT_WALLET_ADDRESS);
    if (!isAuthorized) {
      replyText += `Bot is not authorized to tip on your behalf. Please authorize ${BOT_TWITTER_HANDLE} on our dApp.`;
      await twitterBotClient.replyToTweet(tweetId, replyText);
      return;
    }

    // 3. Resolve Creator's EVM address
    const creatorEVMAddress = await tipProtocolClient.getUserAddressByTwitterHandle(creatorTwitterHandle);
    if (!creatorEVMAddress) {
      replyText += `Sorry, @${creatorTwitterHandle} is not registered on TipProtocol.`;
      await twitterBotClient.replyToTweet(tweetId, replyText);
      return;
    }

    // 4. Verify creator status
    const creatorProfile = await tipProtocolClient.getUserProfile(creatorEVMAddress);
    if (!creatorProfile || !creatorProfile.isCreator) {
      replyText += `Sorry, @${creatorTwitterHandle} is not registered as a creator on TipProtocol.`;
      await twitterBotClient.replyToTweet(tweetId, replyText);
      return;
    }

    // 5. Check balance (now using USDT instead of ETH)
    const tipperBalance = await tipProtocolClient.getBalance(tipperEVMAddress, DEFAULT_TOKEN_ADDRESS);
    if (tipperBalance < amount) {
      replyText += `Insufficient ${DEFAULT_TOKEN_SYMBOL} balance. You have ${formatTokenAmount(tipperBalance)} but need ${formatTokenAmount(amount)}. Please deposit more on our dApp.`;
      await twitterBotClient.replyToTweet(tweetId, replyText);
      return;
    }

    // 6. Execute tip with USDT
    const txHash = await tipProtocolClient.tipCreatorFor(
      tipperEVMAddress,
      creatorTwitterHandle,
      DEFAULT_TOKEN_ADDRESS, // Now uses USDT address
      amount,
      message
    );

    // 7. Success reply
    replyText += `Successfully tipped ${formatTokenAmount(amount)} to @${creatorTwitterHandle}! Transaction: https://explorer.morphl2.io/tx/${txHash}`;
    await twitterBotClient.replyToTweet(tweetId, replyText);

  } catch (error) {
    console.error(`Error handling tip command for tweet ${tweetId}:`, error);
    let errorMessage = error.message || "An unknown error occurred.";

    // Handle common errors
    if (errorMessage.includes("Insufficient balance")) {
      errorMessage = `You have insufficient ${DEFAULT_TOKEN_SYMBOL} balance in your TipProtocol account. Please deposit more on our dApp.`;
    } else if (errorMessage.includes("Not authorized operator")) {
      errorMessage = `You have not authorized ${BOT_TWITTER_HANDLE} to tip on your behalf. Please authorize it on our dApp.`;
    } else if (errorMessage.includes("Creator not found") || errorMessage.includes("User is not a creator")) {
      errorMessage = `The recipient (@${creatorTwitterHandle}) is not a registered creator on TipProtocol.`;
    }

    replyText += `An error occurred: ${errorMessage}`;
    await twitterBotClient.replyToTweet(tweetId, replyText);
  }
}

/**
 * Updated handleBalanceCommand for USDT
 */
async function handleBalanceCommand(tweetId, tipperTwitterUser) {
  const tipperUsername = tipperTwitterUser.username;
  let replyText = `@${tipperUsername} `;

  try {
    const tipperEVMAddress = await tipProtocolClient.getUserAddressByTwitterHandle(tipperUsername);
    if (!tipperEVMAddress) {
      replyText += `You are not registered on TipProtocol. Please register on our dApp first.`;
      await twitterBotClient.replyToTweet(tweetId, replyText);
      return;
    }

    // Get USDT balance instead of ETH
    const balance = await tipProtocolClient.getBalance(tipperEVMAddress, DEFAULT_TOKEN_ADDRESS);
    const userProfile = await tipProtocolClient.getUserProfile(tipperEVMAddress);
    
    if (userProfile && (userProfile.isTipper || userProfile.isCreator)) {
      replyText += `Your current ${DEFAULT_TOKEN_SYMBOL} balance is **${formatTokenAmount(balance)}**.`;
      if (userProfile.isTipper) {
        replyText += ` You've sent ${userProfile.tipsSent} tips totaling ${formatTokenAmount(userProfile.totalTipped)}.`;
      }
      if (userProfile.isCreator) {
        replyText += ` You've received ${userProfile.tipCountReceived} tips totaling ${formatTokenAmount(userProfile.totalTipsReceived)}.`;
      }
    } else {
      replyText += `Your ${DEFAULT_TOKEN_SYMBOL} balance is ${formatTokenAmount(balance)}.`;
    }
  } catch (error) {
    console.error(`Error handling balance command:`, error);
    replyText += `An error occurred while checking your balance: ${error.message}`;
  }
  
  await twitterBotClient.replyToTweet(tweetId, replyText);
}

/**
 * Updated help command
 */
async function handleHelpCommand(tweetId, authorUsername) {
  const helpMessage = `@${authorUsername} Here are available commands:
  - \`${BOT_TWITTER_HANDLE} tip @CreatorHandle <amount_or_$amount> [message]\` to send a ${DEFAULT_TOKEN_SYMBOL} tip.
  - \`${BOT_TWITTER_HANDLE} balance\` to check your ${DEFAULT_TOKEN_SYMBOL} balance.
  - \`${BOT_TWITTER_HANDLE} register\` to learn how to register.
  Visit our dApp to register, deposit ${DEFAULT_TOKEN_SYMBOL}, or authorize the bot.`;
  await twitterBotClient.replyToTweet(tweetId, helpMessage);
}

// --- Main Bot Logic ---

/**
 * Initiates the bot, setting up the Twitter polling mechanism.
 */
async function startBot() {
    console.log('Bot is starting...');
  
    // Start polling for mentions directed at the bot's Twitter handle
    await twitterBotClient.pollForMentions(async (tweet, author) => {
      // Basic filtering: Ignore tweets from the bot itself to prevent loops
      if (author.id === twitterBotClient.botId || author.username.toLowerCase() === BOT_TWITTER_HANDLE.replace('@', '').toLowerCase()) {
        console.log('Ignoring tweet from self.');
        return;
      }
  
      console.log(`Processing tweet ${tweet.id} from @${author.username}: "${tweet.text}"`);
  
      // Parse the command from the tweet text
      const commandData = parseCommand(tweet.text);
  
      if (!commandData) {
        console.log(`Could not parse command from tweet ${tweet.id}. Replying with help.`);
        await twitterBotClient.replyToTweet(
          tweet.id,
          `@${author.username} I didn't understand that command. Please use the format: \`${BOT_TWITTER_HANDLE} tip @CreatorHandle <amount_in_eth> [message]\` or \`${BOT_TWITTER_HANDLE} help\`.`
        );
        return;
      }
  
      switch (commandData.command) {
        case 'tip':
          if (commandData.targetHandle && commandData.amount !== undefined) {
            console.log(`Detected TIP command: Tipper=@${author.username}, Creator=@${commandData.targetHandle}, Amount=${formatEther(commandData.amount)} ETH`);
            await handleTipCommand(
              tweet,
              author,
              commandData.targetHandle,
              commandData.amount,
              commandData.message || ''
            );
          } else {
            await twitterBotClient.replyToTweet(
              tweet.id,
              `@${author.username} Invalid tip command. Usage: \`${BOT_TWITTER_HANDLE} tip @CreatorHandle <amount_in_eth> [message]\`.`
            );
          }
          break;
  
        case 'help':
          console.log(`Detected HELP command from @${author.username}`);
          await handleHelpCommand(tweet.id, author.username);
          break;
  
        case 'status':
          await twitterBotClient.replyToTweet(
            tweet.id,
            `@${author.username} Bot status: Online and polling every 15 minutes! (More detailed status coming soon!)`
          );
          break;
  
        case 'register':
          await twitterBotClient.replyToTweet(
            tweet.id,
            `@${author.username} To register as a tipper or creator, please visit our dApp at https://tipprotocol.example.com and connect your wallet.` // Replace with your actual dApp URL
          );
          break;
  
        case 'balance':
          console.log(`Detected BALANCE command from @${author.username}`);
          await handleBalanceCommand(tweet.id, author);
          break;
  
        default:
          await twitterBotClient.replyToTweet(
            tweet.id,
            `@${author.username} I didn't understand that command. Type \`${BOT_TWITTER_HANDLE} help\` for available commands.`
          );
          break;
      }
    }, 900000); // Poll every 15 minutes
  
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('Stopping bot...');
      twitterBotClient.stopPolling();
      process.exit(0);
    });
  }
// Start the bot and catch any unhandled fatal errors during startup
startBot().catch(error => {
  console.error('Fatal error starting the bot:', error);
  process.exit(1); // Exit the process if the bot cannot start
});