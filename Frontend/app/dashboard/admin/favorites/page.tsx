"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useNetwork } from "@/lib/network-context"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Shield, Heart } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Seller {
    _id: string
    name: string
    userName: string
    email: string
}

interface Product {
    _id: string
    title: string
    price: number
    category: string
    active: boolean
    images: string[]
    seller: Seller
}

interface UserWithFavorites {
    _id: string
    name: string
    userName: string
    email: string
    favorites: Product[]
}

export default function AdminFavoritesPage() {
    const router = useRouter()
    const { get } = useNetwork()
    const { user, isAdmin } = useAuth()
    const [usersWithFavorites, setUsersWithFavorites] = useState<UserWithFavorites[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState<UserWithFavorites | null>(null)

    const dataFetchedRef = useRef(false)

    useEffect(() => {
        if (!isAdmin) {
            router.push("/dashboard")
            return
        }

        if (dataFetchedRef.current) return
        dataFetchedRef.current = true

        const fetchAllFavorites = async () => {
            try {
                setLoading(true)
                const response = await get<{ users: UserWithFavorites[] }>("/api/favorites/all")
                if (response?.users) {
                    setUsersWithFavorites(response.users)
                }
            } catch (error) {
                console.error("Error fetching all favorites:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAllFavorites()
    }, [isAdmin])

    const filteredUsers = usersWithFavorites.filter((u) => {
        return (
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })

    if (!isAdmin) return null

    return (
        <DashboardShell>
            <DashboardHeader heading="User Favorites (Admin)" text="View all users' favorite products.">
                <Badge className="bg-amber-500 text-white">
                    <Shield className="mr-1 h-3 w-3" />
                    Admin
                </Badge>
            </DashboardHeader>

            <div className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Search users..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Card className="border-none bg-white shadow-md dark:bg-gray-800">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-4">
                                {Array(5).fill(0).map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="flex h-60 flex-col items-center justify-center gap-2 p-4 text-center">
                                <Heart className="h-10 w-10 text-gray-300" />
                                <h3 className="text-lg font-semibold">No favorites found</h3>
                                <p className="text-sm text-gray-500">
                                    {searchQuery ? "No users match your search" : "No users have added favorites yet"}
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead className="text-center">Favorites Count</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((u) => (
                                        <TableRow key={u._id}>
                                            <TableCell>
                                                <div className="font-medium">{u.name}</div>
                                                <div className="text-xs text-gray-500">@{u.userName}</div>
                                            </TableCell>
                                            <TableCell>{u.email}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary" className="rounded-full px-3">
                                                    {u.favorites.length}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => setSelectedUser(u)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle>Favorites for {u.name}</DialogTitle>
                                                            <DialogDescription>
                                                                @{u.userName} • {u.favorites.length} saved items
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4">
                                                            {u.favorites.map((product) => (
                                                                <div key={product._id} className="flex items-start gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                                    <div className="h-16 w-16 overflow-hidden rounded-md bg-white dark:bg-gray-800 border flex-shrink-0">
                                                                        <img
                                                                            src={product.images && product.images.length > 0
                                                                                ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${product.images[0]}`
                                                                                : "/placeholder.svg"}
                                                                            alt={product.title}
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="font-semibold text-sm truncate">{product.title}</h4>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <Badge variant="outline" className="text-xs">{product.category}</Badge>
                                                                            <span className="text-sm font-medium text-emerald-600">${product.price.toFixed(2)}</span>
                                                                        </div>
                                                                        {product.seller && (
                                                                            <p className="text-xs text-gray-500 mt-2">
                                                                                Seller: {product.seller.name}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardShell>
    )
}
