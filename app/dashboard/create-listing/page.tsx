"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useNetwork } from "@/lib/network-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, X, ImageIcon, DollarSign, Tag, Layers, Check } from "lucide-react"
import { motion } from "framer-motion"

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

export default function CreateListingPage() {
  const router = useRouter()
  const { post, isLoading } = useNetwork()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "1",
    category: "",
    tags: "",
    active: true,
  })

  const [images, setImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
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

    // Clear error when user selects
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)

      // Limit to 5 images
      if (images.length + selectedFiles.length > 5) {
        toast({
          title: "Too many images",
          description: "You can upload a maximum of 5 images per listing",
          variant: "destructive",
        })
        return
      }

      // Create preview URLs
      const newPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file))

      setImages((prev) => [...prev, ...selectedFiles])
      setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls])

      // Clear error if it exists
      if (errors.images) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.images
          return newErrors
        })
      }
    }
  }

  const removeImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index])

    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.price.trim()) {
      newErrors.price = "Price is required"
    } else if (isNaN(Number.parseFloat(formData.price)) || Number.parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be a positive number"
    }

    if (!formData.stock.trim()) {
      newErrors.stock = "Stock is required"
    } else if (isNaN(Number.parseInt(formData.stock)) || Number.parseInt(formData.stock) < 0) {
      newErrors.stock = "Stock must be a non-negative number"
    }

    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    if (images.length === 0) {
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

      // Create FormData for multipart/form-data submission
      const submitData = new FormData()
      submitData.append("title", formData.title)
      submitData.append("description", formData.description)
      submitData.append("price", formData.price)
      submitData.append("stock", formData.stock)
      submitData.append("category", formData.category)

      // Add tags if provided
      if (formData.tags) {
        formData.tags.split(",").forEach((tag) => {
          submitData.append("tags", tag.trim())
        })
      }

      submitData.append("active", formData.active.toString())

      // Add images
      images.forEach((image) => {
        submitData.append("images", image)
      })

      // Send to the correct API endpoint
      const response = await post("/api/listings", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("Listing created successfully:", response)

      toast({
        title: "Listing Created",
        description: "Your listing has been created successfully",
        variant: "default",
      })

      // Redirect to listings page
      router.push("/dashboard/listings")
    } catch (error) {
      console.error("Error creating listing:", error)
      toast({
        title: "Error",
        description: "There was an error creating your listing. Please try again.",
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

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
        <div className="flex flex-1 items-center gap-2">
          <h1 className="text-xl font-semibold">Create New Listing</h1>
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

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) => handleSwitchChange("active", checked)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                    <Label htmlFor="active" className="flex items-center gap-1">
                      <Check className={`h-4 w-4 ${formData.active ? "text-emerald-600" : "text-gray-400"}`} />
                      List as active
                    </Label>
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
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {imagePreviewUrls.map((url, index) => (
                        <div
                          key={index}
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
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          {index === 0 && (
                            <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-xs px-2 py-1 rounded-md">
                              Cover
                            </span>
                          )}
                        </div>
                      ))}

                      {imagePreviewUrls.length < 5 && (
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
                      Upload up to 5 images. First image will be the cover. Supported formats: JPG, PNG, GIF.
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
                      Creating...
                    </>
                  ) : (
                    "Create Listing"
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
