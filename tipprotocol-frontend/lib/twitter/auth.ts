"use client"

import type { TwitterUser } from "./types"

export class TwitterAuth {
  private static readonly CLIENT_ID = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || "demo-client-id"
  private static readonly REDIRECT_URI =
    `${typeof window !== "undefined" ? window.location.origin : ""}/auth/twitter/callback`

  // Check if we're in demo/mock mode
  private static isDemoMode(): boolean {
    return this.CLIENT_ID === "demo-client-id"
  }

  static generateAuthUrl(): string {
    // If in demo mode, return a mock URL that goes to callback with mock parameters
    if (this.isDemoMode()) {
      const mockState = this.generateRandomState()
      if (typeof window !== "undefined") {
        localStorage.setItem("twitter_oauth_state", mockState)
      }
      return `${this.REDIRECT_URI}?code=mock-auth-code&state=${mockState}`
    }

    // Real Twitter OAuth flow
    const authUrl = new URL("https://twitter.com/i/oauth2/authorize")
    const state = this.generateRandomState()

    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("client_id", this.CLIENT_ID)
    authUrl.searchParams.set("redirect_uri", this.REDIRECT_URI)
    authUrl.searchParams.set("scope", "tweet.read users.read offline.access")
    authUrl.searchParams.set("state", state)
    authUrl.searchParams.set("code_challenge", "challenge")
    authUrl.searchParams.set("code_challenge_method", "plain")

    // Store state for verification
    if (typeof window !== "undefined") {
      localStorage.setItem("twitter_oauth_state", state)
    }

    return authUrl.toString()
  }

  static async exchangeCodeForUser(code: string, state: string): Promise<TwitterUser> {
    // Verify state
    if (typeof window !== "undefined") {
      const storedState = localStorage.getItem("twitter_oauth_state")
      if (storedState !== state) {
        throw new Error("Invalid state parameter")
      }
      localStorage.removeItem("twitter_oauth_state")
    }

    // In demo mode or if code is mock, return mock user
    if (this.isDemoMode() || code === "mock-auth-code") {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock user data with realistic Twitter profile info
      const mockUsers = [
        {
          id: "123456789",
          username: "johndoe",
          name: "John Doe",
          profile_image_url: "/placeholder.svg?height=100&width=100&text=JD",
          verified: false,
          description: "Web3 enthusiast and content creator. Building the future of decentralized tipping! 🚀",
          public_metrics: {
            followers_count: 1250,
            following_count: 890,
            tweet_count: 3420,
          },
          created_at: "2019-03-15T10:30:00.000Z",
        },
        {
          id: "987654321",
          username: "cryptoqueen",
          name: "Sarah Chen",
          profile_image_url: "/placeholder.svg?height=100&width=100&text=SC",
          verified: true,
          description: "Blockchain developer | DeFi researcher | Coffee addict ☕",
          public_metrics: {
            followers_count: 5670,
            following_count: 1200,
            tweet_count: 8900,
          },
          created_at: "2018-07-22T14:20:00.000Z",
        },
      ]

      // Return a random mock user for demo purposes
      return mockUsers[Math.floor(Math.random() * mockUsers.length)]
    }

    // Real implementation would be a server-side API call
    // to exchange the authorization code for an access token and fetch user data
    throw new Error("Real Twitter OAuth not implemented - server-side integration required")
  }

  static storeUserData(user: TwitterUser): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("twitter_user", JSON.stringify(user))
      localStorage.setItem("twitter_auth_timestamp", Date.now().toString())
    }
  }

  static getUserData(): TwitterUser | null {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("twitter_user")
      return stored ? JSON.parse(stored) : null
    }
    return null
  }

  static clearUserData(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("twitter_user")
      localStorage.removeItem("twitter_auth_timestamp")
      localStorage.removeItem("twitter_oauth_state")
    }
  }

  static isAuthExpired(): boolean {
    if (typeof window !== "undefined") {
      const timestamp = localStorage.getItem("twitter_auth_timestamp")
      if (!timestamp) return true

      const authTime = Number.parseInt(timestamp)
      const now = Date.now()
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

      return now - authTime > SEVEN_DAYS
    }
    return true
  }

  private static generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }
}