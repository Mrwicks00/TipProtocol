"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Wallet, Twitter, Shield, ArrowRight, Check, AlertCircle, Loader2, Bot, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { TwitterAuthComponent } from "@/components/twitter/twitter-auth"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { useTipProtocol, useUserProfile } from "@/hooks/use-tip-protocol"
import { morphHolesky } from "@/lib/chains/morph-holesky"
import type { TwitterUser } from "@/lib/twitter/types"

export default function AuthPage() {
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState("")
  const [twitterHandle, setTwitterHandle] = useState("")
  const [twitterUser, setTwitterUser] = useState<TwitterUser | null>(null)
  const [dailyLimit, setDailyLimit] = useState("0.05")
  const { address, isConnected, chain } = useAccount()
  const { registerUser, authorizeBot, isLoading, isSuccess, error } = useTipProtocol()
  const { isRegistered, profile } = useUserProfile(address)

  // Bot operator address (you'll need to set this to your actual bot's address)
  const BOT_OPERATOR_ADDRESS = "0x1234567890123456789012345678901234567890" // Replace with actual bot address

  // Wait for wallet connection before proceeding
  useEffect(() => {
    if (isConnected && step === 1) {
      // Small delay to ensure connection is fully established
      const timer = setTimeout(() => {
        setStep(2)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isConnected, step])

  // Check if user is already registered and redirect
  useEffect(() => {
    if (isRegistered && profile) {
      // User is already registered, redirect to dashboard
      window.location.href = "/dashboard"
    }
  }, [isRegistered, profile])

  const handleTwitterSuccess = (user: TwitterUser) => {
    setTwitterUser(user)
    setTwitterHandle(user.username) // Don't add @ here, contract expects without @
    setTimeout(() => setStep(4), 1000)
  }

  const handleRegisterUser = async () => {
    if (!twitterHandle || !userType) return

    try {
      const asCreator = userType === "creator" || userType === "both"
      const asTipper = userType === "tipper" || userType === "both"

      // Step 1: Register user on contract
      await registerUser(twitterHandle.replace("@", ""), asCreator, asTipper)

      // Step 2: If user is a tipper, authorize the bot
      if (asTipper) {
        await authorizeBot(BOT_OPERATOR_ADDRESS)
      }
    } catch (err) {
      console.error("Registration failed:", err)
    }
  }

  const isWrongNetwork = isConnected && chain?.id !== morphHolesky.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/50 to-background flex items-center justify-center p-4">
      {/* Simple header without full navbar */}
      <div className="absolute top-4 left-4">
        <Link href="/" className="inline-flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center neon-glow">
            <span className="text-white font-bold">T</span>
          </div>
          <span className="text-xl font-bold text-foreground">TipProtocol</span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Get Started</h1>
          <p className="text-muted-foreground">Connect your wallet and set up your profile on Morph Holesky</p>
        </div>

        <Tabs value={step.toString()} className="w-full">
          {/* Step 1: Wallet Connection */}
          <TabsContent value="1">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Wallet className="w-5 h-5 text-green-600" />
                  Connect Your Wallet
                </CardTitle>
                <CardDescription>Connect to Morph Holesky testnet to get started with TipProtocol</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <ConnectWalletButton className="w-full h-14 bg-green-500 hover:bg-green-600 neon-glow" />
                </div>

                {isConnected && !isWrongNetwork && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Wallet connected! Proceeding to next step...</span>
                  </div>
                )}

                {isWrongNetwork && (
                  <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-orange-900 dark:text-orange-100 mb-1">Wrong Network</p>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Please switch to Morph Holesky using the network switcher in your wallet or the connect button
                        above.
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Morph Holesky Testnet</p>
                      <p className="text-blue-700 dark:text-blue-300">
                        TipProtocol runs on Morph Holesky testnet. You'll need testnet ETH to interact with the
                        platform.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: User Type Selection */}
          <TabsContent value="2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Choose Your Role</CardTitle>
                <CardDescription>Select how you plan to use TipProtocol</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    type: "creator",
                    title: "Creator",
                    description: "I want to receive tips from supporters",
                    icon: "🎨",
                  },
                  {
                    type: "tipper",
                    title: "Tipper",
                    description: "I want to tip my favorite creators",
                    icon: "💝",
                  },
                  {
                    type: "both",
                    title: "Both",
                    description: "I want to tip and receive tips",
                    icon: "🔄",
                  },
                ].map((option) => (
                  <Button
                    key={option.type}
                    variant={userType === option.type ? "default" : "outline"}
                    className={`w-full justify-start h-16 ${
                      userType === option.type
                        ? "bg-green-500 hover:bg-green-600 text-white neon-glow"
                        : "hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 border-border"
                    }`}
                    onClick={() => setUserType(option.type)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div className="text-left">
                        <div className="font-medium">{option.title}</div>
                        <div className="text-sm opacity-80">{option.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}

                {userType && (
                  <Button className="w-full bg-green-500 hover:bg-green-600 neon-glow" onClick={() => setStep(3)}>
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Twitter Integration */}
          <TabsContent value="3">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Twitter className="w-5 h-5 text-blue-500" />
                  Twitter Integration
                </CardTitle>
                <CardDescription>Connect your Twitter account for bot integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Twitter className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">Connect Your Twitter Account</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    We'll use your Twitter profile to set up your TipProtocol account and enable bot integration.
                  </p>
                </div>

                <TwitterAuthComponent
                  onSuccess={handleTwitterSuccess}
                  onError={(error) => {
                    console.error("Twitter auth error:", error)
                  }}
                />

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">What we'll access:</p>
                      <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Your profile information (name, username, profile picture)</li>
                        <li>• Permission to send tips via @TipBot mentions</li>
                        <li>• Read access to verify your identity</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 4: Complete Registration */}
          <TabsContent value="4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Complete Registration</CardTitle>
                <CardDescription>Register your account on the TipProtocol smart contract</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Show Twitter Profile Preview */}
                {twitterUser && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500">
                        <img
                          src={twitterUser.profile_image_url || "/placeholder.svg"}
                          alt={twitterUser.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">{twitterUser.name}</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">@{twitterUser.username}</p>
                      </div>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      This profile will be used throughout TipProtocol
                    </p>
                  </div>
                )}

                {(userType === "tipper" || userType === "both") && (
                  <div className="space-y-2">
                    <Label htmlFor="daily-limit">Daily Spending Limit (ETH)</Label>
                    <Input
                      id="daily-limit"
                      type="number"
                      step="0.01"
                      placeholder="0.1"
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(e.target.value)}
                      className="bg-background border-border"
                    />
                    <p className="text-sm text-muted-foreground">
                      Maximum amount the bot can spend on your behalf per day
                    </p>
                  </div>
                )}

                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-900 dark:text-green-100">Registration Summary</span>
                  </div>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Twitter: @{twitterHandle}</li>
                    <li>• Role: {userType === "both" ? "Creator & Tipper" : userType}</li>
                    <li>• Network: Morph Holesky</li>
                    <li>• Wallet: {address?.slice(0, 10)}...</li>
                    {(userType === "tipper" || userType === "both") && <li>• Bot Authorization: Enabled</li>}
                  </ul>
                </div>

                {(userType === "tipper" || userType === "both") && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">Twitter Bot Integration</span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      After registration, you can tip creators by mentioning @TipBot in Twitter replies:
                      <br />
                      <code className="bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded mt-1 inline-block">
                        @TipBot tip @creator $5 Great content!
                      </code>
                    </p>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-sm text-red-700 dark:text-red-300">
                      {error.message || "Registration failed. Please try again."}
                    </span>
                  </div>
                )}

                {isSuccess ? (
                  <Link href="/dashboard">
                    <Button className="w-full bg-green-500 hover:bg-green-600 neon-glow">
                      Registration Complete! Go to Dashboard
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={handleRegisterUser}
                    disabled={isLoading || !twitterHandle || !userType}
                    className="w-full bg-green-500 hover:bg-green-600 neon-glow"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Registering on Contract...
                      </>
                    ) : (
                      <>
                        Register & Complete Setup
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Progress Indicator */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i <= step ? "bg-green-500 neon-glow" : "bg-muted-foreground/30"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
