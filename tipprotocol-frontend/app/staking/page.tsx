"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"

import { TrendingUp, Coins, Clock, Award, ArrowUpRight, Lock, Unlock, Calculator } from "lucide-react"
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
  { name: "Jan", rewards: 0, staked: 0 },
  { name: "Feb", rewards: 0, staked: 0 },
  { name: "Mar", rewards: 0, staked: 0 },
  { name: "Apr", rewards: 0, staked: 0 },
  { name: "May", rewards: 0, staked: 0 },
  { name: "Jun", rewards: 0, staked: 0 },
]

const poolData = [
  { name: "30 Days", value: 0, color: "#10b981" },
  { name: "90 Days", value: 0, color: "#059669" },
  { name: "180 Days", value: 0, color: "#047857" },
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
      totalStaked: "0 TIP",
      participants: "0",
      lockPeriod: "30 days",
      id: "30",
    },
    {
      duration: "90 Days",
      apr: "18%",
      minStake: "500 TIP",
      totalStaked: "0 TIP",
      participants: "0",
      lockPeriod: "90 days",
      id: "90",
    },
    {
      duration: "180 Days",
      apr: "25%",
      minStake: "1000 TIP",
      totalStaked: "0 TIP",
      participants: "0",
      lockPeriod: "180 days",
      id: "180",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold text-foreground">TIP Token Staking</h1>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse">
              🚀 Coming Soon
            </div>
          </div>
          <p className="text-muted-foreground">Stake your TIP tokens and earn rewards with competitive APR rates.</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Staked</p>
                  <p className="text-2xl font-bold text-card-foreground">0 TIP</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Lock className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-muted-foreground">≈ $0.00</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Rewards</p>
                  <p className="text-2xl font-bold text-card-foreground">0 TIP</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-muted-foreground">0% APR</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold text-card-foreground">0 TIP</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-muted-foreground">≈ $0.00</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Next Reward</p>
                  <p className="text-2xl font-bold text-card-foreground">0 TIP</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-muted-foreground">No active stakes</span>
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
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No staking activity yet</p>
                    <p className="text-sm">Start staking to see your performance chart</p>
                  </div>
                </div>
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
                    <span>Available: 0 TIP</span>
                    <button className="text-green-600 hover:text-green-700 opacity-50 cursor-not-allowed">Max</button>
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
                      <span className="text-card-foreground">~0 TIP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly:</span>
                      <span className="text-card-foreground">~0 TIP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Yearly:</span>
                      <span className="text-card-foreground">~0 TIP</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-green-500 hover:bg-green-600 opacity-50 cursor-not-allowed" disabled>
                  <Lock className="w-4 h-4 mr-2" />
                  Stake Tokens
                </Button>
                <p className="text-xs text-muted-foreground text-center">No TIP tokens available to stake</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Pool Distribution</CardTitle>
                <CardDescription>Your staking across different pools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-muted opacity-50"></div>
                    <p>No active stakes</p>
                    <p className="text-sm">Your pool distribution will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full bg-transparent opacity-50 cursor-not-allowed" disabled>
                  <Award className="w-4 h-4 mr-2" />
                  Claim Rewards
                </Button>
                <Button variant="outline" className="w-full bg-transparent opacity-50 cursor-not-allowed" disabled>
                  <Unlock className="w-4 h-4 mr-2" />
                  Unstake Tokens
                </Button>
                <Button variant="outline" className="w-full bg-transparent opacity-50 cursor-not-allowed" disabled>
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