"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Package, ArrowRight, Truck, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-context"

export default function TrackingClient() {
  const { t } = useLanguage()
  const router = useRouter()
  const [trackingId, setTrackingId] = useState("")
  const [error, setError] = useState("")

  // Données récentes de suivi (simulées)
  const recentlyTracked = [
    {
      id: "ECO-123456",
      status: "in-transit",
      from: "Paris, France",
      to: "London, UK",
      estimatedDelivery: "May 15, 2025",
    },
    {
      id: "ECO-789012",
      status: "delivered",
      from: "Berlin, Germany",
      to: "Madrid, Spain",
      estimatedDelivery: "April 30, 2025",
    },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingId.trim()) {
      setError(t("tracking.pleaseEnterTrackingId"))
      return
    }

    // Rediriger vers la page de détails de suivi
    router.push(`/tracking/${trackingId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="EcoDeli Logo"
              width={120}
              height={40}
              className="h-auto"
            />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-semibold text-center text-green-500 mb-8">
            {t("tracking.trackYourPackage")}
          </h1>

          {/* Formulaire de recherche */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="trackingId" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("tracking.trackingId")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="trackingId"
                    value={trackingId}
                    onChange={(e) => {
                      setTrackingId(e.target.value)
                      setError("")
                    }}
                    placeholder={t("tracking.enterTrackingId")}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                {t("tracking.trackPackage")}
              </button>
            </form>
          </div>

          {/* Suivis récents */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{t("tracking.recentlyTracked")}</h2>

            <div className="space-y-4">
              {recentlyTracked.map((item) => (
                <Link
                  key={item.id}
                  href={`/app_client/tracking/${item.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {item.status === "in-transit" ? (
                        <div className="bg-blue-100 p-2 rounded-full mr-4">
                          <Truck className="h-6 w-6 text-blue-600" />
                        </div>
                      ) : (
                        <div className="bg-green-100 p-2 rounded-full mr-4">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{item.id}</p>
                        <p className="text-sm text-gray-500">
                          {item.status === "in-transit" ? t("tracking.inTransit") : t("tracking.delivered")}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">{t("tracking.from")}</p>
                      <p className="font-medium">{item.from}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t("tracking.to")}</p>
                      <p className="font-medium">{item.to}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t("tracking.estimatedDelivery")}</p>
                      <p className="font-medium">{item.estimatedDelivery}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; 2025 EcoDeli. {t("common.allRightsReserved")}</p>
        </div>
      </footer>
    </div>
  )
}