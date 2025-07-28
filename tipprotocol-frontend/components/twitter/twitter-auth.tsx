// components/twitter/twitter-auth.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Twitter, Loader2, Check } from "lucide-react"
import { TwitterAuth } from "@/lib/twitter/auth"
import type { TwitterUser } from "@/lib/twitter/types"

interface TwitterAuthComponentProps {
  onSuccess: (user: TwitterUser) => void
  onError: (error: string) => void
}

export function TwitterAuthComponent({ onSuccess, onError }: TwitterAuthComponentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [existingUser, setExistingUser] = useState<TwitterUser | null>(null)

  useEffect(() => {
    // Check if user already has Twitter auth stored and not expired
    const storedUser = TwitterAuth.getUserData()
    if (storedUser && !TwitterAuth.isAuthExpired()) {
      setExistingUser(storedUser)
    }
  }, [])

  const handleTwitterAuth = () => {
    setIsLoading(true)
    
    // Generate auth URL and open popup
    const authUrl = TwitterAuth.generateAuthUrl()
    const popup = window.open(
      authUrl,
      'twitter-auth',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    )

    if (!popup) {
      setIsLoading(false)
      onError("Popup blocked. Please allow popups and try again.")
      return
    }

    // Listen for messages from the popup
    const messageListener = (event: MessageEvent) => {
      // Ensure message is from our domain
      if (event.origin !== window.location.origin) {
        return
      }

      if (event.data.type === 'TWITTER_AUTH_SUCCESS') {
        const user = event.data.user
        setExistingUser(user)
        setIsLoading(false)
        onSuccess(user)
        
        // Clean up listener
        window.removeEventListener('message', messageListener)
      } else if (event.data.type === 'TWITTER_AUTH_ERROR') {
        setIsLoading(false)
        onError(event.data.error || 'Authentication failed')
        
        // Clean up listener
        window.removeEventListener('message', messageListener)
      }
    }

    // Add message listener
    window.addEventListener('message', messageListener)

    // Check if popup is closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed)
        setIsLoading(false)
        window.removeEventListener('message', messageListener)
        
        // Only show error if we don't have a successful auth
        if (!existingUser) {
          onError("Authentication was cancelled")
        }
      }
    }, 1000)
  }

  const handleUseExisting = () => {
    if (existingUser) {
      onSuccess(existingUser)
    }
  }

  const handleConnectNew = () => {
    // Clear existing data and start fresh
    TwitterAuth.clearUserData()
    setExistingUser(null)
    handleTwitterAuth()
  }

  if (existingUser) {
    return (
      <div className="space-y-4">
        {/* Show existing Twitter connection */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500">
              <img
                src={existingUser.profile_image_url || "/placeholder.svg"}
                alt={existingUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">{existingUser.name}</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">@{existingUser.username}</p>
            </div>
            <div className="ml-auto">
              <Check className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Previously connected Twitter account
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleUseExisting} className="flex-1 bg-green-500 hover:bg-green-600">
            <Check className="w-4 h-4 mr-2" />
            Use This Account
          </Button>
          <Button onClick={handleConnectNew} variant="outline" className="flex-1">
            <Twitter className="w-4 h-4 mr-2" />
            Connect Different Account
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleTwitterAuth}
        disabled={isLoading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting to Twitter...
          </>
        ) : (
          <>
            <Twitter className="w-4 h-4 mr-2" />
            Connect Twitter Account
          </>
        )}
      </Button>
      
      {isLoading && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            A popup window should have opened. If you don't see it, please check if popups are blocked.
          </p>
        </div>
      )}
    </div>
  )
}