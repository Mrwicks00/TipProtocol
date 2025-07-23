"use client"

import type { TwitterBotCommand, TwitterBotResponse } from "./types"

export class TwitterBot {
  private static readonly BOT_HANDLE = "@TipBot"

  static parseCommand(tweetText: string): TwitterBotCommand | null {
    // Remove the bot mention and clean up the text
    const cleanText = tweetText.replace(this.BOT_HANDLE, "").trim()

    // Parse tip command: "tip @creator $5 USDC Great content!"
    const tipRegex = /^tip\s+@(\w+)\s+\$?(\d+(?:\.\d+)?)\s*(\w+)?\s*(.*)?$/i
    const tipMatch = cleanText.match(tipRegex)

    if (tipMatch) {
      return {
        type: "tip",
        recipient: tipMatch[1],
        amount: tipMatch[2],
        token: tipMatch[3] || "ETH",
        message: tipMatch[4]?.trim() || "",
      }
    }

    // Parse balance command: "balance"
    if (cleanText.toLowerCase().includes("balance")) {
      return { type: "balance" }
    }

    // Parse help command: "help"
    if (cleanText.toLowerCase().includes("help")) {
      return { type: "help" }
    }

    return null
  }

  static async executeTipCommand(
    command: TwitterBotCommand,
    tipperAddress: string,
    contractFunction: (recipient: string, amount: string, message: string) => Promise<any>,
  ): Promise<TwitterBotResponse> {
    try {
      if (!command.recipient || !command.amount) {
        return {
          success: false,
          message: "Invalid tip command. Use: @TipBot tip @creator $5 Great content!",
          error: "Missing recipient or amount",
        }
      }

      // Execute the tip through the smart contract
      const result = await contractFunction(command.recipient, command.amount, command.message || "")

      return {
        success: true,
        message: `Successfully tipped @${command.recipient} ${command.amount} ${command.token}! 🎉`,
        transactionHash: result.hash,
      }
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to send tip. Please check your balance and try again.",
        error: error.message,
      }
    }
  }

  static generateHelpMessage(): string {
    return `
🤖 TipBot Commands:

💰 **Tip a creator:**
@TipBot tip @creator $5 Amazing content!

📊 **Check balance:**
@TipBot balance

❓ **Get help:**
@TipBot help

Supported tokens: ETH, USDC, USDT
    `.trim()
  }

  static formatTipNotification(
    tipper: string,
    recipient: string,
    amount: string,
    token: string,
    message?: string,
  ): string {
    const baseMessage = `🎉 @${recipient} received a ${amount} ${token} tip from @${tipper}!`
    return message ? `${baseMessage}\n\n"${message}"` : baseMessage
  }

  static validateTipAmount(amount: string, token = "ETH"): { valid: boolean; error?: string } {
    const numAmount = Number.parseFloat(amount)

    if (isNaN(numAmount) || numAmount <= 0) {
      return { valid: false, error: "Invalid amount" }
    }

    // Set minimum tip amounts per token
    const minimums: Record<string, number> = {
      ETH: 0.001,
      USDC: 1,
      USDT: 1,
    }

    const minimum = minimums[token.toUpperCase()] || 0.001

    if (numAmount < minimum) {
      return { valid: false, error: `Minimum tip amount for ${token} is ${minimum}` }
    }

    // Set maximum tip amounts for safety
    const maximums: Record<string, number> = {
      ETH: 10,
      USDC: 10000,
      USDT: 10000,
    }

    const maximum = maximums[token.toUpperCase()] || 10

    if (numAmount > maximum) {
      return { valid: false, error: `Maximum tip amount for ${token} is ${maximum}` }
    }

    return { valid: true }
  }
}
