"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  LogOut,
  Menu,
  MessageSquare,
  Tag,
  Edit,
  CreditCard,
  Calendar,
  Star,
  LayoutList,
  User
} from "lucide-react"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"

export default function ServiceProviderReviewDetails() {
  const { t } = useLanguage()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})

  // Données fictives pour les services
  const services = [
    {
      id: "1",
      name: "Dog-sitter",
      reviews: [
        {
          id: 1,
          image:"/dog-sitter.jpg",
          serviceName: "Dog-sitter",
          client: "Florence",
          grade: 5,
          comment: "Lorem ipsum dolor sit amet...",
          fullReview:
            "I was extremely satisfied with the dog-sitting service. My dog was well taken care of, and I received regular updates. The sitter was professional, punctual, and clearly loves animals. I will definitely use this service again in the future!",
          date: "April 15, 2025",
        },
        {
          id: 2,
          image:"/dog-sitter.jpg",
          serviceName: "Dog-sitter",
          client: "Charlotte",
          grade: 5,
          comment: "Lorem ipsum dolor sit amet...",
          fullReview:
            "The dog-sitter was amazing with my energetic puppy! They took him for walks, played with him, and made sure he was comfortable. I received photos throughout the day which was reassuring. Highly recommend this service to any pet owner.",
          date: "April 10, 2025",
        },
        {
          id: 3,
          image:"/dog-sitter.jpg",
          serviceName: "Dog-sitter",
          client: "Samy",
          grade: 5,
          comment: "Lorem ipsum dolor sit amet...",
          fullReview:
            "Outstanding service! My dog is usually anxious with strangers, but the sitter was patient and gentle. By the end of the day, my dog didn't want to leave! The sitter followed all my instructions and kept me updated. Will definitely book again.",
          date: "April 5, 2025",
        },
      ],
    },
  ]

  // Trouver le service correspondant à l'ID

  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const service = services.find((s) => s.id === id) || services[0]

  // Fonction pour rendre les étoiles
  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      if (i < rating) {
        stars.push(<Star key={i} className="h-4 w-4 fill-[#FFD700] text-[#FFD700]" />)
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />)
      }
    }
    return <div className="flex">{stars}</div>
  }

  const toggleRowExpansion = (reviewId: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }))
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
            <Link href="/app_service-provider" className="flex items-center">
              <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/app_service-provider"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.dashboard")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_service-provider/review"
                  className="flex items-center rounded-md bg-green-50 px-4 py-3 text-white"
                >
                  <Star className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.review")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_service-provider/services"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <Tag className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.services")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_service-provider/calendar"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <Calendar className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.calendar")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_service-provider/interventions"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <LayoutList className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.interventions")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_service-provider/messages"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <MessageSquare className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.messages")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_service-provider/payments"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <CreditCard className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.payments")}</span>
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
                      href="/app_service-provider/edit_account"
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
        <main className="p-4 lg:p-6">
          <div className="mb-6">
          <Link href="/app_service-provider/review" className="text-green-50 hover:underline flex items-center">
            <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
            {t("common.backToReview")}
          </Link>
          </div>

          <h1 className="text-2xl font-bold mb-6">{service.name}</h1>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("serviceProvider.serviceName")}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("serviceProvider.client")}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("serviceProvider.grade")}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("serviceProvider.review")}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {service.reviews.map((review) => (
                    <React.Fragment key={review.id}>
                      <tr
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleRowExpansion(review.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">{review.serviceName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{review.client}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{renderStars(review.grade)}</td>
                        <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">{review.comment}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          
                        </td>
                      </tr>
                      {expandedRows[review.id] && (
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="p-0">
                            <div className="p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="flex items-start gap-6">
                                <div className="flex-1">
                                  <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-semibold">{t("serviceProvider.reviewGivenBy")} {review.client}</h3>
                                    <div className="flex">{renderStars(review.grade)}</div>
                                  </div>
                                  <p className="text-gray-700 mb-4">{review.fullReview}</p>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">{t("serviceProvider.postedOn")} {review.date}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
