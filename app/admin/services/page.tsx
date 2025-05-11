"use client"

import type React from "react"

import { ServicesContent } from "@/components/back-office/services-content"

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

export default function ServicesPage() {
  const { t } = useLanguage()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-gray-50 lg:flex-row">
      <aside
              className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              } lg:translate-x-0 lg:static lg:inset-auto lg:z-auto`}
            >
              <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex h-16 items-center border-b px-6">
                  <Link href="/admin" className="flex items-center">
                    <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto" />
                  </Link>
                </div>
      
                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4">
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href="/admin"
                        className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                      >
                        <BarChart3 className="mr-3 h-5 w-5" />
                        <span>{t("admin.dashboard")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/users"
                        className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                      >
                        <UserRoundCog className="mr-3 h-5 w-5" />
                        <span>{t("admin.users")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/services"
                        className="flex items-center rounded-md bg-green-50 px-4 py-3 text-white"
                      >
                        <Tags className="mr-3 h-5 w-5" />
                        <span>{t("admin.services")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/translations"
                        className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                      >
                        <Languages className="mr-3 h-5 w-5" />
                        <span>{t("admin.translations")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/complaints"
                        className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                      >
                        <Angry className="mr-3 h-5 w-5" />
                        <span>{t("admin.complaints")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/finance"
                        className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                      >
                        <BadgeDollarSign className="mr-3 h-5 w-5" />
                        <span>{t("admin.finance")}</span>
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </aside>

      {/* Main content */}
      <div className="flex-1 overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Right actions */}
          <div className="ml-auto flex items-center space-x-4">
            <LanguageSelector />

            {/* User menu - style adapté du dashboard client */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center bg-green-50 text-white rounded-full px-4 py-1 hover:bg-green-400 transition-colors"
              >
                <User className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Charlotte</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-100">
                  <Link
                    href="/admin/edit-account"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    <span>{t("common.editAccount")}</span>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <Link href="/app_client" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <User className="h-4 w-4 mr-2" />
                    <span>{t("common.clientSpace")}</span>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <div className="px-4 py-1 text-xs text-gray-500">{t("common.accessToSpace")}</div>

                  <Link href="/register/shopkeeper" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.shopkeeper")}
                  </Link>

                  <Link href="/register/service-provider" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.serviceProvider")}
                  </Link>

                  <Link href="/register/service-provider" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.deliveryMan")}
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <Link href="/logout" className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>{t("common.logout")}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <ServicesContent />
        </main>
      </div>
    </div>
  )
}

