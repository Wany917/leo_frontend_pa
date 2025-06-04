"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DeliverymanPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push("/app_deliveryman/dashboard")
  }, [router])
  
  return null
}