"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, Calendar, Download, AlertCircle } from "lucide-react"
import { useLanguage } from "@/components/language-context"

// Types pour les données de suivi
interface TrackingEvent {
  date: string
  time: string
  location: string
  status: string
  description: string
}

interface TrackingData {
  id: string
  status: "pending" | "in-transit" | "delivered" | "exception"
  packageName: string
  sender: string
  recipient: string
  origin: string
  destination: string
  estimatedDelivery: string
  shippedDate: string
  events: TrackingEvent[]
}

export default function TrackingDetailClient({ id }: { id: string }) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)

  useEffect(() => {
    // Simuler le chargement des données de suivi
    const timer = setTimeout(() => {
      // Dans une application réelle, vous feriez un appel API ici
      const mockData: TrackingData = {
        id,
        status: "in-transit",
        packageName: "Running Shoes",
        sender: "SportShop Paris",
        recipient: "John Doe",
        origin: "Paris, France",
        destination: "London, UK",
        estimatedDelivery: "May 15, 2025",
        shippedDate: "May 5, 2025",
        events: [
          {
            date: "May 8, 2025",
            time: "14:30",
            location: "Distribution Center, Calais",
            status: "in-transit",
            description: "Package in transit to next facility",
          },
          {
            date: "May 7, 2025",
            time: "09:15",
            location: "Sorting Facility, Paris",
            status: "in-transit",
            description: "Package sorted and processed",
          },
          {
            date: "May 6, 2025",
            time: "16:45",
            location: "Collection Point, Paris",
            status: "in-transit",
            description: "Package received at collection point",
          },
          {
            date: "May 5, 2025",
            time: "10:00",
            location: "Sender Location, Paris",
            status: "pending",
            description: "Shipping label created",
          },
        ],
      }

      setTrackingData(mockData)
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [id])

  // Fonction pour obtenir la couleur et l'icône en fonction du statut
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800",
          icon: <Package className="h-5 w-5 text-yellow-600" />,
          text: t("tracking.pending"),
        }
      case "in-transit":
        return {
          color: "bg-blue-100 text-blue-800",
          icon: <Truck className="h-5 w-5 text-blue-600" />,
          text: t("tracking.inTransit"),
        }
      case "delivered":
        return {
          color: "bg-green-100 text-green-800",
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          text: t("tracking.delivered"),
        }
      case "exception":
        return {
          color: "bg-red-100 text-red-800",
          icon: <AlertCircle className="h-5 w-5 text-red-600" />,
          text: t("tracking.exception"),
        }
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          icon: <Package className="h-5 w-5 text-gray-600" />,
          text: status,
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!trackingData) {
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
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-semibold mb-4">{t("tracking.packageNotFound")}</h1>
            <p className="text-gray-600 mb-6">{t("tracking.invalidTrackingId")}</p>
            <Link href="/tracking" className="inline-flex items-center text-green-500 hover:text-green-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("tracking.backToTracking")}
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const statusInfo = getStatusInfo(trackingData.status)

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
          <div className="mb-6">
            <Link href="/tracking" className="inline-flex items-center text-gray-600 hover:text-green-500">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("tracking.backToTracking")}
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-2xl font-semibold">{t("tracking.trackingDetails")}</h1>
                <p className="text-gray-500">
                  {t("tracking.trackingId")}: {trackingData.id}
                </p>
              </div>
              <div className={`mt-2 sm:mt-0 px-3 py-1 rounded-full ${statusInfo.color} flex items-center`}>
                {statusInfo.icon}
                <span className="ml-2 font-medium">{statusInfo.text}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">{t("tracking.packageInfo")}</h2>
                <p className="font-medium">{trackingData.packageName}</p>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1">{t("tracking.sender")}</p>
                  <p>{trackingData.sender}</p>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1">{t("tracking.recipient")}</p>
                  <p>{trackingData.recipient}</p>
                </div>
              </div>

              <div>
                <div className="flex items-start mb-4">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">{t("tracking.from")}</p>
                    <p className="font-medium">{trackingData.origin}</p>
                  </div>
                </div>
                <div className="flex items-start mb-4">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">{t("tracking.to")}</p>
                    <p className="font-medium">{trackingData.destination}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">{t("tracking.estimatedDelivery")}</p>
                    <p className="font-medium">{trackingData.estimatedDelivery}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6 pt-6 border-t border-gray-200">
              <button className="flex items-center text-green-500 hover:text-green-600">
                <Download className="h-5 w-5 mr-2" />
                {t("tracking.downloadInvoice")}
              </button>
              <button className="flex items-center text-red-500 hover:text-red-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                {t("tracking.reportIssue")}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">{t("tracking.shipmentProgress")}</h2>

            <div className="space-y-6">
              {trackingData.events.map((event, index) => {
                const eventStatus = getStatusInfo(event.status)
                return (
                  <div key={index} className="relative pl-8">
                    {index < trackingData.events.length - 1 && (
                      <div className="absolute left-[0.9375rem] top-6 bottom-0 w-0.5 bg-gray-200"></div>
                    )}
                    <div className="absolute left-0 top-1">
                      <div className={`p-1 rounded-full ${index === 0 ? "bg-green-100" : "bg-gray-100"}`}>
                        {eventStatus.icon}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{event.description}</p>
                      <p className="text-sm text-gray-500">{event.location}</p>
                      <p className="text-sm text-gray-500">
                        {event.date} • {event.time}
                      </p>
                    </div>
                  </div>
                )
              })}
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

