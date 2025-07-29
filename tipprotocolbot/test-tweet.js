// test-tweet.js
import { TwitterApi } from 'twitter-api-v2';
import { config } from 'dotenv';

config();

const userClient = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_BOT_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_BOT_ACCESS_TOKEN_SECRET,
});

async function testTweetPosting() {
  console.log('Testing bot tweet posting...');
  
  try {
    // Test 1: Get bot's own info
    console.log('\n--- Test 1: Bot Identity ---');
    try {
      const me = await userClient.v2.me({ 'user.fields': ['id', 'username'] });
      console.log('✅ Bot identity:', {
        id: me.data.id,
        username: me.data.username
      });
    } catch (error) {
      console.log('❌ Bot identity failed:', error.data || error.message);
    }
    
    // Test 2: Post a simple tweet
    console.log('\n--- Test 2: Posting Tweet ---');
    const testMessage = `🤖 Bot test tweet - ${new Date().toISOString()}
    
Testing Tip Protocol Bot functionality! 
#TipProtocolBot #Test`;
    
    const tweet = await userClient.v2.tweet(testMessage);
    console.log('✅ Tweet posted successfully!');
    console.log('Tweet ID:', tweet.data.id);
    console.log('Tweet URL:', `https://twitter.com/${process.env.BOT_TWITTER_HANDLE.replace('@', '')}/status/${tweet.data.id}`);
    
    // Test 3: Reply to our own tweet
    console.log('\n--- Test 3: Posting Reply ---');
    const replyMessage = `This is a test reply to verify reply functionality works! 🎉`;
    
    const reply = await userClient.v2.reply(replyMessage, tweet.data.id);
    console.log('✅ Reply posted successfully!');
    console.log('Reply ID:', reply.data.id);
    console.log('Reply URL:', `https://twitter.com/${process.env.BOT_TWITTER_HANDLE.replace('@', '')}/status/${reply.data.id}`);
    
  } catch (error) {
    console.error('❌ Tweet posting failed:', error);
    if (error.data) {
      console.error('Error details:', error.data);
    }
  }
}

testTweetPosting();