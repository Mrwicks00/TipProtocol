export interface TwitterUser {
  id: string
  username: string
  name: string
  profile_image_url: string
  verified: boolean
  description?: string
  public_metrics?: {
    followers_count: number
    following_count: number
    tweet_count: number
  }
  created_at?: string
}

export interface TwitterAuthState {
  user: TwitterUser | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

export interface TwitterBotCommand {
  type: "tip" | "balance" | "help"
  recipient?: string
  amount?: string
  token?: string
  message?: string
}

export interface TwitterBotResponse {
  success: boolean
  message: string
  transactionHash?: string
  error?: string
}
