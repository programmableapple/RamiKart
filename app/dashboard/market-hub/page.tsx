"use client"

import { useEffect, useState, useRef } from "react"
import { useNetwork } from "@/lib/network-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Search, Filter, ArrowUpDown, ShoppingCart, MessageSquare, Eye } from "lucide-react"
import { motion } from "framer-motion"

interface Seller {
  _id: string
  name: string
  userName: string
  email: string
}

interface Product {
  _id: string
  title: string
  description: string
  price: number
  stock: number
  category: string
  active: boolean
  createdAt: string
  images: string[]
  seller: Seller
  tags: string[]
}

export default function MarketHubPage() {
  const { get, isLoading } = useNetwork()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [view, setView] = useState<string>("grid")
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set())

  // Use a ref to track if we've already fetched the data
  const dataFetchedRef = useRef(false)

  useEffect(() => {
    // Only fetch data if we haven't already
    if (dataFetchedRef.current) return

    // Mark that we've started fetching data
    dataFetchedRef.current = true

    const fetchProducts = async () => {
      try {
        setLoadingProducts(true)
        const response = await get("/api/listings")
        console.log("MarketHub API Response:", response)

        if (response && Array.isArray(response)) {
          setProducts(response)
          setFilteredProducts(response)
        } else if (response && Array.isArray(response.products)) {
          setProducts(response.products)
          setFilteredProducts(response.products)
        } else {
          console.error("Unexpected API response format:", response)
          setProducts([])
          setFilteredProducts([])
        }
      } catch (error) {
        console.error("Error fetching products:", error)
        setProducts([])
        setFilteredProducts([])
      } finally {
        setLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    // Filter and sort products whenever filters change
    let result = [...products]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          (product.tags && product.tags.some((tag) => tag.toLowerCase().includes(query))),
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

    setFilteredProducts(result)
  }, [products, searchQuery, categoryFilter, sortBy])

  const categories = [...new Set(products.map((product) => product.category))]

  const toggleLike = (productId: string) => {
    setLikedProducts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
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
      <DashboardHeader heading="MarketHub" text="Discover products from all sellers on RamiKart." />

      <div className="space-y-6">
        {/* Filters and Search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search products..."
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
        {loadingProducts ? (
          <div className={view === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4"}>
            {Array(8)
              .fill(0)
              .map((_, i) =>
                view === "grid" ? (
                  <Card key={i} className="overflow-hidden border-none shadow-md">
                    <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800">
                      <Skeleton className="h-full w-full" />
                    </div>
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <div className="flex items-center justify-between mt-4">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card key={i} className="overflow-hidden border-none shadow-md">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-1/4 bg-gray-100 dark:bg-gray-800">
                        <Skeleton className="h-40 w-full md:h-full" />
                      </div>
                      <div className="p-4 flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <div className="flex items-center justify-between mt-4">
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ),
              )}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-emerald-100 p-3 mb-4 dark:bg-emerald-900">
              <Search className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
              We couldn't find any products matching your search criteria. Try adjusting your filters or search terms.
            </p>
          </div>
        ) : (
          <>
            {view === "grid" ? (
              <motion.div
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {filteredProducts.map((product) => (
                  <motion.div key={product._id} variants={item}>
                    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                      <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden group">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                            <span className="text-gray-500 dark:text-gray-400">No image</span>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`absolute right-2 top-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white ${
                            likedProducts.has(product._id) ? "text-red-500" : "text-gray-600"
                          }`}
                          onClick={() => toggleLike(product._id)}
                        >
                          <Heart className={`h-5 w-5 ${likedProducts.has(product._id) ? "fill-red-500" : ""}`} />
                        </Button>
                        <div className="absolute bottom-2 left-2">
                          <Badge className="bg-emerald-500 text-white">${product.price.toFixed(2)}</Badge>
                        </div>
                      </div>
                      <CardHeader className="p-4 pb-0">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          >
                            {product.category}
                          </Badge>
                          <Badge
                            className={
                              product.stock > 0
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                            }
                          >
                            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                          </Badge>
                        </div>
                        <CardTitle className="mt-2 text-lg">{product.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-2 flex-grow">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          {truncateText(product.description, 100)}
                        </p>
                        <div className="flex items-center gap-2 mt-auto">
                          <Avatar className="h-6 w-6 border border-emerald-100 dark:border-emerald-900">
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs dark:bg-emerald-900 dark:text-emerald-100">
                              {product.seller.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{product.seller.name}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                        <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                          <ShoppingCart className="mr-1 h-4 w-4" />
                          Buy
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
                {filteredProducts.map((product) => (
                  <motion.div key={product._id} variants={item}>
                    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/4 bg-gray-100 dark:bg-gray-800 relative overflow-hidden group">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                              style={{ minHeight: "200px" }}
                            />
                          ) : (
                            <div
                              className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700"
                              style={{ minHeight: "200px" }}
                            >
                              <span className="text-gray-500 dark:text-gray-400">No image</span>
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`absolute right-2 top-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white ${
                              likedProducts.has(product._id) ? "text-red-500" : "text-gray-600"
                            }`}
                            onClick={() => toggleLike(product._id)}
                          >
                            <Heart className={`h-5 w-5 ${likedProducts.has(product._id) ? "fill-red-500" : ""}`} />
                          </Button>
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
                              className={
                                product.stock > 0
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                              }
                            >
                              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                            </Badge>
                            {product.tags &&
                              product.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                >
                                  {tag}
                                </Badge>
                              ))}
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {truncateText(product.description, 200)}
                          </p>
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="border border-emerald-100 dark:border-emerald-900">
                                <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
                                  {product.seller.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{product.seller.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Listed on {formatDate(product.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                View Details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                              >
                                <MessageSquare className="mr-1 h-4 w-4" />
                                Contact Seller
                              </Button>
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <ShoppingCart className="mr-1 h-4 w-4" />
                                Buy Now
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
