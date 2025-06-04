"use client"

import { AddUsersContent } from "@/components/back-office/add-users-content"
import ResponsiveHeader from "../../responsive-header"
import SideBar from "../../sidebar"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  BarChart3,
  ChevronDown,
  LogOut,
  Menu,
  Angry,
  UserRoundCog,
  BadgeDollarSign,
  Tags,
  Languages,
  Edit,
  User,
} from "lucide-react"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"

export default function AddAdministratorPage() {
  const { t } = useLanguage()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-gray-50 lg:flex-row">
          <SideBar activePage="users" />
    
          {/* Main content */}
          <div className="flex-1 overflow-x-hidden">
            {/* Header */}
            <ResponsiveHeader />

            {/* Main content */}  
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AddUsersContent />
        </main>
      </div>
    </div>
  )
}

