import type React from "react"
import { cn } from "@/lib/utils"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({ children, className, ...props }: DashboardShellProps) {
  return (
    <div className={cn("flex min-h-screen flex-col space-y-6 p-6", className)} {...props}>
      <main className="flex flex-1 flex-col gap-6">{children}</main>
    </div>
  )
}
