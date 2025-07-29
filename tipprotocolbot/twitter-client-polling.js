// bot/twitter-client-polling.js
import { TwitterApi } from 'twitter-api-v2';
import { TWITTER_BEARER_TOKEN, TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, TWITTER_BOT_ACCESS_TOKEN, TWITTER_BOT_ACCESS_TOKEN_SECRET, BOT_TWITTER_HANDLE } from './config.js';

export class TwitterBotClient {
  constructor() {
    this.appClient = new TwitterApi(TWITTER_BEARER_TOKEN);
    this.userClient = new TwitterApi({
      appKey: TWITTER_CONSUMER_KEY,
      appSecret: TWITTER_CONSUMER_SECRET,
      accessToken: TWITTER_BOT_ACCESS_TOKEN,
      accessSecret: TWITTER_BOT_ACCESS_TOKEN_SECRET,
    });
    this.botId = null;
    this.botUsername = BOT_TWITTER_HANDLE.replace('@', '');
    this.lastTweetId = null;
    this.pollingInterval = null;
  }

  async initBotUser() {
    try {
      const me = await this.userClient.v2.me({ 'user.fields': ['id', 'username'] });
      this.botId = me.data.id;
      this.botUsername = me.data.username;
      console.log(`Bot initialized. ID: ${this.botId}, Username: @${this.botUsername}`);
    } catch (error) {
      console.error('Failed to initialize bot user:', {
        message: error.message,
        code: error.code,
        data: error.data
      });
      throw new Error('Cannot initialize bot user. Check OAuth 1.0a credentials and rate limits.');
    }
  }

  async pollForMentions(onMention, intervalMs = 900000) { // 15 minutes
    console.log(`Starting polling for mentions every ${intervalMs/1000} seconds...`);

    if (!this.botId) {
      await this.initBotUser();
    }

    const poll = async () => {
      try {
        const query = `to:${this.botUsername} -is:retweet`;
        const searchOptions = {
          max_results: 10,
          'tweet.fields': ['author_id', 'created_at', 'text', 'in_reply_to_user_id'],
          'user.fields': ['username', 'name', 'profile_image_url'],
          expansions: ['author_id'],
        };

        if (this.lastTweetId) {
          searchOptions.since_id = this.lastTweetId;
        }

        const response = await this.appClient.v2.search(query, searchOptions);

        if (response.data?.data) {
          const tweets = response.data.data.reverse();
          for (const tweet of tweets) {
            if (tweet.author_id === this.botId) continue;

            const author = response.data.includes?.users?.find(
              user => user.id === tweet.author_id
            );

            if (author) {
              console.log(`Found mention from @${author.username}: "${tweet.text}"`);
              await onMention(tweet, author);
            }

            this.lastTweetId = tweet.id;
          }
        } else {
          console.log('No new mentions found.');
        }
      } catch (error) {
        console.error('Error polling for mentions:', {
          message: error.message,
          code: error.code,
          data: error.data,
          rateLimit: error.rateLimit
        });

        if (error.code === 429) {
          const resetTime = error.rateLimit?.reset * 1000 || Date.now() + 15 * 60 * 1000;
          const waitMs = Math.max(resetTime - Date.now(), 0) + 1000; // Add 1s buffer
          console.warn(`Rate limit exceeded. Pausing polling for ${waitMs/1000} seconds until ${new Date(resetTime).toISOString()}`);
          clearInterval(this.pollingInterval);
          setTimeout(() => {
            console.log('Resuming polling...');
            this.pollingInterval = setInterval(poll, intervalMs);
            poll(); // Run immediately after resuming
          }, waitMs);
        }
      }
    };

    await poll();
    this.pollingInterval = setInterval(poll, intervalMs);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('Polling stopped.');
    }
  }

  async getUserByUsername(username) {
    try {
      const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
      const user = await this.userClient.v2.userByUsername(cleanUsername, {
        'user.fields': ['id', 'username', 'name', 'profile_image_url']
      });
      return user.data;
    } catch (error) {
      console.error(`Error fetching user @${username}:`, {
        message: error.message,
        code: error.code,
        data: error.data
      });
      return null;
    }
  }

  async replyToTweet(tweetId, text) {
    try {
      await this.userClient.v2.tweet({
        text,
        reply: { in_reply_to_tweet_id: tweetId }
      });
      console.log(`Replied to tweet ${tweetId}: "${text}"`);
    } catch (error) {
      console.error(`Error replying to tweet ${tweetId}:`, {
        message: error.message,
        code: error.code,
        data: error.data
      });
      throw error;
    }
  }
}