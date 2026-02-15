"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Loader2, Sun, Globe, Eye, Shield, Palette } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useSettings } from "@/lib/settings-context"
import { toast } from "sonner"

export default function SettingsPage() {
  const { settings, isLoading, updateSettings, saveSettings, isSaving } = useSettings()

  const handleSwitchChange = (category: string, setting: string, checked: boolean) => {
    const updated = {
      ...settings,
      [category]: {
        ...(settings[category as keyof typeof settings] as Record<string, any>),
        [setting]: checked,
      },
    }
    updateSettings(updated)
    toast.success(`${setting.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} ${checked ? 'enabled' : 'disabled'}`)
  }

  const handleSelectChange = (field: string, value: string) => {
    const updated = { ...settings, [field]: value }
    updateSettings(updated)
    const labels: Record<string, Record<string, string>> = {
      theme: { light: 'Light', dark: 'Dark', system: 'System' },
      language: { en: 'English', es: 'Spanish', fr: 'French', de: 'German', zh: 'Chinese' },
    }
    toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} changed to ${labels[field]?.[value] || value}`)
  }

  const handleNestedSelectChange = (category: string, field: string, value: string) => {
    const updated = {
      ...settings,
      [category]: {
        ...(settings[category as keyof typeof settings] as Record<string, any>),
        [field]: value,
      },
    }
    updateSettings(updated)
    toast.success(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} updated to ${value}`)
  }

  const handleSave = async () => {
    try {
      await saveSettings()
      toast.success("Settings saved!", {
        description: "Your preferences have been saved and will persist across sessions.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings", {
        description: "Please try again later.",
      })
    }
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Settings" text="Manage your application settings and preferences." />
        <div className="grid gap-6">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
              <Skeleton className="h-6 w-[180px]" />
              <Skeleton className="h-4 w-[250px]" />
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-[120px]" />
                      <Skeleton className="h-3 w-[200px]" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-[180px]" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" text="Manage your application settings and preferences." />

      <div className="grid gap-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="general" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              General
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

          {/* ============ GENERAL TAB ============ */}
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
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t p-6">
                <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700" disabled={isSaving}>
                  {isSaving ? (
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

          {/* ============ PRIVACY TAB ============ */}
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
                <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700" disabled={isSaving}>
                  {isSaving ? (
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

          {/* ============ APPEARANCE TAB ============ */}
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
                <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700" disabled={isSaving}>
                  {isSaving ? (
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
