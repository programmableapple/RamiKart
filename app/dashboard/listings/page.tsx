"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useNetwork } from "@/lib/network-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Search, MoreHorizontal, Edit, Trash, Eye, Filter, ArrowUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Skeleton } from "@/components/ui/skeleton"

interface Product {
  _id: string
  title: string
  price: number
  stock: number
  category: string
  active: boolean
  createdAt: string
  image?: string
  images?: string[]
}

export default function ListingsPage() {
  const { get, isLoading } = useNetwork()
  const [listings, setListings] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [loadingListings, setLoadingListings] = useState(true)

  // Use a ref to track if we've already fetched the data
  const dataFetchedRef = useRef(false)

  useEffect(() => {
    // Only fetch data if we haven't already
    if (dataFetchedRef.current) return

    // Mark that we've started fetching data
    dataFetchedRef.current = true

    const fetchListings = async () => {
      try {
        setLoadingListings(true)
        // Use the new endpoint for user's own listings
        const response = await get("/api/listings/mine")
        console.log("Listings API Response:", response) // Log the response for debugging

        // Check if response has the expected structure
        if (response && Array.isArray(response.products)) {
          setListings(response.products)
        } else if (Array.isArray(response)) {
          // If the response is directly an array
          setListings(response)
        } else {
          console.error("Unexpected API response format:", response)
          // Fallback to mock data
          const mockListings: Product[] = [
            {
              _id: "1",
              title: "Suzuki Bandit 1200cc",
              price: 4000,
              stock: 1,
              category: "Motorcycles & ATV's",
              active: true,
              createdAt: "2023-04-15T10:30:00Z",
              image:
                "https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
            },
            {
              _id: "2",
              title: "iPhone 13 Pro",
              price: 899,
              stock: 5,
              category: "Electronics",
              active: true,
              createdAt: "2023-04-10T14:20:00Z",
              image:
                "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80",
            },
            {
              _id: "3",
              title: "Vintage Camera",
              price: 250,
              stock: 1,
              category: "Photography",
              active: false,
              createdAt: "2023-04-05T09:15:00Z",
              image:
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1738&q=80",
            },
            {
              _id: "4",
              title: "Gaming Laptop",
              price: 1299,
              stock: 3,
              category: "Electronics",
              active: true,
              createdAt: "2023-04-02T16:45:00Z",
              image:
                "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80",
            },
            {
              _id: "5",
              title: "Antique Desk",
              price: 750,
              stock: 1,
              category: "Furniture",
              active: true,
              createdAt: "2023-03-28T11:10:00Z",
              image:
                "https://images.unsplash.com/photo-1595428774223-ef52624120d2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
            },
          ]
          setListings(mockListings)
        }
      } catch (error) {
        console.error("Error fetching listings:", error)
        // Mock data for demo
        const mockListings: Product[] = [
          {
            _id: "1",
            title: "Suzuki Bandit 1200cc",
            price: 4000,
            stock: 1,
            category: "Motorcycles & ATV's",
            active: true,
            createdAt: "2023-04-15T10:30:00Z",
            image:
              "https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
          },
          {
            _id: "2",
            title: "iPhone 13 Pro",
            price: 899,
            stock: 5,
            category: "Electronics",
            active: true,
            createdAt: "2023-04-10T14:20:00Z",
            image:
              "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80",
          },
          {
            _id: "3",
            title: "Vintage Camera",
            price: 250,
            stock: 1,
            category: "Photography",
            active: false,
            createdAt: "2023-04-05T09:15:00Z",
            image:
              "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1738&q=80",
          },
          {
            _id: "4",
            title: "Gaming Laptop",
            price: 1299,
            stock: 3,
            category: "Electronics",
            active: true,
            createdAt: "2023-04-02T16:45:00Z",
            image:
              "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80",
          },
          {
            _id: "5",
            title: "Antique Desk",
            price: 750,
            stock: 1,
            category: "Furniture",
            active: true,
            createdAt: "2023-03-28T11:10:00Z",
            image:
              "https://images.unsplash.com/photo-1595428774223-ef52624120d2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
          },
        ]
        setListings(mockListings)
      } finally {
        setLoadingListings(false)
      }
    }

    fetchListings()
  }, []) // Empty dependency array to ensure it only runs once

  const categories = [...new Set(listings.map((listing) => listing.category))]

  const filteredListings = listings.filter((listing) => {
    // Search filter
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.category.toLowerCase().includes(searchQuery.toLowerCase())

    // Category filter
    const matchesCategory = categoryFilter === "all" || listing.category === categoryFilter

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && listing.active) ||
      (statusFilter === "inactive" && !listing.active)

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "price-high":
        return b.price - a.price
      case "price-low":
        return a.price - b.price
      case "name-asc":
        return a.title.localeCompare(b.title)
      case "name-desc":
        return b.title.localeCompare(a.title)
      default:
        return 0
    }
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="My Listings" text="Manage your marketplace listings." />

      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search listings..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>

            <Link href="/dashboard/create-listing">
              <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Listing
              </Button>
            </Link>
          </div>
        </div>

        <Card className="border-none bg-white shadow-md dark:bg-gray-800">
          <CardContent className="p-0">
            {loadingListings ? (
              <div className="p-6">
                <div className="space-y-4">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : sortedListings.length === 0 ? (
              <div className="flex h-60 flex-col items-center justify-center gap-2 p-4 text-center">
                <h3 className="text-lg font-semibold">No listings found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                    ? "Try different search criteria"
                    : "Create your first listing to get started"}
                </p>
                {!searchQuery && categoryFilter === "all" && statusFilter === "all" && (
                  <Link href="/dashboard/create-listing">
                    <Button className="mt-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Listing
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Stock</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedListings.map((listing) => (
                      <TableRow key={listing._id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
                              {listing.images && listing.images.length > 0 ? (
                                <img
                                  src={listing.images[0] || "/placeholder.svg"}
                                  alt={listing.title}
                                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                />
                              ) : (
                                <img
                                  src="/placeholder.svg"
                                  alt={listing.title}
                                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                />
                              )}
                            </div>
                            <span className="font-medium">{listing.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>{listing.category}</TableCell>
                        <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                          ${listing.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">{listing.stock}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={`${
                              listing.active
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {listing.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(listing.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                <Eye className="h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                <Edit className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2 text-red-600 cursor-pointer">
                                <Trash className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
