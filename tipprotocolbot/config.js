// bot/config.js
import { config } from 'dotenv';
import { TIP_PROTOCOL_ABI } from './lib/chains/tip-protocol.js';

config();

export const BOT_WALLET_PRIVATE_KEY = process.env.BOT_WALLET_PRIVATE_KEY?.startsWith('0x') 
  ? process.env.BOT_WALLET_PRIVATE_KEY 
  : `0x${process.env.BOT_WALLET_PRIVATE_KEY}`;
export const BOT_WALLET_ADDRESS = process.env.BOT_WALLET_ADDRESS;

export const TWITTER_BOT_ACCESS_TOKEN = process.env.TWITTER_BOT_ACCESS_TOKEN;
export const TWITTER_BOT_ACCESS_TOKEN_SECRET = process.env.TWITTER_BOT_ACCESS_TOKEN_SECRET;
export const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
export const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
export const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

export const TIP_PROTOCOL_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TIP_PROTOCOL_ADDRESS || "0x63B083b69459502BCbF68F16c7C7115B6ec4dDe5";
export const TIP_PROTOCOL_CONTRACT_ABI = TIP_PROTOCOL_ABI;

export const NODE_RPC_URL = process.env.NODE_RPC_URL || 'https://morph-holesky.alt.technology/';
export const BOT_TWITTER_HANDLE = process.env.BOT_TWITTER_HANDLE || "@YourBotHandle";

// Token configuration
export const USDT_TOKEN_ADDRESS = process.env.USDT_TOKEN_ADDRESS; // Add this to your .env
export const DEFAULT_TOKEN_ADDRESS = USDT_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000"; // Use USDT as default instead of ETH
export const DEFAULT_TOKEN_SYMBOL = USDT_TOKEN_ADDRESS ? "USDT" : "ETH";
export const DEFAULT_TOKEN_DECIMALS = USDT_TOKEN_ADDRESS ? 6 : 18; // USDT typically has 6 decimals

// Updated check to include USDT token address
if (!BOT_WALLET_PRIVATE_KEY || !BOT_WALLET_ADDRESS || !TWITTER_BOT_ACCESS_TOKEN || !TWITTER_CONSUMER_KEY || !TWITTER_BEARER_TOKEN || !USDT_TOKEN_ADDRESS) {
  console.error("Missing critical environment variables. Please check your .env file.");
  console.error("Required: BOT_WALLET_PRIVATE_KEY, BOT_WALLET_ADDRESS, TWITTER_BOT_ACCESS_TOKEN, TWITTER_CONSUMER_KEY, TWITTER_BEARER_TOKEN, USDT_TOKEN_ADDRESS");
  process.exit(1);
}