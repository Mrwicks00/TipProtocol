// app/api/verify-twitter-handle/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 5; // 5 requests per minute per IP
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      );
    }

    const { handle } = await request.json();
    
    if (!handle || typeof handle !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid handle provided' },
        { status: 400 }
      );
    }

    // Clean the handle
    const cleanHandle = handle.replace('@', '').trim().toLowerCase();
    
    // Basic format validation
    if (!/^[a-zA-Z0-9_]+$/.test(cleanHandle) || cleanHandle.length < 1 || cleanHandle.length > 15) {
      return NextResponse.json({
        success: false,
        error: 'Invalid Twitter handle format',
        available: false
      });
    }

    // Check if handle exists on Twitter (using Twitter API v2)
    // Note: You'll need Twitter API Bearer Token for this
    const twitterBearerToken = process.env.TWITTER_BEARER_TOKEN;
    
    if (!twitterBearerToken) {
      // If no Twitter API access, just do basic validation
      console.warn('No Twitter Bearer Token - skipping existence check');
      return NextResponse.json({
        success: true,
        available: true,
        verified: false,
        message: 'Handle format is valid (existence not verified)'
      });
    }

    try {
      const twitterResponse = await fetch(`https://api.twitter.com/2/users/by/username/${cleanHandle}`, {
        headers: {
          'Authorization': `Bearer ${twitterBearerToken}`
        }
      });

      if (twitterResponse.status === 404) {
        // Handle doesn't exist on Twitter
        return NextResponse.json({
          success: true,
          available: false,
          verified: false,
          message: 'This Twitter handle does not exist'
        });
      }

      if (!twitterResponse.ok) {
        throw new Error('Twitter API error');
      }

      const userData = await twitterResponse.json();
      
      // Handle exists on Twitter
      return NextResponse.json({
        success: true,
        available: true,
        verified: true,
        user: {
          id: userData.data?.id,
          username: userData.data?.username,
          name: userData.data?.name,
          verified: userData.data?.verified || false
        },
        message: 'Twitter handle exists and is available for registration'
      });

    } catch (twitterError) {
      console.error('Twitter API error:', twitterError);
      
      // Fall back to basic validation if Twitter API fails
      return NextResponse.json({
        success: true,
        available: true,
        verified: false,
        message: 'Handle format is valid (Twitter verification failed)'
      });
    }

  } catch (error) {
    console.error('Handle verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}

// Alternative verification method using web scraping (less reliable, use as fallback)
async function verifyHandleViaScraping(handle: string): Promise<boolean> {
  try {
    // This is a basic example - Twitter blocks most scraping attempts
    // You might need to use services like ScrapingBee, Apify, etc.
    const response = await fetch(`https://twitter.com/${handle}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HandleVerifier/1.0)',
      },
    });
    
    // If we get a 200 status and the response contains certain Twitter elements,
    // the handle likely exists
    if (response.ok) {
      const text = await response.text();
      return text.includes('twitter:creator') || text.includes('profile');
    }
    
    return false;
  } catch {
    return false;
  }
}