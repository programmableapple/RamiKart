"use client"

import { useEffect, useState, useRef } from "react"
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

interface DashboardStats {
  totalListings: number
  activeListings: number
  totalOrders: number
  pendingOrders: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { get, isLoading } = useNetwork()
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeListings: 0,
    totalOrders: 0,
    pendingOrders: 0,
  })
  const [recentListings, setRecentListings] = useState([])
  const [loadingListings, setLoadingListings] = useState(true)

  // Use a ref to track if we've already fetched the data
  const dataFetchedRef = useRef(false)

  useEffect(() => {
    // Only fetch data if we haven't already
    if (dataFetchedRef.current) return

    // Mark that we've started fetching data
    dataFetchedRef.current = true

    // This would normally fetch from an API endpoint
    // For demo purposes, we're setting mock data
    const mockStats = {
      totalListings: 12,
      activeListings: 8,
      totalOrders: 24,
      pendingOrders: 3,
    }

    setStats(mockStats)

    // Fetch user's listings only once
    const fetchListings = async () => {
      try {
        setLoadingListings(true)
        // Use the new endpoint
        const response = await get("/api/listings/mine")
        console.log("Dashboard API Response:", response) // Log the response for debugging

        // Check if response has the expected structure
        if (response && Array.isArray(response.products)) {
          setRecentListings(response.products)
        } else if (Array.isArray(response)) {
          // If the response is directly an array
          setRecentListings(response)
        } else {
          console.error("Unexpected API response format:", response)
          // Fallback to mock data
          setRecentListings([
            {
              _id: "1",
              title: "Suzuki Bandit 1200cc",
              price: 4000,
              category: "Motorcycles & ATV's",
              active: true,
              image:
                "https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
            },
            {
              _id: "2",
              title: "iPhone 13 Pro",
              price: 899,
              category: "Electronics",
              active: true,
              image:
                "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80",
            },
            {
              _id: "3",
              title: "Vintage Camera",
              price: 250,
              category: "Photography",
              active: false,
              image:
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1738&q=80",
            },
          ])
        }
      } catch (error) {
        console.error("Error fetching listings:", error)
        // Mock data for demo
        setRecentListings([
          {
            _id: "1",
            title: "Suzuki Bandit 1200cc",
            price: 4000,
            category: "Motorcycles & ATV's",
            active: true,
            image:
              "https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
          },
          {
            _id: "2",
            title: "iPhone 13 Pro",
            price: 899,
            category: "Electronics",
            active: true,
            image:
              "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80",
          },
          {
            _id: "3",
            title: "Vintage Camera",
            price: 250,
            category: "Photography",
            active: false,
            image:
              "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1738&q=80",
          },
        ])
      } finally {
        setLoadingListings(false)
      }
    }

    fetchListings()
  }, []) // Empty dependency array to ensure it only runs once

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
                <span>+2 from last week</span>
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
                <span>+5 from last week</span>
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
              <div className="text-2xl font-bold">$1,234.56</div>
              <div className="mt-1 flex items-center text-xs text-blue-600 dark:text-blue-400">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span>+12.5% from last month</span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">$450.20 this week</p>
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
              <div className="text-2xl font-bold">42</div>
              <div className="mt-1 flex items-center text-xs text-purple-600 dark:text-purple-400">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span>+8 new customers this week</span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">3 returning customers</p>
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
              ) : (
                <div className="space-y-4">
                  {recentListings.map((listing: any) => (
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
                {isLoading ? (
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
                ) : (
                  <div className="space-y-4">
                    <div className="group rounded-lg border p-3 transition-all hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">Order #1234</p>
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                              Pending
                            </Badge>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src="https://ui.shadcn.com/avatars/02.png" alt="Customer" />
                              <AvatarFallback className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-100">
                                JD
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-xs text-gray-500 dark:text-gray-400">John Doe</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-emerald-600 dark:text-emerald-400">$150.00</p>
                          <div className="mt-1 flex items-center justify-end gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>2 hours ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="group rounded-lg border p-3 transition-all hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">Order #1233</p>
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
                              Shipped
                            </Badge>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src="https://ui.shadcn.com/avatars/03.png" alt="Customer" />
                              <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
                                AS
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Alice Smith</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-emerald-600 dark:text-emerald-400">$899.00</p>
                          <div className="mt-1 flex items-center justify-end gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>1 day ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="group rounded-lg border p-3 transition-all hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">Order #1232</p>
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
                              Delivered
                            </Badge>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src="https://ui.shadcn.com/avatars/04.png" alt="Customer" />
                              <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                                RJ
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Robert Johnson</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-emerald-600 dark:text-emerald-400">$450.00</p>
                          <div className="mt-1 flex items-center justify-end gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>3 days ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
