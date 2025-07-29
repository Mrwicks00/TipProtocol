// test-twitter.js
import { TwitterApi } from 'twitter-api-v2';
import { config } from 'dotenv';

config();

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

async function testTwitterAccess() {
  const client = new TwitterApi(TWITTER_BEARER_TOKEN);
  
  console.log('Testing Twitter API access...');
  console.log('Bearer Token:', TWITTER_BEARER_TOKEN?.substring(0, 20) + '...');
  
  try {
    // Test 1: Simple user lookup (should work with Basic access)
    console.log('\n--- Test 1: User Lookup ---');
    const user = await client.v2.userByUsername('twitter');
    console.log('✅ User lookup successful:', user.data.username);
    
  } catch (error) {
    console.log('❌ User lookup failed:', error.data || error.message);
  }

  try {
    // Test 2: Check stream rules (this is what's failing)
    console.log('\n--- Test 2: Stream Rules ---');
    const rules = await client.v2.streamRules();
    console.log('✅ Stream rules access successful:', rules);
    
  } catch (error) {
    console.log('❌ Stream rules failed:', error.data || error.message);
    console.log('Full error:', error);
  }

  try {
    // Test 3: Recent search (alternative to streaming)
    console.log('\n--- Test 3: Recent Search ---');
    const tweets = await client.v2.search('hello', { max_results: 10 });
    console.log('✅ Search successful, found', tweets.data.data?.length, 'tweets');
    
  } catch (error) {
    console.log('❌ Search failed:', error.data || error.message);
  }
}

testTwitterAccess();