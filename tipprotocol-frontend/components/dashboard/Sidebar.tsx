"use client"

import { Button } from "@/components/ui/button"
import { LayoutDashboard, Wallet, History, Settings, Bot, Menu, X } from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "transactions", label: "Transactions", icon: History },
    { id: "bot", label: "Bot Management", icon: Bot },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden bg-card border-b border-border p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          Menu
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          w-64 bg-card border-r border-border 
          transform transition-transform duration-300 ease-in-out
          lg:transform-none lg:transition-none
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isMobileMenuOpen ? "top-0" : "top} : '-translate-x-full lg:translate-x-0"}
          ${isMobileMenuOpen ? "top-0" : "top-16 lg:top-0"}
        `}
      >
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
                onClick={() => handleTabChange(item.id)}
              >
                <item.icon className="mr-3 w-4 h-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
