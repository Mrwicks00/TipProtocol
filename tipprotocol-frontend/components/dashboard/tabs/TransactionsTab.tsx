"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, MinusCircle, Eye, PlusCircle } from "lucide-react"

interface TipTransaction {
  type: "sent" | "received"
  user: string
  amount: string
  token: string
  message: string
  hash: `0x${string}`
  timestamp: string
}

interface DepositWithdrawalTransaction {
  type: "deposit" | "withdrawal"
  amount: string
  token: string
  hash: `0x${string}`
  timestamp: string
}

interface TransactionsTabProps {
  recentTips: TipTransaction[]
  recentDeposits: DepositWithdrawalTransaction[]
  recentWithdrawals: DepositWithdrawalTransaction[]
}

export function TransactionsTab({ recentTips, recentDeposits, recentWithdrawals }: TransactionsTabProps) {
  // Combine all transactions with proper typing
  const allTransactions = [
    ...recentTips.map((tx) => ({ ...tx, user: tx.user })),
    ...recentDeposits.map((tx) => ({ ...tx, user: undefined })),
    ...recentWithdrawals.map((tx) => ({ ...tx, user: undefined })),
  ]

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "sent":
        return <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />
      case "withdrawal":
        return <MinusCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
      case "deposit":
        return <PlusCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
      case "received":
      default:
        return <ArrowDownRight className="w-5 h-5 text-green-600 dark:text-green-400" />
    }
  }

  const getTransactionBg = (type: string) => {
    return type === "sent" || type === "withdrawal"
      ? "bg-red-100 dark:bg-red-900/30"
      : "bg-green-100 dark:bg-green-900/30"
  }

  const getTransactionText = (tx: any) => {
    switch (tx.type) {
      case "sent":
        return `Sent to ${tx.user}`
      case "received":
        return `Received from ${tx.user}`
      case "deposit":
        return "Deposited to Protocol"
      case "withdrawal":
        return "Withdrawn from Protocol"
      default:
        return "Unknown"
    }
  }

  // Sort by timestamp (newest first)
  const sortedTransactions = allTransactions.sort((a, b) => {
    // Convert timestamp to Date for proper sorting
    const dateA = new Date(a.timestamp)
    const dateB = new Date(b.timestamp)
    return dateB.getTime() - dateA.getTime()
  })

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-1">View all your tipping activity.</p>
        </div>
        <Button variant="outline" disabled className="self-start sm:self-auto bg-transparent">
          Export CSV
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground text-lg sm:text-xl">Transaction History (Live Events)</CardTitle>
          <CardDescription>
            Shows tips, deposits, and withdrawals as they happen (not persistent)
            {allTransactions.length > 0 && ` - ${allTransactions.length} recent transactions`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">No recent activity detected.</p>
              <p className="text-sm text-muted-foreground">
                Perform some transactions (tips, deposits, withdrawals) to see them appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedTransactions.map((tx, index) => (
                <div
                  key={`${tx.hash}-${index}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors gap-4"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${getTransactionBg(tx.type)}`}
                    >
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-card-foreground">{getTransactionText(tx)}</p>
                      <p className="text-sm text-muted-foreground">{new Date(tx.timestamp).toLocaleString()}</p>
                      {/* Show message for tips */}
                      {"message" in tx && tx.message && (
                        <p className="text-xs text-muted-foreground italic mt-1 break-words">"{tx.message}"</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="text-left sm:text-right">
                      <p className="font-medium text-card-foreground">
                        {tx.type === "sent" || tx.type === "withdrawal" ? "-" : "+"}$
                        {Number.parseFloat(tx.amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">{tx.token}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      >
                        completed
                      </Badge>
                      {tx.hash && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://explorer.morphl2.io/tx/${tx.hash}`, "_blank")}
                          title="View on Explorer"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <p>Tips: {recentTips.length}</p>
            <p>Deposits: {recentDeposits.length}</p>
            <p>Withdrawals: {recentWithdrawals.length}</p>
            <p>Total: {allTransactions.length}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
