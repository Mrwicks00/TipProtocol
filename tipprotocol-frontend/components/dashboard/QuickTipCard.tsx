// components/dashboard/QuickTipCard.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface QuickTipCardProps {
  isTipper: boolean;
  isLoading: boolean;
  usdtBalance: string;
  onTip: (handle: string, amount: string, message: string) => Promise<void>;
  onBecomeTipper: () => Promise<void>;
  // Add these for debugging
  onRefreshBalance?: () => Promise<void>;
  debugBalance?: () => void;
}

export function QuickTipCard({ 
  isTipper, 
  isLoading, 
  usdtBalance,
  onTip, 
  onBecomeTipper,
  onRefreshBalance,
  debugBalance
}: QuickTipCardProps) {
  const [tipRecipientHandle, setTipRecipientHandle] = useState("");
  const [tipAmount, setTipAmount] = useState("");
  const [tipMessage, setTipMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizeTwitterHandle = (handle: string): string => {
    // Remove @ if present and trim whitespace
    const normalized = handle.trim().replace(/^@/, "");
    
    // Basic validation for Twitter handle format
    if (!/^[a-zA-Z0-9_]{1,15}$/.test(normalized)) {
      throw new Error("Invalid Twitter handle format. Use only letters, numbers, and underscores (max 15 characters)");
    }
    
    return normalized;
  };

  const validateTipAmount = (amount: string): number => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) {
      throw new Error("Please enter a valid number for the tip amount");
    }
    
    if (numAmount <= 0) {
      throw new Error("Tip amount must be greater than 0");
    }
    
    if (numAmount < 0.01) {
      throw new Error("Minimum tip amount is 0.01 USDT");
    }
    
    // IMPROVED BALANCE CHECK with better error handling
    const currentBalance = parseFloat(usdtBalance || "0");
    
    console.log("💰 Balance validation:", {
      inputAmount: numAmount,
      currentBalance,
      usdtBalanceString: usdtBalance,
      sufficient: numAmount <= currentBalance
    });
    
    // Add some tolerance for floating point precision issues
    const tolerance = 0.000001; // Very small tolerance
    if (numAmount > (currentBalance + tolerance)) {
      console.error("❌ Insufficient balance detected:", {
        trying: numAmount,
        available: currentBalance,
        balanceString: usdtBalance,
        difference: numAmount - currentBalance
      });
      
      throw new Error(`Insufficient balance. You have ${currentBalance.toFixed(6)} USDT, but trying to tip ${numAmount} USDT`);
    }
    
    return numAmount;
  };

  const handleQuickTip = async () => {
    if (!isTipper) {
      toast.error("You must be a registered tipper to send tips");
      return;
    }

    // Debug balance before starting
    if (debugBalance) {
      debugBalance();
    }

    setIsSubmitting(true);
    
    try {
      // Validate and normalize the Twitter handle
      const normalizedHandle = normalizeTwitterHandle(tipRecipientHandle);
      
      // Validate the tip amount
      const validatedAmount = validateTipAmount(tipAmount);
      
      console.log("Sending tip:", {
        recipient: normalizedHandle,
        amount: validatedAmount,
        message: tipMessage,
        currentBalance: usdtBalance
      });

      // Call the tip function
      await onTip(normalizedHandle, tipAmount, tipMessage);
      
      // Clear form on success
      setTipRecipientHandle("");
      setTipAmount("");
      setTipMessage("");
      
      toast.success(`Successfully sent ${tipAmount} USDT to @${normalizedHandle}!`);
      
    } catch (error: any) {
      console.error("Tip sending failed:", error);
      
      // More specific error handling
      if (error.message) {
        toast.error(error.message);
      } else if (error.shortMessage) {
        toast.error(`Transaction failed: ${error.shortMessage}`);
      } else {
        toast.error("Failed to send tip. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const amount = parseFloat(tipAmount);
    const balance = parseFloat(usdtBalance || "0");
    
    return (
      isTipper &&
      tipRecipientHandle.trim() !== "" &&
      tipAmount.trim() !== "" &&
      !isNaN(amount) &&
      amount > 0 &&
      amount >= 0.01 &&
      amount <= balance
    );
  };

  // Parse balance for display with better error handling
  const displayBalance = () => {
    try {
      const balance = parseFloat(usdtBalance || "0");
      return balance.toFixed(6);
    } catch (error) {
      console.error("Error parsing balance for display:", error);
      return "Error";
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center justify-between">
          Quick Tip
          {/* Add refresh button for debugging */}
          {onRefreshBalance && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshBalance}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Send a tip manually • Balance: {displayBalance()} USDT
          {/* Add debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 mt-1">
              Raw balance: "{usdtBalance}"
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isTipper && (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 p-3 rounded-md text-sm">
            You are not a tipper. 
            <Button 
              variant="link" 
              onClick={onBecomeTipper} 
              className="p-0 h-auto text-yellow-800 dark:text-yellow-200 underline"
              disabled={isLoading}
            >
              Click here to become a tipper
            </Button> 
            to send tips.
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Twitter Handle</Label>
          <Input
            id="recipient"
            placeholder="username (without @)"
            className="bg-background border-border"
            value={tipRecipientHandle}
            onChange={(e) => setTipRecipientHandle(e.target.value)}
            disabled={isLoading || isSubmitting || !isTipper}
          />
          {tipRecipientHandle && (
            <p className="text-xs text-muted-foreground">
              Will send to: @{tipRecipientHandle.replace(/^@/, "")}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (USDT)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            max={usdtBalance || "0"}
            placeholder="10.00"
            className="bg-background border-border"
            value={tipAmount}
            onChange={(e) => setTipAmount(e.target.value)}
            disabled={isLoading || isSubmitting || !isTipper}
          />
          {tipAmount && parseFloat(tipAmount) > parseFloat(usdtBalance || "0") && (
            <p className="text-xs text-red-500">
              Insufficient balance. You have {displayBalance()} USDT
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="message">Message (Optional)</Label>
          <Input
            id="message"
            placeholder="Your message here"
            className="bg-background border-border"
            value={tipMessage}
            onChange={(e) => setTipMessage(e.target.value)}
            disabled={isLoading || isSubmitting || !isTipper}
            maxLength={280}
          />
          <p className="text-xs text-muted-foreground">
            {tipMessage.length}/280 characters
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="token">Token</Label>
          <select
            className="w-full p-2 border border-border rounded-md bg-background text-foreground"
            disabled
          >
            <option>USDT</option>
          </select>
        </div>
        
        <Button
          onClick={handleQuickTip}
          className="w-full bg-green-500 hover:bg-green-600 neon-glow disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || isSubmitting || !isFormValid()}
        >
          {isSubmitting ? "Sending Tip..." : isLoading ? "Loading..." : "Send Tip"}
          <Send className="ml-2 w-4 h-4" />
        </Button>
        
        {!isTipper && (
          <p className="text-xs text-muted-foreground text-center">
            Register as a tipper to unlock tipping functionality
          </p>
        )}

        {/* Debug section - only show in development */}
        {process.env.NODE_ENV === 'development' && debugBalance && (
          <div className="border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={debugBalance}
              className="w-full"
            >
              Debug Balance Info
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}