"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"
import { Package, ChevronDown } from "lucide-react"
import { useApiCall, useApiCallWithSuccess } from "@/hooks/use-api-call"
import { useLivreurWebSocket } from "@/hooks/use-livreur-websocket"
import { livreurService } from "@/services/livreurService"

interface MultiRoleUser {
  id: number
  firstName: string
  lastName: string
  email: string
  livreur?: {
    id: number
    availabilityStatus: 'available' | 'busy' | 'offline'
    rating: string
  }
}

interface DeliveryData {
  id: string | number
  name?: string
  image?: string
  sender?: string
  deliveryAddress?: string
  pickupLocation?: string
  dropoffLocation?: string
  price?: string
  deliveryDate?: string
  amount?: number
  storageBox?: string
  size?: string
  statusText?: string
  timeAway?: string
  // Champs de l'API
  annonceId?: number
  livreurId?: number
  statut?: string
  status?: string
  createdAt?: string
  updatedAt?: string
  livreur?: any
  trackingNumber?: string
  weight?: string
  dimensions?: string
  // champs fusionnés
  annonce?: any
  clientInfo?: {
    firstName: string
    lastName: string
  }
}

const DeliveryDetailClient = ({ id }: { id: string }) => {
  const { t } = useLanguage()
  const [delivery, setDelivery] = useState<DeliveryData | null>(null)
  const [user, setUser] = useState<MultiRoleUser | null>(null)
  const [code, setCode] = useState<string[]>(Array(6).fill("")) // État pour les 6 chiffres
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const { execute: executeGetProfile, loading: profileLoading } = useApiCall<MultiRoleUser>()
  const { execute: executeGetDelivery, loading: deliveryLoading } = useApiCall<any>()
  const { execute: executeUpdateStatus } = useApiCallWithSuccess('Statut mis à jour avec succès !')
  
  const loading = profileLoading || deliveryLoading

  const loadDeliveryData = async () => {
    try {
      console.log('Chargement des détails de la livraison:', id)
      
      const deliveryResponse: any = await executeGetDelivery(
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/livraisons/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('authToken') || localStorage.getItem('authToken')}`
          },
          credentials: 'include'
        }).then(res => {
          if (!res.ok) throw new Error('Erreur lors de la récupération de la livraison')
          return res.json()
        })
      )
      
      console.log("Données de livraison récupérées:", deliveryResponse)
      
      const livraisonData = deliveryResponse.livraison || deliveryResponse
      
      const deliveryData: DeliveryData = {
        id: livraisonData.id,
        livreurId: livraisonData.livreurId,
        status: livraisonData.status,
        annonceId: livraisonData.annonceId,
        livreur: livraisonData.livreur,
        createdAt: livraisonData.createdAt || livraisonData.created_at,
        updatedAt: livraisonData.updatedAt || livraisonData.updated_at,
        pickupLocation: livraisonData.pickupLocation || livraisonData.pickup_location,
        dropoffLocation: livraisonData.dropoffLocation || livraisonData.dropoff_location,
        annonce: livraisonData.annonce,
        
        clientInfo: livraisonData.client ? {
          firstName: livraisonData.client.firstName || livraisonData.client.first_name || '',
          lastName: livraisonData.client.lastName || livraisonData.client.last_name || ''
        } : undefined,
        
        name: livraisonData.annonce?.title || `Livraison #${livraisonData.id}`,
        image: livraisonData.annonce?.imagePath ? `${process.env.NEXT_PUBLIC_API_URL}/${livraisonData.annonce.imagePath}` : "/placeholder.svg",
        sender: livraisonData.client ? `${livraisonData.client.firstName || livraisonData.client.first_name || ''} ${livraisonData.client.lastName || livraisonData.client.last_name || ''}`.trim() : "Client",
        deliveryAddress: livraisonData.dropoffLocation || livraisonData.dropoff_location || "Adresse non spécifiée",
        price: livraisonData.annonce?.price ? `€${livraisonData.annonce.price}` : "Prix non spécifié",
        deliveryDate: formatDate(livraisonData.createdAt || livraisonData.created_at),
        amount: 1,
        storageBox: "Consigne standard",
        size: "Medium",
        statut: mapStatus(livraisonData.status),
        statusText: getStatusText(mapStatus(livraisonData.status)),
        timeAway: "Distance estimée: 5 km",
        trackingNumber: `TRACK-${livraisonData.id}`,
        weight: "2.5 kg",
        dimensions: "30×20×15 cm"
      }

      setDelivery(deliveryData)
      console.log('Livraison formatée:', deliveryData)
      
    } catch (error) {
      console.error("Erreur lors du chargement de la livraison:", error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const userProfile = await executeGetProfile(livreurService.getProfile())
        
        if (!userProfile?.livreur?.id) {
          console.error('Utilisateur non-livreur:', userProfile)
          return
        }
        
        setUser(userProfile)
        
        await loadDeliveryData()
        
      } catch (error) {
        console.error("Erreur lors du chargement initial:", error)
      }
    }
    
    if (id) {
      loadData()
    }
  }, [id])

  const mapStatus = (apiStatus: string): string => {
    switch (apiStatus?.toLowerCase()) {
      case "scheduled":
        return "en_attente"
      case "in_progress":
        return "en_cours"
      case "completed":
        return "livré"
      case "cancelled":
        return "annulé"
      default:
        return apiStatus || "en_attente"
    }
  }

  const getApiStatus = (uiStatus: string): string => {
    switch (uiStatus?.toLowerCase()) {
      case "en_attente":
        return "scheduled"
      case "en_cours":
        return "in_progress"
      case "livré":
        return "completed"
      case "annulé":
        return "cancelled"
      default:
        return uiStatus || "scheduled"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date non spécifiée"
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Date invalide"
      }
      
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
      
      return date.toLocaleDateString('fr-FR', options)
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error)
      return "Date non spécifiée"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "en_attente":
        return "En attente"
      case "en_cours":
        return "En cours de livraison"
      case "livré":
        return "Livré"
      case "payé":
        return "Payé"
      default:
        return status
    }
  }

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    if (/^\d{1,6}$/.test(pastedData)) {
      const newCode = [...code]
      for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
        newCode[i] = pastedData[i]
      }
      setCode(newCode)

      const focusIndex = Math.min(pastedData.length, 5)
      inputRefs.current[focusIndex]?.focus()
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    const verificationCode = code.join("")
    
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
      if (!token || !delivery) {
        setIsSubmitting(false)
        return
      }
      
      const trackingCode = delivery.trackingNumber?.replace(/\D/g, '').substring(0, 6)
      const validCodes = ["123456", trackingCode]
      
      if (validCodes.includes(verificationCode)) {
        console.log("Code validé, mise à jour du statut de la livraison");
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/livraisons/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            status: "completed",
            livreur_id: delivery.livreurId,
            pickup_location: delivery.pickupLocation,
            dropoff_location: delivery.dropoffLocation
          }),
          credentials: 'include'
        })
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Erreur API:", response.status, errorText);
          console.error("Payload envoyé:", JSON.stringify({ 
            status: "completed",
            livreur_id: delivery.livreurId,
            pickup_location: delivery.pickupLocation,
            dropoff_location: delivery.dropoffLocation
          }));
          throw new Error(`Erreur lors de la mise à jour de la livraison: ${response.status}`);
        }
        
        setDelivery({
          ...delivery,
          statut: "livré",
          status: "completed",
          statusText: "Livré"
        })
        
        alert(t("deliveryman.codeValidated"))
      } else {
        alert(t("deliveryman.invalidCode"))
      }
    } catch (error) {
      console.error("Erreur lors de la validation du code:", error)
      alert("Une erreur est survenue lors de la validation du code")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
        <Link href="/app_deliveryman/deliveries" className="text-green-500 hover:text-green-600 transition-colors">
          {t("deliveryman.deliveries.backToDeliveries")}
        </Link>
      </div>
    )
  }

  if (!delivery) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">{t("deliveryman.deliveries.deliveryNotFound")}</h2>
        <Link href="/app_deliveryman/deliveries" className="text-green-500 hover:text-green-600 transition-colors">
          {t("deliveryman.deliveries.backToDeliveries")}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white p-4 flex justify-between items-center shadow-sm">
        <Link href="/app_deliveryman" className="flex items-center">
          <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto" />
        </Link>

        <div className="flex items-center mr-20">
          <LanguageSelector />
        </div>
      </header>

      <div className="p-6">
        <div className="mb-6">
          <Link href="/app_deliveryman/deliveries" className="text-green-500 hover:underline flex items-center">
            <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
            {t("deliveryman.backToDeliveries")}
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">{t("deliveryman.deliveryDetails")}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-center mb-6">
              <div className="relative w-full max-w-md h-64">
                <Image src={delivery.image || "/placeholder.svg"} alt={delivery.name || ""} fill className="object-contain rounded-md" />
              </div>
            </div>

            <h2 className="text-xl font-bold mb-4">{delivery.name}</h2>

            <div className="space-y-3">
              <p>
                <span className="font-medium">{t("deliveryman.deliveryFor")}</span> {delivery.sender}
              </p>
              <p>
                <span className="font-medium">{t("deliveryman.deliveryAddress")}</span>:{" "}
                {delivery.deliveryAddress}
              </p>
              <p>
                <span className="font-medium">{t("deliveryman.pickupLocation")}</span>:{" "}
                {delivery.pickupLocation}
              </p>
              <p>
                <span className="font-medium">{t("deliveryman.priceForDelivery")}</span>: {delivery.price}
              </p>
              <p>
                <span className="font-medium">{t("deliveryman.deliveryDate")}</span>: {delivery.deliveryDate}
              </p>
              <p>
                <span className="font-medium">{t("deliveryman.trackingNumber")}</span>: {delivery.trackingNumber}
              </p>
              <p>
                <span className="font-medium">{t("deliveryman.weight")}</span>: {delivery.weight} kg
              </p>
              <p>
                <span className="font-medium">{t("deliveryman.dimensions")}</span>: {delivery.dimensions}
              </p>
              <p>
                <span className="font-medium">{t("deliveryman.status")}</span>: {delivery.statusText}
              </p>

              <div className="flex items-center mt-4">
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                  <Package className="w-4 h-4 mr-1" />
                  {delivery.size}
                </span>
              </div>
            </div>
          </div>

          {delivery.statut === "en_cours" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">{t("deliveryman.enterCode")}</h2>
              <p className="text-gray-600 mb-6">{t("deliveryman.enterCodeDescription")}</p>
              
              <div className="flex justify-center space-x-2 mb-6">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={code[index]}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-xl font-bold rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || code.some((digit) => digit === "")}
                className={`w-full py-2 rounded-md text-white ${
                  isSubmitting || code.some((digit) => digit === "")
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {isSubmitting ? t("deliveryman.validatingCode") : t("deliveryman.validateCode")}
              </button>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                Conseil: Pour tester, vous pouvez utiliser le code 123456 ou les 6 premiers chiffres du numéro de suivi.
              </p>
            </div>
          )}
          
          {delivery.statut === "livré" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-green-600">{t("deliveryman.deliveryCompleted")}</h2>
              <p className="text-gray-600 mb-4">{t("deliveryman.deliveryCompletedDescription")}</p>
              
              <div className="bg-green-50 p-4 rounded-md text-green-700">
                <p className="font-medium">{t("deliveryman.thankYou")}</p>
              </div>
            </div>
          )}
          
          {delivery.statut === "en_attente" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">{t("deliveryman.startDelivery")}</h2>
              <p className="text-gray-600 mb-4">{t("deliveryman.startDeliveryDescription")}</p>
              
              <button
                type="button"
                onClick={async () => {
                  try {
                    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
                    if (!token) return
                    
                    console.log("Démarrage de la livraison, mise à jour du statut");
                    
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/livraisons/${id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        status: "in_progress",
                        livreur_id: delivery.livreurId,
                        pickup_location: delivery.pickupLocation,
                        dropoff_location: delivery.dropoffLocation
                      }),
                      credentials: 'include'
                    })
                    
                    if (!response.ok) {
                      const errorText = await response.text();
                      console.error("Erreur API:", response.status, errorText);
                      console.error("Payload envoyé:", JSON.stringify({ 
                        status: "in_progress",
                        livreur_id: delivery.livreurId,
                        pickup_location: delivery.pickupLocation,
                        dropoff_location: delivery.dropoffLocation
                      }));
                      throw new Error(`Erreur lors du démarrage de la livraison: ${response.status}`);
                    }
                    
                    setDelivery({
                      ...delivery,
                      statut: "en_cours",
                      status: "in_progress",
                      statusText: "En cours de livraison"
                    })
                    
                    alert(t("deliveryman.deliveryStarted"))
                  } catch (error) {
                    console.error("Erreur lors du démarrage de la livraison:", error)
                    alert("Une erreur est survenue lors du démarrage de la livraison")
                  }
                }}
                className="w-full py-2 rounded-md text-white bg-green-500 hover:bg-green-600"
              >
                {t("deliveryman.startDelivery")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DeliveryDetailClient