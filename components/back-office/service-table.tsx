"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ResponsiveTableWrapper } from "@/components/back-office/responsive-table-wrapper"
import Image from "next/image"
import { Star, StarHalf } from "lucide-react"

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
  // Fonction pour rendre les étoiles de notation
  const renderStars = (grade: number) => {
    const stars = []
    const fullStars = Math.floor(grade)
    const hasHalfStar = grade % 1 !== 0

    // Ajouter les étoiles pleines
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-[#FFD700] text-[#FFD700]" />)
    }

    // Ajouter une demi-étoile si nécessaire
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

  return (
    <ResponsiveTableWrapper>
      <Table>
        <TableHeader>
          <TableRow className="bg-white">
            <TableHead className="font-medium">Image</TableHead>
            <TableHead className="font-medium">Service Name</TableHead>
            <TableHead className="font-medium">Service Provider</TableHead>
            <TableHead className="font-medium">Pricing</TableHead>
            <TableHead className="font-medium">Grade</TableHead>
            <TableHead className="font-medium">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((service) => (
            <TableRow key={service.id}>
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
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ResponsiveTableWrapper>
  )
}

