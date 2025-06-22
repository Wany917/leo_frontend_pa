"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ResponsiveTableWrapper } from "@/components/back-office/responsive-table-wrapper"
import Link from "next/link"
import { useLanguage } from "@/components/language-context"
import { useState } from "react"

interface ComplaintData {
  id: number
  client: string
  announceId: string
  shippingPrice: string
  justificativePieces: number
  description: string
  status: string
}

interface ComplaintsTableProps {
  data: ComplaintData[]
}

export function ComplaintsTable({ data }: ComplaintsTableProps) {
  const { t } = useLanguage()
  // Fonction pour rendre le badge de statut avec la bonne couleur
  const renderStatusBadge = (status: string) => {
    let bgColor = ""
    let displayStatus = ""

    switch (status.toLowerCase()) {
      case "open":
        bgColor = "bg-[#F8A097]"
        displayStatus = "Open"
        break
      case "in_progress":
        bgColor = "bg-[#FFA726]"
        displayStatus = "In Progress"
        break
      case "resolved":
        bgColor = "bg-[#8CD790]"
        displayStatus = "Resolved"
        break
      case "closed":
        bgColor = "bg-[#E57373]"
        displayStatus = "Closed"
        break
      default:
        bgColor = "bg-gray-200"
        displayStatus = status
    }

    return <span className={`px-3 py-1 rounded-md text-sm ${bgColor} text-white`}>{displayStatus}</span>
  }

  return (
    <ResponsiveTableWrapper>
      <Table>
        <TableHeader>
          <TableRow className="bg-white">
            <TableHead className="font-medium">Client</TableHead>
            <TableHead className="font-medium">Announce's ID</TableHead>
            <TableHead className="font-medium">Shipping price</TableHead>
            <TableHead className="font-medium">Justificative pieces</TableHead>
            <TableHead className="font-medium">Description</TableHead>
            <TableHead className="font-medium">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((complaint) => (
            <TableRow key={complaint.id} className="cursor-pointer hover:bg-gray-50" onClick={() => {}}>
              <TableCell>
                <Link href={`/admin/complaints/${complaint.id}`} className="block w-full h-full">
                  {complaint.client}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/admin/complaints/${complaint.id}`} className="block w-full h-full">
                  {complaint.announceId}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/admin/complaints/${complaint.id}`} className="block w-full h-full">
                  {complaint.shippingPrice}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/admin/complaints/${complaint.id}`} className="block w-full h-full">
                  {complaint.justificativePieces}
                </Link>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                <Link href={`/admin/complaints/${complaint.id}`} className="block w-full h-full">
                  {complaint.description}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/admin/complaints/${complaint.id}`} className="block w-full h-full">
                  {renderStatusBadge(complaint.status)}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ResponsiveTableWrapper>
  )
}

