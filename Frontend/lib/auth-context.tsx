"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useNetwork } from "./network-context"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Define the User interface
interface User {
  _id: string
  name: string
  userName: string
  email: string
  role: "user" | "admin"
  avatar?: string
}

// Define the AuthContext interface
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  login: (emailOrUsername: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updatedFields: Partial<User>) => void
}

// Define the RegisterData interface
interface RegisterData {
  name: string
  userName: string
  email: string
  password: string
  role?: "user" | "admin"
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create the AuthProvider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { post } = useNetwork()
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem("user")
        localStorage.removeItem("accessToken")
      }
    }
    setIsLoading(false)
  }, [])

  // Update the login function to use emailOrUsername instead of email
  const login = async (emailOrUsername: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await post<{ user: User; accessToken: string; refreshToken: string }>("/api/auth/login", {
        emailOrUsername,
        password,
      })

      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.setItem("accessToken", response.accessToken)
      localStorage.setItem("refreshToken", response.refreshToken)

      // Update state
      setUser(response.user)

      // Show success toast
      toast.success(`Welcome back, ${response.user.name}!`, {
        description: "Your dashboard is ready.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      // Error is handled by network interceptor
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true)
      const response = await post<{ user: User; accessToken: string; refreshToken: string }>("/api/auth/register", userData)

      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.setItem("accessToken", response.accessToken)
      localStorage.setItem("refreshToken", response.refreshToken)

      // Update state
      setUser(response.user)

      // Show success toast
      toast.success(`Welcome to RamiKart, ${response.user.name}!`, {
        description: "Your account has been created successfully.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      // Error is handled by network interceptor
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true)
      await post("/api/auth/logout")

      localStorage.removeItem("user")
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")

      // Update state
      setUser(null)

      // Show success toast
      toast.success("Logged out successfully", {
        description: "See you soon! Come back anytime.",
      })

      // Redirect to login
      router.push("/login")
    } catch (error) {
      localStorage.removeItem("user")
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      setUser(null)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  // Update user fields (e.g., after profile edit)
  const updateUser = (updatedFields: Partial<User>) => {
    if (!user) return
    const newUser = { ...user, ...updatedFields }
    setUser(newUser)
    localStorage.setItem("user", JSON.stringify(newUser))
  }

  // Create the auth context value
  const authContextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>
}

// Create a custom hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
