"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { ThemeToggle } from "@/components/theme-toggle"

export default function SettingsPage() {
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [dailyLimit, setDailyLimit] = useState([100])
  const [notifications, setNotifications] = useState({
    tips: true,
    bot: false,
    security: true,
    marketing: false,
  })

  const user = {
    name: "John Doe",
    twitterHandle: "@johndoe",
    avatar: "/placeholder.svg?height=100&width=100&text=JD",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    isConnected: true,
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} user={user} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and security settings.</p>
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
            <TabsTrigger value="notifications" className="flex items-center gap-2">
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
                  <CardTitle className="text-card-foreground">Profile Information</CardTitle>
                  <CardDescription>Update your personal information and profile picture</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white text-xl">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                        <Upload className="w-4 h-4" />
                        Upload Photo
                      </Button>
                      <p className="text-xs text-muted-foreground">JPG, PNG up to 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="display-name">Display Name</Label>
                      <Input id="display-name" defaultValue={user.name} className="bg-background border-border" />
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
                    <Input id="bio" placeholder="Tell us about yourself..." className="bg-background border-border" />
                  </div>

                  <Button className="bg-green-500 hover:bg-green-600 neon-glow">Save Changes</Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Connected Accounts</CardTitle>
                  <CardDescription>Manage your connected social media and wallet accounts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Twitter className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-card-foreground">Twitter</p>
                        <p className="text-sm text-muted-foreground">{user.twitterHandle}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Connected
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Wallet className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="font-medium text-card-foreground">Wallet</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Connected
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
                  <CardTitle className="text-card-foreground">Bot Authorization</CardTitle>
                  <CardDescription>Control bot permissions and spending limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-card-foreground">Enable Bot</p>
                      <p className="text-sm text-muted-foreground">Allow @TipBot to send tips on your behalf</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-card-foreground">Daily Spending Limit: ${dailyLimit[0]}</Label>
                    <Slider
                      value={dailyLimit}
                      onValueChange={setDailyLimit}
                      max={1000}
                      min={10}
                      step={10}
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground">Maximum amount the bot can spend per day</p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-green-900 dark:text-green-100">Security Active</span>
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
                  <CardTitle className="text-card-foreground">Wallet Security</CardTitle>
                  <CardDescription>Manage your wallet security settings</CardDescription>
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
                        {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Never share your private key with anyone</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-card-foreground">Transaction Confirmations</p>
                        <p className="text-sm text-muted-foreground">Require confirmation for all transactions</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-card-foreground">Biometric Authentication</p>
                        <p className="text-sm text-muted-foreground">Use fingerprint or face ID</p>
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
                <CardTitle className="text-card-foreground">Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-card-foreground">Transaction Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-card-foreground">Tips Received</p>
                          <p className="text-sm text-muted-foreground">Get notified when you receive tips</p>
                        </div>
                        <Switch
                          checked={notifications.tips}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, tips: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-card-foreground">Bot Activity</p>
                          <p className="text-sm text-muted-foreground">Updates on bot transactions</p>
                        </div>
                        <Switch
                          checked={notifications.bot}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, bot: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-card-foreground">System Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-card-foreground">Security Alerts</p>
                          <p className="text-sm text-muted-foreground">Important security notifications</p>
                        </div>
                        <Switch
                          checked={notifications.security}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, security: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-card-foreground">Marketing Updates</p>
                          <p className="text-sm text-muted-foreground">Product updates and promotions</p>
                        </div>
                        <Switch
                          checked={notifications.marketing}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button className="bg-green-500 hover:bg-green-600 neon-glow">Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Appearance Settings</CardTitle>
                <CardDescription>Customize how TipProtocol looks and feels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-card-foreground">Theme</p>
                      <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                    </div>
                    <ThemeToggle />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-card-foreground">Reduced Motion</p>
                      <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-card-foreground">Compact Mode</p>
                      <p className="text-sm text-muted-foreground">Show more content in less space</p>
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
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/30">
                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Disconnect Wallet</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      This will disconnect your wallet and revoke all bot permissions. You'll need to reconnect to use
                      TipProtocol.
                    </p>
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 bg-transparent"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect Wallet
                    </Button>
                  </div>

                  <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/30">
                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Delete Account</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      Permanently delete your TipProtocol account and all associated data. This action cannot be undone.
                    </p>
                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
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
  )
}
