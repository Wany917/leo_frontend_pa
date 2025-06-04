"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  BarChart3,
  ChevronDown,
  LogOut,
  Menu,
  MessageSquare,
  Tag,
  Edit,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Star,
  LayoutList,
  User,
  ReceiptText,
  PartyPopper,
  Check,
  X,
} from "lucide-react"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Types for our pricing plans
interface PricingFeature {
    name: string
    basic: boolean
    standard: boolean
    ultimate: boolean
  }
  
  interface PricingPlan {
    id: string
    name: string
    price: string
    priceId: string // Stripe price ID
    features: PricingFeature[]
    isActive?: boolean
  }
  
  export default function ShopkeeperContractsClient() {
    const { t } = useLanguage()
    const router = useRouter()
    const [currentPlan, setCurrentPlan] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
  
    // Fetch current subscription status
    useEffect(() => {
      const fetchSubscription = async () => {
        try {
          // In a real app, this would be an API call to your backend
          // For demo purposes, we'll simulate a response
          await new Promise((resolve) => setTimeout(resolve, 1000))
  
          // Simulate a user with an active Ultimate plan
          setCurrentPlan("ultimate")
          setLoading(false)
        } catch (error) {
          console.error("Error fetching subscription:", error)
          setLoading(false)
        }
      }
  
      fetchSubscription()
    }, [])
  
    // Define pricing plans with Stripe price IDs
    // In a real app, you might fetch these from your backend
    const pricingPlans: PricingPlan[] = [
      {
        id: "basic",
        name: t("contracts.basic"),
        price: "£14.99",
        priceId: "price_basic123", // Replace with your actual Stripe price ID
        isActive: currentPlan === "basic",
        features: [
          { name: t("contracts.freeSetup"), basic: true, standard: true, ultimate: true },
          { name: t("contracts.bandwidthLimit"), basic: true, standard: true, ultimate: true },
          { name: t("contracts.userConnection"), basic: true, standard: true, ultimate: true },
          { name: t("contracts.analyticsReport"), basic: false, standard: true, ultimate: true },
          { name: t("contracts.publicApiAccess"), basic: false, standard: true, ultimate: true },
          { name: t("contracts.pluginsIntegration"), basic: false, standard: false, ultimate: true },
          { name: t("contracts.customContentManagement"), basic: false, standard: false, ultimate: true },
        ],
      },
      {
        id: "standard",
        name: t("contracts.standard"),
        price: "£49.99",
        priceId: "price_standard123", // Replace with your actual Stripe price ID
        isActive: currentPlan === "standard",
        features: [
          { name: t("contracts.freeSetup"), basic: true, standard: true, ultimate: true },
          { name: t("contracts.bandwidthLimit"), basic: true, standard: true, ultimate: true },
          { name: t("contracts.userConnection"), basic: true, standard: true, ultimate: true },
          { name: t("contracts.analyticsReport"), basic: false, standard: true, ultimate: true },
          { name: t("contracts.publicApiAccess"), basic: false, standard: true, ultimate: true },
          { name: t("contracts.pluginsIntegration"), basic: false, standard: false, ultimate: true },
          { name: t("contracts.customContentManagement"), basic: false, standard: false, ultimate: true },
        ],
      },
      {
        id: "ultimate",
        name: t("contracts.ultimate"),
        price: "£89.99",
        priceId: "price_ultimate123", // Replace with your actual Stripe price ID
        isActive: currentPlan === "ultimate",
        features: [
          { name: t("contracts.freeSetup"), basic: true, standard: true, ultimate: true },
          { name: t("contracts.bandwidthLimit"), basic: true, standard: true, ultimate: true },
          { name: t("contracts.userConnection"), basic: true, standard: true, ultimate: true },
          { name: t("contracts.analyticsReport"), basic: false, standard: true, ultimate: true },
          { name: t("contracts.publicApiAccess"), basic: false, standard: true, ultimate: true },
          { name: t("contracts.pluginsIntegration"), basic: false, standard: false, ultimate: true },
          { name: t("contracts.customContentManagement"), basic: false, standard: false, ultimate: true },
        ],
      },
    ]
  
    // Handle free trial start
    const handleStartFreeTrial = (planId: string) => {
      // In a real app, this would redirect to a checkout page or process
      console.log(`Starting free trial for ${planId} plan`)
      // For demo purposes, we'll just log and simulate a redirect
      router.push(`/shopkeeper/dashboard?trial=${planId}`)
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
                  className="flex items-center rounded-md bg-green-50 px-4 py-3 text-white"
                >
                  <ReceiptText className="mr-3 h-5 w-5" />
                  <span>{t("shopkeeper.contract")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_shopkeeper/announcements"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
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
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-12">{t("contracts.title")}</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden ${
                  plan.isActive ? "ring-2 ring-green-500" : ""
                }`}
              >
                <div className="p-6 text-center">
                  <h2 className="text-2xl font-semibold text-gray-900">{plan.name}</h2>
                  <p className="text-gray-600 mt-1">{t("contracts.monthlyCharge")}</p>
                  <p className="text-5xl font-bold text-green-50 my-4">{plan.price}</p>
                </div>

                <div className="border-t border-gray-200"></div>

                <ul className="divide-y divide-gray-200">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="p-4 flex items-center">
                      {feature[plan.id as keyof PricingFeature] ? (
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                      ) : (
                      <X className="h-5 w-5 text-gray-300 mr-3" />
                      )}
                      <span className={`${feature[plan.id as keyof PricingFeature] ? "text-gray-900" : "text-gray-400"}`}>{feature.name}</span>
                    </li>
                  ))}
                </ul>

                <div className="p-6 text-center">
                  {plan.isActive ? (
                    <button
                      className="w-full py-2 px-4 bg-green-50 hover:bg-green-500 text-white rounded-md transition-colors"
                      onClick={() => router.push("/shopkeeper/billing")}
                    >
                      {t("contracts.renew")}
                    </button>
                  ) : (
                    <>
                    <button
                        className="w-full py-2 px-4 bg-green-50 hover:bg-green-600 text-white rounded-md transition-colors"
                        onClick={() => router.push(`/shopkeeper/checkout?priceId=${plan.priceId}`)}
                    >
                        {t("contracts.getStarted")}
                    </button>
                      <p className="mt-4 text-sm text-gray-600">
                        <button
                          onClick={() => handleStartFreeTrial(plan.id)}
                          className="text-green-50 hover:underline"
                        >
                          {t("contracts.startFreeTrial")}
                        </button>
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
        
  </div>
</div>
    )
}