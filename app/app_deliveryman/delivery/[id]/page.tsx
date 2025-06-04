"use client"

import { use } from "react"
import DeliveryDetailClient from "@/components/deliveryman/delivery-detail"

export default function DeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return <DeliveryDetailClient id={resolvedParams.id} />
}