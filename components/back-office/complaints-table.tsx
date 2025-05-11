"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ResponsiveTableWrapper } from "@/components/back-office/responsive-table-wrapper"
import Link from "next/link"

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
  // Fonction pour rendre le badge de statut avec la bonne couleur
  const renderStatusBadge = (status: string) => {
    let bgColor = ""

    switch (status.toLowerCase()) {
      case "pending":
        bgColor = "bg-[#F8A097]"
        break
      case "resolved":
        bgColor = "bg-[#8CD790]"
        break
      case "rejected":
        bgColor = "bg-[#E57373]"
        break
      default:
        bgColor = "bg-gray-200"
    }

    return <span className={`px-3 py-1 rounded-md text-sm ${bgColor} text-white`}>{status}</span>
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
                <Link href={`/complaints/${complaint.id}`} className="block w-full h-full">
                  {complaint.client}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/complaints/${complaint.id}`} className="block w-full h-full">
                  {complaint.announceId}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/complaints/${complaint.id}`} className="block w-full h-full">
                  {complaint.shippingPrice}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/complaints/${complaint.id}`} className="block w-full h-full">
                  {complaint.justificativePieces}
                </Link>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                <Link href={`/complaints/${complaint.id}`} className="block w-full h-full">
                  {complaint.description}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/complaints/${complaint.id}`} className="block w-full h-full">
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

