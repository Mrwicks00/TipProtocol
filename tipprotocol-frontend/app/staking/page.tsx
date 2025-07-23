"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, Coins, Clock, Award, ArrowUpRight, Lock, Unlock, Calculator } from "lucide-react"
import { Navbar } from "@/components/navbar"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const stakingData = [
  { name: "Jan", rewards: 120, staked: 1000 },
  { name: "Feb", rewards: 145, staked: 1200 },
  { name: "Mar", rewards: 180, staked: 1500 },
  { name: "Apr", rewards: 220, staked: 1800 },
  { name: "May", rewards: 250, staked: 2000 },
  { name: "Jun", rewards: 280, staked: 2200 },
]

const poolData = [
  { name: "30 Days", value: 35, color: "#10b981" },
  { name: "90 Days", value: 45, color: "#059669" },
  { name: "180 Days", value: 20, color: "#047857" },
]

export default function StakingPage() {
  const [stakeAmount, setStakeAmount] = useState("")
  const [selectedPool, setSelectedPool] = useState("90")

  const user = {
    name: "John Doe",
    twitterHandle: "@johndoe",
    avatar: "/placeholder.svg?height=100&width=100&text=JD",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    isConnected: true,
  }

  const stakingPools = [
    {
      duration: "30 Days",
      apr: "12%",
      minStake: "100 TIP",
      totalStaked: "1.2M TIP",
      participants: "2,450",
      lockPeriod: "30 days",
      id: "30",
    },
    {
      duration: "90 Days",
      apr: "18%",
      minStake: "500 TIP",
      totalStaked: "3.8M TIP",
      participants: "1,890",
      lockPeriod: "90 days",
      id: "90",
    },
    {
      duration: "180 Days",
      apr: "25%",
      minStake: "1000 TIP",
      totalStaked: "2.1M TIP",
      participants: "1,120",
      lockPeriod: "180 days",
      id: "180",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">TIP Token Staking</h1>
          <p className="text-muted-foreground">Stake your TIP tokens and earn rewards with competitive APR rates.</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Staked</p>
                  <p className="text-2xl font-bold text-card-foreground">2,500 TIP</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Lock className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-muted-foreground">≈ $5,250.00</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Rewards</p>
                  <p className="text-2xl font-bold text-card-foreground">450 TIP</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 dark:text-green-400">+18% APR</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold text-card-foreground">1,250 TIP</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-muted-foreground">≈ $2,625.00</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Next Reward</p>
                  <p className="text-2xl font-bold text-card-foreground">12.5 TIP</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-muted-foreground">in 2 days</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Staking Pools */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Staking Pools</CardTitle>
                <CardDescription>Choose a staking pool that fits your investment strategy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stakingPools.map((pool) => (
                    <div
                      key={pool.id}
                      className={`p-6 border rounded-lg cursor-pointer transition-all ${
                        selectedPool === pool.id
                          ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                          : "border-border hover:border-green-300 dark:hover:border-green-700"
                      }`}
                      onClick={() => setSelectedPool(pool.id)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-card-foreground">{pool.duration}</h3>
                          <p className="text-sm text-muted-foreground">Lock Period: {pool.lockPeriod}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{pool.apr}</div>
                          <p className="text-sm text-muted-foreground">APR</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Min Stake</p>
                          <p className="font-medium text-card-foreground">{pool.minStake}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Staked</p>
                          <p className="font-medium text-card-foreground">{pool.totalStaked}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Participants</p>
                          <p className="font-medium text-card-foreground">{pool.participants}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Staking Performance */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Staking Performance</CardTitle>
                <CardDescription>Your staking rewards and balance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stakingData}>
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
                    <Line type="monotone" dataKey="rewards" stroke="#10b981" strokeWidth={2} name="Rewards" />
                    <Line type="monotone" dataKey="staked" stroke="#3b82f6" strokeWidth={2} name="Staked Amount" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Staking Actions */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Stake TIP Tokens</CardTitle>
                <CardDescription>Stake your tokens to earn rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stake-amount">Amount to Stake</Label>
                  <Input
                    id="stake-amount"
                    placeholder="0.00"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="bg-background border-border"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Available: 1,250 TIP</span>
                    <button className="text-green-600 hover:text-green-700">Max</button>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-card-foreground">Estimated Rewards</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily:</span>
                      <span className="text-card-foreground">~0.49 TIP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly:</span>
                      <span className="text-card-foreground">~15 TIP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Yearly:</span>
                      <span className="text-green-600 font-medium">~180 TIP</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-green-500 hover:bg-green-600 neon-glow">
                  <Lock className="w-4 h-4 mr-2" />
                  Stake Tokens
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Pool Distribution</CardTitle>
                <CardDescription>Your staking across different pools</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={poolData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {poolData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {poolData.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-muted-foreground">{entry.name}</span>
                      </div>
                      <span className="text-card-foreground">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full bg-transparent">
                  <Award className="w-4 h-4 mr-2" />
                  Claim Rewards
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Unlock className="w-4 h-4 mr-2" />
                  Unstake Tokens
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Compound Rewards
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
