"use client"

import type React from "react"

import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios"
import { createContext, useContext, useState, useRef, useCallback, useMemo, useEffect } from "react"
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

  // Refs for state-setters so interceptors don't go stale
  const toastRef = useRef(toast)
  toastRef.current = toast

  // Create a stable axios instance (only created once)
  const api = useMemo(() => axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
    headers: {
      "Content-Type": "application/json",
    },
  }), [])

  // Attach interceptors only once
  const interceptorsAttached = useRef(false)

  useEffect(() => {
    if (interceptorsAttached.current) return
    interceptorsAttached.current = true

    // --- Request interceptor ---
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
      (err) => {
        setIsLoading(false)
        setError(err.message)
        return Promise.reject(err)
      },
    )

    // --- Token refresh state (closure-scoped, not React state) ---
    let isRefreshing = false
    let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = []

    const processQueue = (err: any, token: string | null = null) => {
      failedQueue.forEach((prom) => {
        if (token) {
          prom.resolve(token)
        } else {
          prom.reject(err)
        }
      })
      failedQueue = []
    }

    // --- Response interceptor ---
    api.interceptors.response.use(
      (response) => {
        setIsLoading(false)
        return response
      },
      async (error: AxiosError) => {
        setIsLoading(false)
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

        if (error.response) {
          const status = error.response.status
          const errorMessage = (error.response.data as any)?.message || "An error occurred"

          if (status === 401 && !originalRequest._retry) {
            // Try to refresh the access token before giving up
            const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null

            if (refreshToken) {
              if (isRefreshing) {
                // Another refresh is already in-flight – queue this request
                return new Promise((resolve, reject) => {
                  failedQueue.push({
                    resolve: (token: string) => {
                      if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                      }
                      resolve(api(originalRequest))
                    },
                    reject: (err: any) => reject(err),
                  })
                })
              }

              originalRequest._retry = true
              isRefreshing = true

              try {
                const { data } = await axios.post(
                  `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/refresh`,
                  { token: refreshToken }
                )

                const newAccessToken = data.accessToken
                localStorage.setItem("accessToken", newAccessToken)
                processQueue(null, newAccessToken)

                // Retry the original request with the new token
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                }
                return api(originalRequest)
              } catch (refreshError) {
                processQueue(refreshError, null)
                // Refresh failed – clear tokens and redirect to login
                if (typeof window !== "undefined") {
                  localStorage.removeItem("accessToken")
                  localStorage.removeItem("refreshToken")
                  localStorage.removeItem("user")
                  if (window.location.pathname !== "/login") {
                    window.location.href = "/login"
                  }
                  toastRef.current({
                    title: "Session expired",
                    description: "Please log in again",
                    variant: "destructive",
                  })
                }
                return Promise.reject(refreshError)
              } finally {
                isRefreshing = false
              }
            } else {
              // No refresh token available – clear and redirect
              if (typeof window !== "undefined") {
                localStorage.removeItem("accessToken")
                localStorage.removeItem("refreshToken")
                localStorage.removeItem("user")
                if (window.location.pathname !== "/login") {
                  window.location.href = "/login"
                }
                toastRef.current({
                  title: "Session expired",
                  description: "Please log in again",
                  variant: "destructive",
                })
              }
            }
          } else if (status !== 401) {
            // Handle other errors
            setError(errorMessage)
            toastRef.current({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            })
          }
        } else if (error.request) {
          setError("No response from server. Please check your connection.")
          toastRef.current({
            title: "Network Error",
            description: "No response from server. Please check your connection.",
            variant: "destructive",
          })
        } else {
          setError(error.message || "An error occurred")
          toastRef.current({
            title: "Request Error",
            description: error.message || "An error occurred",
            variant: "destructive",
          })
        }

        return Promise.reject(error)
      },
    )
  }, [api])

  // Create stable wrapper functions for API calls
  const get = useCallback(async <T,>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.get(url, config)
    return response.data
  }, [api])

  const post = useCallback(async <T,>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.post(url, data, config)
    return response.data
  }, [api])

  const patch = useCallback(async <T,>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.patch(url, data, config)
    return response.data
  }, [api])

  const deleteRequest = useCallback(async <T,>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.delete(url, config)
    return response.data
  }, [api])

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
