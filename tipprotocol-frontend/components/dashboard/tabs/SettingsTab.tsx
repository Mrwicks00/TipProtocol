// components/dashboard/tabs/SettingsTab.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface SettingsTabProps {
  currentUserProfile: any;
  isCreator: boolean;
  isTipper: boolean;
  isLoading: boolean;
  onBecomeCreator: () => Promise<void>;
  onBecomeTipper: () => Promise<void>;
}

export function SettingsTab({
  currentUserProfile,
  isCreator,
  isTipper,
  isLoading,
  onBecomeCreator,
  onBecomeTipper,
}: SettingsTabProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Profile Settings</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name" className="text-card-foreground">
                Display Name
              </Label>
              <Input
                id="display-name"
                defaultValue={currentUserProfile?.twitterHandle || "N/A"}
                className="bg-background border-border"
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="twitter-handle" className="text-card-foreground">
                Twitter Handle
              </Label>
              <Input
                id="twitter-handle"
                defaultValue={currentUserProfile?.twitterHandle || "@unregistered"}
                className="bg-background border-border"
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user-type" className="text-card-foreground">
                User Type
              </Label>
              <div className="flex space-x-4">
                <Badge variant={isCreator ? "default" : "outline"} className={isCreator ? "bg-green-500 text-white" : ""}>
                  {isCreator ? "Creator" : "Not a Creator"}
                </Badge>
                <Badge variant={isTipper ? "default" : "outline"} className={isTipper ? "bg-blue-500 text-white" : ""}>
                  {isTipper ? "Tipper" : "Not a Tipper"}
                </Badge>
              </div>
              {!isCreator && (
                <Button 
                  onClick={onBecomeCreator} 
                  className="mt-2 bg-green-500 hover:bg-green-600 neon-glow" 
                  disabled={isLoading}
                >
                  {isLoading ? "Becoming Creator..." : "Become a Creator"}
                </Button>
              )}
              {!isTipper && (
                <Button 
                  onClick={onBecomeTipper} 
                  className="mt-2 bg-blue-500 hover:bg-blue-600 neon-glow" 
                  disabled={isLoading}
                >
                  {isLoading ? "Becoming Tipper..." : "Become a Tipper"}
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-card-foreground">
                Bio
              </Label>
              <Input
                id="bio"
                placeholder="Tell us about yourself..."
                className="bg-background border-border"
                disabled
              />
            </div>
            
            <Button className="bg-green-500 hover:bg-green-600 neon-glow" disabled>
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Notification Preferences</CardTitle>
            <CardDescription>These are not implemented in the contract, but can be added off-chain.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-card-foreground">Tips Received</p>
                <p className="text-sm text-muted-foreground">Get notified when you receive tips</p>
              </div>
              <Switch defaultChecked disabled />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-card-foreground">Tips Sent</p>
                <p className="text-sm text-muted-foreground">Confirmation when tips are sent</p>
              </div>
              <Switch defaultChecked disabled />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-card-foreground">Bot Activity</p>
                <p className="text-sm text-muted-foreground">Updates on bot transactions</p>
              </div>
              <Switch disabled />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
