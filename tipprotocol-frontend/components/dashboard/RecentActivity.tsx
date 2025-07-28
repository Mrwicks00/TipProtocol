// components/dashboard/RecentActivity.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, MinusCircle, Eye, PlusCircle } from "lucide-react";

interface Activity {
  type: "sent" | "received" | "deposit" | "withdrawal";
  user?: string;
  amount: string;
  token: string;
  timestamp: string;
  message?: string;
  hash?: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "sent":
        return <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case "withdrawal":
        return <MinusCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case "deposit":
        return <PlusCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      default:
        return <ArrowDownRight className="w-5 h-5 text-green-600 dark:text-green-400" />;
    }
  };

  const getActivityBg = (type: string) => {
    return type === "sent" || type === "withdrawal" 
      ? "bg-red-100 dark:bg-red-900/30" 
      : "bg-green-100 dark:bg-green-900/30";
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case "sent":
        return `Sent to ${activity.user}`;
      case "received":
        return `Received from ${activity.user}`;
      case "deposit":
        return "Deposited";
      case "withdrawal":
        return "Withdrawn";
      default:
        return "Unknown";
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Recent Activity (Live Events)</CardTitle>
        <CardDescription>Your latest transactions (only shows new events while page is open)</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-center">No recent activity detected. Try making a transaction!</p>
        ) : (
          <div className="space-y-4">
            {activities
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityBg(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">
                        {getActivityText(activity)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-card-foreground">
                      ${parseFloat(activity.amount).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">{activity.token}</p>
                  </div>
                  {activity.hash && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://explorer.morphl2.io/tx/${activity.hash}`, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}