"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Twitter, Check, Loader2, ExternalLink, Users, Calendar } from "lucide-react"
import { TwitterAuth } from "@/lib/twitter/auth"
import { TwitterUtils } from "@/lib/twitter/utils"
import type { TwitterUser } from "@/lib/twitter/types"

interface TwitterAuthComponentProps {
  onSuccess: (user: TwitterUser) => void
  onError?: (error: string) => void
}

export function TwitterAuthComponent({ onSuccess, onError }: TwitterAuthComponentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [user, setUser] = useState<TwitterUser | null>(null)

  const handleTwitterAuth = async () => {
    setIsLoading(true)

    try {
      const authUrl = TwitterAuth.generateAuthUrl()

      const authWindow = window.open(authUrl, "twitter-auth", "width=600,height=600,scrollbars=yes,resizable=yes")

      // Listen for the auth callback
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed)
          setIsLoading(false)
        }
      }, 1000)

      // Listen for auth completion message
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return

        if (event.data.type === "TWITTER_AUTH_SUCCESS") {
          const userData: TwitterUser = event.data.user
          setUser(userData)
          setIsConnected(true)
          setIsLoading(false)

          // Store user data
          TwitterAuth.storeUserData(userData)

          authWindow?.close()
          clearInterval(checkClosed)
          onSuccess(userData)
        } else if (event.data.type === "TWITTER_AUTH_ERROR") {
          setIsLoading(false)
          authWindow?.close()
          clearInterval(checkClosed)
          onError?.(event.data.error)
        }
      }

      window.addEventListener("message", handleMessage)

      // Cleanup
      setTimeout(() => {
        window.removeEventListener("message", handleMessage)
        if (!authWindow?.closed) {
          authWindow?.close()
          setIsLoading(false)
        }
      }, 300000) // 5 minute timeout
    } catch (error) {
      setIsLoading(false)
      onError?.("Failed to connect to Twitter. Please try again.")
    }
  }

  if (isConnected && user) {
    return (
      <div className="space-y-4">
        {/* Connected State - Rich Profile Display */}
        <div className="flex items-start gap-4 p-6 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
          <Avatar className="h-16 w-16 border-2 border-green-500">
            <AvatarImage src={TwitterUtils.getProfileImageUrl(user, "bigger") || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-lg">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-green-900 dark:text-green-100 truncate">{user.name}</h3>
              {TwitterUtils.isVerified(user) && (
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  <Check className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            <p className="text-sm text-green-700 dark:text-green-300 mb-2">@{user.username}</p>

            {user.description && (
              <p className="text-sm text-green-600 dark:text-green-400 mb-3 line-clamp-2">
                {TwitterUtils.truncateDescription(user.description, 120)}
              </p>
            )}

            {user.public_metrics && (
              <div className="flex items-center gap-4 text-xs text-green-600 dark:text-green-400">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{TwitterUtils.formatFollowerCount(user.public_metrics.followers_count)} followers</span>
                </div>
                {user.created_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Joined {TwitterUtils.getAccountAge(user.created_at)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Check className="w-5 h-5" />
              <span className="font-medium text-sm">Connected</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(TwitterUtils.generateTwitterUrl(user.username), "_blank")}
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            🎉 Twitter account connected successfully! Your profile information will be used throughout TipProtocol.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleTwitterAuth}
        disabled={isLoading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 neon-glow"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Connecting to Twitter...
          </>
        ) : (
          <>
            <Twitter className="w-5 h-5 mr-2" />
            Authorize with Twitter
          </>
        )}
      </Button>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          We'll securely connect to your Twitter account to enable bot integration and display your profile.
        </p>
      </div>
    </div>
  )
}
