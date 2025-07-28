// components/dashboard/QuickStats.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Button } from "@/components/ui/button";
import { DollarSign, Send, ArrowDownRight, Bot, RefreshCw } from "lucide-react";

interface QuickStatsProps {
  usdtBalance: string;
  totalTipped: string;
  tipsSent: number;
  totalTipsReceived: string;
  tipCountReceived: number;
  isBotAuthorized: boolean;
  currentDailySpent: string;
  currentSpendingLimit: string;
  isLoading: boolean;
  onRefreshBotStatus?: () => Promise<void>; // Add this prop
}

export function QuickStats({
  usdtBalance,
  totalTipped,
  tipsSent,
  totalTipsReceived,
  tipCountReceived,
  isBotAuthorized,
  currentDailySpent,
  currentSpendingLimit,
  isLoading,
  onRefreshBotStatus, // Add this parameter
}: QuickStatsProps) {
  const stats = [
    {
      title: "Total Balance (USDT)",
      value: `$${parseFloat(usdtBalance).toFixed(2)}`,
      subtitle: isLoading ? "Loading..." : `Last updated: ${new Date().toLocaleTimeString()}`,
      icon: DollarSign,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Tips Sent (USDT)",
      value: `$${parseFloat(totalTipped || "0").toFixed(2)}`,
      subtitle: `${tipsSent} transactions`,
      icon: Send,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Tips Received (USDT)",
      value: `$${parseFloat(totalTipsReceived || "0").toFixed(2)}`,
      subtitle: `${tipCountReceived} supporters`,
      icon: ArrowDownRight,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Bot Status",
      value: isBotAuthorized ? "Authorized" : "Disabled",
      subtitle: `$${parseFloat(currentDailySpent).toFixed(2)} / $${parseFloat(currentSpendingLimit).toFixed(2)} daily spent`,
      icon: Bot,
      iconBg: isBotAuthorized ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30",
      iconColor: isBotAuthorized ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
      valueColor: isBotAuthorized ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
      hasAction: true, // Special flag for bot status card
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-card border-border hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.valueColor || "text-card-foreground"}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-full flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-muted-foreground">{stat.subtitle}</span>
              {stat.hasAction && onRefreshBotStatus && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefreshBotStatus}
                  className="h-6 px-2 text-xs"
                  disabled={isLoading}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Refresh
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}