"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useNetwork } from "@/lib/network-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, User, Mail, AtSign, MapPin, Phone, Globe, Lock, Shield, Upload } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { get, post } = useNetwork()
  const [activeTab, setActiveTab] = useState("general")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const dataFetchedRef = useRef(false)

  const [profileData, setProfileData] = useState({
    name: "",
    userName: "",
    email: "",
    bio: "",
    location: "",
    phone: "",
    website: "",
    avatar: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Fetch profile from backend on mount
  useEffect(() => {
    if (dataFetchedRef.current) return
    dataFetchedRef.current = true

    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true)
        const response = await get<{ profile: any }>("/api/auth/profile")
        if (response?.profile) {
          setProfileData((prev) => ({
            ...prev,
            name: response.profile.name || "",
            userName: response.profile.userName || "",
            email: response.profile.email || "",
            bio: response.profile.bio || "",
            location: response.profile.location || "",
            phone: response.profile.phone || "",
            website: response.profile.website || "",
            avatar: response.profile.avatar || "",
          }))
          if (response.profile.avatar) {
            setAvatarPreview(`${API_URL}${response.profile.avatar}`)
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        // Fallback to auth context data
        if (user) {
          setProfileData((prev) => ({
            ...prev,
            name: user.name || "",
            userName: user.userName || "",
            email: user.email || "",
          }))
        }
        toast.error("Failed to load profile", {
          description: "Using cached data instead.",
        })
      } finally {
        setIsLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please select an image under 2MB.",
        })
        return
      }
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
      toast.success("Avatar selected", {
        description: "Click 'Save Changes' to upload.",
      })
    }
  }

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true)

      // Use FormData for multipart upload (avatar file)
      const formData = new FormData()
      formData.append("name", profileData.name)
      formData.append("userName", profileData.userName)
      formData.append("email", profileData.email)
      formData.append("bio", profileData.bio)
      formData.append("location", profileData.location)
      formData.append("phone", profileData.phone)
      formData.append("website", profileData.website)
      if (avatarFile) {
        formData.append("avatar", avatarFile)
      }

      const token = localStorage.getItem("accessToken")
      const response = await axios.patch(`${API_URL}/api/auth/profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      const profile = response.data.profile

      // Update the auth context so changes propagate across the app
      updateUser({
        name: profile.name,
        userName: profile.userName,
        email: profile.email,
        avatar: profile.avatar,
      })

      // Update avatar preview with server URL
      if (profile.avatar) {
        setAvatarPreview(`${API_URL}${profile.avatar}`)
      }
      setAvatarFile(null)

      toast.success("Profile updated!", {
        description: "Your profile information has been saved successfully.",
      })
    } catch (error: any) {
      console.error("Error updating profile:", error)
      const message = error?.response?.data?.message || "Please try again later."
      toast.error("Failed to update profile", {
        description: message,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!profileData.currentPassword || !profileData.newPassword) {
      toast.error("Missing fields", {
        description: "Please fill in both current and new password.",
      })
      return
    }

    if (profileData.newPassword !== profileData.confirmPassword) {
      toast.error("Password mismatch", {
        description: "New password and confirmation do not match.",
      })
      return
    }

    if (profileData.newPassword.length < 6) {
      toast.error("Password too short", {
        description: "New password must be at least 6 characters.",
      })
      return
    }

    try {
      setIsUpdating(true)

      await post("/api/auth/changepassword", {
        oldPassword: profileData.currentPassword,
        newPassword: profileData.newPassword,
      })

      setProfileData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))

      toast.success("Password updated!", {
        description: "Your password has been changed successfully.",
      })
    } catch (error: any) {
      console.error("Error updating password:", error)
      const message = error?.response?.data?.message || "Please try again later."
      toast.error("Failed to update password", {
        description: message,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoadingProfile) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Profile" text="Manage your account settings and preferences." />
        <div className="grid gap-6">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
              <Skeleton className="h-6 w-[180px]" />
              <Skeleton className="h-4 w-[250px]" />
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex flex-col items-center gap-4 md:w-1/3">
                  <Skeleton className="h-32 w-32 rounded-full" />
                  <Skeleton className="h-8 w-[120px]" />
                </div>
                <div className="space-y-4 md:w-2/3">
                  {Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Profile" text="Manage your account settings and preferences." />

      <div className="grid gap-6">
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-3">
            <TabsTrigger value="general" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              General
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              Security
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and public profile.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 md:flex-row">
                  <div className="flex flex-col items-center gap-4 md:w-1/3">
                    <Avatar className="h-32 w-32 border-4 border-emerald-100 dark:border-emerald-900">
                      <AvatarImage
                        src={avatarPreview || undefined}
                        alt={profileData.name || "User"}
                      />
                      <AvatarFallback className="text-4xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
                        {profileData.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30">
                          <Upload className="h-4 w-4" />
                          <span>Change Avatar</span>
                        </div>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </Label>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">JPG, GIF or PNG. Max size 2MB.</p>
                    </div>
                  </div>

                  <div className="space-y-4 md:w-2/3">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-1">
                          <User className="h-4 w-4 text-emerald-600" /> Full Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={profileData.name}
                          onChange={handleChange}
                          className="border-emerald-100 focus-visible:ring-emerald-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="userName" className="flex items-center gap-1">
                          <AtSign className="h-4 w-4 text-emerald-600" /> Username
                        </Label>
                        <Input
                          id="userName"
                          name="userName"
                          value={profileData.userName}
                          onChange={handleChange}
                          className="border-emerald-100 focus-visible:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-emerald-600" /> Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleChange}
                        className="border-emerald-100 focus-visible:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="flex items-center gap-1">
                        <User className="h-4 w-4 text-emerald-600" /> Bio
                      </Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        placeholder="Tell us about yourself"
                        value={profileData.bio}
                        onChange={handleChange}
                        className="min-h-[100px] border-emerald-100 focus-visible:ring-emerald-500"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="location" className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-emerald-600" /> Location
                        </Label>
                        <Input
                          id="location"
                          name="location"
                          placeholder="City, Country"
                          value={profileData.location}
                          onChange={handleChange}
                          className="border-emerald-100 focus-visible:ring-emerald-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-emerald-600" /> Phone
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="+1 (555) 123-4567"
                          value={profileData.phone}
                          onChange={handleChange}
                          className="border-emerald-100 focus-visible:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website" className="flex items-center gap-1">
                        <Globe className="h-4 w-4 text-emerald-600" /> Website
                      </Label>
                      <Input
                        id="website"
                        name="website"
                        placeholder="https://example.com"
                        value={profileData.website}
                        onChange={handleChange}
                        className="border-emerald-100 focus-visible:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t p-6">
                <Button
                  onClick={handleUpdateProfile}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <CardTitle>Password</CardTitle>
                <CardDescription>Update your password to keep your account secure.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="flex items-center gap-1">
                    <Lock className="h-4 w-4 text-emerald-600" /> Current Password
                  </Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={profileData.currentPassword}
                    onChange={handleChange}
                    className="border-emerald-100 focus-visible:ring-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="flex items-center gap-1">
                    <Lock className="h-4 w-4 text-emerald-600" /> New Password
                  </Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={profileData.newPassword}
                    onChange={handleChange}
                    className="border-emerald-100 focus-visible:ring-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center gap-1">
                    <Lock className="h-4 w-4 text-emerald-600" /> Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={handleChange}
                    className="border-emerald-100 focus-visible:ring-emerald-500"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t p-6">
                <Button
                  onClick={handleUpdatePassword}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900">
                      <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Protect your account with an additional verification step.
                      </p>
                    </div>
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">Enable</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <CardTitle>Account Preferences</CardTitle>
                <CardDescription>Manage your account settings and preferences.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Email Notifications</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="marketing-emails" className="flex items-center gap-2 cursor-pointer">
                          <div className="flex h-5 w-5 items-center justify-center rounded border border-emerald-200">
                            <input
                              id="marketing-emails"
                              type="checkbox"
                              className="h-3 w-3 accent-emerald-600"
                              defaultChecked
                            />
                          </div>
                          <span>Marketing emails</span>
                        </Label>
                        <span className="text-xs text-gray-500">Receive offers, promotions and updates</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="product-emails" className="flex items-center gap-2 cursor-pointer">
                          <div className="flex h-5 w-5 items-center justify-center rounded border border-emerald-200">
                            <input
                              id="product-emails"
                              type="checkbox"
                              className="h-3 w-3 accent-emerald-600"
                              defaultChecked
                            />
                          </div>
                          <span>Product emails</span>
                        </Label>
                        <span className="text-xs text-gray-500">Receive updates about your products</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="security-emails" className="flex items-center gap-2 cursor-pointer">
                          <div className="flex h-5 w-5 items-center justify-center rounded border border-emerald-200">
                            <input
                              id="security-emails"
                              type="checkbox"
                              className="h-3 w-3 accent-emerald-600"
                              defaultChecked
                            />
                          </div>
                          <span>Security emails</span>
                        </Label>
                        <span className="text-xs text-gray-500">Receive security alerts and notifications</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Account Actions</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Download Your Data</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Download a copy of your data from RamiKart
                          </p>
                        </div>
                        <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                          Download
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-red-600 dark:text-red-400">Delete Account</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Permanently delete your account and all your data
                          </p>
                        </div>
                        <Button variant="destructive">Delete Account</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t p-6">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
