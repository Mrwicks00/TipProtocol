"use client"

import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { ConnectWalletButton } from "@/components/connect-wallet-button"

interface NavbarProps {
  isAuthenticated?: boolean
  user?: {
    name: string
    twitterHandle: string
    avatar: string
    walletAddress: string
    isConnected: boolean
  }
}

export function Navbar({ isAuthenticated = false, user }: NavbarProps) {
  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center neon-glow">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">TipProtocol</span>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <div className="hidden md:flex items-center space-x-6">
                  <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/leaderboard" className="text-muted-foreground hover:text-foreground transition-colors">
                    Leaderboard
                  </Link>
                  <Link href="/staking" className="text-muted-foreground hover:text-foreground transition-colors">
                    Staking
                  </Link>
                </div>
                <ThemeToggle />
                <ConnectWalletButton className="bg-green-500 hover:bg-green-600 neon-glow" />
                <UserNav user={user} />
              </>
            ) : (
              <>
                <div className="hidden md:flex items-center space-x-8">
                  <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </a>
                  <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                    How It Works
                  </a>
                  <a href="#stats" className="text-muted-foreground hover:text-foreground transition-colors">
                    Stats
                  </a>
                </div>
                <ThemeToggle />
                <ConnectWalletButton className="bg-green-500 hover:bg-green-600 neon-glow" />
                <Link href="/auth">
                  <Button className="bg-green-500 hover:bg-green-600 text-white neon-glow">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
