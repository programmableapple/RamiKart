"use client"

import type React from "react"

import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios"
import { createContext, useContext, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

// Define the NetworkManager interface
interface NetworkManager {
  api: AxiosInstance
  isLoading: boolean
  error: string | null
  get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>
  delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>
}

// Create the NetworkContext
const NetworkContext = createContext<NetworkManager | undefined>(undefined)

// Create the NetworkProvider component
export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Create the axios instance
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
    headers: {
      "Content-Type": "application/json",
    },
  })

  // Add request interceptor
  api.interceptors.request.use(
    (config) => {
      setIsLoading(true)
      setError(null)

      // Add auth token if available
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken")
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }

      return config
    },
    (error) => {
      setIsLoading(false)
      setError(error.message)
      return Promise.reject(error)
    },
  )

  // Add response interceptor
  api.interceptors.response.use(
    (response) => {
      setIsLoading(false)
      return response
    },
    (error: AxiosError) => {
      setIsLoading(false)

      // Handle different error types
      if (error.response) {
        // Server responded with a status code outside of 2xx range
        const status = error.response.status
        const errorMessage = error.response.data?.message || "An error occurred"

        if (status === 401) {
          // Handle unauthorized access
          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken")
            localStorage.removeItem("user")
            window.location.href = "/login"
            toast({
              title: "Session expired",
              description: "Please log in again",
              variant: "destructive",
            })
          }
        } else {
          // Handle other errors
          setError(errorMessage)
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          })
        }
      } else if (error.request) {
        // Request was made but no response received
        setError("No response from server. Please check your connection.")
        toast({
          title: "Network Error",
          description: "No response from server. Please check your connection.",
          variant: "destructive",
        })
      } else {
        // Something happened in setting up the request
        setError(error.message || "An error occurred")
        toast({
          title: "Request Error",
          description: error.message || "An error occurred",
          variant: "destructive",
        })
      }

      return Promise.reject(error)
    },
  )

  // Create wrapper functions for API calls
  const get = async <T,>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.get(url, config)
    return response.data
  }

  const post = async <T,>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.post(url, data, config)
    return response.data
  }

  const patch = async <T,>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.patch(url, data, config)
    return response.data
  }

  const deleteRequest = async <T,>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.delete(url, config)
    return response.data
  }

  // Create the network manager object
  const networkManager: NetworkManager = {
    api,
    isLoading,
    error,
    get,
    post,
    patch,
    delete: deleteRequest,
  }

  return <NetworkContext.Provider value={networkManager}>{children}</NetworkContext.Provider>
}

// Create a custom hook to use the NetworkContext
export function useNetwork() {
  const context = useContext(NetworkContext)
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider")
  }
  return context
}
