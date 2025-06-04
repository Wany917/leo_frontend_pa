"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { User, ChevronDown, Edit, LogOut, Star, CreditCard } from "lucide-react"
import LanguageSelector from "@/components/language-selector"
import { useLanguage } from "@/components/language-context"

// Types for our data
interface DeliveryItem {
  id: string
  image: string
  name: string
  destination: string
  price: string
  amount: number
  deliveryDate: string
  status: "paid" | "unpaid"
  rating: number // Ajouter cette propriété
}

interface ServiceItem {
  id: string
  image: string
  name: string
  provider: string
  price: string
  date: string
  rating: number
  status: "paid" | "unpaid"
}

export default function PaymentsPage() {
  const { t } = useLanguage()
  const [first_name, setUserName] = useState("")
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "unpaid" | "paid">("all")
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null)
  const [showRatingModal, setShowRatingModal] = useState<string | null>(null)
  const [tempRating, setTempRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)

  // Mock data for deliveries
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([
    {
      id: "d1",
      image: "/placeholder.svg?height=50&width=50",
      name: "Pair of running shoes",
      destination: "11 rue Erand, Paris 75012",
      price: "£20.00",
      amount: 1,
      deliveryDate: "26th May",
      status: "paid",
      rating: 0, // Ajouter cette propriété
    },
    {
      id: "d2",
      image: "/placeholder.svg?height=50&width=50",
      name: "Headphones",
      destination: "45 rue Erand, Paris 75017",
      price: "£14.00",
      amount: 1,
      deliveryDate: "3rd June",
      status: "unpaid",
      rating: 0, // Ajouter cette propriété
    },
  ])

  // Mock data for services
  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: "s1",
      image: "/placeholder.svg?height=50&width=50",
      name: "Baby-sitter",
      provider: "Florence",
      price: "£68.00",
      date: "24th May 2025",
      rating: 0,
      status: "paid",
    },
    {
      id: "s2",
      image: "/placeholder.svg?height=50&width=50",
      name: "Dog-sitter",
      provider: "Charlotte",
      price: "£60.00",
      date: "28th February 2025",
      rating: 0,
      status: "paid",
    },
    {
      id: "s3",
      image: "/placeholder.svg?height=50&width=50",
      name: "Ride to the airport",
      provider: "Samy",
      price: "£50.00",
      date: "2nd January 2025",
      rating: 0,
      status: "unpaid",
    },
  ])

  // Filter items based on active tab
  const filteredDeliveries = deliveries.filter((item) => {
    if (activeTab === "all") return true
    return item.status === activeTab
  })

  const filteredServices = services.filter((item) => {
    if (activeTab === "all") return true
    return item.status === activeTab
  })

  useEffect(() => {
		const token =
			sessionStorage.getItem('authToken') ||
			localStorage.getItem('authToken');
		if (!token) return;

		fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			credentials: 'include',
		})
			.then((res) => {
				if (!res.ok) throw new Error('Unauthorized');
				return res.json();
			})
			.then((data) => {
				setUserName(data.firstName);
			})
			.catch((err) => console.error('Auth/me failed:', err));
	}, []);

  // Handle payment
  const handlePayment = async (type: "delivery" | "service", id: string) => {
    // In a real app, this would redirect to Stripe checkout
    // For demo purposes, we'll just update the status
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (type === "delivery") {
        setDeliveries((prev) => prev.map((item) => (item.id === id ? { ...item, status: "paid" } : item)))
      } else {
        setServices((prev) => prev.map((item) => (item.id === id ? { ...item, status: "paid" } : item)))
      }

      setShowPaymentModal(null)
    } catch (error) {
      console.error("Payment error:", error)
    }
  }

  // Handle rating
  const handleRating = (type: "delivery" | "service", id: string, rating: number) => {
    if (type === "delivery") {
      setDeliveries((prev) => prev.map((item) => (item.id === id ? { ...item, rating } : item)))
    } else {
      setServices((prev) => prev.map((item) => (item.id === id ? { ...item, rating } : item)))
    }
    setShowRatingModal(null)
    setTempRating(0)
  }

  // Render star rating
  const renderStars = (rating: number, id: string, interactive = false) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setTempRating(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            className={`${interactive ? "cursor-pointer" : ""}`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= (interactive ? hoveredRating || tempRating : rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/app_client">
              <Image
                src="/logo.png"
                alt="EcoDeli Logo"
                width={120}
                height={40}
                className="h-auto"
              />
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/app_client/announcements" className="text-gray-700 hover:text-green-500">
              {t("navigation.myAnnouncements")}
            </Link>
            <Link href="/app_client/payments" className="text-green-500 font-medium border-b-2 border-green-500">
              {t("navigation.myPayments")}
            </Link>
            <Link href="/app_client/messages" className="text-gray-700 hover:text-green-500">
              {t("navigation.messages")}
            </Link>
            <Link href="/app_client/complaint" className="text-gray-700 hover:text-green-500">
              {t("navigation.makeComplaint")}
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageSelector />

            {/* User Account Menu */}
            <div className="relative">
              <button
                className="flex items-center bg-green-50 text-white rounded-full px-4 py-1 hover:bg-green-400 transition-colors"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <User className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">{first_name}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-100">
                  <Link
                    href="/app_client/edit-account"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    <span>{t("common.editAccount")}</span>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <div className="px-4 py-1 text-xs text-gray-500">{t("common.registerAs")}</div>

                  <Link href="/register/delivery-man" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.deliveryMan")}
                  </Link>

                  <Link href="/register/shopkeeper" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.shopkeeper")}
                  </Link>

                  <Link href="/register/service-provider" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.serviceProvider")}
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-center text-green-400 mb-8">
          {t("payments.yourPayments")}
        </h1>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-sm rounded-md ${
                activeTab === "all" ? "bg-white shadow-sm" : "hover:bg-gray-200"
              }`}
            >
              {t("common.all")}
            </button>
            <button
              onClick={() => setActiveTab("unpaid")}
              className={`px-4 py-2 text-sm rounded-md ${
                activeTab === "unpaid" ? "bg-white shadow-sm" : "hover:bg-gray-200"
              }`}
            >
              {t("payments.unpaid")}
            </button>
            <button
              onClick={() => setActiveTab("paid")}
              className={`px-4 py-2 text-sm rounded-md ${
                activeTab === "paid" ? "bg-white shadow-sm" : "hover:bg-gray-200"
              }`}
            >
              {t("payments.paid")}
            </button>
          </div>
        </div>

        {/* Delivery Man Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">{t("payments.deliveryMan")}</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">{t("payments.image")}</th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">
                      {t("payments.announceName")}
                    </th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">{t("payments.whereTo")}</th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">{t("payments.price")}</th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">{t("payments.amount")}</th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">
                      {t("payments.deliveryDate")}
                    </th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">
                      {t("payments.rateDelivery")}
                    </th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">{t("payments.status")}</th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">{t("payments.action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeliveries.length > 0 ? (
                    filteredDeliveries.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div className="w-12 h-12 bg-green-100 rounded-md overflow-hidden">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              width={48}
                              height={48}
                              className="object-contain w-full h-full"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-2 font-medium">{item.name}</td>
                        <td className="py-3 px-2 text-gray-600">{item.destination}</td>
                        <td className="py-3 px-2 font-medium">{item.price}</td>
                        <td className="py-3 px-2 text-center">{item.amount}</td>
                        <td className="py-3 px-2">{item.deliveryDate}</td>
                        <td className="py-3 px-2">
                          {item.status === "paid" ? (
                            item.rating > 0 ? (
                              renderStars(item.rating, item.id)
                            ) : (
                              <button
                                onClick={() => {
                                  setShowRatingModal(`delivery-${item.id}`)
                                  setTempRating(0)
                                }}
                                className="text-sm text-green-500 hover:underline"
                              >
                                {t("payments.rateNow")}
                              </button>
                            )
                          ) : (
                            <span className="text-sm text-gray-400">{t("payments.payFirstToRate")}</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {item.status === "paid" ? t("payments.paid") : t("payments.unpaid")}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          {item.status === "unpaid" && (
                            <button
                              onClick={() => setShowPaymentModal(`delivery-${item.id}`)}
                              className="inline-flex items-center px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              {t("payments.payNow")}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-gray-500">
                        {t("payments.noDeliveriesFound")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Service Providers Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{t("payments.serviceProviders")}</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">{t("payments.image")}</th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">
                      {t("payments.serviceName")}
                    </th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">
                      {t("payments.serviceProvider")}
                    </th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">{t("payments.price")}</th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">{t("payments.date")}</th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">
                      {t("payments.rateHimHer")}
                    </th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">{t("payments.status")}</th>
                    <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">{t("payments.action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.length > 0 ? (
                    filteredServices.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div className="w-12 h-12 bg-green-100 rounded-md overflow-hidden">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              width={48}
                              height={48}
                              className="object-contain w-full h-full"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-2 font-medium">{item.name}</td>
                        <td className="py-3 px-2">{item.provider}</td>
                        <td className="py-3 px-2 font-medium">{item.price}</td>
                        <td className="py-3 px-2">{item.date}</td>
                        <td className="py-3 px-2">
                          {item.status === "paid" ? (
                            item.rating > 0 ? (
                              renderStars(item.rating, item.id)
                            ) : (
                              <button
                                onClick={() => {
                                  setShowRatingModal(item.id)
                                  setTempRating(0)
                                }}
                                className="text-sm text-green-500 hover:underline"
                              >
                                {t("payments.rateNow")}
                              </button>
                            )
                          ) : (
                            <span className="text-sm text-gray-400">{t("payments.payFirstToRate")}</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {item.status === "paid" ? t("payments.paid") : t("payments.unpaid")}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          {item.status === "unpaid" && (
                            <button
                              onClick={() => setShowPaymentModal(`service-${item.id}`)}
                              className="inline-flex items-center px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              {t("payments.payNow")}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-gray-500">
                        {t("payments.noServicesFound")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">{t("payments.payment")}</h3>

            <p className="mb-6">
              {t("payments.youAreAboutToPay")}{" "}
              <span className="font-medium">
                {showPaymentModal.startsWith("delivery")
                  ? deliveries.find((item) => item.id === showPaymentModal.replace("delivery-", ""))?.name
                  : services.find((item) => item.id === showPaymentModal.replace("service-", ""))?.name}
              </span>
            </p>

            <div className="mb-6">
              <div className="border rounded-md p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">{t("common.amount")}:</span>
                  <span className="font-medium">
                    {showPaymentModal.startsWith("delivery")
                      ? deliveries.find((item) => item.id === showPaymentModal.replace("delivery-", ""))?.price
                      : services.find((item) => item.id === showPaymentModal.replace("service-", ""))?.price}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("payments.paymentMethod")}:</span>
                  <span className="font-medium">{t("payments.creditCard")}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-16 bg-blue-600 rounded-md mr-3"></div>
                  <div>
                    <p className="font-medium">Credit Card ending in 4242</p>
                    <p className="text-sm text-gray-500">Expires 12/25</p>
                  </div>
                </div>

                <button className="text-sm text-green-500 hover:underline">
                  {t("payments.useADifferentPaymentMethod")}
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPaymentModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={() =>
                  handlePayment(
                    showPaymentModal.startsWith("delivery") ? "delivery" : "service",
                    showPaymentModal.replace(showPaymentModal.startsWith("delivery") ? "delivery-" : "service-", ""),
                  )
                }
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                {t("payments.payNow")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">
              {showRatingModal.startsWith("delivery") ? t("payments.rateThisDelivery") : t("payments.rateThisService")}
            </h3>

            <p className="mb-6">
              {t("payments.howWouldYouRate")}{" "}
              <span className="font-medium">
                {showRatingModal.startsWith("delivery")
                  ? deliveries.find((item) => item.id === showRatingModal.replace("delivery-", ""))?.name
                  : services.find((item) => item.id === showRatingModal.replace("service-", ""))?.name}
                {!showRatingModal.startsWith("delivery") && (
                  <>
                    {" "}
                    {t("payments.by")}{" "}
                    {services.find((item) => item.id === showRatingModal.replace("service-", ""))?.provider}
                  </>
                )}
              </span>
              ?
            </p>

            <div className="flex justify-center mb-6">
              {renderStars(tempRating, showRatingModal.includes("-") ? showRatingModal.split("-")[1] : "", true)}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRatingModal(null)
                  setTempRating(0)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={() =>
                  handleRating(
                    showRatingModal.startsWith("delivery") ? "delivery" : "service",
                    showRatingModal.replace(showRatingModal.startsWith("delivery") ? "delivery-" : "service-", ""),
                    tempRating,
                  )
                }
                disabled={tempRating === 0}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {t("payments.submitRating")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}