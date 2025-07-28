// components/dashboard/Sidebar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { LayoutDashboard, Wallet, History, Settings, Bot } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "transactions", label: "Transactions", icon: History },
    { id: "bot", label: "Bot Management", icon: Bot },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-64 bg-card border-r border-border h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-6">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === item.id
                  ? "bg-green-500 hover:bg-green-600 text-white neon-glow"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="mr-3 w-4 h-4" />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
}
