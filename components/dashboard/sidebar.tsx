"use client"

import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  ShoppingBag,
  Home,
  Package,
  ShoppingCart,
  User,
  LogOut,
  PlusCircle,
  Settings,
  Bell,
  Heart,
  MessageSquare,
  Menu,
  ChevronRight,
  ChevronLeft,
  Store,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DashboardSidebar({ open, onOpenChange }: SidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIsMobile()

    // Add event listener
    window.addEventListener("resize", checkIsMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path)
  }

  const toggleSidebar = () => {
    onOpenChange(!open)
  }

  const NavItem = ({ href, icon: Icon, label, badge }: { href: string; icon: any; label: string; badge?: number }) => (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200",
        isActive(href)
          ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400"
          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
      )}
    >
      <div className="relative">
        <Icon className={cn("h-5 w-5", isActive(href) ? "text-emerald-600 dark:text-emerald-400" : "")} />
        {badge && !open && (
          <Badge className="absolute -right-2 -top-2 h-4 w-4 rounded-full p-0 text-[10px] flex items-center justify-center bg-emerald-500 text-white md:flex hidden">
            {badge}
          </Badge>
        )}
      </div>
      <span className={cn("flex-1 transition-all", !open && "md:hidden")}>{label}</span>
      {badge && open && <Badge className="ml-auto bg-emerald-500 text-white">{badge}</Badge>}
    </Link>
  )

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white shadow-sm transition-all duration-300 dark:border-gray-800 dark:bg-gray-900",
          open ? "translate-x-0" : "-translate-x-full md:w-20 md:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-emerald-600" />
            <span className={cn("text-xl font-bold transition-all", !open && "md:hidden")}>RamiKart</span>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => onOpenChange(false)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex" onClick={toggleSidebar}>
            {open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <nav className="flex flex-col gap-2">
            <div className="py-2">
              <h3 className={cn("mb-2 text-xs font-medium text-gray-500 dark:text-gray-400", !open && "md:hidden")}>
                Dashboard
              </h3>
              <div className="space-y-1">
                <NavItem href="/dashboard" icon={Home} label="Overview" />
                <NavItem href="/dashboard/listings" icon={Package} label="My Listings" badge={12} />
                <NavItem href="/dashboard/market-hub" icon={Store} label="MarketHub" />
                <NavItem href="/dashboard/create-listing" icon={PlusCircle} label="Create Listing" />
                <NavItem href="/dashboard/orders" icon={ShoppingCart} label="Orders" badge={3} />
              </div>
            </div>

            <div className="py-2">
              <h3 className={cn("mb-2 text-xs font-medium text-gray-500 dark:text-gray-400", !open && "md:hidden")}>
                Activity
              </h3>
              <div className="space-y-1">
                <NavItem href="/dashboard/messages" icon={MessageSquare} label="Messages" badge={5} />
                <NavItem href="/dashboard/notifications" icon={Bell} label="Notifications" badge={8} />
                <NavItem href="/dashboard/favorites" icon={Heart} label="Favorites" />
              </div>
            </div>

            <div className="py-2">
              <h3 className={cn("mb-2 text-xs font-medium text-gray-500 dark:text-gray-400", !open && "md:hidden")}>
                Account
              </h3>
              <div className="space-y-1">
                <NavItem href="/dashboard/profile" icon={User} label="Profile" />
                <NavItem href="/dashboard/settings" icon={Settings} label="Settings" />
              </div>
            </div>
          </nav>
        </div>

        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          <div className={cn("flex items-center gap-3", !open && "md:justify-center")}>
            <Avatar className="border-2 border-emerald-100 dark:border-emerald-900">
              <AvatarImage src="https://ui.shadcn.com/avatars/01.png" alt={user?.name || "User"} />
              <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className={cn("flex-1 transition-all", !open && "md:hidden")}>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Log out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-40 flex h-10 w-10 rounded-full border border-gray-200 bg-white shadow-lg md:hidden dark:border-gray-800 dark:bg-gray-900"
        onClick={() => onOpenChange(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  )
}
