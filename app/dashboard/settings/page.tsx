"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Sun, Bell, Globe, Eye, CreditCard, Shield, Palette } from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  const [settings, setSettings] = useState({
    theme: "system",
    language: "en",
    notifications: {
      email: true,
      push: true,
      sms: false,
      browser: true,
    },
    privacy: {
      profileVisibility: "public",
      activityStatus: true,
      showEmail: false,
    },
    appearance: {
      reducedMotion: false,
      highContrast: false,
      fontSize: "medium",
    },
  })

  const handleSwitchChange = (category: string, setting: string, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: checked,
      },
    }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNestedSelectChange = (category: string, field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  const saveSettings = async () => {
    try {
      setIsUpdating(true)

      // In a real app, you would send the settings to the server
      // const response = await patch("/api/users/settings", settings)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Save Failed",
        description: "There was an error saving your settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" text="Manage your application settings and preferences." />

      <div className="grid gap-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:w-auto">
            <TabsTrigger value="general" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              General
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              Privacy
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage your general application settings.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900">
                        <Sun className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <Label htmlFor="theme">Theme</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred theme</p>
                      </div>
                    </div>
                    <Select value={settings.theme} onValueChange={(value) => handleSelectChange("theme", value)}>
                      <SelectTrigger id="theme" className="w-[180px] border-emerald-100 focus-visible:ring-emerald-500">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900">
                        <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <Label htmlFor="language">Language</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred language</p>
                      </div>
                    </div>
                    <Select value={settings.language} onValueChange={(value) => handleSelectChange("language", value)}>
                      <SelectTrigger
                        id="language"
                        className="w-[180px] border-emerald-100 focus-visible:ring-emerald-500"
                      >
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900">
                        <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <Label>Payment Methods</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your payment methods</p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t p-6">
                <Button onClick={saveSettings} className="bg-emerald-600 hover:bg-emerald-700" disabled={isUpdating}>
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

          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage how you receive notifications.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900">
                        <Bell className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) => handleSwitchChange("notifications", "email", checked)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900">
                        <Bell className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive push notifications on your devices
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) => handleSwitchChange("notifications", "push", checked)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900">
                        <Bell className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <Label htmlFor="sms-notifications">SMS Notifications</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via SMS</p>
                      </div>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={settings.notifications.sms}
                      onCheckedChange={(checked) => handleSwitchChange("notifications", "sms", checked)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900">
                        <Bell className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <Label htmlFor="browser-notifications">Browser Notifications</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive notifications in your browser
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="browser-notifications"
                      checked={settings.notifications.browser}
                      onCheckedChange={(checked) => handleSwitchChange("notifications", "browser", checked)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t p-6">
                <Button onClick={saveSettings} className="bg-emerald-600 hover:bg-emerald-700" disabled={isUpdating}>
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

          <TabsContent value="privacy" className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Manage your privacy and security preferences.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900">
                        <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <Label htmlFor="profile-visibility">Profile Visibility</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Control who can see your profile</p>
                      </div>
                    </div>
                    <Select
                      value={settings.privacy.profileVisibility}
                      onValueChange={(value) => handleNestedSelectChange("privacy", "profileVisibility", value)}
                    >
                      <SelectTrigger
                        id="profile-visibility"
                        className="w-[180px] border-emerald-100 focus-visible:ring-emerald-500"
                      >
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900">
                        <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <Label htmlFor="activity-status">Activity Status</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Show when you're active on RamiKart</p>
                      </div>
                    </div>
                    <Switch
                      id="activity-status"
                      checked={settings.privacy.activityStatus}
                      onCheckedChange={(checked) => handleSwitchChange("privacy", "activityStatus", checked)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900">
                        <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <Label htmlFor="show-email">Show Email Address</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Allow others to see your email address
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="show-email"
                      checked={settings.privacy.showEmail}
                      onCheckedChange={(checked) => handleSwitchChange("privacy", "showEmail", checked)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t p-6">
                <Button onClick={saveSettings} className="bg-emerald-600 hover:bg-emerald-700" disabled={isUpdating}>
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

          <TabsContent value="appearance" className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize how RamiKart looks and feels.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900">
                        <Palette className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <Label htmlFor="reduced-motion">Reduced Motion</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Reduce the amount of animations</p>
                      </div>
                    </div>
                    <Switch
                      id="reduced-motion"
                      checked={settings.appearance.reducedMotion}
                      onCheckedChange={(checked) => handleSwitchChange("appearance", "reducedMotion", checked)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900">
                        <Palette className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <Label htmlFor="high-contrast">High Contrast</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Increase contrast for better visibility
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="high-contrast"
                      checked={settings.appearance.highContrast}
                      onCheckedChange={(checked) => handleSwitchChange("appearance", "highContrast", checked)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900">
                        <Palette className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <Label htmlFor="font-size">Font Size</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Adjust the text size</p>
                      </div>
                    </div>
                    <Select
                      value={settings.appearance.fontSize}
                      onValueChange={(value) => handleNestedSelectChange("appearance", "fontSize", value)}
                    >
                      <SelectTrigger
                        id="font-size"
                        className="w-[180px] border-emerald-100 focus-visible:ring-emerald-500"
                      >
                        <SelectValue placeholder="Select font size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t p-6">
                <Button onClick={saveSettings} className="bg-emerald-600 hover:bg-emerald-700" disabled={isUpdating}>
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
        </Tabs>
      </div>
    </DashboardShell>
  )
}
