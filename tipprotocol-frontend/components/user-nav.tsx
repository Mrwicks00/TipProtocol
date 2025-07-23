"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Settings, LogOut, User, Wallet, Trophy, Home, Check } from "lucide-react"
import Link from "next/link"
import { TwitterAuth } from "@/lib/twitter/auth"
import { TwitterUtils } from "@/lib/twitter/utils"

interface UserNavProps {
  user: {
    name: string
    twitterHandle: string
    avatar: string
    walletAddress: string
    isConnected: boolean
  }
}

export function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Get Twitter user data from storage
  const twitterUser = TwitterAuth.getUserData()

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Use Twitter profile data if available, fallback to props
  const profileImage = twitterUser ? TwitterUtils.getProfileImageUrl(twitterUser, "bigger") : user.avatar
  const displayName = twitterUser?.name || user.name
  const twitterHandle = twitterUser ? `@${twitterUser.username}` : user.twitterHandle
  const isVerified = twitterUser ? TwitterUtils.isVerified(twitterUser) : false

  return (
    <div className="flex items-center space-x-4">
      {/* Wallet Address Display */}
      <div className="hidden md:flex items-center space-x-2 bg-muted/50 px-3 py-2 rounded-lg border border-border">
        <Wallet className="w-4 h-4 text-green-600" />
        <span className="text-sm font-mono text-muted-foreground">{truncateAddress(user.walletAddress)}</span>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      </div>

      {/* User Profile Dropdown */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border-2 border-green-500/20 hover:border-green-500/50 transition-colors">
              <AvatarImage src={profileImage || "/placeholder.svg"} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white">
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 p-4" align="end" forceMount>
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="h-12 w-12 border-2 border-green-500/20">
              <AvatarImage src={profileImage || "/placeholder.svg"} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white">
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{displayName}</p>
                {isVerified && <Check className="w-4 h-4 text-blue-500" />}
              </div>
              <p className="text-xs text-muted-foreground">{twitterHandle}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                >
                  Connected
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">{truncateAddress(user.walletAddress)}</span>
              </div>
            </div>
          </div>

          {/* Twitter Profile Stats (if available) */}
          {twitterUser?.public_metrics && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Followers:</span>
                  <span className="ml-1 font-medium">
                    {TwitterUtils.formatFollowerCount(twitterUser.public_metrics.followers_count)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Following:</span>
                  <span className="ml-1 font-medium">
                    {TwitterUtils.formatFollowerCount(twitterUser.public_metrics.following_count)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/" className="flex items-center cursor-pointer">
              <Home className="mr-2 h-4 w-4" />
              <span>Homepage</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex items-center cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/leaderboard" className="flex items-center cursor-pointer">
              <Trophy className="mr-2 h-4 w-4" />
              <span>Leaderboard</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="text-red-600 dark:text-red-400 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
