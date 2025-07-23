"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, ExternalLink, Users, Calendar, MessageCircle } from "lucide-react"
import type { TwitterUser } from "@/lib/twitter/types"
import { TwitterUtils } from "@/lib/twitter/utils"

interface TwitterProfileCardProps {
  user: TwitterUser
  showStats?: boolean
  compact?: boolean
}

export function TwitterProfileCard({ user, showStats = true, compact = false }: TwitterProfileCardProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
        <Avatar className="h-10 w-10">
          <AvatarImage src={TwitterUtils.getProfileImageUrl(user, "normal") || "/placeholder.svg"} alt={user.name} />
          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-card-foreground truncate">{user.name}</p>
            {TwitterUtils.isVerified(user) && <Check className="w-4 h-4 text-blue-500" />}
          </div>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(TwitterUtils.generateTwitterUrl(user.username), "_blank")}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-blue-500/20">
            <AvatarImage src={TwitterUtils.getProfileImageUrl(user, "bigger") || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-lg">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-card-foreground truncate">{user.name}</h3>
              {TwitterUtils.isVerified(user) && (
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  <Check className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-3">@{user.username}</p>

            {user.description && (
              <p className="text-sm text-card-foreground mb-4 leading-relaxed">{user.description}</p>
            )}

            {showStats && user.public_metrics && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-card-foreground">
                    {TwitterUtils.formatFollowerCount(user.public_metrics.followers_count)}
                  </span>
                  <span className="text-muted-foreground">followers</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-card-foreground">
                    {TwitterUtils.formatFollowerCount(user.public_metrics.tweet_count)}
                  </span>
                  <span className="text-muted-foreground">tweets</span>
                </div>
              </div>
            )}

            {user.created_at && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Calendar className="w-3 h-3" />
                <span>Joined {TwitterUtils.getAccountAge(user.created_at)}</span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(TwitterUtils.generateTwitterUrl(user.username), "_blank")}
              className="bg-transparent"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Twitter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
