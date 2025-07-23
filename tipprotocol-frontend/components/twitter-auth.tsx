"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Twitter, Check, Loader2 } from "lucide-react"

interface TwitterUser {
  id: string
  username: string
  name: string
  profile_image_url: string
  verified: boolean
}

interface TwitterAuthProps {
  onSuccess: (user: TwitterUser) => void
  onError?: (error: string) => void
}

export function TwitterAuth({ onSuccess, onError }: TwitterAuthProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [user, setUser] = useState<TwitterUser | null>(null)

  const handleTwitterAuth = async () => {
    setIsLoading(true)

    try {
      // In a real implementation, this would:
      // 1. Redirect to Twitter OAuth
      // 2. Handle the callback
      // 3. Exchange code for access token
      // 4. Fetch user profile

      // Simulate Twitter OAuth flow
      const authWindow = window.open(
        "https://twitter.com/oauth/authorize?client_id=tipprotocol&redirect_uri=https://tipprotocol.com/auth/callback&scope=read:user",
        "twitter-auth",
        "width=600,height=600,scrollbars=yes,resizable=yes",
      )

      // Listen for the auth callback (in real app, this would be handled by your backend)
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed)

          // Simulate successful auth response
          setTimeout(() => {
            const mockUser: TwitterUser = {
              id: "123456789",
              username: "johndoe",
              name: "John Doe",
              profile_image_url: "/placeholder.svg?height=100&width=100&text=JD",
              verified: false,
            }

            setUser(mockUser)
            setIsConnected(true)
            setIsLoading(false)
            onSuccess(mockUser)
          }, 1000)
        }
      }, 1000)
    } catch (error) {
      setIsLoading(false)
      onError?.("Failed to connect to Twitter. Please try again.")
    }
  }

  if (isConnected && user) {
    return (
      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.profile_image_url || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-green-900 dark:text-green-100">{user.name}</p>
              {user.verified && <Check className="w-4 h-4 text-blue-500" />}
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">@{user.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <Check className="w-5 h-5" />
          <span className="font-medium">Connected</span>
        </div>
      </div>
    )
  }

  return (
    <Button
      onClick={handleTwitterAuth}
      disabled={isLoading}
      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 neon-glow"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Twitter className="w-5 h-5 mr-2" />
          Authorize with Twitter
        </>
      )}
    </Button>
  )
}
