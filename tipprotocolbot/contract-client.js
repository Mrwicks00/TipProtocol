// bot/contract-client.js
import { createPublicClient, createWalletClient, http, parseEther, isAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { morphHolesky } from './lib/chains/morph-holesky.js'; // Your custom chain config

import {
  BOT_WALLET_PRIVATE_KEY,
  BOT_WALLET_ADDRESS,
  BOT_TWITTER_HANDLE,
  TIP_PROTOCOL_CONTRACT_ADDRESS,
  TIP_PROTOCOL_CONTRACT_ABI,
  NODE_RPC_URL
} from './config.js';

export class TipProtocolClient {
  constructor() {
    this.botAccount = privateKeyToAccount(BOT_WALLET_PRIVATE_KEY);

    this.publicClient = createPublicClient({
      chain: morphHolesky, // Use your Morph Holesky chain
      transport: http(NODE_RPC_URL),
    });

    this.walletClient = createWalletClient({
      account: this.botAccount,
      chain: morphHolesky, // Use your Morph Holesky chain
      transport: http(NODE_RPC_URL),
    });
  }

  /**
   * Calls the tipCreatorFor function on behalf of a tipper.
   * The bot's wallet pays for gas.
   * @param {string} tipperAddress The address of the tipper
   * @param {string} creatorTwitterHandle The Twitter handle of the creator
   * @param {string} tokenAddress The token contract address
   * @param {bigint} amount The amount to tip
   * @param {string} message The tip message
   * @returns {Promise<string>} Transaction hash
   */
  async tipCreatorFor(
    tipperAddress,
    creatorTwitterHandle,
    tokenAddress,
    amount,
    message
  ) {
    try {
      console.log(`Sending tip from ${tipperAddress} to ${creatorTwitterHandle} for ${amount} wei of ${tokenAddress}`);
      const { request } = await this.publicClient.simulateContract({
        account: this.botAccount,
        address: TIP_PROTOCOL_CONTRACT_ADDRESS,
        abi: TIP_PROTOCOL_CONTRACT_ABI,
        functionName: 'tipCreatorFor',
        args: [
          tipperAddress,
          creatorTwitterHandle,
          tokenAddress,
          amount,
          message
        ],
      });

      const hash = await this.walletClient.writeContract(request);
      console.log(`Tip transaction sent. Hash: ${hash}`);
      return hash;
    } catch (error) {
      console.error('Error in tipCreatorFor:', error);
      throw error;
    }
  }

  /**
   * Get unified user profile
   * @param {string} userAddress The user's EVM address
   * @returns {Promise<Object|null>} User profile object or null
   */
  async getUserProfile(userAddress) {
    try {
      const data = await this.publicClient.readContract({
        address: TIP_PROTOCOL_CONTRACT_ADDRESS,
        abi: TIP_PROTOCOL_CONTRACT_ABI,
        functionName: 'getUserProfile',
        args: [userAddress],
      });
      return {
        twitterHandle: data[0],
        isCreator: data[1],
        isTipper: data[2],
        totalTipsReceived: data[3],
        tipCountReceived: data[4],
        totalTipped: data[5],
        tipsSent: data[6],
        registeredAt: data[7],
      };
    } catch (error) {
      console.error(`Error fetching user profile for ${userAddress}:`, error);
      return null;
    }
  }

  /**
   * Get user address by Twitter handle using the unified mapping.
   * @param {string} twitterHandle The Twitter handle (without @)
   * @returns {Promise<string|null>} The user's EVM address or null
   */
  async getUserAddressByTwitterHandle(twitterHandle) {
    try {
      // Your contract has `twitterToUser` mapping
      const address = await this.publicClient.readContract({
        address: TIP_PROTOCOL_CONTRACT_ADDRESS,
        abi: TIP_PROTOCOL_CONTRACT_ABI,
        functionName: 'twitterToUser',
        args: [twitterHandle],
      });
      // Check if address is valid and not zero address
      if (isAddress(address) && address !== '0x0000000000000000000000000000000000000000') {
        return address;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching user address for Twitter handle ${twitterHandle}:`, error);
      return null;
    }
  }

  /**
   * Get creator address and info by Twitter handle (still useful for specific creator checks)
   * This function should ideally leverage `getUserAddressByTwitterHandle` internally
   * and then fetch the profile to check `isCreator`.
   * @param {string} twitterHandle The Twitter handle (without @)
   * @returns {Promise<Object>} Creator info object
   */
  async getCreatorByTwitter(twitterHandle) {
    try {
      const creatorAddress = await this.getUserAddressByTwitterHandle(twitterHandle);
      if (!creatorAddress) return { creatorAddress: null, creator: null };

      const userProfile = await this.getUserProfile(creatorAddress);
      if (userProfile && userProfile.isCreator) {
        return {
          creatorAddress: creatorAddress,
          creator: { // Re-map to the Creator struct shape if needed for backward compat, or just return UserProfile
            twitterHandle: userProfile.twitterHandle,
            isRegistered: true, // If they have a profile and isCreator is true
            totalTipsReceived: userProfile.totalTipsReceived,
            tipCount: userProfile.tipCountReceived,
            registeredAt: userProfile.registeredAt,
          },
        };
      }
      return { creatorAddress: null, creator: null };
    } catch (error) {
      console.error(`Error fetching creator by Twitter handle ${twitterHandle}:`, error);
      return { creatorAddress: null, creator: null };
    }
  }

  /**
   * Checks if an address is registered in any capacity (tipper or creator).
   * @param {string} userAddress The user's EVM address
   * @returns {Promise<boolean>} True if user is registered
   */
  async isRegisteredUser(userAddress) {
    try {
      const data = await this.publicClient.readContract({
        address: TIP_PROTOCOL_CONTRACT_ADDRESS,
        abi: TIP_PROTOCOL_CONTRACT_ABI,
        functionName: 'isRegisteredUser',
        args: [userAddress],
      });
      return data;
    } catch (error) {
      console.error(`Error checking if user ${userAddress} is registered:`, error);
      return false;
    }
  }

  /**
   * Checks if a user has authorized an operator.
   * @param {string} userAddress The user's EVM address
   * @param {string} operatorAddress The operator's EVM address
   * @returns {Promise<boolean>} True if operator is authorized
   */
  async isOperatorAuthorized(userAddress, operatorAddress) {
    try {
      const data = await this.publicClient.readContract({
        address: TIP_PROTOCOL_CONTRACT_ADDRESS,
        abi: TIP_PROTOCOL_CONTRACT_ABI,
        functionName: 'authorizedOperators', // Directly read from public mapping
        args: [userAddress, operatorAddress],
      });
      return data;
    } catch (error) {
      console.error(`Error checking operator authorization for ${userAddress}:`, error);
      return false;
    }
  }

  /**
   * Gets the balance of a token for a user from the contract's internal balance.
   * @param {string} userAddress The user's EVM address
   * @param {string} tokenAddress The token contract address
   * @returns {Promise<bigint>} The user's balance
   */
  async getBalance(userAddress, tokenAddress) {
    try {
      const data = await this.publicClient.readContract({
        address: TIP_PROTOCOL_CONTRACT_ADDRESS,
        abi: TIP_PROTOCOL_CONTRACT_ABI,
        functionName: 'getBalance',
        args: [userAddress, tokenAddress],
      });
      return data;
    } catch (error) {
      console.error(`Error fetching balance for ${userAddress} and token ${tokenAddress}:`, error);
      return 0n;
    }
  }

  /**
   * Get platform fee rate for a specific user (shows discount if applicable)
   * @param {string} userAddress The user's EVM address
   * @returns {Promise<bigint>} The platform fee rate
   */
  async getPlatformFeeRate(userAddress) {
    try {
      const data = await this.publicClient.readContract({
        address: TIP_PROTOCOL_CONTRACT_ADDRESS,
        abi: TIP_PROTOCOL_CONTRACT_ABI,
        functionName: 'getPlatformFeeRate',
        args: [userAddress],
      });
      return data;
    } catch (error) {
      console.error(`Error fetching platform fee rate for ${userAddress}:`, error);
      return 0n; // Return 0 or handle error appropriately
    }
  }
}