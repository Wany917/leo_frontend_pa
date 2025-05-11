"use client"

import { ComplaintsTable } from "@/components/back-office/complaints-table"

export function ComplaintsContent() {
  // Données fictives pour les réclamations
  const complaintsData = [
    {
      id: 1,
      client: "Killian",
      announceId: "000001",
      shippingPrice: "£20.00",
      justificativePieces: 2,
      description: "Lorem ipsum dolor sit amet...",
      status: "Pending",
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Complaints</h1>
      <ComplaintsTable data={complaintsData} />
    </div>
  )
}

