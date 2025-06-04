"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Search,
  Package,
  PartyPopper,
} from "lucide-react"
import { useLanguage } from "@/components/language-context"
import DeliverymanLayout from "./layout"
import { useApiCall } from "@/hooks/use-api-call"
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

interface Delivery {
  id: string | number
  image?: string
  announceName?: string
  whereTo?: string
  price?: string
  amount?: number
  deliveryDate?: string
  status: "paid" | "in_transit" | "delivered" | "pending" | "scheduled" | "completed"
  isPriority?: boolean
  annonceId?: number
  livreurId?: number
  adresseLivraison?: string
  pickupLocation?: string
  dropoffLocation?: string
  clientInfo?: {
    firstName: string
    lastName: string
  }
}

export default function DeliverymanDeliveries() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [user, setUser] = useState<MultiRoleUser | null>(null)

  const { execute: executeGetProfile, loading: profileLoading } = useApiCall<MultiRoleUser>()
  const { execute: executeGetLivraisons, loading: livraisonsLoading } = useApiCall<any>()
  
  // ✅ Variables de chargement unifiées
  const loading = profileLoading || livraisonsLoading

  // ✅ NOUVEAU - Fonction de chargement avec vraies données
  const loadDeliveries = async () => {
    try {
      console.log('Chargement des livraisons du livreur...')
      
      // Récupérer les livraisons via notre service moderne
      const livraisonsResponse: any = await executeGetLivraisons(livreurService.getMyLivraisons())
      console.log('Livraisons récupérées:', livraisonsResponse)
      
      // ✅ NOUVEAU - Extraire les livraisons de la structure de réponse
      let livraisons: any[] = []
      
      if (Array.isArray(livraisonsResponse)) {
        livraisons = livraisonsResponse
      } else if (livraisonsResponse?.livraisons?.data && Array.isArray(livraisonsResponse.livraisons.data)) {
        livraisons = livraisonsResponse.livraisons.data
      } else if (livraisonsResponse?.data && Array.isArray(livraisonsResponse.data)) {
        livraisons = livraisonsResponse.data
      } else {
        console.warn('Structure de réponse livraisons inattendue:', livraisonsResponse)
        livraisons = []
      }
      
      console.log('Livraisons extraites:', livraisons, 'Nombre:', livraisons.length)
      
      // ✅ NOUVEAU - Transformer avec les vraies données du backend
      const formattedDeliveries: Delivery[] = livraisons.map((livraison: any) => {
        
        // Mapper le statut API vers notre interface
        let status: "paid" | "in_transit" | "delivered" | "pending" | "scheduled" | "completed" = "pending"
        switch(livraison.status) {
          case "scheduled":
            status = "scheduled"
            break
          case "in_progress":
          case "en_cours":
          case "in_transit":
            status = "in_transit"
            break
          case "completed":
          case "livré":
          case "delivered":
            status = "delivered"
            break
          case "paid":
          case "payé":
            status = "paid"
            break
          default:
            status = "pending"
        }
        
        const deliveryItem: Delivery = {
          id: livraison.id,
          annonceId: livraison.annonceId,
          livreurId: livraison.livreurId,
          announceName: livraison.annonce?.title || `Livraison #${livraison.id}`,
          image: livraison.annonce?.imagePath ? `${process.env.NEXT_PUBLIC_API_URL}/${livraison.annonce.imagePath}` : "/placeholder.svg",
          whereTo: livraison.dropoffLocation || livraison.dropoff_location || "Adresse de livraison",
          pickupLocation: livraison.pickupLocation || livraison.pickup_location || "Point de retrait",
          price: livraison.annonce?.price ? `€${livraison.annonce.price}` : "Prix non spécifié",
          amount: 1,
          deliveryDate: formatDate(livraison.createdAt || livraison.created_at),
          status: status,
          isPriority: livraison.annonce?.priority || false,
          adresseLivraison: livraison.dropoffLocation || livraison.dropoff_location,
          clientInfo: livraison.client ? {
            firstName: livraison.client.firstName || livraison.client.first_name || '',
            lastName: livraison.client.lastName || livraison.client.last_name || ''
          } : undefined
        }
        
        return deliveryItem
      })
      
      console.log('Livraisons formatées:', formattedDeliveries)
      setDeliveries(formattedDeliveries)
      
    } catch (error) {
      console.error("Erreur lors de la récupération des livraisons:", error)
      // ✅ Les erreurs sont gérées automatiquement par les hooks
    }
  }

  // ✅ NOUVEAU - Chargement initial avec gestion du profil
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Charger le profil utilisateur d'abord
        const userProfile = await executeGetProfile(livreurService.getProfile())
        
        // Vérifier que l'utilisateur est bien un livreur
        if (!userProfile?.livreur?.id) {
          console.error('Utilisateur non-livreur:', userProfile)
          return
        }
        
        setUser(userProfile)
        
        // 2. Charger les livraisons
        await loadDeliveries()
        
      } catch (error) {
        console.error("Erreur lors du chargement initial:", error)
      }
    }
    
    loadData()
  }, [])

  // Fonction utilitaire pour formater la date
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date non spécifiée"
    
    try {
      const date = new Date(dateString)
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        return "Date invalide"
      }
      
      // Options pour le format de date
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
      return "Date invalide"
    }
  }

  // Filtrer les livraisons en fonction de la recherche
  const filteredDeliveries = deliveries.filter((delivery) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      (delivery.announceName?.toLowerCase().includes(query) || false) ||
      (delivery.whereTo?.toLowerCase().includes(query) || false) ||
      (delivery.price?.toLowerCase().includes(query) || false) ||
      (delivery.deliveryDate?.toLowerCase().includes(query) || false)
    )
  })

  // Fonction pour obtenir la classe CSS du statut
  const getStatusClass = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-300 text-green-800"
      case "in_transit":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-gray-100 text-gray-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Fonction pour obtenir le texte du statut
  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return t("deliveryman.deliveriess.paid")
      case "in_transit":
        return t("deliveryman.deliveriess.inTransit")
      case "delivered":
        return t("deliveryman.deliveriess.delivered")
      case "pending":
        return t("deliveryman.deliveriess.pending")
      default:
        return status
    }
  }

  return (
    <DeliverymanLayout>
      {/* Page content */}
      <main className="p-4 lg:p-6">
        <h1 className="mb-6 text-2xl font-bold">{t("deliveryman.deliveries")}</h1>

        {/* Mobile search bar */}
        <div className="mb-6 md:hidden">
          <div className="relative w-full">
            <input
              type="text"
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>

        {/* Search bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 mb-8 mt-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          /* Deliveries Table */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("deliveryman.deliveriess.image")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("deliveryman.deliveriess.announceName")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("deliveryman.deliveriess.whereTo")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("deliveryman.deliveriess.price")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("deliveryman.deliveriess.deliveryDate")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("deliveryman.deliveriess.status")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDeliveries.length > 0 ? (
                    filteredDeliveries.map((delivery) => (
                      <tr 
                        key={delivery.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => window.location.href = `/app_deliveryman/delivery/${delivery.id}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            <Image
                              src={delivery.image || "/placeholder.svg"}
                              alt={delivery.announceName || "Delivery image"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {delivery.announceName}
                              {delivery.isPriority && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {t("deliveryman.priority")}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{delivery.whereTo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {delivery.price}
                            {delivery.isPriority && (
                              <span className="ml-1 text-xs text-red-600">(+{t("deliveryman.priorityFee")})</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{delivery.deliveryDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(delivery.status)}`}
                          >
                            {getStatusText(delivery.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        {t("deliveryman.deliveriess.noDeliveriesFound")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </DeliverymanLayout>
  )
}