"use client"

import { useState, useEffect } from "react"
import { useNetwork } from "@/lib/network-context"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, Search, Filter, ArrowUpDown, ShoppingCart, Trash2, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

export default function FavoritesPage() {
  const { post, get } = useNetwork()
  const { toast } = useToast()
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Product[]>([])
  const [filteredFavorites, setFilteredFavorites] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [view, setView] = useState<string>("grid")
  const [loading, setLoading] = useState(true)

  // View Product Dialog State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

  // Buy Confirmation Alert Dialog State
  const [buyProduct, setBuyProduct] = useState<Product | null>(null)
  const [isBuyAlertOpen, setIsBuyAlertOpen] = useState(false)

  // Load favorites from API
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        const response = await get<{ favorites: Product[] }>("/api/favorites")
        if (response?.favorites) {
          setFavorites(response.favorites)
        }
      } catch (error) {
        console.error("Error fetching favorites:", error)
        toast({
          title: "Error",
          description: "Failed to load favorites.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [user])

  useEffect(() => {
    let result = [...favorites]

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

    setFilteredFavorites(result)
  }, [favorites, searchQuery, categoryFilter, sortBy])

  const categories = [...new Set(favorites.map((product) => product.category))]

  const removeFavorite = async (id: string) => {
    try {
      await post(`/api/favorites/toggle/${id}`)

      const updated = favorites.filter((product) => product._id !== id)
      setFavorites(updated)

      toast({
        title: "Removed from Favorites",
        description: "Product has been removed from your favorites.",
      })
    } catch (error) {
      console.error("Error removing favorite:", error)
      toast({
        title: "Error",
        description: "Failed to remove from favorites.",
        variant: "destructive",
      })
    }
  }

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsViewOpen(true)
  }

  const handleBuyProduct = async (product: Product) => {
    try {
      toast({
        title: "Processing Order",
        description: `Buying ${product.title}...`,
      })

      const orderData = {
        items: [
          {
            product: product._id,
            quantity: 1,
          }
        ],
        paymentInfo: {
          method: "credit_card",
          transactionId: "txn_" + Date.now()
        },
        shippingAddress: {
          street: "123 Main St",
          city: "New York",
          state: "NY",
          zip: "10001",
          country: "USA"
        }
      }

      await post("/api/orders", orderData)

      toast({
        title: "Order Placed!",
        description: `Successfully purchased ${product.title}`,
        className: "bg-green-500 text-white border-none"
      })
    } catch (error: any) {
      console.error("Buy error:", error)
      toast({
        title: "Purchase Failed",
        description: error.message || "Could not place order. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().split("T")[0]
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "..."
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
        {loading ? (
          <div className={view === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4"}>
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden border-none shadow-md">
                  <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : filteredFavorites.length === 0 ? (
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
              <div
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {filteredFavorites.map((product, index) => (
                  <div
                    key={product._id}
                    className="animate-fadeSlideIn opacity-0"
                    style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
                  >                    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
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
                          className="absolute right-2 top-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-red-500"
                          onClick={() => removeFavorite(product._id)}
                        >
                          <Heart className="h-5 w-5 fill-red-500" />
                        </Button>
                        <div className="absolute bottom-2 left-2">
                          <Badge className="bg-emerald-500 text-white">${product.price.toFixed(2)}</Badge>
                        </div>
                        {product.stock <= 0 && (
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
                        <h3 className="text-lg font-medium mb-2">{product.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-grow">
                          {truncateText(product.description, 100)}
                        </p>
                        <div className="mt-auto space-y-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 border border-emerald-100 dark:border-emerald-900">
                              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs dark:bg-emerald-900 dark:text-emerald-100">
                                {product.seller.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{product.seller.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                              onClick={() => handleViewProduct(product)}
                            >
                              <Eye className="mr-1 h-4 w-4" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                              onClick={() => removeFavorite(product._id)}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={product.stock <= 0}
                            onClick={() => { setBuyProduct(product); setIsBuyAlertOpen(true) }}
                          >
                            <ShoppingCart className="mr-1 h-4 w-4" />
                            {product.stock > 0 ? "Buy Now" : "Out of Stock"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFavorites.map((product, index) => (
                  <div
                    key={product._id}
                    className="animate-fadeSlideIn opacity-0"
                    style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
                  >
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
                            className="absolute right-2 top-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-red-500"
                            onClick={() => removeFavorite(product._id)}
                          >
                            <Heart className="h-5 w-5 fill-red-500" />
                          </Button>
                          {product.stock <= 0 && (
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
                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                                onClick={() => handleViewProduct(product)}
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                View Details
                              </Button>
                              <Button
                                variant="outline"
                                className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                                onClick={() => removeFavorite(product._id)}
                              >
                                <Trash2 className="mr-1 h-4 w-4" />
                                Remove
                              </Button>
                              <Button
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={product.stock <= 0}
                                onClick={() => { setBuyProduct(product); setIsBuyAlertOpen(true) }}
                              >
                                <ShoppingCart className="mr-1 h-4 w-4" />
                                {product.stock > 0 ? "Buy Now" : "Out of Stock"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* View Product Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedProduct.title}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-sm">
                    {selectedProduct.category}
                  </Badge>
                  <Badge className={`${selectedProduct.stock > 0 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                    {selectedProduct.stock > 0 ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="mt-4 space-y-6">
                <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <img
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-3xl font-bold text-emerald-600">${selectedProduct.price.toFixed(2)}</p>
                  </div>
                  <Button
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      setIsViewOpen(false)
                      setBuyProduct(selectedProduct)
                      setIsBuyAlertOpen(true)
                    }}
                    disabled={selectedProduct.stock <= 0}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Buy Now
                  </Button>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Description</h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Sold by</h4>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        {selectedProduct.seller.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedProduct.seller.name}</p>
                      <p className="text-xs text-gray-500">{selectedProduct.seller.email}</p>
                    </div>
                  </div>
                </div>

                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {selectedProduct.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-gray-600 bg-gray-100">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Buy Confirmation Alert Dialog */}
      <AlertDialog open={isBuyAlertOpen} onOpenChange={setIsBuyAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to buy <span className="font-semibold text-foreground">{buyProduct?.title}</span> for{" "}
              <span className="font-semibold text-emerald-600">${buyProduct?.price.toFixed(2)}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                if (buyProduct) {
                  handleBuyProduct(buyProduct)
                }
              }}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Confirm Purchase
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  )
}
