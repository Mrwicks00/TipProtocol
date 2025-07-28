// components/dashboard/QuickTipCard.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";

interface QuickTipCardProps {
  isTipper: boolean;
  isLoading: boolean;
  onTip: (handle: string, amount: string, message: string) => Promise<void>;
  onBecomeTipper: () => Promise<void>;
}

export function QuickTipCard({ isTipper, isLoading, onTip, onBecomeTipper }: QuickTipCardProps) {
  const [tipRecipientHandle, setTipRecipientHandle] = useState("");
  const [tipAmount, setTipAmount] = useState("");
  const [tipMessage, setTipMessage] = useState("");

  const handleQuickTip = async () => {
    if (!tipRecipientHandle || !tipAmount || isNaN(Number(tipAmount)) || Number(tipAmount) <= 0) {
      alert("Please enter a valid recipient handle and amount.");
      return;
    }
    await onTip(tipRecipientHandle, tipAmount, tipMessage);
    setTipRecipientHandle("");
    setTipAmount("");
    setTipMessage("");
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Quick Tip</CardTitle>
        <CardDescription>Send a tip manually</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isTipper && (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 p-3 rounded-md text-sm">
            You are not a tipper. 
            <Button 
              variant="link" 
              onClick={onBecomeTipper} 
              className="p-0 h-auto text-yellow-800 dark:text-yellow-200 underline"
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
            placeholder="@username"
            className="bg-background border-border"
            value={tipRecipientHandle}
            onChange={(e) => setTipRecipientHandle(e.target.value)}
            disabled={isLoading || !isTipper}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (USDT)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="10.00"
            className="bg-background border-border"
            value={tipAmount}
            onChange={(e) => setTipAmount(e.target.value)}
            disabled={isLoading || !isTipper}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="message">Message (Optional)</Label>
          <Input
            id="message"
            placeholder="Your message here"
            className="bg-background border-border"
            value={tipMessage}
            onChange={(e) => setTipMessage(e.target.value)}
            disabled={isLoading || !isTipper}
          />
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
          className="w-full bg-green-500 hover:bg-green-600 neon-glow"
          disabled={isLoading || !isTipper || !tipRecipientHandle || !tipAmount || parseFloat(tipAmount) <= 0}
        >
          {isLoading ? "Sending Tip..." : "Send Tip"}
          <Send className="ml-2 w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}