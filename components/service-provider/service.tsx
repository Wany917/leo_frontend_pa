"use client"

import React, { useState, ReactNode } from "react"
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
  Calendar,
  Star,
  LayoutList,
  User,
} from "lucide-react"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Définition du type Service
interface Service {
  id: number
  name: string
  description: string
  price: string
  rating: number
  image: string
}

export default function ServiceProviderPage() {
  const { t } = useLanguage()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [services, setServices] = useState<Service[]>([
    {
      id: 1,
      name: "Dog-sitter",
      description:"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.",
      price: "£20/hour",
      rating: 5,
      image: "/dog-sitter.jpg",
    },
  ])

  // Fonction pour rendre les étoiles
  const renderStars = (rating: number) => {
    const stars: ReactNode[] = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-5 w-5 fill-[#FFD700] text-[#FFD700]" />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="h-5 w-5 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="h-5 w-5 fill-[#FFD700] text-[#FFD700]" />
            </div>
          </div>
        )
      } else {
        stars.push(<Star key={i} className="h-5 w-5 text-gray-300" />)
      }
    }

    return <div className="flex">{stars}</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main content */}
      <div className="flex-1 overflow-x-hidden">
        {/* Page content */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-6 mr-6">
          <h1 className="text-2xl font-bold ml-6">{t("serviceProvider.services")}</h1>
          <Link href="/app_service-provider/services/add" className="hidden sm:block">
            <Button className="bg-green-50 hover:bg-green-50 text-white">
              {t("serviceProvider.addService")}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-6">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden border shadow-sm">
              <div className="relative h-48 w-full overflow-hidden">
                <Image src={service.image || "/placeholder.svg"} alt={service.name} fill className="object-cover" />
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold">{service.name}</h2>
                  <div className="flex">{renderStars(service.rating)}</div>
                </div>
                <p className="text-gray-600 mb-4 h-24 overflow-hidden">{service.description}</p>
                <div className="flex justify-between items-center">
                  <span className="bg-green-50 bg-opacity-20 text-green-50 px-4 py-2 rounded-full text-sm">
                    {service.price}
                  </span>
                  <Link key={service.id} href={`/app_service-provider/services/${service.id}`}>   
                    <Button variant="outline" className="border-green-50 text-green-50 hover:bg-green-50 hover:text-white">
                      {t("common.edit")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}