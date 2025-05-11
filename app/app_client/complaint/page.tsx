"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, ChevronDown, Edit, LogOut, Plus, AlertCircle, FileText, CheckCircle, X } from "lucide-react"
import LanguageSelector from "@/components/language-selector"
import { useLanguage } from "@/components/language-context"
import { formatDate } from '@/app/utils/date-formats'
import ResponsiveHeader from "../responsive-header"

// Types pour nos données
interface ComplaintItem {
  id: string
  announce: string
  shippingPrice: string
  justificativePieces: number
  description: string
  status: "pending" | "in_progress" | "done" | "rejected"
  dateSubmitted: string
}

export default function ComplaintPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "resolved">("all")
  const [showDetailsModal, setShowDetailsModal] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Données pour les plaintes
  const [complaints, setComplaints] = useState<ComplaintItem[]>([])

  // Filtrer les plaintes en fonction de l'onglet actif
  const filteredComplaints = complaints.filter((item) => {
    if (activeTab === "all") return true
    if (activeTab === "pending") return ["pending", "in_progress"].includes(item.status)
    if (activeTab === "resolved") return ["done", "rejected"].includes(item.status)
    return true
  })

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setIsLoading(true)
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
        
        if (!token) {
          console.error("No auth token found")
          setIsLoading(false)
          return
        }
        
        // Récupérer l'ID de l'utilisateur connecté
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!userResponse.ok) {
          throw new Error("Erreur lors de la récupération des informations utilisateur")
        }
        
        const userData = await userResponse.json()
        const userId = userData.id
        
        // Récupérer les plaintes de l'utilisateur
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/complaints/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        console.log("Statut de la réponse API plaintes:", response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log("Données des plaintes reçues:", data)
          
          if (data && data.complaints && Array.isArray(data.complaints) && data.complaints.length > 0) {
            // Convertir au format attendu par le composant
            const formattedComplaints: ComplaintItem[] = data.complaints.map((item: any) => {
              console.log("Item de plainte:", item)
              
              // Déterminer l'ID d'annonce en vérifiant plusieurs propriétés possibles
              let announceId = "N/A"
              if (item.announce_id) {
                announceId = item.announce_id
              } else if (item.relatedOrderId) {
                announceId = item.relatedOrderId
              } else if (item.related_order_id) {
                announceId = item.related_order_id
              }
              
              return {
                id: item.id,
                announce: announceId,
                shippingPrice: `£${item.shippingPrice || item.shipping_price || 0}`,
                justificativePieces: item.justificativePieces?.length || 0,
                description: item.description || "",
                status: mapStatus(item.status),
                dateSubmitted: formatDate(item.createdAt || item.created_at)
              }
            })
            
            setComplaints(formattedComplaints)
          } else {
            setComplaints([])
          }
        } else {
          console.error("Erreur lors de la récupération des plaintes:", await response.text())
        }
      } catch (error) {
        console.error("Error fetching complaints:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchComplaints()
  }, [])

  // Mapper le statut du backend vers les status d'affichage
  const mapStatus = (backendStatus: string): "pending" | "in_progress" | "done" | "rejected" => {
    switch (backendStatus) {
      case "open": return "pending"
      case "in_progress": return "in_progress"
      case "resolved": return "done"
      case "closed": return "rejected"
      default: return "pending"
    }
  }

  // Obtenir la couleur du badge de statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Obtenir le texte du statut
  const getStatusText = (status: string) => {
    switch (status) {
      case "done":
        return t("complaints.done")
      case "in_progress":
        return t("complaints.inProgress")
      case "pending":
        return t("complaints.pending")
      case "rejected":
        return t("complaints.rejected")
      default:
        return status
    }
  }

  // Obtenir l'icône du statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in_progress":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Utiliser le composant ResponsiveHeader */}
      <ResponsiveHeader activePage="complaint" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-green-400">{t("complaints.yourComplaints")}</h1>

          <Link
            href="/app_client/complaint/create"
            className="mt-4 sm:mt-0 bg-green-500 text-white px-4 py-2 rounded-full flex items-center hover:bg-green-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t("complaints.newComplaint")}
          </Link>
        </div>

        {/* Onglets de filtrage */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === "all"
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-gray-500 hover:text-green-500"
              }`}
            >
              {t("complaints.allComplaints")}
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === "pending"
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-gray-500 hover:text-green-500"
              }`}
            >
              {t("complaints.pendingComplaints")}
            </button>
            <button
              onClick={() => setActiveTab("resolved")}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === "resolved"
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-gray-500 hover:text-green-500"
              }`}
            >
              {t("complaints.resolvedComplaints")}
            </button>
          </div>

          {/* Liste des plaintes */}
          <div className="divide-y">
            {isLoading ? (
              <div className="py-16 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-2"></div>
                <p className="text-gray-500">{t("common.loading")}</p>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="py-16 text-center">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">{t("complaints.noComplaintsFound")}</p>
                <Link
                  href="/app_client/complaint/create"
                  className="text-green-500 hover:underline font-medium inline-flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t("complaints.submitNewComplaint")}
                </Link>
              </div>
            ) : (
              filteredComplaints.map((complaint) => (
                <div key={complaint.id} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-wrap items-start justify-between">
                    <div className="mb-2 sm:mb-0">
                      <p className="font-medium text-gray-900">
                        {t("complaints.announcement")} #{complaint.announce}
                      </p>
                      <p className="text-sm text-gray-500">{t("complaints.submitted")}: {complaint.dateSubmitted}</p>
                    </div>

                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${getStatusBadge(
                          complaint.status
                        )}`}
                      >
                        {getStatusIcon(complaint.status)}
                        <span className="ml-1">{getStatusText(complaint.status)}</span>
                      </span>

                      <button
                        onClick={() => setShowDetailsModal(complaint.id)}
                        className="text-green-500 hover:text-green-600 text-sm font-medium"
                      >
                        {t("common.details")}
                      </button>
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-gray-700 line-clamp-2">{complaint.description}</p>

                  {/* Badge pour les pièces justificatives */}
                  {complaint.justificativePieces > 0 && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        <FileText className="h-3.5 w-3.5 mr-1" />
                        {complaint.justificativePieces} {t("complaints.attachments")}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modal détaillé de la plainte */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{t("complaints.complaintDetails")}</h2>
                <button
                  onClick={() => setShowDetailsModal(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {(() => {
                const complaint = complaints.find((c) => c.id === showDetailsModal)
                if (!complaint) return null

                return (
                  <>
                    <div className="mb-4 pb-4 border-b">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium">
                          {t("complaints.announcement")} #{complaint.announce}
                        </p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                            complaint.status
                          )}`}
                        >
                          {getStatusIcon(complaint.status)}
                          <span className="ml-1">{getStatusText(complaint.status)}</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{t("complaints.submitted")}: {complaint.dateSubmitted}</p>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">{t("complaints.description")}</h3>
                      <p className="text-gray-700">{complaint.description}</p>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">{t("complaints.shippingPrice")}</h3>
                      <p className="text-gray-700">{complaint.shippingPrice}</p>
                    </div>

                    {complaint.justificativePieces > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">{t("complaints.attachments")}</h3>
                        <div className="flex items-center text-gray-700">
                          <FileText className="h-5 w-5 mr-2 text-gray-400" />
                          <span>
                            {complaint.justificativePieces} {t("complaints.files")}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

