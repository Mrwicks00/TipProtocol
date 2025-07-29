"use client"

import { QuickStats } from "../QuickStats"
import { ActivityChart } from "../ActivityChart"
import { QuickTipCard } from "../QuickTipCard"
import { RecentActivity } from "../RecentActivity"

interface DashboardTabProps {
  usdtBalance: string
  currentUserProfile: any
  isBotAuthorized: boolean
  currentDailySpent: string
  currentSpendingLimit: string
  isLoading: boolean
  isTipper: boolean
  recentTips: any[]
  recentDeposits: any[]
  recentWithdrawals: any[]
  onTip: (handle: string, amount: string, message: string) => Promise<void>
  onBecomeTipper: () => Promise<void>
  onRefreshBotStatus?: () => Promise<void>
  onDebugBalance?: () => Promise<void>
}

export function DashboardTab({
  usdtBalance,
  currentUserProfile,
  isBotAuthorized,
  currentDailySpent,
  currentSpendingLimit,
  isLoading,
  isTipper,
  recentTips,
  recentDeposits,
  recentWithdrawals,
  onRefreshBotStatus,
  onTip,
  onDebugBalance,
  onBecomeTipper,
}: DashboardTabProps) {
  const allActivities = [...recentTips, ...recentDeposits, ...recentWithdrawals]

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your tipping overview.</p>
      </div>

      <QuickStats
        usdtBalance={usdtBalance}
        totalTipped={currentUserProfile?.totalTipped || "0"}
        tipsSent={currentUserProfile?.tipsSent || 0}
        totalTipsReceived={currentUserProfile?.totalTipsReceived || "0"}
        tipCountReceived={currentUserProfile?.tipCountReceived || 0}
        isBotAuthorized={isBotAuthorized}
        currentDailySpent={currentDailySpent}
        currentSpendingLimit={currentSpendingLimit}
        isLoading={isLoading}
        onRefreshBotStatus={onRefreshBotStatus}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <ActivityChart />
        <QuickTipCard isTipper={isTipper} isLoading={isLoading} onTip={onTip} onBecomeTipper={onBecomeTipper} debugBalance={onDebugBalance} usdtBalance={usdtBalance} />
      </div>

      <RecentActivity activities={allActivities} />
    </div>
  )
}
