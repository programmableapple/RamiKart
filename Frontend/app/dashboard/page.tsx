"use client"

import { useMemo } from "react"
import { useNetwork } from "@/lib/network-context"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, TrendingUp, Users, ArrowUpRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Skeleton } from "@/components/ui/skeleton"
import useSWR from "swr"

interface DashboardStats {
  totalListings: number
  activeListings: number
  totalOrders: number
  pendingOrders: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { get } = useNetwork()

  // SWR Fetcher with cache busting
  const fetcher = (url: string) => {
    const timestamp = new Date().getTime()
    const separator = url.includes("?") ? "&" : "?"
    return get(`${url}${separator}_t=${timestamp}`)
  }

  // Use SWR for listings with polling (every 5 seconds)
  const { data: listingsResponse, error: listingsError, isLoading: loadingListings } = useSWR(
    "/api/listings/mine",
    fetcher,
    {
      refreshInterval: 5000,
      refreshWhenHidden: true,
      revalidateOnFocus: true
    }
  )

  // Use SWR for orders with polling (every 5 seconds)
  const { data: ordersResponse, error: ordersError, isLoading: loadingOrders } = useSWR(
    "/api/orders/user",
    fetcher,
    {
      refreshInterval: 5000,
      refreshWhenHidden: true,
      revalidateOnFocus: true
    }
  )

  // Memoize listings data processing
  const recentListings = useMemo(() => {
    if (!listingsResponse) return []
    const response = listingsResponse as any
    if (Array.isArray(response.products)) return response.products
    if (Array.isArray(response)) return response
    if (Array.isArray(response.listings)) return response.listings
    return []
  }, [listingsResponse])

  // Memoize orders data processing
  const orders = useMemo(() => {
    if (!ordersResponse) return []
    const response = ordersResponse as any
    if (response && response.success && Array.isArray(response.orders)) {
      return response.orders
    }
    // Fallback if structure is different (e.g. direct array)
    if (Array.isArray(response)) return response
    return []
  }, [ordersResponse])

  // Calculate stats
  const stats: DashboardStats = useMemo(() => ({
    totalListings: recentListings.length,
    activeListings: recentListings.filter((l: any) => l.active).length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
  }), [recentListings, orders])


  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Welcome back to your RamiKart dashboard." />

      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="overflow-hidden border-none bg-white shadow-md dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
              <div className="rounded-full bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-100">
                <Package className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalListings}</div>
              <div className="mt-1 flex items-center text-xs text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span>Updated live</span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{stats.activeListings} active listings</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none bg-white shadow-md dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <div className="rounded-full bg-amber-100 p-2 text-amber-600 dark:bg-amber-900 dark:text-amber-100">
                <ShoppingCart className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <div className="mt-1 flex items-center text-xs text-amber-600 dark:text-amber-400">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span>Updated live</span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{stats.pendingOrders} pending orders</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none bg-white shadow-md dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900 dark:text-blue-100">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <div className="mt-1 flex items-center text-xs text-blue-600 dark:text-blue-400">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span>Calculated from orders</span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Coming soon</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none bg-white shadow-md dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <div className="rounded-full bg-purple-100 p-2 text-purple-600 dark:bg-purple-900 dark:text-purple-100">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <div className="mt-1 flex items-center text-xs text-purple-600 dark:text-purple-400">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span>You</span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Welcome back!</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 border-none bg-white shadow-md dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Listings</CardTitle>
                <CardDescription>Your most recently added products</CardDescription>
              </div>
              <Link href="/dashboard/listings">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loadingListings ? (
                <div className="space-y-4">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-14 w-14 rounded-md" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                      </div>
                    ))}
                </div>
              ) : recentListings.length > 0 ? (
                <div className="space-y-4">
                  {recentListings.slice(0, 5).map((listing: any) => (
                    <div
                      key={listing._id}
                      className="group flex items-center gap-4 rounded-lg border p-3 transition-all hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      <div className="h-14 w-14 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
                        <img
                          src={listing.images && listing.images.length > 0 ? listing.images[0] : "/placeholder.svg"}
                          alt={listing.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{listing.title}</h3>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            ${listing.price.toFixed(2)}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                listing.active
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              }
                            >
                              {listing.active ? "Active" : "Inactive"}
                            </Badge>
                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              {listing.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">No listings found.</div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-3 border-none bg-white shadow-md dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your most recent customer orders</CardDescription>
              </div>
              <Link href="/dashboard/orders">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px]">
                {" "}
                {/* Add fixed minimum height */}
                {loadingOrders ? (
                  <div className="space-y-4">
                    {Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-4 w-[100px]" />
                          </div>
                          <Skeleton className="h-10 w-10 rounded-full" />
                        </div>
                      ))}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order: any) => (
                      <div key={order._id} className="group rounded-lg border p-3 transition-all hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">Order #{order._id.slice(-6)}</p>
                              <Badge className={`
                                ${order.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100' : ''}
                                ${order.status === 'shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : ''}
                                ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100' : ''}
                                ${order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : ''}
                            `}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={user?.avatar || "https://ui.shadcn.com/avatars/02.png"} alt="Customer" />
                                <AvatarFallback className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-100">
                                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.name || 'User'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-emerald-600 dark:text-emerald-400">${order.total?.toFixed(2)}</p>
                            <div className="mt-1 flex items-center justify-end gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">No orders found.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
