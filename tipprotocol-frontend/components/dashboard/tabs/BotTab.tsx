// components/dashboard/tabs/BotTab.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Twitter, Shield, Eye } from "lucide-react";

interface BotTabProps {
  isTipper: boolean;
  isBotAuthorized: boolean;
  currentSpendingLimit: string;
  currentDailySpent: string;
  isLoading: boolean;
  recentTips: any[];
  onAuthorizeBot: (limit: number) => Promise<void>;
  onRevokeBot: () => Promise<void>;
  onBecomeTipper: () => Promise<void>;
}

export function BotTab({
  isTipper,
  isBotAuthorized,
  currentSpendingLimit,
  currentDailySpent,
  isLoading,
  recentTips,
  onAuthorizeBot,
  onRevokeBot,
  onBecomeTipper,
}: BotTabProps) {
  const [botAuthToggle, setBotAuthToggle] = useState(false);
  const [dailyLimitSlider, setDailyLimitSlider] = useState([100]);

  useEffect(() => {
    if (isBotAuthorized !== undefined) {
      setBotAuthToggle(isBotAuthorized);
    }
  }, [isBotAuthorized]);

  useEffect(() => {
    if (currentSpendingLimit) {
      setDailyLimitSlider([Number(parseFloat(currentSpendingLimit).toFixed(0))]);
    }
  }, [currentSpendingLimit]);

  const handleBotAuthorizationChange = async (checked: boolean) => {
    if (checked && !botAuthToggle) {
      await onAuthorizeBot(dailyLimitSlider[0]);
    } else if (!checked && botAuthToggle) {
      await onRevokeBot();
    }
    setBotAuthToggle(checked);
  };

  const handleSetDailyLimit = async () => {
    await onAuthorizeBot(dailyLimitSlider[0]);
  };

  const botActivityTips = recentTips.filter(tip => tip.type === 'sent');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bot Management</h1>
        <p className="text-muted-foreground">Manage your Twitter bot authorization and settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Twitter className="w-5 h-5 text-blue-500" />
              Bot Authorization
            </CardTitle>
            <CardDescription>Control whether the bot can send tips on your behalf</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isTipper && (
              <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-sm">
                You must be a tipper to authorize the bot. 
                <Button 
                  variant="link" 
                  onClick={onBecomeTipper} 
                  className="p-0 h-auto text-red-800 dark:text-red-200 underline"
                >
                  Click here to become a tipper
                </Button>.
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-card-foreground">Bot Authorization</p>
                <p className="text-sm text-muted-foreground">Allow @TipBot to send tips for you</p>
              </div>
              <Switch
                checked={botAuthToggle}
                onCheckedChange={handleBotAuthorizationChange}
                disabled={isLoading || !isTipper}
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-card-foreground">Daily Spending Limit: ${dailyLimitSlider[0].toFixed(2)} USDT</Label>
                <Slider
                  value={dailyLimitSlider}
                  onValueChange={setDailyLimitSlider}
                  max={500}
                  min={10}
                  step={10}
                  className="mt-2"
                  disabled={isLoading || !isTipper}
                />
                <p className="text-sm text-muted-foreground mt-1">Maximum amount the bot can spend per day</p>
              </div>
              <Button
                onClick={handleSetDailyLimit}
                className="w-full bg-green-500 hover:bg-green-600 neon-glow"
                disabled={isLoading || !isTipper || !botAuthToggle}
              >
                {isLoading ? "Saving Limit..." : "Save Daily Limit"}
              </Button>
            </div>

            <div
              className={`p-4 rounded-lg border ${
                botAuthToggle
                  ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield
                  className={`w-5 h-5 ${botAuthToggle ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                />
                <span
                  className={`font-medium ${botAuthToggle ? "text-green-900 dark:text-green-100" : "text-red-900 dark:text-red-100"}`}
                >
                  Bot Status: {botAuthToggle ? "Authorized" : "Disabled"}
                </span>
              </div>
              <p
                className={`text-sm mt-1 ${botAuthToggle ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}
              >
                {botAuthToggle
                  ? `The bot can send tips up to $${parseFloat(currentSpendingLimit).toFixed(2)} USDT daily. Spent today: $${parseFloat(currentDailySpent).toFixed(2)} USDT.`
                  : "The bot cannot send tips on your behalf. Enable authorization above."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Recent Bot Activity (Live Events)</CardTitle>
            <CardDescription>Tips sent by the bot on your behalf (limited history)</CardDescription>
          </CardHeader>
          <CardContent>
            {botActivityTips.length === 0 ? (
              <p className="text-muted-foreground text-center">No recent bot activity.</p>
            ) : (
              <div className="space-y-4">
                {botActivityTips.map((activity, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-card-foreground">{activity.user}</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        ${parseFloat(activity.amount).toFixed(2)} {activity.token}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">"{activity.message}"</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                    {activity.hash && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => window.open(`https://explorer.morphl2.io/tx/${activity.hash}`, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-1" /> View Tx
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">How to Use the Bot</CardTitle>
          <CardDescription>Simple commands to tip creators on Twitter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-card-foreground">Basic Tip Command</h3>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm text-foreground">
                @TipBot tip @creator $10
              </div>
              <p className="text-sm text-muted-foreground">
                Reply to any tweet with this command to tip the creator
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-card-foreground">Specify Token (Currently USDT Only)</h3>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm text-foreground">
                @TipBot tip @creator $10 USDT
              </div>
              <p className="text-sm text-muted-foreground">The bot currently only supports USDT.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
