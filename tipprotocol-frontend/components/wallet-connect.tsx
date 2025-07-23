"use client"

import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Wallet, ExternalLink, Copy, Check } from "lucide-react"
import { useState } from "react"
import { formatEther } from "viem"

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Wallet className="w-5 h-5 text-green-600" />
            Wallet Connected
          </CardTitle>
          <CardDescription>Your Web3 wallet is connected and ready</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://effigy.im/a/${address}.png`} alt="Wallet Avatar" />
                <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white">
                  {address.slice(2, 4).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">{truncateAddress(address)}</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {chain?.name || "Unknown"}
                  </Badge>
                  {balance && (
                    <span className="text-sm text-green-700 dark:text-green-300">
                      {Number.parseFloat(formatEther(balance.value)).toFixed(4)} {balance.symbol}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={copyAddress} className="h-8 w-8 p-0">
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`${chain?.blockExplorers?.default.url}/address/${address}`, "_blank")}
                className="h-8 w-8 p-0"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => disconnect()} className="flex-1 bg-transparent">
              Disconnect
            </Button>
            <Button
              onClick={() => window.open(`${chain?.blockExplorers?.default.url}/address/${address}`, "_blank")}
              className="flex-1 bg-green-500 hover:bg-green-600 neon-glow"
            >
              View on Explorer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Wallet className="w-5 h-5 text-green-600" />
          Connect Your Wallet
        </CardTitle>
        <CardDescription>Choose your preferred wallet to get started</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {connectors.map((connector) => (
          <Button
            key={connector.uid}
            variant="outline"
            className="w-full justify-between h-14 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 bg-transparent border-border"
            onClick={() => connect({ connector })}
            disabled={isPending}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">{connector.name}</span>
            </div>
            {connector.name === "MetaMask" && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Popular</Badge>
            )}
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
