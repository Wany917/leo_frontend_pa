"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
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
  Search,
  Download,
  X,
} from "lucide-react"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"
import { useToast } from '@/hooks/use-toast';

// Mock data for payments
const mockPayments = [
  {
    id: "1",
    image: "/running-shoes.jpg",
    announceName: "Pair of running shoes",
    clientAddress: "11 rue Erard, Paris 75012",
    price: "£20.00",
    deliveryDate: "26th May",
    status: "Paid",
    customer: {
      name: "Kevin C.",
      email: "kevin.c@example.com",
      address: "242 rue Faubourg Saint Antoine, Paris 75012",
    },
    invoiceDetails: {
      invoiceNumber: "INV-2025-0042",
      date: "20th May 2025",
      deliveryFee: "£20.00",
      tax: "£4.00",
      total: "£24.00",
    },
  },
  {
    id: "2",
    image: "/baby-sitter.jpg",
    announceName: "Baby stroller",
    whereTo: "15 Avenue des Gobelins, Paris 75005",
    price: "£35.00",
    deliveryDate: "28th May",
    status: "Paid",
    customer: {
      name: "Marie L.",
      email: "marie.l@example.com",
      address: "15 Avenue des Gobelins, Paris 75005",
    },
    invoiceDetails: {
      invoiceNumber: "INV-2025-0043",
      date: "22nd May 2025",
      deliveryFee: "£35.00",
      tax: "£7.00",
      total: "£42.00",
    },
  },
  {
    id: "3",
    image: "/dog-sitter.jpg",
    announceName: "Dog food package",
    whereTo: "8 rue de Rivoli, Paris 75001",
    price: "£15.00",
    deliveryDate: "30th May",
    status: "Pending",
    customer: {
      name: "Thomas B.",
      email: "thomas.b@example.com",
      address: "8 rue de Rivoli, Paris 75001",
    },
    invoiceDetails: {
      invoiceNumber: "INV-2025-0044",
      date: "25th May 2025",
      deliveryFee: "£15.00",
      tax: "£3.00",
      total: "£18.00",
    },
  },
]

export default function ShopkeeperPayment() {
  const { t } = useLanguage()
  const router = useRouter()
  const [payments, setPayments] = useState(mockPayments)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<(typeof mockPayments)[0] | null>(null)

  // Filtrer les paiements selon la recherche
  const filteredPayments = payments.filter(payment => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
  
    const address = payment.clientAddress ?? payment.whereTo ?? ""
    return (
      payment.announceName.toLowerCase().includes(q) ||
      address.toLowerCase().includes(q) ||
      payment.price.toLowerCase().includes(q) ||
      payment.deliveryDate.toLowerCase().includes(q) ||
      payment.status.toLowerCase().includes(q)
    )
  })  

  const handlePreviewInvoice = (payment: (typeof mockPayments)[0]) => {
    setSelectedInvoice(payment)
  }

  const handleCloseInvoice = () => {
    setSelectedInvoice(null)
  }

  // Add this inside the component
  const { toast } = useToast();

  const handleDownloadInvoice = (id: string) => {
    console.log(`Downloading invoice for payment ${id}`);
    toast({
      title: "Téléchargement réussi",
      description: `Facture ${id} téléchargée avec succès!`,
      variant: "default"
    });
  };


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
                  className="flex items-center rounded-md bg-green-50 px-4 py-3 text-white"
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
        <main className="flex-1 p-6">
                  <h1 className="text-2xl font-bold mb-6">{t("deliveryman.payments")}</h1>
        
                  {/* Search bar */}
                  <div className="hidden md:flex flex-1 max-w-md mx-4 mb-8 mt-8">
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder={t("common.search")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    </div>
                  </div>
        
                  {/* Payments table */}
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-3">{t("payments.image")}</th>
                            <th className="px-6 py-3">{t("payments.announceName")}</th>
                            <th className="px-6 py-3">{t("payments.clientAddress")}</th>
                            <th className="px-6 py-3">{t("payments.price")}</th>
                            <th className="px-6 py-3">{t("payments.serviceDate")}</th>
                            <th className="px-6 py-3">{t("tracking.downloadInvoice")}</th>
                            <th className="px-6 py-3">{t("payments.status")}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredPayments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0">
                                    <Image
                                      src={payment.image || "/placeholder.svg"}
                                      alt={payment.announceName}
                                      width={40}
                                      height={40}
                                      className="h-10 w-10 rounded-full object-cover"
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{payment.announceName}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{payment.whereTo}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{payment.price}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{payment.deliveryDate}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => handlePreviewInvoice(payment)}
                                  className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200"
                                >
                                  {t("tracking.trackingDetails")}
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    payment.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {payment.status === "Paid" ? t("payments.paid") : t("payments.unpaid")}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </main>
        
                {/* Invoice Preview Modal */}
                {selectedInvoice && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between border-b p-4">
                        <h2 className="text-xl font-bold">{t("tracking.trackingDetails")}</h2>
                        <button onClick={handleCloseInvoice} className="text-gray-500 hover:text-gray-700">
                          <X className="h-5 w-5" />
                        </button>
                      </div>
        
                      <div className="p-6">
                        {/* Invoice Header */}
                        <div className="flex justify-between mb-8">
                          <div>
                            <h3 className="text-lg font-bold text-gray-700">EcoDeli</h3>
                            <p className="text-sm text-gray-500">{t("deliveryman.editJustificative.dailyDelivery")}</p>
                            <p className="text-sm text-gray-500">123 Delivery Street</p>
                            <p className="text-sm text-gray-500">Paris, 75000</p>
                          </div>
                          <div className="text-right">
                            <h3 className="text-lg font-bold text-gray-700">{t("tracking.trackingDetails")}</h3>
                            <p className="text-sm text-gray-500">
                              {t("tracking.trackingId")}: {selectedInvoice.id}
                            </p>
                            <p className="text-sm text-gray-500">
                              {t("payments.date")}: {selectedInvoice.invoiceDetails.date}
                            </p>
                          </div>
                        </div>
        
                        {/* Customer Info */}
                        <div className="mb-8">
                          <h4 className="text-md font-semibold text-gray-700 mb-2">{t("deliveryman.customer")}</h4>
                          <p className="text-sm text-gray-600">{selectedInvoice.customer.name}</p>
                          <p className="text-sm text-gray-600">{selectedInvoice.customer.email}</p>
                          <p className="text-sm text-gray-600">{selectedInvoice.customer.address}</p>
                        </div>
        
                        {/* Delivery Details */}
                        <div className="mb-8">
                          <h4 className="text-md font-semibold text-gray-700 mb-2">
                            {t("deliveryman.deliveries.deliveryDetails")}
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center mb-4">
                              <div className="h-16 w-16 mr-4">
                                <Image
                                  src={selectedInvoice.image || "/placeholder.svg"}
                                  alt={selectedInvoice.announceName}
                                  width={64}
                                  height={64}
                                  className="h-16 w-16 rounded-md object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium">{selectedInvoice.announceName}</p>
                                <p className="text-sm text-gray-500">
                                  {t("deliveryman.deliveries.deliveryDate")}: {selectedInvoice.deliveryDate}
                                </p>
                              </div>
                            </div>
        
                            <div className="border-t border-gray-200 pt-4">
                              <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-600">{t("deliveryman.deliveries.deliveryAddress")}</span>
                                <span className="text-sm">{selectedInvoice.clientAddress}</span>
                              </div>
                              <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-600">{t("deliveryman.status")}</span>
                                <span
                                  className={`text-sm ${selectedInvoice.status === "Paid" ? "text-green-600" : "text-yellow-600"}`}
                                >
                                  {selectedInvoice.status === "Paid" ? t("payments.paid") : t("payments.unpaid")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
        
                        {/* Payment Summary */}
                        <div className="mb-8">
                          <h4 className="text-md font-semibold text-gray-700 mb-2">{t("payments.payment")}</h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between mb-2">
                              <span className="text-sm text-gray-600">{t("deliveryman.deliveries.priceForDelivery")}</span>
                              <span className="text-sm">{selectedInvoice.invoiceDetails.deliveryFee}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm text-gray-600">{t("tracking.tax")}</span>
                              <span className="text-sm">{selectedInvoice.invoiceDetails.tax}</span>
                            </div>
                            <div className="flex justify-between font-medium pt-2 border-t border-gray-200 mt-2">
                              <span>{t("tracking.total")}</span>
                              <span>{selectedInvoice.invoiceDetails.total}</span>
                            </div>
                          </div>
                        </div>
        
                        {/* Actions */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDownloadInvoice(selectedInvoice.id)}
                            className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {t("tracking.downloadInvoice")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
        
  </div>
</div>
    )
}