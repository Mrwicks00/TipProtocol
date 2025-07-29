"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAccount } from "wagmi"
import { Toaster, toast } from "sonner"

// Import custom hooks and components
import { Navbar } from "@/components/navbar"
import { useTipProtocol } from "@/hooks/use-tip-contract"

// Import dashboard components
import { Sidebar } from "@/components/dashboard/Sidebar"
import { DashboardTab } from "@/components/dashboard/tabs/DashboardTab"
import { BotTab } from "@/components/dashboard/tabs/BotTab"
import { WalletTab } from "@/components/dashboard/tabs/WalletTab"
import { TransactionsTab } from "@/components/dashboard/tabs/TransactionsTab"
import { SettingsTab } from "@/components/dashboard/tabs/SettingsTab"

export default function Dashboard() {
  const { address: userWalletAddress, isConnected } = useAccount()
  const {
    userAddress,
    currentUserProfile,
    usdtProtocolBalance,
    isBotAuthorized,
    currentSpendingLimit,
    currentDailySpent,
    isLoading,
    becomeCreator,
    becomeTipper,
    tipCreator,
    depositUSDT,
    withdrawUSDT,
    authorizeBot,
    revokeBot,
    refetchAllData,
    checkAndAuthorizeBot,
    debugBotAuthorization,
    checkContractAuthorizationDirect,
    recentTips,
    recentDeposits,
    recentWithdrawals,
    debugBalanceIssue
  } = useTipProtocol()

  const [activeTab, setActiveTab] = useState("dashboard")

  // Effect to refetch all data when user connects or account changes
  useEffect(() => {
    if (isConnected && userWalletAddress) {
      refetchAllData()
    }
  }, [isConnected, userWalletAddress, refetchAllData])

  // User data for Navbar
  const user = {
    name: currentUserProfile?.twitterHandle || (userWalletAddress ? `${userWalletAddress.slice(0, 6)}...` : "Guest"),
    twitterHandle: currentUserProfile?.twitterHandle || "@unregistered",
    avatar: "/placeholder.svg?height=100&width=100&text=JD",
    walletAddress: userWalletAddress || "N/A",
    isConnected: isConnected,
  }

  // If not connected, prompt to connect wallet
  if (!isConnected || !userWalletAddress) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Navbar isAuthenticated={false} user={user} />
        <Card className="w-full max-w-md text-center mt-20">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Please connect your cryptocurrency wallet to access the Tip Protocol Dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                /* Trigger wallet connect using wagmi's useConnect hook */
              }}
              className="bg-green-500 hover:bg-green-600 neon-glow"
            >
              Connect Wallet
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">Ensure you're on the Morph Holesky testnet.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Determine if user is Creator/Tipper
  const isCreator = currentUserProfile?.isCreator || false
  const isTipper = currentUserProfile?.isTipper || false

  // Handler functions
  const handleTip = async (handle: string, amount: string, message: string) => {
    await tipCreator(handle, amount, message)
  }

  const handleDeposit = async (amount: string) => {
    await depositUSDT(amount)
  }

  const handleWithdraw = async (amount: string) => {
    await withdrawUSDT(amount)
  }

  const handleAuthorizeBot = async (limit: number) => {
    await authorizeBot(limit)
  }

  const handleRevokeBot = async () => {
    await revokeBot()
  }

  const handleBecomeCreator = async () => {
    await becomeCreator()
  }

  const handleBecomeTipper = async () => {
    await becomeTipper()
  }

  const handleRefreshBotStatus = async () => {
    console.log("=== REFRESHING BOT STATUS ===")
    try {
      // First, debug current state
      await debugBotAuthorization()
      // Then try to check authorization directly from contract
      await checkContractAuthorizationDirect()
      // Refresh all data
      await refetchAllData()
      // If still not authorized and user is a tipper, try to authorize
      if (currentUserProfile?.isTipper && !isBotAuthorized) {
        console.log("After refresh, bot still not authorized. Attempting authorization...")
        await checkAndAuthorizeBot()
      }
    } catch (error) {
      console.error("Error during bot status refresh:", error)
      toast.error("Failed to refresh bot status")
    }
  }

  // Render the appropriate tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardTab
            usdtBalance={usdtProtocolBalance}
            currentUserProfile={currentUserProfile}
            isBotAuthorized={isBotAuthorized}
            currentDailySpent={currentDailySpent}
            currentSpendingLimit={currentSpendingLimit}
            isLoading={isLoading}
            isTipper={isTipper}
            recentTips={recentTips}
            recentDeposits={recentDeposits}
            recentWithdrawals={recentWithdrawals}
            onTip={handleTip}
            onBecomeTipper={handleBecomeTipper}
            onRefreshBotStatus={handleRefreshBotStatus}
            onDebugBalance={debugBalanceIssue}
          />
        )
      case "bot":
        return (
          <BotTab
            isTipper={isTipper}
            isBotAuthorized={isBotAuthorized}
            currentSpendingLimit={currentSpendingLimit}
            currentDailySpent={currentDailySpent}
            isLoading={isLoading}
            recentTips={recentTips}
            onAuthorizeBot={handleAuthorizeBot}
            onRevokeBot={handleRevokeBot}
            onBecomeTipper={handleBecomeTipper}
          />
        )
      case "wallet":
        return (
          <WalletTab
            usdtBalance={usdtProtocolBalance}
            isLoading={isLoading}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
          />
        )
      case "transactions":
        return (
          <TransactionsTab
            recentTips={recentTips}
            recentDeposits={recentDeposits}
            recentWithdrawals={recentWithdrawals}
          />
        )
      case "settings":
        return (
          <SettingsTab
            currentUserProfile={currentUserProfile}
            isCreator={isCreator}
            isTipper={isTipper}
            isLoading={isLoading}
            onBecomeCreator={handleBecomeCreator}
            onBecomeTipper={handleBecomeTipper}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-right" />
      <Navbar isAuthenticated={true} user={user} />
      <div className="flex flex-col lg:flex-row">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  )
}
