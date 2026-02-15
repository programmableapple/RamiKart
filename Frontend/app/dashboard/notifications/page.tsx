"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bell,
  ShoppingCart,
  Heart,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Check,
} from "lucide-react"

interface Notification {
  id: string
  type: "order" | "message" | "like" | "system" | "alert"
  title: string
  description: string
  timestamp: string
  read: boolean
  user?: {
    id: string
    name: string
    avatar?: string
  }
  actionUrl?: string
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Mock data
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "order",
        title: "New Order Received",
        description: "John Doe purchased your Vintage Camera for $250",
        timestamp: "2023-04-15T10:30:00Z",
        read: false,
        user: {
          id: "user1",
          name: "John Doe",
          avatar: "https://ui.shadcn.com/avatars/01.png",
        },
        actionUrl: "/dashboard/orders",
      },
      {
        id: "2",
        type: "message",
        title: "New Message",
        description: "Jane Smith sent you a message about your iPhone listing",
        timestamp: "2023-04-15T09:45:00Z",
        read: false,
        user: {
          id: "user2",
          name: "Jane Smith",
          avatar: "https://ui.shadcn.com/avatars/02.png",
        },
        actionUrl: "/dashboard/messages",
      },
      {
        id: "3",
        type: "like",
        title: "New Like",
        description: "Robert Johnson liked your Gaming Laptop listing",
        timestamp: "2023-04-14T16:20:00Z",
        read: true,
        user: {
          id: "user3",
          name: "Robert Johnson",
          avatar: "https://ui.shadcn.com/avatars/03.png",
        },
        actionUrl: "/dashboard/listings",
      },
      {
        id: "4",
        type: "system",
        title: "Account Verified",
        description: "Your account has been successfully verified",
        timestamp: "2023-04-13T14:10:00Z",
        read: true,
        actionUrl: "/dashboard/profile",
      },
      {
        id: "5",
        type: "alert",
        title: "Price Drop Alert",
        description: "A product on your wishlist has dropped in price",
        timestamp: "2023-04-12T11:05:00Z",
        read: false,
        actionUrl: "/dashboard/favorites",
      },
      {
        id: "6",
        type: "order",
        title: "Order Shipped",
        description: "Your order #1234 has been shipped",
        timestamp: "2023-04-11T09:30:00Z",
        read: true,
        actionUrl: "/dashboard/orders",
      },
      {
        id: "7",
        type: "system",
        title: "New Feature Available",
        description: "Check out our new messaging features",
        timestamp: "2023-04-10T15:45:00Z",
        read: true,
        actionUrl: "/dashboard/messages",
      },
    ]

    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter((n) => !n.read).length)
  }, [])

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "unread" && notification.read) {
      return false
    }
    if (activeTab === "orders" && notification.type !== "order") {
      return false
    }
    if (activeTab === "messages" && notification.type !== "message") {
      return false
    }
    if (activeTab === "system" && !["system", "alert"].includes(notification.type)) {
      return false
    }
    return true
  })

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) => {
        if (notification.id === id && !notification.read) {
          setUnreadCount((prev) => prev - 1)
          return { ...notification, read: true }
        }
        return notification
      }),
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
    setUnreadCount(0)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      case "message":
        return <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      case "like":
        return <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
      case "system":
        return <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      case "alert":
        return <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      default:
        return <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Notifications" text="Stay updated with your account activity.">
        <Button
          variant="outline"
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <Check className="mr-2 h-4 w-4" />
          Mark all as read
        </Button>
      </DashboardHeader>

      <Card className="border-none shadow-md">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald-600" />
              Notifications
              {unreadCount > 0 && <Badge className="ml-2 bg-emerald-500 text-white">{unreadCount}</Badge>}
            </CardTitle>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                >
                  Unread
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                >
                  Orders
                </TabsTrigger>
                <TabsTrigger
                  value="messages"
                  className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                >
                  Messages
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(85vh-14rem)]">
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-emerald-100 p-3 mb-4 dark:bg-emerald-900">
                    <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                    You have no {activeTab !== "all" ? activeTab : ""} notifications at the moment.
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`relative p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      !notification.read ? "bg-emerald-50 dark:bg-emerald-900/10" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium">{notification.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{notification.description}</p>
                        {notification.user && (
                          <div className="mt-2 flex items-center gap-2">
                            <Avatar className="h-6 w-6 border border-emerald-100 dark:border-emerald-900">
                              <AvatarImage
                                src={notification.user.avatar || "/placeholder.svg"}
                                alt={notification.user.name}
                              />
                              <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
                                {notification.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{notification.user.name}</span>
                          </div>
                        )}
                        {notification.actionUrl && (
                          <div className="mt-2">
                            <Button
                              variant="link"
                              className="h-auto p-0 text-emerald-600 dark:text-emerald-400"
                              asChild
                            >
                              <a href={notification.actionUrl}>View Details</a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
