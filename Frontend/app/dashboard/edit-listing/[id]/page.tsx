"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useNetwork } from "@/lib/network-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, X, ImageIcon, DollarSign, Tag, Layers, Check, EyeOff, Eye } from "lucide-react"
import { motion } from "framer-motion"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const categories = [
    "Electronics",
    "Clothing",
    "Home & Garden",
    "Toys & Games",
    "Sports & Outdoors",
    "Automotive",
    "Books & Media",
    "Collectibles",
    "Furniture",
    "Motorcycles & ATV's",
    "Other",
]

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { get, patch, isLoading } = useNetwork()
    const { toast } = useToast()
    const { id: listingId } = use(params)

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        tags: "",
        active: true,
    })

    const [images, setImages] = useState<File[]>([])
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
    const [existingImages, setExistingImages] = useState<string[]>([])
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isFetching, setIsFetching] = useState(true)

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await get(`/api/listings/${listingId}`)
                // @ts-ignore
                const listing = response.product || response

                if (listing) {
                    setFormData({
                        title: listing.title || "",
                        description: listing.description || "",
                        price: listing.price.toString() || "",
                        stock: listing.stock.toString() || "",
                        category: listing.category || "",
                        tags: listing.tags ? listing.tags.join(", ") : "",
                        active: listing.active,
                    })
                    setExistingImages(listing.images || [])
                }
            } catch (error) {
                console.error("Error fetching listing:", error)
                toast({
                    title: "Error",
                    description: "Failed to load listing details.",
                    variant: "destructive",
                })
                router.push("/dashboard/listings")
            } finally {
                setIsFetching(false)
            }
        }

        if (listingId) {
            fetchListing()
        }
    }, [listingId, get, router, toast])


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[name]
                return newErrors
            })
        }
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[name]
                return newErrors
            })
        }
    }

    const handleActiveChange = (value: string) => {
        setFormData((prev) => ({ ...prev, active: value === "active" }))
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files)
            const totalImages = existingImages.length + images.length + selectedFiles.length

            if (totalImages > 5) {
                toast({
                    title: "Too many images",
                    description: "You can upload a maximum of 5 images per listing",
                    variant: "destructive",
                })
                return
            }

            const newPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file))
            setImages((prev) => [...prev, ...selectedFiles])
            setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls])

            if (errors.images) {
                setErrors((prev) => {
                    const newErrors = { ...prev }
                    delete newErrors.images
                    return newErrors
                })
            }
        }
    }

    const removeImage = (index: number, isExisting: boolean) => {
        if (isExisting) {
            setExistingImages((prev) => prev.filter((_, i) => i !== index))
        } else {
            URL.revokeObjectURL(imagePreviewUrls[index])
            setImages((prev) => prev.filter((_, i) => i !== index))
            setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index))
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.title.trim()) newErrors.title = "Title is required"
        if (!formData.description.trim()) newErrors.description = "Description is required"
        if (!formData.price.trim()) newErrors.price = "Price is required"
        else if (isNaN(Number.parseFloat(formData.price)) || Number.parseFloat(formData.price) <= 0) newErrors.price = "Price must be a positive number"

        if (!formData.stock.trim()) newErrors.stock = "Stock is required"
        else if (isNaN(Number.parseInt(formData.stock)) || Number.parseInt(formData.stock) < 0) newErrors.stock = "Stock must be a non-negative number"

        if (!formData.category) newErrors.category = "Category is required"

        if (existingImages.length === 0 && images.length === 0) {
            newErrors.images = "At least one image is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fix the errors in the form",
                variant: "destructive",
            })
            return
        }

        try {
            setIsSubmitting(true)

            const submitData = new FormData()
            submitData.append("title", formData.title)
            submitData.append("description", formData.description)
            submitData.append("price", formData.price)
            submitData.append("stock", formData.stock)
            submitData.append("category", formData.category)

            if (formData.tags) {
                formData.tags.split(",").forEach((tag) => {
                    submitData.append("tags", tag.trim())
                })
            }

            submitData.append("active", formData.active.toString())

            // Append existing images as a JSON string to let backend know which to keep
            // This part depends on how your backend handles updates. 
            // Often backends expect 'images' to be new files.
            // If we need to delete old images, we might need a separate mechanism or send the list of retained images.
            // For now, let's assume we send new files in 'images' and maybe 'existingImages' separately if backend supports it.
            // OR if backend replaces all images, we need to handle that.
            // Assuming simplified update: only new images are added. 
            // To properly support reordering/deleting, backend logic is needed.
            // Let's implement a 'keepImages' field.

            existingImages.forEach(img => submitData.append("keepImages", img));

            images.forEach((image) => {
                submitData.append("images", image)
            })

            // Adjust to your backend expectation. 
            // If backend at PUT /api/listings/:id handles multipart/form-data
            const response = await patch(`/api/listings/${listingId}`, submitData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })

            console.log("Listing updated successfully:", response)

            toast({
                title: "Listing Updated",
                description: "Your listing has been updated successfully",
                variant: "default",
            })

            router.push("/dashboard/listings")
        } catch (error) {
            console.error("Error updating listing:", error)
            toast({
                title: "Error",
                description: "There was an error updating your listing. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

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

    if (isFetching) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        )
    }

    return (
        <div className="flex flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
                <div className="flex flex-1 items-center gap-2">
                    <h1 className="text-xl font-semibold">Edit Listing</h1>
                </div>
            </header>
            <main className="flex-1 p-6">
                <motion.form onSubmit={handleSubmit} variants={container} initial="hidden" animate="show">
                    <div className="grid gap-6 md:grid-cols-2">
                        <motion.div className="space-y-6 md:col-span-1" variants={item}>
                            <Card className="border-emerald-100 shadow-md hover:shadow-lg transition-shadow duration-300">
                                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                                    <CardTitle className="flex items-center gap-2">
                                        <Tag className="h-5 w-5 text-emerald-600" />
                                        Product Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 p-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            placeholder="Enter product title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="border-emerald-100 focus-visible:ring-emerald-500"
                                        />
                                        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            placeholder="Enter product description"
                                            rows={5}
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="border-emerald-100 focus-visible:ring-emerald-500"
                                        />
                                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="price" className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4 text-emerald-600" /> Price
                                            </Label>
                                            <Input
                                                id="price"
                                                name="price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                value={formData.price}
                                                onChange={handleChange}
                                                className="border-emerald-100 focus-visible:ring-emerald-500"
                                            />
                                            {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="stock" className="flex items-center gap-1">
                                                <Layers className="h-4 w-4 text-emerald-600" /> Stock
                                            </Label>
                                            <Input
                                                id="stock"
                                                name="stock"
                                                type="number"
                                                min="0"
                                                step="1"
                                                placeholder="1"
                                                value={formData.stock}
                                                onChange={handleChange}
                                                className="border-emerald-100 focus-visible:ring-emerald-500"
                                            />
                                            {errors.stock && <p className="text-sm text-red-500">{errors.stock}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                                            <SelectTrigger id="category" className="border-emerald-100 focus-visible:ring-emerald-500">
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tags">Tags (comma separated)</Label>
                                        <Input
                                            id="tags"
                                            name="tags"
                                            placeholder="e.g. vintage, rare, limited"
                                            value={formData.tags}
                                            onChange={handleChange}
                                            className="border-emerald-100 focus-visible:ring-emerald-500"
                                        />
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <Label>Listing Status</Label>
                                        <RadioGroup
                                            value={formData.active ? "active" : "inactive"}
                                            onValueChange={handleActiveChange}
                                            className="flex flex-col gap-3"
                                        >
                                            <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <RadioGroupItem value="active" id="status-active" className="text-emerald-600 border-emerald-600" />
                                                <Label htmlFor="status-active" className="flex items-center gap-2 cursor-pointer w-full font-medium">
                                                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-600">
                                                        <Eye className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        Active
                                                        <p className="text-xs font-normal text-muted-foreground">Visible to all users on the marketplace</p>
                                                    </div>
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <RadioGroupItem value="inactive" id="status-inactive" className="text-gray-500" />
                                                <Label htmlFor="status-inactive" className="flex items-center gap-2 cursor-pointer w-full font-medium">
                                                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-500">
                                                        <EyeOff className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        Inactive
                                                        <p className="text-xs font-normal text-muted-foreground">Hidden from the marketplace, only visible to you</p>
                                                    </div>
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div className="space-y-6 md:col-span-1" variants={item}>
                            <Card className="border-emerald-100 shadow-md hover:shadow-lg transition-shadow duration-300">
                                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                                    <CardTitle className="flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5 text-emerald-600" />
                                        Product Images
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 p-6">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium mb-2">Existing Images</p>
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-4">
                                            {existingImages.map((url, index) => (
                                                <div
                                                    key={`existing-${index}`}
                                                    className="relative aspect-square rounded-md border bg-gray-100 overflow-hidden group"
                                                >
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}${url}`}
                                                        alt={`Product existing ${index + 1}`}
                                                        className="h-full w-full rounded-md object-cover transition-transform group-hover:scale-105"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => removeImage(index, true)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>

                                        <p className="text-sm font-medium mb-2">New Images</p>
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                            {imagePreviewUrls.map((url, index) => (
                                                <div
                                                    key={`new-${index}`}
                                                    className="relative aspect-square rounded-md border bg-gray-100 overflow-hidden group"
                                                >
                                                    <img
                                                        src={url || "/placeholder.svg"}
                                                        alt={`Product preview ${index + 1}`}
                                                        className="h-full w-full rounded-md object-cover transition-transform group-hover:scale-105"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => removeImage(index, false)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}

                                            {(existingImages.length + images.length) < 5 && (
                                                <div className="flex aspect-square items-center justify-center rounded-md border border-dashed border-emerald-200">
                                                    <label
                                                        htmlFor="image-upload"
                                                        className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 p-2 text-center text-sm text-muted-foreground hover:bg-emerald-50 transition-colors"
                                                    >
                                                        <Upload className="h-6 w-6 text-emerald-600" />
                                                        <span>Upload Image</span>
                                                        <input
                                                            id="image-upload"
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            className="hidden"
                                                            onChange={handleImageChange}
                                                        />
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                        {errors.images && <p className="text-sm text-red-500">{errors.images}</p>}
                                        <p className="text-xs text-muted-foreground">
                                            Upload up to 5 images total. Supported formats: JPG, PNG, GIF.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/dashboard/listings")}
                                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    disabled={isLoading || isSubmitting}
                                >
                                    {isLoading || isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Update Listing"
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </motion.form>
            </main>
        </div>
    )
}
