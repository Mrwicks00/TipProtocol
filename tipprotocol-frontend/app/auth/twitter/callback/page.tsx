// app/auth/twitter/callback/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, Check, X, Twitter } from "lucide-react"
import { TwitterAuth } from "@/lib/twitter/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type AuthState = 'loading' | 'success' | 'error'

export default function TwitterCallbackPage() {
  const searchParams = useSearchParams()
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const errorParam = searchParams.get("error")

    if (errorParam) {
      setAuthState('error')
      setError(errorParam)
      // Send error to parent window but don't close immediately
      window.opener?.postMessage(
        {
          type: "TWITTER_AUTH_ERROR",
          error: errorParam,
        },
        window.location.origin,
      )
      return
    }

    if (code && state) {
      // Use the TwitterAuth class to handle the code exchange
      TwitterAuth.exchangeCodeForUser(code, state)
        .then((userData) => {
          // Store user data
          TwitterAuth.storeUserData(userData)
          setUser(userData)
          setAuthState('success')
          
          // Send success message to parent window but don't close yet
          window.opener?.postMessage(
            {
              type: "TWITTER_AUTH_SUCCESS",
              user: userData,
            },
            window.location.origin,
          )
        })
        .catch((error) => {
          console.error('Twitter auth error:', error)
          setAuthState('error')
          setError(error.message)
          
          window.opener?.postMessage(
            {
              type: "TWITTER_AUTH_ERROR",
              error: error.message,
            },
            window.location.origin,
          )
        })
    } else {
      // No code or state, something went wrong
      setAuthState('error')
      setError("Missing authorization code or state")
      
      window.opener?.postMessage(
        {
          type: "TWITTER_AUTH_ERROR",
          error: "Missing authorization code or state",
        },
        window.location.origin,
      )
    }
  }, [searchParams])

  const handleContinue = () => {
    // Only close after user confirms
    window.close()
  }

  const handleRetry = () => {
    // Go back to Twitter auth
    window.location.href = TwitterAuth.generateAuthUrl()
  }

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
              <h2 className="text-xl font-semibold mb-2">Connecting to Twitter</h2>
              <p className="text-muted-foreground">Please wait while we complete your authentication...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (authState === 'success' && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-center">Twitter Connected!</CardTitle>
            <CardDescription className="text-center">
              Your Twitter account has been successfully connected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Show connected Twitter profile */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500">
                  <img
                    src={user.profile_image_url || "/placeholder.svg"}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">{user.name}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">@{user.username}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Twitter className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900 dark:text-green-100">Ready to proceed</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                You can now continue with your registration. This window will close and you'll return to the setup process.
              </p>
            </div>

            <Button onClick={handleContinue} className="w-full bg-green-500 hover:bg-green-600">
              Continue with Registration
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (authState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-center">Authentication Failed</CardTitle>
            <CardDescription className="text-center">
              There was a problem connecting your Twitter account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>Error:</strong> {error}
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleRetry} variant="outline" className="flex-1">
                Try Again
              </Button>
              <Button onClick={() => window.close()} variant="secondary" className="flex-1">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}