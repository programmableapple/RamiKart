"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { useTheme } from "next-themes"
import { useNetwork } from "./network-context"
import { useAuth } from "./auth-context"

interface SettingsData {
    theme: string
    language: string
    privacy: {
        profileVisibility: string
        activityStatus: boolean
        showEmail: boolean
    }
    appearance: {
        reducedMotion: boolean
        highContrast: boolean
        fontSize: string
    }
}

interface SettingsContextType {
    settings: SettingsData
    isLoading: boolean
    updateSettings: (newSettings: SettingsData) => void
    saveSettings: () => Promise<void>
    isSaving: boolean
}

const DEFAULT_SETTINGS: SettingsData = {
    theme: "system",
    language: "en",
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
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const { setTheme } = useTheme()
    const { get, patch } = useNetwork()
    const { user, isLoading: authLoading } = useAuth()

    // Apply appearance settings to the DOM
    const applyAppearance = useCallback((appearance: SettingsData["appearance"]) => {
        const html = document.documentElement

        // Font size
        html.classList.remove("font-small", "font-medium", "font-large")
        html.classList.add(`font-${appearance.fontSize}`)

        // Reduced motion
        if (appearance.reducedMotion) {
            html.classList.add("reduced-motion")
        } else {
            html.classList.remove("reduced-motion")
        }

        // High contrast
        if (appearance.highContrast) {
            html.classList.add("high-contrast")
        } else {
            html.classList.remove("high-contrast")
        }
    }, [])

    // Apply theme
    const applyTheme = useCallback((theme: string) => {
        setTheme(theme)
    }, [setTheme])

    // Track which user we already fetched settings for to avoid re-fetching
    const fetchedForUser = useRef<string | null>(null)

    // Fetch settings from backend on login
    useEffect(() => {
        if (!user) {
            fetchedForUser.current = null
            setIsLoading(false)
            return
        }

        // Skip if we already fetched for this user
        if (fetchedForUser.current === user._id) {
            return
        }
        fetchedForUser.current = user._id

        const fetchSettings = async () => {
            try {
                setIsLoading(true)
                const response = await get<{ settings: SettingsData }>("/api/auth/settings")
                if (response?.settings) {
                    const loaded: SettingsData = {
                        theme: response.settings.theme || DEFAULT_SETTINGS.theme,
                        language: response.settings.language || DEFAULT_SETTINGS.language,
                        privacy: {
                            profileVisibility: response.settings.privacy?.profileVisibility || DEFAULT_SETTINGS.privacy.profileVisibility,
                            activityStatus: response.settings.privacy?.activityStatus ?? DEFAULT_SETTINGS.privacy.activityStatus,
                            showEmail: response.settings.privacy?.showEmail ?? DEFAULT_SETTINGS.privacy.showEmail,
                        },
                        appearance: {
                            reducedMotion: response.settings.appearance?.reducedMotion ?? DEFAULT_SETTINGS.appearance.reducedMotion,
                            highContrast: response.settings.appearance?.highContrast ?? DEFAULT_SETTINGS.appearance.highContrast,
                            fontSize: response.settings.appearance?.fontSize || DEFAULT_SETTINGS.appearance.fontSize,
                        },
                    }
                    setSettings(loaded)
                    applyTheme(loaded.theme)
                    applyAppearance(loaded.appearance)
                }
            } catch (error) {
                console.error("Error fetching settings:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSettings()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id])

    // Reset settings when user logs out
    useEffect(() => {
        if (!user && !authLoading) {
            setSettings(DEFAULT_SETTINGS)
            applyTheme(DEFAULT_SETTINGS.theme)
            applyAppearance(DEFAULT_SETTINGS.appearance)
        }
    }, [user, authLoading, applyTheme, applyAppearance])

    // Prevent cross-tab theme bleed: when another tab writes to the theme
    // storage key, re-apply this user's own settings so they aren't overridden.
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === "ramikart-theme" && user) {
                // Another tab changed the theme – re-apply our own
                applyTheme(settings.theme)
            }
        }
        window.addEventListener("storage", handleStorage)
        return () => window.removeEventListener("storage", handleStorage)
    }, [user, settings.theme, applyTheme])

    // Update settings locally and apply immediately
    const updateSettings = useCallback((newSettings: SettingsData) => {
        setSettings(newSettings)
        applyTheme(newSettings.theme)
        applyAppearance(newSettings.appearance)
    }, [applyTheme, applyAppearance])

    // Save settings to backend
    const saveSettings = useCallback(async () => {
        setIsSaving(true)
        try {
            await patch("/api/auth/settings", settings)
        } finally {
            setIsSaving(false)
        }
    }, [patch, settings])

    return (
        <SettingsContext.Provider value={{ settings, isLoading, updateSettings, saveSettings, isSaving }}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const context = useContext(SettingsContext)
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider")
    }
    return context
}
