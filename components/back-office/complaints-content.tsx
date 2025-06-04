"use client"

import { ComplaintsTable } from "@/components/back-office/complaints-table"
import { useLanguage } from "@/components/language-context"

export function ComplaintsContent() {
  const { t } = useLanguage()
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
      <h1 className="text-2xl font-bold">{t("admin.complaints")}</h1>
      <ComplaintsTable data={complaintsData} />
    </div>
  )
}

