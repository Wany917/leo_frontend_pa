"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ChevronDown,
  LogOut,
  Menu,
  Edit,
  User,
} from "lucide-react"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export default function ServiceProviderDashboard() {
  const { t } = useLanguage()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState("April")

  // Données fictives pour les prestations à venir
  const upcomingServices = [
    {
      id: 1,
      client: "Sophie Martin",
      service: "Dog-sitter",
      date: "2025-04-23",
      time: "14:00 - 16:00",
      location: "15 rue de Paris, 75001 Paris",
      status: "Confirmed",
    },
    {
      id: 2,
      client: "Thomas Dubois",
      service: "Dog-sitter",
      date: "2025-04-24",
      time: "10:00 - 12:00",
      location: "8 avenue Victor Hugo, 75016 Paris",
      status: "Pending",
    },
    {
      id: 3,
      client: "Marie Leroy",
      service: "Dog-sitter",
      date: "2025-04-25",
      time: "15:30 - 17:30",
      location: "22 boulevard Saint-Michel, 75005 Paris",
      status: "Confirmed",
    },
    {
      id: 4,
      client: "Pierre Moreau",
      service: "Dog-sitter",
      date: "2025-04-26",
      time: "09:00 - 11:00",
      location: "5 rue de Rivoli, 75004 Paris",
      status: "Confirmed",
    },
    {
      id: 5,
      client: "Julie Bernard",
      service: "Dog-sitter",
      date: "2025-04-27",
      time: "16:00 - 18:00",
      location: "12 rue de Vaugirard, 75006 Paris",
      status: "Pending",
    },
  ]

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
    return new Date(dateString).toLocaleDateString("en-GB", options)
  }

  // Fonction pour rendre le badge de statut avec la bonne couleur
  const renderStatusBadge = (status: string) => {
    let bgColor = ""

    switch (status.toLowerCase()) {
      case "confirmed":
        bgColor = "bg-[#8CD790] text-white"
        break
      case "pending":
        bgColor = "bg-[#F8A097] text-white"
        break
      case "canceled":
        bgColor = "bg-[#E57373] text-white"
        break
      default:
        bgColor = "bg-gray-200 text-gray-800"
    }
    // Traduction dynamique de status.<clé>
    const label = t(`status.${status.toLowerCase()}`) || status
    return <Badge className={`${bgColor} font-normal`}>{label}</Badge>
  }

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Main content */}
      <div className="flex-1 overflow-x-hidden">

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <h1 className="mb-6 text-2xl font-bold">{t("serviceProvider.dashboard")}</h1>

       {/* Tableau des prestations à venir */}
    <Card className="border-none shadow-md">
        <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">{t("serviceProvider.upcomingInterventions")}</h2>
        </div>
        <div className="p-4">
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead>
                <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">{t("serviceProvider.client")}</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">{t("serviceProvider.service")}</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">{t("serviceProvider.date")}</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">{t("serviceProvider.time")}</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">{t("serviceProvider.addressClient")}</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">{t("serviceProvider.status")}</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {upcomingServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{service.client}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{service.service}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(service.date)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{service.time}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate">{service.location}</td>
                    <td className="px-6 py-4 text-sm">{renderStatusBadge(service.status)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
    </Card>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Nombre de clients */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-8">{t("serviceProvider.numberOfClients")}</h3>
          <div className="flex flex-col items-center justify-center">
            <p className="text-5xl font-bold mb-6">83.9 K</p>
            <div className="bg-[#8CD790] bg-opacity-20 text-[#8CD790] px-4 py-2 rounded-full text-sm">
              +9.7 K {t("serviceProvider.thisMonth")}
            </div>
          </div>
        </Card>

        {/* Meilleur service */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">{t("serviceProvider.bestService")}</h3>
          <p className="text-center font-medium mb-4">Dog-sitter</p>
          <div className="flex justify-center mb-4">
            <div className="relative w-40 h-40 rounded-lg overflow-hidden">
              <Image
                src="/dog-sitter.jpg"
                alt="Dog-sitter"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </Card>

        {/* Chiffres du mois */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-8">{t("serviceProvider.numbersOfTheMonth")}</h3>
          <div className="flex flex-col items-center justify-center">
            <p className="text-5xl font-bold mb-6">£ 4.5 K</p>
            <div className="bg-[#8CD790] bg-opacity-20 text-[#8CD790] px-4 py-2 rounded-full text-sm">
              +5.4% {t("serviceProvider.thanLastMonth")}
            </div>
          </div>
        </Card>
      </div>
    </main>
  </div>
</div>
    )
}