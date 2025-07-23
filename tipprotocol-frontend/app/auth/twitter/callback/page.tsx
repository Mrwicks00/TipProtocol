"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

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
      return
    }

    if (code && state) {
      // In a real implementation, you would:
      // 1. Verify the state parameter
      // 2. Exchange the code for an access token
      // 3. Fetch user profile from Twitter API

      // Simulate API call to exchange code for user data
      exchangeCodeForUser(code, state)
        .then((user) => {
          window.opener?.postMessage(
            {
              type: "TWITTER_AUTH_SUCCESS",
              user,
            },
            window.location.origin,
          )
        })
        .catch((error) => {
          window.opener?.postMessage(
            {
              type: "TWITTER_AUTH_ERROR",
              error: error.message,
            },
            window.location.origin,
          )
        })
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

async function exchangeCodeForUser(code: string, state: string) {
  // In a real implementation, this would be a server-side API call
  // to exchange the authorization code for an access token and fetch user data

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Mock user data (in real app, this comes from Twitter API)
  return {
    id: "123456789",
    username: "johndoe",
    name: "John Doe",
    profile_image_url: "/placeholder.svg?height=100&width=100&text=JD",
    verified: false,
  }
}
