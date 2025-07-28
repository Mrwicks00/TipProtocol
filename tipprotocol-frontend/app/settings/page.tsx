"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount, useDisconnect } from "wagmi";
import { useTipProtocol } from "@/hooks/use-tip-contract";
import {
  User,
  Shield,
  Bell,
  Palette,
  Wallet,
  Twitter,
  Upload,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  LogOut,
  Trash2,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const {
    currentUserProfile,
    isBotAuthorized,
    currentSpendingLimit,
    currentDailySpent,
    authorizeBot,
    revokeBot,
    isLoading,
    refetchAllData,
  } = useTipProtocol();

  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [dailyLimit, setDailyLimit] = useState([100]);
  const [notifications, setNotifications] = useState({
    tips: true,
    bot: false,
    security: true,
    marketing: false,
  });

  // Update daily limit when real data loads
  useEffect(() => {
    if (currentSpendingLimit) {
      setDailyLimit([parseFloat(currentSpendingLimit)]);
    }
  }, [currentSpendingLimit]);

  // Update bot notification when authorization changes
  useEffect(() => {
    setNotifications((prev) => ({ ...prev, bot: isBotAuthorized }));
  }, [isBotAuthorized]);

  // Real user data
  const user = {
    name: currentUserProfile?.twitterHandle || "Unknown User",
    twitterHandle: currentUserProfile?.twitterHandle || "",
    avatar: "/placeholder.svg", // You'd get this from Twitter API later
    walletAddress: address || "",
    isConnected,
  };

  // Handle bot authorization toggle
  const handleBotToggle = async (enabled: boolean) => {
    try {
      if (enabled && !isBotAuthorized) {
        await authorizeBot(dailyLimit[0]);
      } else if (!enabled && isBotAuthorized) {
        await revokeBot();
      }
      // Refresh data after action
      setTimeout(() => refetchAllData(), 2000);
    } catch (error) {
      console.error("Failed to toggle bot authorization:", error);
    }
  };

  // Handle daily limit update
  const handleDailyLimitUpdate = async () => {
    try {
      if (isBotAuthorized) {
        // Re-authorize with new limit
        await authorizeBot(dailyLimit[0]);
        setTimeout(() => refetchAllData(), 2000);
      }
    } catch (error) {
      console.error("Failed to update daily limit:", error);
    }
  };

  // Handle wallet disconnect
  const handleDisconnectWallet = () => {
    disconnect();
    // Optionally redirect to home page
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} user={user} />

      {isLoading && (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          Processing transaction...
        </div>
      </div>
    )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and security settings.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-fit">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="danger" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Danger Zone</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal information and profile picture
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white text-xl">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 bg-transparent"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Photo
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG up to 2MB
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="display-name">Display Name</Label>
                      <Input
                        id="display-name"
                        defaultValue={user.name}
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter-handle">Twitter Handle</Label>
                      <Input
                        id="twitter-handle"
                        defaultValue={user.twitterHandle}
                        className="bg-background border-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      placeholder="Tell us about yourself..."
                      className="bg-background border-border"
                    />
                  </div>

                  <Button className="bg-green-500 hover:bg-green-600 neon-glow">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">
                    Connected Accounts
                  </CardTitle>
                  <CardDescription>
                    Manage your connected social media and wallet accounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Twitter className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-card-foreground">
                          Twitter
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {currentUserProfile?.twitterHandle
                            ? `@${currentUserProfile.twitterHandle}`
                            : "Not connected"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        currentUserProfile?.twitterHandle
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }
                    >
                      {currentUserProfile?.twitterHandle
                        ? "Connected"
                        : "Disconnected"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Wallet className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="font-medium text-card-foreground">
                          Wallet
                        </p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {address
                            ? `${address.slice(0, 10)}...${address.slice(-8)}`
                            : "Not connected"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        isConnected
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }
                    >
                      {isConnected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">
                    Bot Authorization
                  </CardTitle>
                  <CardDescription>
                    Control bot permissions and spending limits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-card-foreground">
                        Enable Bot
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Allow @TipBot to send tips on your behalf
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-card-foreground">
                      Daily Spending Limit: ${dailyLimit[0]}
                    </Label>
                    <Slider
                      value={dailyLimit}
                      onValueChange={setDailyLimit}
                      max={1000}
                      min={10}
                      step={10}
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground">
                      Maximum amount the bot can spend per day
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-green-900 dark:text-green-100">
                        Security Active
                      </span>
                    </div>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• Two-factor authentication enabled</li>
                      <li>• Daily spending limits active</li>
                      <li>• Real-time monitoring enabled</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">
                    Wallet Security
                  </CardTitle>
                  <CardDescription>
                    Manage your wallet security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Private Key</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type={showPrivateKey ? "text" : "password"}
                        value="••••••••••••••••••••••••••••••••"
                        readOnly
                        className="bg-background border-border font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                        className="px-3"
                      >
                        {showPrivateKey ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Never share your private key with anyone
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-card-foreground">
                          Transaction Confirmations
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Require confirmation for all transactions
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-card-foreground">
                          Biometric Authentication
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Use fingerprint or face ID
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-card-foreground">
                      Enable Bot
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Allow @TipBot to send tips on your behalf
                    </p>
                  </div>
                  <Switch
                    checked={isBotAuthorized}
                    onCheckedChange={handleBotToggle}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-card-foreground">
                    Daily Spending Limit: ${dailyLimit[0]}
                  </Label>
                  <Slider
                    value={dailyLimit}
                    onValueChange={setDailyLimit}
                    max={1000}
                    min={10}
                    step={10}
                    className="mt-2"
                    disabled={isLoading}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Maximum amount the bot can spend per day
                    </p>
                    <Button
                      size="sm"
                      onClick={handleDailyLimitUpdate}
                      disabled={isLoading || !isBotAuthorized}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Update Limit
                    </Button>
                  </div>
                  {currentDailySpent && (
                    <p className="text-sm text-blue-600">
                      Today's spending: ${currentDailySpent} / $
                      {currentSpendingLimit}
                    </p>
                  )}
                </div>

                <div
                  className={`border rounded-lg p-4 ${
                    isBotAuthorized
                      ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                      : "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {isBotAuthorized ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    )}
                    <span
                      className={`font-medium ${
                        isBotAuthorized
                          ? "text-green-900 dark:text-green-100"
                          : "text-yellow-900 dark:text-yellow-100"
                      }`}
                    >
                      {isBotAuthorized
                        ? "Bot Authorized"
                        : "Bot Not Authorized"}
                    </span>
                  </div>
                  <ul
                    className={`text-sm space-y-1 ${
                      isBotAuthorized
                        ? "text-green-700 dark:text-green-300"
                        : "text-yellow-700 dark:text-yellow-300"
                    }`}
                  >
                    {isBotAuthorized ? (
                      <>
                        <li>• Bot can send tips on your behalf</li>
                        <li>• Daily spending limit: ${currentSpendingLimit}</li>
                        <li>• Real-time monitoring enabled</li>
                      </>
                    ) : (
                      <>
                        <li>• Enable bot to tip via Twitter</li>
                        <li>• Set daily spending limits for security</li>
                        <li>• Authorize to start using @TipBot</li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Appearance Settings
                </CardTitle>
                <CardDescription>
                  Customize how TipProtocol looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-card-foreground">Theme</p>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred theme
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-card-foreground">
                        Reduced Motion
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Minimize animations and transitions
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-card-foreground">
                        Compact Mode
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Show more content in less space
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone */}
          <TabsContent value="danger" className="space-y-6">
            <Card className="bg-card border-border border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/30">
                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                      Disconnect Wallet
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      This will disconnect your wallet and revoke all bot
                      permissions. You'll need to reconnect to use TipProtocol.
                    </p>
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 bg-transparent"
                      onClick={handleDisconnectWallet}
                      disabled={isLoading}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect Wallet
                    </Button>
                  </div>

                  <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/30">
                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                      Delete Account
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      Permanently delete your TipProtocol account and all
                      associated data. This action cannot be undone.
                    </p>
                    <Button
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
