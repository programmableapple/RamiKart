import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"
import { NetworkProvider } from "@/lib/network-context"
import "@/app/globals.css"

export const metadata = {
  title: "RamiKart - Online Marketplace",
  description: "Buy and sell items on RamiKart, the premier online marketplace",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <NetworkProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </NetworkProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
