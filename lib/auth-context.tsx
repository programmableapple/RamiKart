"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useNetwork } from "./network-context"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

// Define the User interface
interface User {
  _id: string
  name: string
  userName: string
  email: string
  role: "user" | "admin"
}

// Define the AuthContext interface
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (emailOrUsername: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
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
  const { toast } = useToast()
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
      const response = await post<{ user: User; accessToken: string }>("/api/auth/login", {
        emailOrUsername,
        password,
      })

      // Save user and token to localStorage
      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.setItem("accessToken", response.accessToken)

      // Update state
      setUser(response.user)

      // Show success toast
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.user.name}!`,
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
      const response = await post<{ user: User; accessToken: string }>("/api/auth/register", userData)

      // Save user and token to localStorage
      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.setItem("accessToken", response.accessToken)

      // Update state
      setUser(response.user)

      // Show success toast
      toast({
        title: "Registration successful",
        description: `Welcome to RamiKart, ${response.user.name}!`,
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

      // Clear localStorage
      localStorage.removeItem("user")
      localStorage.removeItem("accessToken")

      // Update state
      setUser(null)

      // Show success toast
      toast({
        title: "Logout successful",
        description: "You have been logged out successfully.",
      })

      // Redirect to login
      router.push("/login")
    } catch (error) {
      // Even if the logout API fails, we still want to clear local storage
      localStorage.removeItem("user")
      localStorage.removeItem("accessToken")
      setUser(null)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  // Create the auth context value
  const authContextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
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
