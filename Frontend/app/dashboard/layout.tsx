"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { SocketProvider } from "@/lib/socket-context"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-32 w-32 animate-pulse rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <SocketProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
        <div className={cn("flex-1 transition-all duration-300", isSidebarOpen ? "md:ml-64" : "md:ml-20")}>
          {children}
        </div>
      </div>
    </SocketProvider>
  )
}
