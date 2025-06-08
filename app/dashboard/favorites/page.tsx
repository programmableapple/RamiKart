"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Search, Filter, ArrowUpDown, ShoppingCart, Trash2, Eye } from "lucide-react"
import { motion } from "framer-motion"

interface Product {
  id: string
  title: string
  description: string
  price: number
  category: string
  image: string
  seller: {
    id: string
    name: string
  }
  dateAdded: string
  inStock: boolean
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Product[]>([])
  const [filteredFavorites, setFilteredFavorites] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [view, setView] = useState<string>("grid")

  // Mock data
  useEffect(() => {
    const mockFavorites: Product[] = [
      {
        id: "1",
        title: "Vintage Camera",
        description: "A beautiful vintage film camera in excellent condition. Perfect for photography enthusiasts.",
        price: 250,
        category: "Photography",
        image:
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1738&q=80",
        seller: {
          id: "seller1",
          name: "John Doe",
        },
        dateAdded: "2023-04-15T10:30:00Z",
        inStock: true,
      },
      {
        id: "2",
        title: "iPhone 13 Pro",
        description: "Like new iPhone 13 Pro with 256GB storage. Includes original box and accessories.",
        price: 899,
        category: "Electronics",
        image:
          "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80",
        seller: {
          id: "seller2",
          name: "Jane Smith",
        },
        dateAdded: "2023-04-14T14:20:00Z",
        inStock: true,
      },
      {
        id: "3",
        title: "Antique Desk",
        description: "Beautiful antique wooden desk from the early 1900s. Great condition with minor wear.",
        price: 750,
        category: "Furniture",
        image:
          "https://images.unsplash.com/photo-1595428774223-ef52624120d2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
        seller: {
          id: "seller3",
          name: "Robert Johnson",
        },
        dateAdded: "2023-04-13T09:15:00Z",
        inStock: true,
      },
      {
        id: "4",
        title: "Mountain Bike",
        description: "High-quality mountain bike with front suspension. Perfect for trails and off-road riding.",
        price: 450,
        category: "Sports & Outdoors",
        image:
          "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1748&q=80",
        seller: {
          id: "seller4",
          name: "Emily Davis",
        },
        dateAdded: "2023-04-12T16:45:00Z",
        inStock: false,
      },
      {
        id: "5",
        title: "Vintage Vinyl Records",
        description: "Collection of classic rock vinyl records from the 70s and 80s. All in excellent condition.",
        price: 120,
        category: "Books & Media",
        image:
          "https://images.unsplash.com/photo-1603048588665-791ca8aea617?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
        seller: {
          id: "seller5",
          name: "Michael Wilson",
        },
        dateAdded: "2023-04-11T11:10:00Z",
        inStock: true,
      },
    ]

    setFavorites(mockFavorites)
    setFilteredFavorites(mockFavorites)
  }, [])

  useEffect(() => {
    // Filter and sort favorites whenever filters change
    let result = [...favorites]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query),
      )
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((product) => product.category === categoryFilter)
    }

    // Apply sorting
    result = result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        case "oldest":
          return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
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

    setFilteredFavorites(result)
  }, [favorites, searchQuery, categoryFilter, sortBy])

  const categories = [...new Set(favorites.map((product) => product.category))]

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter((product) => product.id !== id))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "..."
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Favorites" text="Products you've saved to your wishlist." />

      <div className="space-y-6">
        {/* Filters and Search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search favorites..."
              className="pl-9 border-emerald-100 focus-visible:ring-emerald-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] border-emerald-100 focus-visible:ring-emerald-500">
                <Filter className="mr-2 h-4 w-4 text-emerald-500" />
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

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] border-emerald-100 focus-visible:ring-emerald-500">
                <ArrowUpDown className="mr-2 h-4 w-4 text-emerald-500" />
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

            <Tabs defaultValue="grid" className="w-[180px]" value={view} onValueChange={setView}>
              <TabsList className="grid w-full grid-cols-2 bg-emerald-50 dark:bg-emerald-900/20">
                <TabsTrigger value="grid" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                  Grid
                </TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Products Display */}
        {filteredFavorites.length === 0 ? (
          <Card className="border-none shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-emerald-100 p-3 mb-4 dark:bg-emerald-900">
                <Heart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No favorites found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                {searchQuery || categoryFilter !== "all"
                  ? "Try different search criteria or browse more products to add to your favorites."
                  : "You haven't added any products to your favorites yet. Browse products and click the heart icon to add them here."}
              </p>
              <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" asChild>
                <a href="/dashboard/market-hub">Browse Products</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {view === "grid" ? (
              <motion.div
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {filteredFavorites.map((product) => (
                  <motion.div key={product.id} variants={item}>
                    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                      <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden group">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-red-500"
                          onClick={() => removeFavorite(product.id)}
                        >
                          <Heart className="h-5 w-5 fill-red-500" />
                        </Button>
                        <div className="absolute bottom-2 left-2">
                          <Badge className="bg-emerald-500 text-white">${product.price.toFixed(2)}</Badge>
                        </div>
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Badge className="bg-red-500 text-white px-3 py-1 text-sm">Out of Stock</Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="mb-2 flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          >
                            {product.category}
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Added {formatDate(product.dateAdded)}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium mb-2">{product.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-grow">
                          {truncateText(product.description, 100)}
                        </p>
                        <div className="mt-auto space-y-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Seller: {product.seller.name}</div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                            >
                              <Eye className="mr-1 h-4 w-4" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                              onClick={() => removeFavorite(product.id)}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={!product.inStock}
                          >
                            <ShoppingCart className="mr-1 h-4 w-4" />
                            {product.inStock ? "Buy Now" : "Out of Stock"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
                {filteredFavorites.map((product) => (
                  <motion.div key={product.id} variants={item}>
                    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/4 bg-gray-100 dark:bg-gray-800 relative overflow-hidden group">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            style={{ minHeight: "200px" }}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-red-500"
                            onClick={() => removeFavorite(product.id)}
                          >
                            <Heart className="h-5 w-5 fill-red-500" />
                          </Button>
                          {!product.inStock && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Badge className="bg-red-500 text-white px-3 py-1 text-sm">Out of Stock</Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-6 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <h3 className="text-xl font-semibold">{product.title}</h3>
                            <Badge className="bg-emerald-500 text-white text-lg px-3 py-1">
                              ${product.price.toFixed(2)}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge
                              variant="outline"
                              className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            >
                              {product.category}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
                            >
                              Added {formatDate(product.dateAdded)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {truncateText(product.description, 200)}
                          </p>
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Seller: <span className="font-medium">{product.seller.name}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                View Details
                              </Button>
                              <Button
                                variant="outline"
                                className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                                onClick={() => removeFavorite(product.id)}
                              >
                                <Trash2 className="mr-1 h-4 w-4" />
                                Remove
                              </Button>
                              <Button
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={!product.inStock}
                              >
                                <ShoppingCart className="mr-1 h-4 w-4" />
                                {product.inStock ? "Buy Now" : "Out of Stock"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  )
}
