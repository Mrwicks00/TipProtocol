// app/auth/twitter/callback/page.tsx
"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { TwitterAuth } from "@/lib/twitter/auth"

export default function TwitterCallbackPage() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      // Send error to parent window
      window.opener?.postMessage(
        {
          type: "TWITTER_AUTH_ERROR",
          error: error,
        },
        window.location.origin,
      )
      window.close()
      return
    }

    if (code && state) {
      // Use the TwitterAuth class to handle the code exchange
      TwitterAuth.exchangeCodeForUser(code, state)
        .then((user) => {
          // Store user data
          TwitterAuth.storeUserData(user)
          
          // Send success message to parent window
          window.opener?.postMessage(
            {
              type: "TWITTER_AUTH_SUCCESS",
              user,
            },
            window.location.origin,
          )
          
          // Close the popup
          window.close()
        })
        .catch((error) => {
          console.error('Twitter auth error:', error)
          window.opener?.postMessage(
            {
              type: "TWITTER_AUTH_ERROR",
              error: error.message,
            },
            window.location.origin,
          )
          window.close()
        })
    } else {
      // No code or state, something went wrong
      window.opener?.postMessage(
        {
          type: "TWITTER_AUTH_ERROR",
          error: "Missing authorization code or state",
        },
        window.location.origin,
      )
      window.close()
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
        <p className="text-muted-foreground">Completing Twitter authentication...</p>
      </div>
    </div>
  )
}