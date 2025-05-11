import type React from "react"
import { cn } from "@/lib/utils"
import { MainNav } from "@/components/back-office/main-nav"
import { UserNav } from "@/components/back-office/user-nav"

interface DashboardShellProps {
  children: React.ReactNode
  className?: string
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-16 items-center px-4">
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className={cn("mx-auto w-full max-w-7xl", className)}>{children}</div>
      </main>
    </div>
  )
}

