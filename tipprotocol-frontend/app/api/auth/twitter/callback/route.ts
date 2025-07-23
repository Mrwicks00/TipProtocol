// app/api/auth/twitter/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'

const TWITTER_CLIENT_ID = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID!
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/twitter/callback`

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json()
    
    // Verify state parameter (you should store this in session/database)
    // For now, we'll skip state verification in this example
    
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: 'challenge' // In production, use proper PKCE
      })
    })
    
    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }
    
    const tokenData = await tokenResponse.json()
    
    // Fetch user profile
    const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=id,username,name,profile_image_url,verified,description,public_metrics,created_at', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    })
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user profile')
    }
    
    const userData = await userResponse.json()
    
    return NextResponse.json({
      success: true,
      user: userData.data
    })
    
  } catch (error) {
    console.error('Twitter OAuth error:', error)
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 400 }
    )
  }
}