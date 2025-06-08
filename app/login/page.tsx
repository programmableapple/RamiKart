"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Loader2, Mail, Lock } from "lucide-react"

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState("")
  const [password, setPassword] = useState("")
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(emailOrUsername, password)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white p-4 dark:from-gray-900 dark:to-gray-800">
      <Link href="/" className="absolute left-8 top-8 flex items-center gap-2">
        <ShoppingBag className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xl font-bold">RamiKart</span>
      </Link>

      <div className="w-full max-w-md">
        <Card className="w-full border-none shadow-lg dark:bg-gray-800">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900">
                <ShoppingBag className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailOrUsername" className="flex items-center gap-1">
                  <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" /> Email or Username
                </Label>
                <Input
                  id="emailOrUsername"
                  type="text"
                  placeholder="Email or username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="border-gray-200 focus-visible:ring-emerald-500 dark:border-gray-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="flex items-center gap-1">
                    <Lock className="h-4 w-4 text-gray-500 dark:text-gray-400" /> Password
                  </Label>
                  <Link href="#" className="text-xs text-emerald-600 hover:underline dark:text-emerald-400">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-gray-200 focus-visible:ring-emerald-500 dark:border-gray-700"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-emerald-600 hover:underline dark:text-emerald-400">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
