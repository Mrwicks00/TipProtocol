// components/dashboard/tabs/WalletTab.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, MinusCircle } from "lucide-react";

interface WalletTabProps {
  usdtBalance: string;
  isLoading: boolean;
  onDeposit: (amount: string) => Promise<void>;
  onWithdraw: (amount: string) => Promise<void>;
}

export function WalletTab({ usdtBalance, isLoading, onDeposit, onWithdraw }: WalletTabProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      alert("Please enter a valid amount to deposit.");
      return;
    }
    await onDeposit(depositAmount);
    setDepositAmount("");
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
      alert("Please enter a valid amount to withdraw.");
      return;
    }
    await onWithdraw(withdrawAmount);
    setWithdrawAmount("");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Wallet</h1>
        <p className="text-muted-foreground">Manage your tokens and balances.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Token Balances</CardTitle>
            <CardDescription>Your current token holdings within Tip Protocol</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* USDT Balance */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">U</span>
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">Tether</p>
                    <p className="text-sm text-muted-foreground">USDT</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-card-foreground">
                    {parseFloat(usdtBalance).toFixed(2)} USDT
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">${parseFloat(usdtBalance).toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground"> (Live) </span>
                  </div>
                </div>
              </div>
              
              {/* ETH internal balance (placeholder) */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg opacity-50 cursor-not-allowed">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">E</span>
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">Ethereum (Internal)</p>
                    <p className="text-sm text-muted-foreground">ETH</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-card-foreground">0.0000 ETH</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">$0.00</span>
                    <span className="text-sm text-muted-foreground"> (Not currently supported for tipping) </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground">Deposit USDT</CardTitle>
            <CardDescription>Transfer USDT from your wallet to Tip Protocol</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                placeholder="0.00"
                className="bg-background border-border"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleDeposit}
              className="w-full bg-green-500 hover:bg-green-600 neon-glow"
              disabled={isLoading || !depositAmount || parseFloat(depositAmount) <= 0}
            >
              {isLoading ? "Depositing..." : "Deposit USDT"}
              <PlusCircle className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Withdraw USDT</CardTitle>
            <CardDescription>Transfer USDT from Tip Protocol to your wallet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                placeholder="0.00"
                className="bg-background border-border"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleWithdraw}
              className="w-full bg-red-500 hover:bg-red-600 neon-glow"
              disabled={isLoading || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > parseFloat(usdtBalance)}
            >
              {isLoading ? "Withdrawing..." : "Withdraw USDT"}
              <MinusCircle className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
