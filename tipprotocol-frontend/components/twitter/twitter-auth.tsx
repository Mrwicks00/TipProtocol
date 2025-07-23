// components/twitter/twitter-auth.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Twitter, Loader2, Check, AlertCircle } from "lucide-react"
import { TwitterAuth } from "@/lib/twitter/auth"
import type { TwitterUser } from "@/lib/twitter/types"

interface TwitterAuthComponentProps {
  onSuccess: (user: TwitterUser) => void
  onError: (error: string) => void
}

export function TwitterAuthComponent({ onSuccess, onError }: TwitterAuthComponentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<TwitterUser | null>(null)

  useEffect(() => {
    // Check if user is already authenticated
    const existingUser = TwitterAuth.getUserData()
    if (existingUser && !TwitterAuth.isAuthExpired()) {
      setUser(existingUser)
      onSuccess(existingUser)
    }

    // Check if we just returned from Twitter auth
    // This happens when user comes back from Twitter's auth page
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const error = urlParams.get('error')

    if (error) {
      onError(error)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
      return
    }

    if (code && state) {
      setIsLoading(true)
      
      TwitterAuth.exchangeCodeForUser(code, state)
        .then((user) => {
          TwitterAuth.storeUserData(user)
          setUser(user)
          onSuccess(user)
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname)
        })
        .catch((error) => {
          console.error('Twitter auth error:', error)
          onError(error.message)
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [onSuccess, onError])

  const handleAuth = () => {
    setIsLoading(true)
    
    try {
      // Generate auth URL and redirect directly (no popup!)
      const authUrl = TwitterAuth.generateAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      console.error('Failed to generate auth URL:', error)
      onError('Failed to start authentication')
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    TwitterAuth.clearUserData()
    setUser(null)
  }

  // If user is already connected, show success state
  if (user) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <img
                src={user.profile_image_url || "/placeholder.svg"}
                alt={user.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="font-medium text-green-900 dark:text-green-100">
                {user.name} (@{user.username})
              </span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Twitter account connected successfully!
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={handleDisconnect}
          className="w-full"
        >
          Disconnect Twitter Account
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleAuth}
        disabled={isLoading}
        className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Connecting to Twitter...
          </>
        ) : (
          <>
            <Twitter className="w-4 h-4 mr-2" />
            Continue with Twitter
          </>
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          You'll be redirected to Twitter to authorize this app
        </p>
      </div>
    </div>
  )
}