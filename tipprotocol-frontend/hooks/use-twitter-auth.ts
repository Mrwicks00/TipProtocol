"use client"

import { useState, useCallback, useEffect } from "react"
import type { TwitterUser, TwitterAuthState } from "@/lib/twitter/types"
import { TwitterAuth } from "@/lib/twitter/auth"

export function useTwitterAuth() {
  const [state, setState] = useState<TwitterAuthState>({
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
  })

  // Check for existing auth on mount
  useEffect(() => {
    const existingUser = TwitterAuth.getUserData()
    if (existingUser && !TwitterAuth.isAuthExpired()) {
      setState({
        user: existingUser,
        isLoading: false,
        error: null,
        isAuthenticated: true,
      })
    }
  }, [])

  const authenticate = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const authUrl = TwitterAuth.generateAuthUrl()

      const authWindow = window.open(authUrl, "twitter-auth", "width=600,height=600,scrollbars=yes,resizable=yes")

      // Listen for auth completion
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return

        if (event.data.type === "TWITTER_AUTH_SUCCESS") {
          const user: TwitterUser = event.data.user
          TwitterAuth.storeUserData(user)

          setState({
            user,
            isLoading: false,
            error: null,
            isAuthenticated: true,
          })
          authWindow?.close()
        } else if (event.data.type === "TWITTER_AUTH_ERROR") {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: event.data.error,
          }))
          authWindow?.close()
        }
      }

      window.addEventListener("message", handleMessage)

      // Cleanup on window close
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed)
          window.removeEventListener("message", handleMessage)
          setState((prev) => ({ ...prev, isLoading: false }))
        }
      }, 1000)
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to authenticate with Twitter",
      }))
    }
  }, [])

  const logout = useCallback(() => {
    TwitterAuth.clearUserData()
    setState({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
    })
  }, [])

  const refreshUser = useCallback(async () => {
    const user = TwitterAuth.getUserData()
    if (user && !TwitterAuth.isAuthExpired()) {
      setState((prev) => ({ ...prev, user, isAuthenticated: true }))
    } else {
      logout()
    }
  }, [logout])

  return {
    ...state,
    authenticate,
    logout,
    refreshUser,
  }
}
