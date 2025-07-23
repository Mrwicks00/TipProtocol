"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Users,
  Search,
  Filter,
  Crown,
  Zap,
  DollarSign,
  ArrowUpRight,
} from "lucide-react"
import { Navbar } from "@/components/navbar"

const topTippers = [
  {
    rank: 1,
    name: "CryptoWhale",
    handle: "@cryptowhale",
    avatar: "/placeholder.svg?height=50&width=50&text=CW",
    totalTipped: "$12,450",
    tipsCount: 234,
    change: "+15%",
    badge: "Platinum Tipper",
  },
  {
    rank: 2,
    name: "GeneroousGiver",
    handle: "@generousgiver",
    avatar: "/placeholder.svg?height=50&width=50&text=GG",
    totalTipped: "$8,920",
    tipsCount: 189,
    change: "+8%",
    badge: "Gold Tipper",
  },
  {
    rank: 3,
    name: "TipMaster",
    handle: "@tipmaster",
    avatar: "/placeholder.svg?height=50&width=50&text=TM",
    totalTipped: "$7,650",
    tipsCount: 156,
    change: "+12%",
    badge: "Gold Tipper",
  },
  {
    rank: 4,
    name: "SupporterOne",
    handle: "@supporterone",
    avatar: "/placeholder.svg?height=50&width=50&text=SO",
    totalTipped: "$6,340",
    tipsCount: 142,
    change: "+5%",
    badge: "Silver Tipper",
  },
  {
    rank: 5,
    name: "KindHeart",
    handle: "@kindheart",
    avatar: "/placeholder.svg?height=50&width=50&text=KH",
    totalTipped: "$5,890",
    tipsCount: 128,
    change: "+18%",
    badge: "Silver Tipper",
  },
]

const topCreators = [
  {
    rank: 1,
    name: "TechGuru",
    handle: "@techguru",
    avatar: "/placeholder.svg?height=50&width=50&text=TG",
    totalEarned: "$18,750",
    tipsReceived: 456,
    supporters: 89,
    change: "+22%",
    badge: "Top Creator",
  },
  {
    rank: 2,
    name: "ArtistPro",
    handle: "@artistpro",
    avatar: "/placeholder.svg?height=50&width=50&text=AP",
    totalEarned: "$14,320",
    tipsReceived: 378,
    supporters: 67,
    change: "+16%",
    badge: "Rising Star",
  },
  {
    rank: 3,
    name: "CodeMaster",
    handle: "@codemaster",
    avatar: "/placeholder.svg?height=50&width=50&text=CM",
    totalEarned: "$12,890",
    tipsReceived: 298,
    supporters: 54,
    change: "+19%",
    badge: "Tech Leader",
  },
  {
    rank: 4,
    name: "ContentKing",
    handle: "@contentking",
    avatar: "/placeholder.svg?height=50&width=50&text=CK",
    totalEarned: "$11,450",
    tipsReceived: 267,
    supporters: 48,
    change: "+11%",
    badge: "Content Pro",
  },
  {
    rank: 5,
    name: "DesignQueen",
    handle: "@designqueen",
    avatar: "/placeholder.svg?height=50&width=50&text=DQ",
    totalEarned: "$9,780",
    tipsReceived: 234,
    supporters: 42,
    change: "+14%",
    badge: "Design Expert",
  },
]

export default function LeaderboardPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("tippers")

  const user = {
    name: "John Doe",
    twitterHandle: "@johndoe",
    avatar: "/placeholder.svg?height=100&width=100&text=JD",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    isConnected: true,
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">
            #{rank}
          </span>
        )
    }
  }

  const getBadgeColor = (badge: string) => {
    if (badge.includes("Platinum") || badge.includes("Top"))
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
    if (badge.includes("Gold") || badge.includes("Rising"))
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    if (badge.includes("Silver") || badge.includes("Tech"))
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground">Discover top tippers and creators in the TipProtocol community.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tips</p>
                  <p className="text-2xl font-bold text-card-foreground">$2.4M</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 dark:text-green-400">+12.5%</span>
                <span className="text-muted-foreground ml-2">this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Tippers</p>
                  <p className="text-2xl font-bold text-card-foreground">8,450</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 dark:text-green-400">+8.2%</span>
                <span className="text-muted-foreground ml-2">this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Top Creators</p>
                  <p className="text-2xl font-bold text-card-foreground">3,200</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 dark:text-green-400">+15.3%</span>
                <span className="text-muted-foreground ml-2">this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Your Rank</p>
                  <p className="text-2xl font-bold text-card-foreground">#247</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 dark:text-green-400">+23 positions</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Leaderboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tippers" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Top Tippers
            </TabsTrigger>
            <TabsTrigger value="creators" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Top Creators
            </TabsTrigger>
          </TabsList>

          {/* Top Tippers */}
          <TabsContent value="tippers">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Top Tippers</CardTitle>
                <CardDescription>Users who have tipped the most to creators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topTippers.map((tipper, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10">{getRankIcon(tipper.rank)}</div>
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={tipper.avatar || "/placeholder.svg"} alt={tipper.name} />
                          <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white">
                            {tipper.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-card-foreground">{tipper.name}</p>
                            <Badge className={getBadgeColor(tipper.badge)}>{tipper.badge}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{tipper.handle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-card-foreground">{tipper.totalTipped}</p>
                        <div className="flex items-center justify-end space-x-2 text-sm">
                          <span className="text-muted-foreground">{tipper.tipsCount} tips</span>
                          <span className="text-green-600 dark:text-green-400">{tipper.change}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Creators */}
          <TabsContent value="creators">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Top Creators</CardTitle>
                <CardDescription>Creators who have earned the most from tips</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCreators.map((creator, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10">{getRankIcon(creator.rank)}</div>
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={creator.avatar || "/placeholder.svg"} alt={creator.name} />
                          <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white">
                            {creator.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-card-foreground">{creator.name}</p>
                            <Badge className={getBadgeColor(creator.badge)}>{creator.badge}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{creator.handle}</p>
                          <p className="text-xs text-muted-foreground">{creator.supporters} supporters</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-card-foreground">{creator.totalEarned}</p>
                        <div className="flex items-center justify-end space-x-2 text-sm">
                          <span className="text-muted-foreground">{creator.tipsReceived} tips</span>
                          <span className="text-green-600 dark:text-green-400">{creator.change}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Your Performance */}
        <Card className="bg-card border-border mt-8">
          <CardHeader>
            <CardTitle className="text-card-foreground">Your Performance</CardTitle>
            <CardDescription>See how you rank among other users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-card-foreground">As a Tipper</h3>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-card-foreground">Current Rank</p>
                    <p className="text-sm text-muted-foreground">Among all tippers</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-card-foreground">#247</p>
                    <p className="text-sm text-green-600 dark:text-green-400">↑23</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Tipped:</span>
                    <span className="text-card-foreground font-medium">$1,250</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tips Sent:</span>
                    <span className="text-card-foreground font-medium">47</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-card-foreground">As a Creator</h3>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-card-foreground">Current Rank</p>
                    <p className="text-sm text-muted-foreground">Among all creators</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-card-foreground">#892</p>
                    <p className="text-sm text-green-600 dark:text-green-400">↑156</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Earned:</span>
                    <span className="text-card-foreground font-medium">$892</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tips Received:</span>
                    <span className="text-card-foreground font-medium">23</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
