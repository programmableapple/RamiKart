"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useNetwork } from "@/lib/network-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MoreHorizontal, Eye, Filter, ArrowUpDown, ShoppingCart, Clock, CheckCircle, XCircle, Truck, Trash, AlertCircle } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Skeleton } from "@/components/ui/skeleton"
import useSWR from "swr"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface OrderItem {
    product: any
    quantity: number
    priceAtPurchase: number
}

interface Order {
    _id: string
    items: OrderItem[]
    total: number
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
    createdAt: string
    shippingAddress?: {
        city: string
        country: string
    }
}

export default function OrdersPage() {
    const { get, post, delete: deleteRequest } = useNetwork()
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [sortBy, setSortBy] = useState<string>("newest")
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [isViewOpen, setIsViewOpen] = useState(false)

    // SWR Fetcher with cache busting
    const fetcher = (url: string) => {
        const timestamp = new Date().getTime()
        const separator = url.includes("?") ? "&" : "?"
        return get(`${url}${separator}_t=${timestamp}`)
    }

    // Use SWR for orders with polling (every 5 seconds)
    const { data: ordersResponse, error: ordersError, isLoading: loadingOrders, mutate } = useSWR(
        "/api/orders/user",
        fetcher,
        {
            refreshInterval: 5000,
            refreshWhenHidden: true,
            revalidateOnFocus: true
        }
    )

    // Memoize orders data processing
    const orders: Order[] = useMemo(() => {
        if (!ordersResponse) return []
        const response = ordersResponse as any

        if (Array.isArray(response)) {
            return response
        } else if (response && Array.isArray(response.orders)) {
            return response.orders
        } else {
            console.error("Unexpected API response format:", response)
            return []
        }
    }, [ordersResponse])


    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            // Search filter (by Order ID or Order Name)
            const orderName = order.items.length > 0
                ? (order.items[0].product?.title || "Unknown Product")
                : "Empty Order"

            const matchesSearch =
                order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                orderName.toLowerCase().includes(searchQuery.toLowerCase())

            // Status filter
            const matchesStatus = statusFilter === "all" || order.status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [orders, searchQuery, statusFilter])

    // Sort orders
    const sortedOrders = useMemo(() => {
        return [...filteredOrders].sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                case "oldest":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                case "total-high":
                    return b.total - a.total
                case "total-low":
                    return a.total - b.total
                default:
                    return 0
            }
        })
    }, [filteredOrders, sortBy])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    // Helper to get order name
    const getOrderName = (order: Order) => {
        if (!order.items || order.items.length === 0) return "Empty Order"
        const firstItemName = order.items[0].product?.title || "Unknown Product"
        const remainingCount = order.items.length - 1
        return remainingCount > 0 ? `${firstItemName} + ${remainingCount} more` : firstItemName
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-none"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>
            case 'paid':
                return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-none"><CheckCircle className="mr-1 h-3 w-3" /> Paid</Badge>
            case 'shipped':
                return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-none"><Truck className="mr-1 h-3 w-3" /> Shipped</Badge>
            case 'delivered':
                return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-none"><CheckCircle className="mr-1 h-3 w-3" /> Delivered</Badge>
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-none"><XCircle className="mr-1 h-3 w-3" /> Cancelled</Badge>
            default:
                return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-none">{status}</Badge>
        }
    }

    const handleDeleteOrder = async (orderId: string) => {
        try {
            await deleteRequest(`/api/orders/${orderId}`)
            mutate() // Revalidate SWR data
            toast({
                title: "Order deleted",
                description: "The order has been successfully deleted.",
            })
        } catch (error) {
            console.error("Error deleting order:", error)
            toast({
                title: "Error",
                description: "Failed to delete order. Please try again.",
                variant: "destructive",
            })
        }
    }

    const handleCancelOrder = async (orderId: string) => {
        try {
            const response: any = await post(`/api/orders/${orderId}/cancel`, {})
            if (response.success) {
                mutate() // Revalidate SWR data
                // Update selected order if it's the one we just cancelled
                if (selectedOrder && selectedOrder._id === orderId) {
                    setSelectedOrder({ ...selectedOrder, status: 'cancelled' })
                }
                toast({
                    title: "Order Cancelled",
                    description: "Your order has been successfully cancelled.",
                })
            }
        } catch (error) {
            console.error("Error cancelling order:", error)
            toast({
                title: "Error",
                description: "Failed to cancel order. Please try again.",
                variant: "destructive",
            })
        }
    }

    return (
        <DashboardShell>
            <DashboardHeader heading="My Orders" text="View and track your customer orders." />

            <div className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Search by Order ID or Item..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
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
                                <SelectItem value="total-high">Total: High to Low</SelectItem>
                                <SelectItem value="total-low">Total: Low to High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Card className="border-none bg-white shadow-md dark:bg-gray-800">
                    <CardContent className="p-0">
                        {loadingOrders ? (
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
                        ) : sortedOrders.length === 0 ? (
                            <div className="flex h-60 flex-col items-center justify-center gap-2 p-4 text-center">
                                <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-700">
                                    <ShoppingCart className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold">No orders found</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {searchQuery || statusFilter !== "all"
                                        ? "Try different search criteria"
                                        : "No orders have been placed yet."}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="w-[120px]">Order ID</TableHead>
                                            <TableHead>Order Name</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Customer / Location</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedOrders.map((order) => (
                                            <TableRow key={order._id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <TableCell className="font-medium">#{order._id.slice(-4)}</TableCell>
                                                <TableCell className="font-medium text-gray-700 dark:text-gray-300">
                                                    {getOrderName(order)}
                                                </TableCell>
                                                <TableCell>{formatDate(order.createdAt)}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm">
                                                            {order.shippingAddress
                                                                ? `${order.shippingAddress.city}, ${order.shippingAddress.country}`
                                                                : "N/A"}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {order.items.length} item(s)
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                                                    ${order.total.toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {getStatusBadge(order.status)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">Actions</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <Dialog open={isViewOpen && selectedOrder?._id === order._id} onOpenChange={(open) => {
                                                                setIsViewOpen(open)
                                                                if (open) setSelectedOrder(order)
                                                                else setSelectedOrder(null)
                                                            }}>
                                                                <DialogTrigger asChild>
                                                                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onSelect={(e) => e.preventDefault()}>
                                                                        <Eye className="h-4 w-4" />
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-3xl">
                                                                    <DialogHeader>
                                                                        <DialogTitle>Order Details #{selectedOrder?._id.slice(-4)}</DialogTitle>
                                                                        <DialogDescription>
                                                                            Ordered on {selectedOrder && formatDate(selectedOrder.createdAt)}
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                    {selectedOrder && (
                                                                        <div className="grid gap-4 py-4">
                                                                            {selectedOrder.items.some(item => !item.product) && (
                                                                                <Alert variant="destructive">
                                                                                    <AlertCircle className="h-4 w-4" />
                                                                                    <AlertTitle>Listing Deleted</AlertTitle>
                                                                                    <AlertDescription>
                                                                                        One or more items in this order have been deleted by the seller. We apologize for the inconvenience.
                                                                                    </AlertDescription>
                                                                                </Alert>
                                                                            )}
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                <div>
                                                                                    <h3 className="font-semibold mb-2">Shipping Information</h3>
                                                                                    <p className="text-sm text-gray-500">
                                                                                        {selectedOrder.shippingAddress ? (
                                                                                            <>
                                                                                                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.country}
                                                                                            </>
                                                                                        ) : "N/A"}
                                                                                    </p>
                                                                                </div>
                                                                                <div>
                                                                                    <h3 className="font-semibold mb-2">Order Status</h3>
                                                                                    {getStatusBadge(selectedOrder.status)}
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <h3 className="font-semibold mb-2">Items</h3>
                                                                                <Table>
                                                                                    <TableHeader>
                                                                                        <TableRow>
                                                                                            <TableHead>Product</TableHead>
                                                                                            <TableHead className="text-right">Quantity</TableHead>
                                                                                            <TableHead className="text-right">Price</TableHead>
                                                                                            <TableHead className="text-right">Total</TableHead>
                                                                                        </TableRow>
                                                                                    </TableHeader>
                                                                                    <TableBody>
                                                                                        {selectedOrder.items.map((item, index) => (
                                                                                            <TableRow key={index}>
                                                                                                <TableCell>{item.product?.title || "Unknown Product"}</TableCell>
                                                                                                <TableCell className="text-right">{item.quantity}</TableCell>
                                                                                                <TableCell className="text-right">${item.priceAtPurchase.toFixed(2)}</TableCell>
                                                                                                <TableCell className="text-right">${(item.quantity * item.priceAtPurchase).toFixed(2)}</TableCell>
                                                                                            </TableRow>
                                                                                        ))}
                                                                                    </TableBody>
                                                                                </Table>
                                                                            </div>
                                                                            <div className="flex justify-end mt-4">
                                                                                <div className="text-right">
                                                                                    <span className="font-semibold mr-2">Total:</span>
                                                                                    <span className="text-xl font-bold text-emerald-600">${selectedOrder.total.toFixed(2)}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </DialogContent>
                                                            </Dialog>
                                                            {order.status === 'pending' && (
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <DropdownMenuItem
                                                                            className="flex items-center gap-2 cursor-pointer text-amber-600 focus:text-amber-600"
                                                                            onSelect={(e) => e.preventDefault()}
                                                                        >
                                                                            <XCircle className="h-4 w-4" />
                                                                            Cancel Order
                                                                        </DropdownMenuItem>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                Are you sure you want to cancel this order? This action cannot be undone.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleCancelOrder(order._id)}
                                                                                className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-600"
                                                                            >
                                                                                Yes, Cancel
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            )}
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <DropdownMenuItem
                                                                        className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                                                                        onSelect={(e) => e.preventDefault()}
                                                                    >
                                                                        <Trash className="h-4 w-4" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This action cannot be undone. This will permanently delete your
                                                                            order from our servers.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleDeleteOrder(order._id)}>
                                                                            Continue
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
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
