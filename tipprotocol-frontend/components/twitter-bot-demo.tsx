"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bot, Twitter, Send, Loader2 } from "lucide-react"
import { useCreatorByTwitter, useTipProtocol } from "@/hooks/use-tip-protocol"

export function TwitterBotDemo() {
  const [creatorHandle, setCreatorHandle] = useState("")
  const [tipAmount, setTipAmount] = useState("")
  const [message, setMessage] = useState("")
  const { sendTip, isLoading } = useTipProtocol()
  const { creatorAddress, creator } = useCreatorByTwitter(creatorHandle)

  const handleSendTip = async () => {
    if (!creatorHandle || !tipAmount) return

    try {
      await sendTip(creatorHandle, tipAmount, message)
    } catch (error) {
      console.error("Failed to send tip:", error)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Bot className="w-5 h-5 text-blue-500" />
          Twitter Bot Integration Demo
        </CardTitle>
        <CardDescription>Test how the Twitter bot would work when users mention @TipBot</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Twitter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-900 dark:text-blue-100">How it works:</span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
            Users can tip creators by replying to their tweets with:
          </p>
          <code className="bg-blue-100 dark:bg-blue-900/50 px-3 py-2 rounded block text-sm">
            @TipBot tip @creator $5 Amazing content! 🚀
          </code>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="creator-handle">Creator Twitter Handle</Label>
            <Input
              id="creator-handle"
              placeholder="creator_username (without @)"
              value={creatorHandle}
              onChange={(e) => setCreatorHandle(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          {creatorAddress && creator && (
            <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                ✅ Creator found: @{creator.twitterHandle} ({creatorAddress.slice(0, 10)}...)
                <br />
                Total tips received: {creator.totalTipsReceived} ETH
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tip-amount">Tip Amount (ETH)</Label>
            <Input
              id="tip-amount"
              type="number"
              step="0.001"
              placeholder="0.01"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Input
              id="message"
              placeholder="Great content! 🚀"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          <Button
            onClick={handleSendTip}
            disabled={isLoading || !creatorHandle || !tipAmount || !creatorAddress}
            className="w-full bg-green-500 hover:bg-green-600 neon-glow"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Tip...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Tip (Simulate Bot Action)
              </>
            )}
          </Button>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            <strong>Note:</strong> In production, the Twitter bot would:
            <br />
            1. Monitor mentions of @TipBot
            <br />
            2. Parse the tip command and amount
            <br />
            3. Look up both users' wallet addresses using their Twitter handles
            <br />
            4. Execute the tip using the `tipCreatorFor()` function with proper authorization
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
