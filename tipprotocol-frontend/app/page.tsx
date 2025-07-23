import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Twitter, Zap, Shield, Users, TrendingUp, Bot, Wallet } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-muted/50 to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Badge className="mb-6 bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-500/50">
              <Bot className="w-4 h-4 mr-2" />
              Twitter Bot Integration
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Tip Your Favorite
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-600">
                Creators Seamlessly
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Send tips to content creators instantly via Twitter bot integration. Gasless transactions, multi-token
              support, and unified profiles make tipping effortless.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 neon-glow">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-3 border-border hover:bg-muted bg-transparent">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Modern Tipping
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for creators and supporters who want seamless, secure, and social tipping experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-border shadow-lg hover:shadow-xl transition-all duration-300 group hover-lift bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform neon-glow">
                  <Twitter className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Twitter Bot Integration</h3>
                <p className="text-muted-foreground">
                  Just tag @TipBot to send tips instantly. No complex interfaces or additional apps needed.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-lg hover:shadow-xl transition-all duration-300 group hover-lift bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform neon-glow">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Gasless Transactions</h3>
                <p className="text-muted-foreground">
                  No gas fees, we handle the blockchain complexity. Focus on supporting creators, not transaction costs.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-lg hover:shadow-xl transition-all duration-300 group hover-lift bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform neon-glow">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Multi-Token Support</h3>
                <p className="text-muted-foreground">
                  Tip with ETH, USDC, and other supported tokens. Choose the currency that works best for you.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-lg hover:shadow-xl transition-all duration-300 group hover-lift bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform neon-glow">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Unified Profiles</h3>
                <p className="text-muted-foreground">
                  One account for both tipping and receiving. Switch between creator and supporter modes seamlessly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to start tipping creators on Twitter
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Connect Wallet",
                description: "Connect your wallet and register your account with TipProtocol",
                icon: Wallet,
              },
              {
                step: "02",
                title: "Authorize Bot",
                description: "Authorize the Twitter bot to send tips on your behalf with daily limits",
                icon: Shield,
              },
              {
                step: "03",
                title: "Tag & Tip",
                description: "Tag @TipBot with creator handle and amount in any Twitter reply",
                icon: Twitter,
              },
              {
                step: "04",
                title: "Instant Transfer",
                description: "Tip gets sent automatically with zero gas fees and instant confirmation",
                icon: Zap,
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-20 h-20 bg-background border-4 border-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg neon-glow">
                    <item.icon className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-sm font-bold text-green-600 mb-2">STEP {item.step}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full">
                    <ArrowRight className="w-6 h-6 text-green-500 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Growing Community</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of creators and supporters already using TipProtocol
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Total Tips Sent", value: "$2.4M", icon: TrendingUp },
              { label: "Active Creators", value: "12,500", icon: Users },
              { label: "Supported Tokens", value: "25+", icon: Wallet },
              { label: "Twitter Integrations", value: "50K+", icon: Twitter },
            ].map((stat, index) => (
              <Card key={index} className="border-border shadow-lg text-center bg-card hover-lift">
                <CardContent className="p-8">
                  <stat.icon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-card-foreground mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Start Tipping?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join the future of creator support. Connect your wallet and start tipping in minutes.
          </p>
          <Link href="/auth">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-green-400 dark:hover:bg-gray-800 px-8 py-3 neon-glow"
            >
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 dark:bg-gray-900 text-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center neon-glow">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">TipProtocol</span>
              </div>
              <p className="text-muted-foreground">The future of creator tipping on social media.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 TipProtocol. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
