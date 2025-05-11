"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { XCircle } from "lucide-react"

export default function PaymentCancelPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Optionnel: vous pourriez enregistrer l'annulation dans votre système
    const logCancellation = async () => {
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
        if (!token) return
        
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/log-cancellation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'annulation:", error)
      }
    }
    
    logCancellation()
  }, [])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-semibold mb-4">Paiement annulé</h2>
        <p className="text-gray-600 mb-6">Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.</p>
        <div className="flex flex-col space-y-3">
          <Link
            href="/app_client/payments"
            className="inline-block bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            Retourner à mes paiements
          </Link>
          <Link
            href="/app_client"
            className="inline-block text-gray-600 hover:text-gray-800 transition-colors"
          >
            Retourner à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}