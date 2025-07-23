"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  LayoutDashboard,
  Wallet,
  History,
  Settings,
  Bot,
  ArrowUpRight,
  ArrowDownRight,
  Twitter,
  Shield,
  DollarSign,
  Send,
  Eye,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Navbar } from "@/components/navbar"

const chartData = [
  { name: "Jan", tips: 400, received: 240 },
  { name: "Feb", tips: 300, received: 139 },
  { name: "Mar", tips: 200, received: 980 },
  { name: "Apr", tips: 278, received: 390 },
  { name: "May", tips: 189, received: 480 },
  { name: "Jun", tips: 239, received: 380 },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [botAuthorized, setBotAuthorized] = useState(true)
  const [dailyLimit, setDailyLimit] = useState([100])

  const Sidebar = () => (
    <div className="w-64 bg-card border-r border-border h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-6">
        <nav className="space-y-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "wallet", label: "Wallet", icon: Wallet },
            { id: "transactions", label: "Transactions", icon: History },
            { id: "bot", label: "Bot Management", icon: Bot },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === item.id
                  ? "bg-green-500 hover:bg-green-600 text-white neon-glow"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="mr-3 w-4 h-4" />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  )

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

      <div className="flex">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                  <p className="text-muted-foreground">Welcome back! Here's your tipping overview.</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-card border-border hover-lift">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                          <p className="text-2xl font-bold text-card-foreground">$2,847.50</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <div className="flex items-center mt-4 text-sm">
                        <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-600 dark:text-green-400">+12.5%</span>
                        <span className="text-muted-foreground ml-2">from last month</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border hover-lift">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Tips Sent</p>
                          <p className="text-2xl font-bold text-card-foreground">$1,234.00</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <Send className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="flex items-center mt-4 text-sm">
                        <span className="text-muted-foreground">47 transactions</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border hover-lift">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Tips Received</p>
                          <p className="text-2xl font-bold text-card-foreground">$892.30</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                          <ArrowDownRight className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                      <div className="flex items-center mt-4 text-sm">
                        <span className="text-muted-foreground">23 supporters</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border hover-lift">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Bot Status</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">Active</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <Bot className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <div className="flex items-center mt-4 text-sm">
                        <span className="text-muted-foreground">$50 daily limit</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-card-foreground">Tipping Activity</CardTitle>
                      <CardDescription>Your tips sent and received over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" className="text-muted-foreground" />
                          <YAxis className="text-muted-foreground" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Line type="monotone" dataKey="tips" stroke="#10b981" strokeWidth={2} />
                          <Line type="monotone" dataKey="received" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-card-foreground">Quick Tip</CardTitle>
                      <CardDescription>Send a tip manually</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="recipient">Recipient Twitter Handle</Label>
                        <Input id="recipient" placeholder="@username" className="bg-background border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount (USD)</Label>
                        <Input id="amount" type="number" placeholder="10.00" className="bg-background border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="token">Token</Label>
                        <select className="w-full p-2 border border-border rounded-md bg-background text-foreground">
                          <option>USDC</option>
                          <option>ETH</option>
                          <option>USDT</option>
                        </select>
                      </div>
                      <Button className="w-full bg-green-500 hover:bg-green-600 neon-glow">
                        Send Tip
                        <Send className="ml-2 w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Recent Activity</CardTitle>
                    <CardDescription>Your latest transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { type: "sent", user: "@creator1", amount: "$25.00", time: "2 hours ago", token: "USDC" },
                        { type: "received", user: "@supporter1", amount: "$10.00", time: "4 hours ago", token: "ETH" },
                        { type: "sent", user: "@creator2", amount: "$15.00", time: "1 day ago", token: "USDC" },
                        { type: "received", user: "@supporter2", amount: "$50.00", time: "2 days ago", token: "USDT" },
                      ].map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                activity.type === "sent"
                                  ? "bg-red-100 dark:bg-red-900/30"
                                  : "bg-green-100 dark:bg-green-900/30"
                              }`}
                            >
                              {activity.type === "sent" ? (
                                <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                              ) : (
                                <ArrowDownRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-card-foreground">
                                {activity.type === "sent" ? "Sent to" : "Received from"} {activity.user}
                              </p>
                              <p className="text-sm text-muted-foreground">{activity.time}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-card-foreground">{activity.amount}</p>
                            <p className="text-sm text-muted-foreground">{activity.token}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Bot Management Tab */}
            {activeTab === "bot" && (
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
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-card-foreground">Bot Authorization</p>
                          <p className="text-sm text-muted-foreground">Allow @TipBot to send tips for you</p>
                        </div>
                        <Switch checked={botAuthorized} onCheckedChange={setBotAuthorized} />
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-card-foreground">Daily Spending Limit: ${dailyLimit[0]}</Label>
                          <Slider
                            value={dailyLimit}
                            onValueChange={setDailyLimit}
                            max={500}
                            min={10}
                            step={10}
                            className="mt-2"
                          />
                          <p className="text-sm text-muted-foreground mt-1">Maximum amount the bot can spend per day</p>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-lg border ${
                          botAuthorized
                            ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Shield
                            className={`w-5 h-5 ${botAuthorized ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                          />
                          <span
                            className={`font-medium ${botAuthorized ? "text-green-900 dark:text-green-100" : "text-red-900 dark:text-red-100"}`}
                          >
                            Bot Status: {botAuthorized ? "Authorized" : "Disabled"}
                          </span>
                        </div>
                        <p
                          className={`text-sm mt-1 ${botAuthorized ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}
                        >
                          {botAuthorized
                            ? "The bot can send tips up to your daily limit"
                            : "The bot cannot send tips on your behalf"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-card-foreground">Recent Bot Activity</CardTitle>
                      <CardDescription>Tips sent by the bot on your behalf</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { recipient: "@creator1", amount: "$25.00", tweet: "Great content!", time: "2h ago" },
                          { recipient: "@creator2", amount: "$10.00", tweet: "Love this thread", time: "5h ago" },
                          { recipient: "@creator3", amount: "$15.00", tweet: "Amazing work!", time: "1d ago" },
                        ].map((activity, index) => (
                          <div key={index} className="p-4 border border-border rounded-lg bg-muted/20">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-card-foreground">{activity.recipient}</span>
                              <span className="font-medium text-green-600 dark:text-green-400">{activity.amount}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">"{activity.tweet}"</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        ))}
                      </div>
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
                        <h3 className="font-semibold text-card-foreground">Specify Token</h3>
                        <div className="bg-muted p-4 rounded-lg font-mono text-sm text-foreground">
                          @TipBot tip @creator $10 USDC
                        </div>
                        <p className="text-sm text-muted-foreground">Add token symbol to specify which token to use</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Wallet Tab */}
            {activeTab === "wallet" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Wallet</h1>
                  <p className="text-muted-foreground">Manage your tokens and balances.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2 bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-card-foreground">Token Balances</CardTitle>
                      <CardDescription>Your current token holdings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { symbol: "ETH", name: "Ethereum", balance: "1.2547", value: "$2,847.50", change: "+5.2%" },
                          { symbol: "USDC", name: "USD Coin", balance: "1,250.00", value: "$1,250.00", change: "0.0%" },
                          { symbol: "USDT", name: "Tether", balance: "500.00", value: "$500.00", change: "+0.1%" },
                        ].map((token, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border border-border rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold">{token.symbol[0]}</span>
                              </div>
                              <div>
                                <p className="font-medium text-card-foreground">{token.name}</p>
                                <p className="text-sm text-muted-foreground">{token.symbol}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-card-foreground">
                                {token.balance} {token.symbol}
                              </p>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">{token.value}</span>
                                <span
                                  className={`text-sm ${
                                    token.change.startsWith("+")
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400"
                                  }`}
                                >
                                  {token.change}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-card-foreground">Convert to Fiat</CardTitle>
                      <CardDescription>Convert your crypto to USD</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>From Token</Label>
                        <select className="w-full p-2 border border-border rounded-md bg-background text-foreground">
                          <option>USDT</option>
                          <option>USDC</option>
                          <option>ETH</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input placeholder="0.00" className="bg-background border-border" />
                      </div>
                      <div className="text-sm text-muted-foreground">≈ $0.00 USD</div>
                      <Button className="w-full bg-green-500 hover:bg-green-600 neon-glow">Convert to USD</Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button className="w-full bg-green-500 hover:bg-green-600 neon-glow">Deposit Tokens</Button>
                      <Button variant="outline" className="w-full bg-transparent">
                        Withdraw Tokens
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent">
                        Swap Tokens
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === "transactions" && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
                    <p className="text-muted-foreground">View all your tipping activity.</p>
                  </div>
                  <Button variant="outline">Export CSV</Button>
                </div>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Transaction History</CardTitle>
                    <CardDescription>All your tips sent and received</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          type: "sent",
                          user: "@creator1",
                          amount: "$25.00",
                          token: "USDC",
                          time: "2024-01-15 14:30",
                          status: "completed",
                          hash: "0x1234...5678",
                        },
                        {
                          type: "received",
                          user: "@supporter1",
                          amount: "$10.00",
                          token: "ETH",
                          time: "2024-01-15 12:15",
                          status: "completed",
                          hash: "0x2345...6789",
                        },
                        {
                          type: "sent",
                          user: "@creator2",
                          amount: "$15.00",
                          token: "USDC",
                          time: "2024-01-14 18:45",
                          status: "completed",
                          hash: "0x3456...7890",
                        },
                      ].map((tx, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                tx.type === "sent"
                                  ? "bg-red-100 dark:bg-red-900/30"
                                  : "bg-green-100 dark:bg-green-900/30"
                              }`}
                            >
                              {tx.type === "sent" ? (
                                <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                              ) : (
                                <ArrowDownRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-card-foreground">
                                {tx.type === "sent" ? "Sent to" : "Received from"} {tx.user}
                              </p>
                              <p className="text-sm text-muted-foreground">{tx.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-medium text-card-foreground">{tx.amount}</p>
                              <p className="text-sm text-muted-foreground">{tx.token}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800">{tx.status}</Badge>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                  <p className="text-muted-foreground">Manage your account preferences and security.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-card-foreground">Profile Settings</CardTitle>
                      <CardDescription>Update your profile information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="display-name" className="text-card-foreground">
                          Display Name
                        </Label>
                        <Input id="display-name" defaultValue="John Doe" className="bg-background border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitter-handle" className="text-card-foreground">
                          Twitter Handle
                        </Label>
                        <Input id="twitter-handle" defaultValue="@johndoe" className="bg-background border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-card-foreground">
                          Bio
                        </Label>
                        <Input
                          id="bio"
                          placeholder="Tell us about yourself..."
                          className="bg-background border-border"
                        />
                      </div>
                      <Button className="bg-green-500 hover:bg-green-600 neon-glow">Save Changes</Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-card-foreground">Notification Preferences</CardTitle>
                      <CardDescription>Choose what notifications you want to receive</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-card-foreground">Tips Received</p>
                          <p className="text-sm text-muted-foreground">Get notified when you receive tips</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-card-foreground">Tips Sent</p>
                          <p className="text-sm text-muted-foreground">Confirmation when tips are sent</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-card-foreground">Bot Activity</p>
                          <p className="text-sm text-muted-foreground">Updates on bot transactions</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
