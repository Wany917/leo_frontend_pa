"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-context"
import DeliverymanLayout from "./layout"
import { Package } from "lucide-react"
// ✅ NOUVEAUX IMPORTS - Architecture moderne
import { useApiCall, useApiCallWithSuccess } from "@/hooks/use-api-call"
import { useLivreurWebSocket } from "@/hooks/use-livreur-websocket"
import { livreurService } from "@/services/livreurService"

// ✅ AMÉLIORÉ - Interface pour utilisateur multi-rôles
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

// Type pour les notifications de livraison
interface Notification {
  id: string | number
  productName?: string
  image?: string
  sender?: string
  deliveryAddress?: string
  price?: string
  deliveryDate?: string
  amount?: number
  storageBox?: string
  size?: string
  annonceId?: number
  title?: string
  description?: string
  type?: 'new_delivery' | 'status_update' | 'message' | 'system'
  isRead?: boolean
  createdAt?: string
  urgent?: boolean
}

export default function DeliverymanNotifications() {
  const { t } = useLanguage()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [user, setUser] = useState<MultiRoleUser | null>(null)

  // ✅ NOUVEAUX HOOKS - Architecture moderne
  const { execute: executeGetProfile, loading: profileLoading } = useApiCall<MultiRoleUser>()
  const { execute: executeGetNotifications, loading: notificationsLoading } = useApiCall<any>()
  const { execute: executeAcceptDelivery } = useApiCallWithSuccess('Livraison acceptée avec succès !')
  const { execute: executeRejectDelivery } = useApiCallWithSuccess('Livraison refusée')
  
  // ✅ Variables de chargement unifiées
  const loading = profileLoading || notificationsLoading

  // ✅ NOUVEAU - WebSocket pour notifications temps réel
  const websocket = useLivreurWebSocket({
    userId: user?.livreur?.id || 0,
    onNewDeliveryAvailable: (data: any) => {
      console.log('Nouvelle notification de livraison:', data)
      // Ajouter la nouvelle notification en temps réel
      const newNotification: Notification = {
        id: Date.now(),
        type: 'new_delivery',
        productName: data.title || 'Nouvelle livraison disponible',
        description: data.description || 'Une nouvelle livraison est disponible dans votre zone',
        sender: data.client || 'Client',
        deliveryAddress: data.address || 'Adresse non spécifiée',
        price: data.price ? `€${data.price}` : 'Prix non spécifié',
        urgent: data.urgent || false,
        isRead: false,
        createdAt: new Date().toISOString(),
        annonceId: data.annonceId
      }
      setNotifications(prev => [newNotification, ...prev])
    },
    enableNotifications: true,
    enableLocationTracking: false,
  })

  // ✅ NOUVEAU - Fonction de chargement des notifications
  const loadNotifications = async () => {
    try {
      console.log('Chargement des notifications...')
      
      // ✅ NOUVEAU - Simuler des notifications car l'API peut ne pas avoir d'endpoint spécifique
      // En attendant un vrai endpoint, on crée des notifications basées sur les nouvelles livraisons
      const mockNotifications: Notification[] = [
        {
          id: 1,
          type: 'new_delivery',
          productName: 'Nouvelle livraison disponible',
          description: 'Une livraison prioritaire est disponible dans votre zone',
          sender: 'Marie Dupont',
          deliveryAddress: '123 Rue de la République, Paris',
          price: '€15.50',
          urgent: true,
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
          image: '/placeholder.svg'
        },
        {
          id: 2,
          type: 'status_update',
          productName: 'Livraison #12345',
          description: 'Le client a confirmé la réception de sa commande',
          sender: 'Système',
          deliveryAddress: '456 Avenue des Champs, Lyon',
          price: '€8.75',
          urgent: false,
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
          image: '/placeholder.svg'
        },
        {
          id: 3,
          type: 'message',
          productName: 'Message client',
          description: 'Le client souhaite modifier l\'adresse de livraison',
          sender: 'Pierre Martin',
          deliveryAddress: '789 Boulevard Saint-Germain, Marseille',
          price: '€12.00',
          urgent: false,
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5h ago
          image: '/placeholder.svg'
        }
      ]
      
      setNotifications(mockNotifications)
      console.log('Notifications chargées:', mockNotifications)
      
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error)
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
        
        // 2. Charger les notifications
        await loadNotifications()
        
      } catch (error) {
        console.error("Erreur lors du chargement initial:", error)
      }
    }
    
    loadData()
  }, [])

  // Fonction utilitaire pour formater la plage de dates
  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return "Date non spécifiée"
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
  }

  // Fonction pour déterminer la taille en fonction du poids
  const getSizeFromWeight = (weight: number) => {
    if (weight <= 1) return "Small"
    if (weight <= 5) return "Medium"
    return "Large"
  }

  const handleAccept = async (id: string) => {
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
      if (!token) return

      // Récupérer les informations de l'utilisateur connecté
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })

      if (!userResponse.ok) {
        throw new Error('Erreur lors de la récupération des informations utilisateur')
      }

      const userData = await userResponse.json()
      const livreurId = userData.id

      // Créer une nouvelle livraison
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/annonces/${id}/livraisons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          livreurId: livreurId,
          statut: 'en_attente'
        }),
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la livraison')
      }

      // Supprimer la notification
      setNotifications(notifications.filter(notif => notif.id !== id))
      
      // Rediriger vers les livraisons
      router.push('/app_deliveryman/deliveries')
    } catch (error) {
      console.error("Erreur lors de l'acceptation de la livraison:", error)
      alert("Une erreur est survenue lors de l'acceptation de la livraison")
    }
  }

  const handleReject = (id: string) => {
    // Ici on simule simplement la suppression de la notification
    setNotifications(notifications.filter(notif => notif.id !== id))
  }

  return (
    <DeliverymanLayout>
      {/* Page content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">{t("deliveryman.notifications")}</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : notifications.length > 0 ? (
          <>
            <p className="text-center text-lg mb-8">{t("deliveryman.notificationsDescription")}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notifications.map((notification) => (
                <div key={notification.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-center mb-4">
                      <Image
                        src={notification.image || "/placeholder.svg"}
                        alt={notification.productName || "Notification image"}
                        width={260}
                        height={160}
                        className="object-contain"
                      />
                    </div>

                    <h3 className="text-xl font-semibold mb-2">{notification.productName}</h3>

                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">{t("deliveryman.by")}</span> {notification.sender}
                      </p>
                      <p>
                        <span className="font-medium">{t("deliveryman.deliveryAddress")}</span> :{" "}
                        {notification.deliveryAddress}
                      </p>
                      <p>
                        <span className="font-medium">{t("announcements.priceForDelivery")}</span> :{" "}
                        {notification.price}
                      </p>
                      <p>
                        <span className="font-medium">{t("announcements.deliveryDate")}</span> :{" "}
                        {notification.deliveryDate}
                      </p>
                      <p>
                        <span className="font-medium">{t("announcements.amount")}</span> : {notification.amount}
                      </p>
                      <p>
                        <span className="font-medium">{t("announcements.storageBox")}</span> :{" "}
                        {notification.storageBox}
                      </p>
                    </div>

                    <div className="mt-4 text-center">
                      <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                        {notification.size}
                      </span>
                    </div>

                    <div className="mt-6 flex justify-center space-x-4">
                      <button
                        onClick={() => handleAccept(notification.id.toString())}
                        className="px-6 py-2 text-white bg-green-50 hover:bg-green-300 rounded-md transition-colors"
                      >
                        {t("common.accept")}
                      </button>
                      <button
                        onClick={() => handleReject(notification.id.toString())}
                        className="px-6 py-2 bg-red-400 hover:bg-red-500 text-white rounded-md transition-colors"
                      >
                        {t("common.reject")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">{t("deliveryman.noNotifications")}</h3>
            <p className="text-gray-500">{t("deliveryman.checkBackLater")}</p>
          </div>
        )}
      </div>
    </DeliverymanLayout>
  )
}