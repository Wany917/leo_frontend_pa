"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  BarChart3,
  ChevronDown,
  LogOut,
  Menu,
  MessageSquare,
  Edit,
  CreditCard,
  User,
  ReceiptText,
  PartyPopper,
  Plus,
} from "lucide-react"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"

export default function ShopkeeperAnnouncementsPage() {
  const { t } = useLanguage()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Pair of running shoes",
      image: "/running-shoes.jpg",
      deliveryAddress: "11 rue Erand, Paris 75012",
      price: "£20",
      deliveryDate: "15th May - 30th May",
      amount: 1,
      storageBox: "Storage box 1",
    },
    {
      id: 2,
      title: "Pair of running shoes",
      image: "/running-shoes.jpg",
      deliveryAddress: "45 rue Erand, Paris 75017",
      price: "£14",
      deliveryDate: "3rd June - 17th June",
      amount: 1,
      storageBox: "Storage box 1",
    },
  ])

  const handleDelete = (id: number) => {
    if (window.confirm(t("announcements.confirmDelete"))) {
      setAnnouncements(announcements.filter((announcement) => announcement.id !== id))
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-auto lg:z-auto`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/app_shopkeeper" className="flex items-center">
              <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/app_shopkeeper"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  <span>{t("shopkeeper.dashboard")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_shopkeeper/contract"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <ReceiptText className="mr-3 h-5 w-5" />
                  <span>{t("shopkeeper.contract")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_shopkeeper/announcements"
                  className="flex items-center rounded-md bg-green-50 px-4 py-3 text-white"
                >
                  <PartyPopper className="mr-3 h-5 w-5" />
                  <span>{t("shopkeeper.announcements")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_shopkeeper/messages"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <MessageSquare className="mr-3 h-5 w-5" />
                  <span>{t("shopkeeper.messages")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_shopkeeper/payments"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <CreditCard className="mr-3 h-5 w-5" />
                  <span>{t("shopkeeper.payments")}</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-x-hidden">
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
                  href="/app_shopkeeper/edit_account"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  <span>{t("common.editAccount")}</span>
                </Link>

                <div className="border-t border-gray-100 my-1"></div>

                <Link href="/app_client" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                  <User className="h-4 w-4 mr-2" />
                  {t("common.clientSpace")}
                </Link>

                <div className="border-t border-gray-100 my-1"></div>

                <div className="px-4 py-1 text-xs text-gray-500">{t("common.accessToSpace")}</div>

                <Link href="/register/shopkeeper" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  {t("common.shopkeeper")}
                </Link>

                <Link href="/register/deliveryman" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
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

        {/* Page content */}
        <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <h1 className="text-2xl font-semibold text-center text-green-400">{t("announcements.yourAnnouncements")}</h1>

          <Link
            href="/app_shopkeeper/announcements/create"
            className="bg-green-400 text-white px-4 py-2 rounded-full flex items-center hover:bg-green-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t("announcements.makeNewAnnouncement")}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 relative bg-green-200">
                <Image
                  src="/placeholder.svg"
                  alt={announcement.title}
                  width={200}
                  height={150}
                  className="object-contain mx-auto h-full"
                />
              </div>

              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">{announcement.title}</h2>

                <div className="space-y-1 text-sm mb-4">
                  <p>
                    <span className="font-medium">{t("announcements.deliveryAddress")}:</span>{" "}
                    {announcement.deliveryAddress}
                  </p>
                  <p>
                    <span className="font-medium">{t("announcements.priceForDelivery")}:</span> {announcement.price}
                  </p>
                  <p>
                    <span className="font-medium">{t("announcements.deliveryDate")}:</span> {announcement.deliveryDate}
                  </p>
                  <p>
                    <span className="font-medium">{t("announcements.amount")}:</span> {announcement.amount}
                  </p>
                  <p>
                    <span className="font-medium">{t("announcements.storageBox")}:</span> {announcement.storageBox}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-sm hover:bg-red-200 transition-colors"
                    onClick={() => handleDelete(announcement.id)}
                  >
                    {t("announcements.delete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {announcements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">{t("announcements.noAnnouncements")}</p>
            <Link
              href="/app_client/announcements/create"
              className="bg-green-400 text-white px-4 py-2 rounded-full flex items-center mx-auto hover:bg-green-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t("announcements.makeFirstAnnouncement")}
            </Link>
          </div>
        )}
      </main>
        
  </div>
</div>
    )
}