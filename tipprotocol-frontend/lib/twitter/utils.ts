"use client"

import type { TwitterUser } from "./types"

export class TwitterUtils {
  static formatHandle(handle: string): string {
    return handle.startsWith("@") ? handle : `@${handle}`
  }

  static removeAtSymbol(handle: string): string {
    return handle.startsWith("@") ? handle.slice(1) : handle
  }

  static formatFollowerCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  static getProfileImageUrl(user: TwitterUser, size: "normal" | "bigger" | "mini" = "normal"): string {
    if (!user.profile_image_url) return "/placeholder.svg?height=100&width=100&text=?"

    // Twitter profile images come with _normal suffix by default
    // We can replace it with different sizes
    const sizeMap = {
      mini: "_mini", // 24x24
      normal: "_normal", // 48x48
      bigger: "_bigger", // 73x73
    }

    return user.profile_image_url.replace("_normal", sizeMap[size])
  }

  static truncateDescription(description: string, maxLength = 100): string {
    if (description.length <= maxLength) return description
    return description.slice(0, maxLength).trim() + "..."
  }

  static getAccountAge(createdAt: string): string {
    const created = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 30) {
      return `${diffDays} days ago`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months > 1 ? "s" : ""} ago`
    } else {
      const years = Math.floor(diffDays / 365)
      return `${years} year${years > 1 ? "s" : ""} ago`
    }
  }

  static isVerified(user: TwitterUser): boolean {
    return user.verified === true
  }

  static generateTwitterUrl(username: string): string {
    return `https://twitter.com/${TwitterUtils.removeAtSymbol(username)}`
  }

  static extractMentions(text: string): string[] {
    const mentionRegex = /@(\w+)/g
    const mentions = []
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1])
    }

    return mentions
  }

  static sanitizeForDisplay(text: string): string {
    // Remove potentially harmful characters and limit length
    return text
      .replace(/[<>]/g, "") // Remove HTML-like characters
      .slice(0, 280) // Twitter character limit
      .trim()
  }
}
