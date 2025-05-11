"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isVerifying, setIsVerifying] = useState(true)
  
  useEffect(() => {
    // Vérifier la session Stripe
    const verifySession = async () => {
      try {
        const sessionId = searchParams.get('session_id')
        if (!sessionId) {
          router.push('/app_client/payments')
          return
        }
        
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/verify-session?session_id=${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error("Session de paiement invalide")
        }
        
        setIsVerifying(false)
      } catch (error) {
        console.error("Erreur de vérification:", error)
        setTimeout(() => router.push('/app_client/payments'), 3000)
      }
    }
    
    verifySession()
  }, [router, searchParams])
  
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Vérification du paiement...</h2>
          <p className="text-gray-600">Veuillez patienter pendant que nous vérifions votre paiement.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-semibold mb-4">Paiement réussi !</h2>
        <p className="text-gray-600 mb-6">Votre paiement a été traité avec succès.</p>
        <Link
          href="/app_client/payments"
          className="inline-block bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
        >
          Retourner à mes paiements
        </Link>
      </div>
    </div>
  )
}