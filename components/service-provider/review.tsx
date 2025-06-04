"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Star,
} from "lucide-react"
import { useLanguage } from "@/components/language-context"
import { Card } from "@/components/ui/card"

export default function ServiceProviderReview() {
  const { t } = useLanguage()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // Données fictives pour les services
  const services = [
    {
      id: 1,
      name: "Dog-sitter",
      image: "/dog-sitter.jpg",
      rating: 5,
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.",
      reviewCount: 314,
    },
  ]

  // Fonction pour rendre les étoiles
  const renderStars = (rating: number) => {
    const stars = []
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
          </div>,
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
        <main className="p-4 lg:p-6">
          <h1 className="text-2xl font-bold mb-6">{t("serviceProvider.review")}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link key={service.id} href={`/app_service-provider/review/${service.id}`}
                className="block hover:shadow-lg transition-shadow"
              >
                <Card className="overflow-hidden shadow-md border-none cursor-pointer">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image src={service.image || "/placeholder.svg"} alt={service.name} fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-xl font-semibold">{service.name}</h2>
                      <div className="flex">{renderStars(service.rating)}</div>
                    </div>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <p className="text-sm font-medium text-gray-500">
                      {service.reviewCount} {t("serviceProvider.reviewsCount")}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
