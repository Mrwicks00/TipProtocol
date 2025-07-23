"use client"

import type React from "react"

import { useState } from "react"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useTipContract } from "@/hooks/use-tip-contract"

export function TipSender() {
  const { address, isConnected } = useAccount()
  const { sendTip, isLoading, isSuccess, error } = useTipContract()

  const [recipientAddress, setRecipientAddress] = useState("")
  const [twitterHandle, setTwitterHandle] = useState("")
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")

  const handleSendTip = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipientAddress || !twitterHandle || !amount) return

    await sendTip(recipientAddress, twitterHandle, amount, message)
  }

  if (!isConnected) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Connect your wallet to send tips</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Send className="w-5 h-5 text-green-600" />
          Send Tip
        </CardTitle>
        <CardDescription>Send a tip directly to a creator's wallet</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendTip} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="twitter-handle">Creator Twitter Handle</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">@</span>
              <Input
                id="twitter-handle"
                placeholder="username"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                className="pl-8 bg-background border-border"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient-address">Recipient Wallet Address</Label>
            <Input
              id="recipient-address"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="bg-background border-border font-mono text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ETH)</Label>
            <Input
              id="amount"
              type="number"
              step="0.001"
              placeholder="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-background border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Great content! Keep it up 🚀"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-background border-border"
              rows={3}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">{error.message || "Transaction failed"}</span>
            </div>
          )}

          {isSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-700 dark:text-green-300">Tip sent successfully! 🎉</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !recipientAddress || !twitterHandle || !amount}
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
                Send Tip
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
