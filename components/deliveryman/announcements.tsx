"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  BarChart3,
  ChevronDown,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Edit,
  BellRing,
  CreditCard,
  User,
  PartyPopper,
} from "lucide-react"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"
import DeliverymanLayout from "./layout"
import { useApiCall, useApiCallWithSuccess } from "@/hooks/use-api-call"
import { useLivreurWebSocket } from "@/hooks/use-livreur-websocket"
import { livreurService } from "@/services/livreurService"
import { clientService } from "@/services/clientService"
import { useToast } from '@/hooks/use-toast';

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

// Type pour les annonces (conservé à l'identique)
interface Announcement {
  id: string | number
  title: string
  image?: string
  client?: string
  address?: string
  price?: string
  deliveryDate?: string
  amount?: number
  storageBox?: string
  size?: "Small" | "Medium" | "Large"
  isPriority?: boolean
  description?: string
  utilisateurId?: number
}

export default function DeliverymanAnnouncements() {
  const { t } = useLanguage()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [user, setUser] = useState<MultiRoleUser | null>(null)
  const [loadingAccept, setLoadingAccept] = useState<{id: number, loading: boolean}>({ id: 0, loading: false })

  // ✅ NOUVEAUX HOOKS - Architecture améliorée
  const { execute: executeGetProfile, loading: profileLoading } = useApiCall<MultiRoleUser>()
  const { execute: executeGetAnnouncements, loading: announcementsLoading } = useApiCall<any>()
  const { execute: executeAcceptDelivery } = useApiCallWithSuccess('Livraison acceptée avec succès !')
  
  // ✅ NOUVEAU - WebSocket pour notifications temps réel
  const websocket = useLivreurWebSocket({
    userId: user?.livreur?.id || 0,
    onNewDeliveryAvailable: (data) => {
      console.log('Nouvelle livraison disponible:', data)
      // Recharger les annonces pour montrer la nouvelle
      loadAnnouncements()
    },
    onDeliveryAcceptedSuccess: (data) => {
      console.log('Livraison acceptée avec succès:', data)
      // Recharger les annonces pour retirer celle acceptée
      loadAnnouncements()
    },
    enableNotifications: true,
    enableLocationTracking: false,
  })

  const loadAnnouncements = async () => {
    try {
      console.log('Chargement des annonces disponibles...')
      
      const announcesResponse: any = await executeGetAnnouncements(
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/annonces`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('authToken') || localStorage.getItem('authToken')}`
          },
          credentials: 'include'
        }).then(res => {
          if (!res.ok) throw new Error('Erreur lors de la récupération des annonces')
          return res.json()
        })
      )
      console.log('Annonces récupérées:', announcesResponse)
      
      // Extraire les annonces de la réponse
      let annoncesData: any[] = []
      if (Array.isArray(announcesResponse)) {
        annoncesData = announcesResponse
      } else if (announcesResponse?.annonces?.data && Array.isArray(announcesResponse.annonces.data)) {
        annoncesData = announcesResponse.annonces.data
      } else if (announcesResponse?.data && Array.isArray(announcesResponse.data)) {
        annoncesData = announcesResponse.data
      } else if (announcesResponse?.annonces && Array.isArray(announcesResponse.annonces)) {
        annoncesData = announcesResponse.annonces
      }
      
      console.log('Données annonces extraites:', annoncesData)
      
      // Transformer les données pour correspondre à notre interface (même logique qu'avant)
      const formattedAnnouncements: Announcement[] = annoncesData
        .filter((annonce: any) => annonce.state === 'open') // Ne montrer que les annonces ouvertes
        .map((annonce: any) => ({
          id: annonce.id,
          title: annonce.title || "Annonce sans titre",
          description: annonce.description,
          image: annonce.imagePath ? `${process.env.NEXT_PUBLIC_API_URL}/${annonce.imagePath}` : "/placeholder.svg",
          client: annonce.utilisateur ? `${annonce.utilisateur.firstName || annonce.utilisateur.first_name || ''} ${annonce.utilisateur.lastName || annonce.utilisateur.last_name || ''}`.trim() : "Client",
          address: annonce.destinationAddress || annonce.destination_address || "Adresse non spécifiée",
          price: `€${annonce.price || 0}`,
          deliveryDate: formatDate(annonce.scheduledDate || annonce.scheduled_date),
          amount: 1, // Par défaut 1 puisque ce n'est pas dans l'API
          storageBox: annonce.storageBoxId || "Non spécifié",
          size: getSizeFromWeight(5) as "Small" | "Medium" | "Large", // ✅ CORRIGÉ - Cast du type
          isPriority: annonce.priority,
          utilisateurId: annonce.utilisateurId || annonce.user_id
        }))

      setAnnouncements(formattedAnnouncements)
      console.log('Annonces formatées:', formattedAnnouncements)
      
    } catch (error) {
      console.error("Erreur lors de la récupération des annonces:", error)
      // ✅ Les erreurs sont gérées automatiquement par les hooks
    }
  }

  // ✅ NOUVEAU - Chargement initial avec gestion du profil utilisateur
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
        
        // 2. Charger les annonces
        await loadAnnouncements()
        
      } catch (error) {
        console.error("Erreur lors du chargement initial:", error)
      }
    }
    
    loadData()
  }, [])

  // Fonction utilitaire pour formater la date
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date non spécifiée"
    
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Fonction pour déterminer la taille en fonction du poids
  const getSizeFromWeight = (weight: number) => {
    if (weight <= 1) return "Small"
    if (weight <= 5) return "Medium"
    return "Large"
  }

  // ✅ AMÉLIORÉ - Accepter une livraison avec nouvelle architecture
  const handleAcceptDelivery = async (announcementId: number) => {
    setLoadingAccept({ id: announcementId, loading: true })
    
    try {
      // Vérifier que l'utilisateur est bien un livreur
      if (!user?.livreur?.id) {
        const { toast } = useToast();

        toast({
          variant: "destructive",
          title: "Erreur d'authentification",
          description: "Vous devez être connecté en tant que livreur"
        });
        return;
      }

      // ✅ NOUVEAU - Utiliser le service livreur pour accepter la livraison
      console.log('Acceptation de la livraison pour l\'annonce:', announcementId)
      
      // Créer la livraison via l'API
      const response = await executeAcceptDelivery(
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/annonces/${announcementId}/livraisons`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('authToken') || localStorage.getItem('authToken')}`
          },
          credentials: 'include',
          body: JSON.stringify({
            livreur_id: user.livreur.id,
            status: 'scheduled',
            pickup_location: "À récupérer",
            dropoff_location: "À livrer"
          })
        }).then(res => {
          if (!res.ok) throw new Error('Erreur lors de la création de la livraison')
          return res.json()
        })
      )
      
      console.log('Livraison créée:', response)
      
      // Retirer cette annonce de la liste
      setAnnouncements(prev => prev.filter(a => a.id !== announcementId))
      
      // ✅ NOUVEAU - Redirection plus élégante
      setTimeout(() => {
        window.location.href = '/app_deliveryman/deliveries'
      }, 1000)
      
    } catch (error) {
      console.error("Erreur lors de l'acceptation de la livraison:", error);
      const { toast } = useToast();
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'accepter cette livraison"
      });
    } finally {
      setLoadingAccept({ id: 0, loading: false });
    }
  }

  // ✅ Variables de chargement unifiées
  const loading = profileLoading || announcementsLoading

  return (
    <DeliverymanLayout>
      {/* Page content */}
      <main className="p-4 lg:p-6">
        <h1 className="mb-6 text-2xl font-bold">{t("deliveryman.announcements")}</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            {/* Announcements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="h-48 relative bg-green-200">
                    <Image
                      src={announcement.image || "/placeholder.svg"}
                      alt={announcement.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-lg font-semibold">{announcement.title}</h2>
                      {announcement.isPriority && (
                        <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          {t("deliveryman.priority")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">By {announcement.client}</span>
                    </p>
                    <div className="space-y-2 text-sm mb-4">
                      <p>
                        <span className="font-medium">{t("announcements.deliveryAddress")}:</span> {announcement.address}
                      </p>
                      <p>
                        <span className="font-medium">{t("announcements.priceForDelivery")}:</span> {announcement.price}
                        {announcement.isPriority && (
                          <span className="ml-2 text-red-600 text-xs font-medium">(+{t("deliveryman.priorityFee")})</span>
                        )}
                      </p>
                      <p>
                        <span className="font-medium">{t("announcements.deliveryDate")}:</span>{" "}
                        {announcement.deliveryDate}
                      </p>
                      <p>
                        <span className="font-medium">{t("announcements.amount")}:</span> {announcement.amount}
                      </p>
                      <p>
                        <span className="font-medium">{t("announcements.storageBox")}:</span> {announcement.storageBox}
                      </p>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{announcement.size}</span>
                      <button
                        onClick={() => handleAcceptDelivery(Number(announcement.id))}
                        className={`${
                          announcement.isPriority ? "bg-red-500 hover:bg-red-600" : "bg-green-300 hover:bg-green-400"
                        } px-4 py-2 text-white rounded-md text-sm font-medium`}
                        disabled={loadingAccept.loading && loadingAccept.id === announcement.id}
                      >
                        {loadingAccept.loading && loadingAccept.id === announcement.id 
                          ? "En cours..." 
                          : announcement.isPriority ? "Urgent" : "Accepter"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state if no announcements */}
            {announcements.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Package className="h-12 w-12 mx-auto" />
                </div>
                <h2 className="text-xl font-medium mb-2">{t("deliveryman.noAnnouncementsAvailable")}</h2>
                <p className="text-gray-500 mb-4">{t("deliveryman.checkBackLater")}</p>
              </div>
            )}
          </>
        )}
      </main>
    </DeliverymanLayout>
  )
}