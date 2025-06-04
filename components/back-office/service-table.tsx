"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ResponsiveTableWrapper } from "@/components/back-office/responsive-table-wrapper"
import Image from "next/image"
import { Star, StarHalf } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import { useState } from "react"

interface ServiceData {
  id: number
  image: string
  name: string
  provider: string
  pricing: string
  grade: number
}

interface ServiceTableProps {
  data: ServiceData[]
}

export function ServiceTable({ data }: ServiceTableProps) {
  const { t } = useLanguage()
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})

  // Fonction pour gérer l'expansion des lignes
  const toggleRowExpansion = (id: number) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Fonction pour les étoiles de notation
  const renderStars = (grade: number) => {
    const stars = []
    const fullStars = Math.floor(grade)
    const hasHalfStar = grade % 1 !== 0

    // Ajouter les étoiles pleines
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-[#FFD700] text-[#FFD700]" />)
    }

    // Ajouter une demi-étoile
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-[#FFD700] text-[#FFD700]" />)
    }

    // Ajouter les étoiles vides
    const emptyStars = 5 - Math.ceil(grade)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
    }

    return <div className="flex">{stars}</div>
  }

  // Données fictives pour les avis
  const reviews = {
    1: [
      { id: 1, client: "Jean Dupont", comment: "Excellent service, très satisfait !", rating: 5 },
      { id: 2, client: "Marie Curie", comment: "Bon service, mais peut être amélioré.", rating: 4 },
    ],
    2: [
      { id: 1, client: "Paul Martin", comment: "Service moyen, pas très ponctuel.", rating: 3 },
    ],
    3: [
      { id: 1, client: "Sophie Lefebvre", comment: "Service exceptionnel, je recommande !", rating: 5 },
      { id: 2, client: "Luc Bernard", comment: "Très professionnel et rapide.", rating: 5 },
    ],
  }

  return (
    <ResponsiveTableWrapper>
      <Table>
        <TableHeader>
          <TableRow className="bg-white">
            <TableHead className="font-medium">{t("admin.serviceImage")}</TableHead>
            <TableHead className="font-medium">{t("admin.serviceName")}</TableHead>
            <TableHead className="font-medium">{t("admin.serviceProviderName")}</TableHead>
            <TableHead className="font-medium">{t("admin.servicePricing")}</TableHead>
            <TableHead className="font-medium">{t("admin.serviceGrade")}</TableHead>
            <TableHead className="font-medium">{t("admin.action")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((service) => (
            <>
              <TableRow
                key={service.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => toggleRowExpansion(service.id)}
              >
                <TableCell>
                  <div className="relative w-16 h-12 overflow-hidden rounded-md">
                    <Image src={service.image || "/placeholder.svg"} alt={service.name} fill className="object-cover" />
                  </div>
                </TableCell>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.provider}</TableCell>
                <TableCell>{service.pricing}</TableCell>
                <TableCell>{renderStars(service.grade)}</TableCell>
                <TableCell>
                  <Button variant="destructive" size="sm" className="bg-[#E57373] hover:bg-[#ef5350]">
                    {t("common.delete")}
                  </Button>
                </TableCell>
              </TableRow>
              {expandedRows[service.id] && (
                <TableRow>
                  <TableCell colSpan={6} className="bg-gray-50">
                    <div className="p-4 space-y-4">
                      <h3 className="text-lg font-semibold">{t("admin.reviews")}</h3>
                      {reviews[service.id]?.map((review) => (
                        <div key={review.id} className="border-b pb-4">
                          <p className="text-sm font-medium">{review.client}</p>
                          <p className="text-sm text-gray-600">{review.comment}</p>
                          <div className="mt-2">{renderStars(review.rating)}</div>
                        </div>
                      )) || <p className="text-sm text-gray-500">{t("admin.noReviews")}</p>}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </ResponsiveTableWrapper>
  )
}

