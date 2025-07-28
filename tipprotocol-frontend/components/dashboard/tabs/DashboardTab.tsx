// components/dashboard/tabs/DashboardTab.tsx
"use client";

import { QuickStats } from "../QuickStats";
import { ActivityChart } from "../ActivityChart";
import { QuickTipCard } from "../QuickTipCard";
import { RecentActivity } from "../RecentActivity";

interface DashboardTabProps {
  usdtBalance: string;
  currentUserProfile: any;
  isBotAuthorized: boolean;
  currentDailySpent: string;
  currentSpendingLimit: string;
  isLoading: boolean;
  isTipper: boolean;
  recentTips: any[];
  recentDeposits: any[];
  recentWithdrawals: any[];
  onTip: (handle: string, amount: string, message: string) => Promise<void>;
  onBecomeTipper: () => Promise<void>;
  onRefreshBotStatus?: () => Promise<void>;
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
  onBecomeTipper,
}: DashboardTabProps) {
  const allActivities = [...recentTips, ...recentDeposits, ...recentWithdrawals];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your tipping overview.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart />
        <QuickTipCard
          isTipper={isTipper}
          isLoading={isLoading}
          onTip={onTip}
          onBecomeTipper={onBecomeTipper}
        />
      </div>

      <RecentActivity activities={allActivities} />
    </div>
  );
}