import type React from "react"
interface ResponsiveTableWrapperProps {
  children: React.ReactNode
}

export function ResponsiveTableWrapper({ children }: ResponsiveTableWrapperProps) {
  return (
    <div className="bg-white rounded-lg border">
      <div className="overflow-x-auto -mx-1 px-1">{children}</div>
    </div>
  )
}

