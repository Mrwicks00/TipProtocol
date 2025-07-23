"use client"

import { useState } from "react"
import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from "wagmi"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Wallet, ExternalLink, Copy, Check, AlertTriangle, Loader2 } from "lucide-react"
import { formatEther } from "viem"
import { morphHolesky } from "@/lib/chains/morph-holesky"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect?: () => void
}

export function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })
  const { switchChain, isPending: isSwitching } = useSwitchChain()
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

  const handleConnect = (connector: any) => {
    connect({ connector })
    onConnect?.()
  }

  const handleSwitchToMorph = () => {
    switchChain({ chainId: morphHolesky.id })
  }

  const isWrongNetwork = isConnected && chain?.id !== morphHolesky.id

  if (isConnected && address) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-600" />
              Wallet Connected
            </DialogTitle>
            <DialogDescription>Your wallet is connected to TipProtocol</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Wrong Network Warning */}
            {isWrongNetwork && (
              <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-orange-900 dark:text-orange-100 mb-1">Wrong Network</p>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                    Please switch to Morph Holesky to use TipProtocol
                  </p>
                  <Button
                    onClick={handleSwitchToMorph}
                    disabled={isSwitching}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {isSwitching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Switching...
                      </>
                    ) : (
                      "Switch to Morph Holesky"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Wallet Info */}
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://effigy.im/a/${address}.png`} alt="Wallet Avatar" />
                  <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white">
                    {address.slice(2, 4).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">{truncateAddress(address)}</p>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        isWrongNetwork
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      }
                    >
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

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => disconnect()} className="flex-1 bg-transparent">
                Disconnect
              </Button>
              <Button
                onClick={() => {
                  window.open(`${chain?.blockExplorers?.default.url}/address/${address}`, "_blank")
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 neon-glow"
              >
                View on Explorer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-green-600" />
            Connect Your Wallet
          </DialogTitle>
          <DialogDescription>Choose your preferred wallet to connect to Morph Holesky</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {connectors.map((connector) => (
            <Card
              key={connector.uid}
              className="cursor-pointer hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
              onClick={() => handleConnect(connector)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{connector.name}</p>
                    <p className="text-sm text-muted-foreground">Connect using {connector.name}</p>
                  </div>
                </div>
                {connector.name === "MetaMask" && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Popular
                  </Badge>
                )}
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> TipProtocol runs on Morph Holesky testnet. Make sure your wallet is configured for
            this network.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
