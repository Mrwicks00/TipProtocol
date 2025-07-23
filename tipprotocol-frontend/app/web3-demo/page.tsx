"use client"

import { TwitterBotDemo } from "@/components/twitter-bot-demo"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { Navbar } from "@/components/navbar"

export default function Web3DemoPage() {
  const user = {
    name: "John Doe",
    twitterHandle: "@johndoe",
    avatar: "/placeholder.svg?height=100&width=100&text=JD",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    isConnected: true,
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} user={user} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Web3 Integration Demo</h1>
          <p className="text-muted-foreground">
            Test TipProtocol smart contract integration and Twitter bot functionality
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <ConnectWalletButton className="w-full bg-green-500 hover:bg-green-600 neon-glow" />
          </div>
          <TwitterBotDemo />
        </div>
      </div>
    </div>
  )
}
