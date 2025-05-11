"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, ChevronDown, Edit, LogOut } from "lucide-react"
import LanguageSelector from "@/components/language-selector"
import { useLanguage } from "@/components/language-context"

// Interface pour les annonces
interface Announcement {
  id: string
  title: string
}

export default function CreateComplaintClient() {
  const router = useRouter()
  const { t } = useLanguage()
  const [first_name, setUserName] = useState("")
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  
  const [formData, setFormData] = useState({
    announce: "",
    shippingPrice: "",
    description: "",
  })

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
        if (!token) return
        
        // Pour le débogage - vérifier que nous avons bien un token
        console.log("Token récupéré:", token ? "Oui" : "Non")
        
        // Récupérer l'ID de l'utilisateur connecté
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!userResponse.ok) {
          console.error("Erreur lors de la récupération des informations utilisateur")
          setAnnouncements([
            { id: "1", title: "Annonce #1 - Test" },
            { id: "2", title: "Annonce #2 - Test" },
          ])
          return
        }
        
        const userData = await userResponse.json()
        console.log("Données utilisateur:", userData)
        const userId = userData.id
        
        if (!userId) {
          console.error("ID utilisateur non trouvé")
          setAnnouncements([
            { id: "1", title: "Annonce #1 - Test" },
            { id: "2", title: "Annonce #2 - Test" },
          ])
          return
        }
        
        // Récupérer les annonces de l'utilisateur avec la bonne URL
        const annonceResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/annonces/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        console.log(`URL appelée: ${process.env.NEXT_PUBLIC_API_URL}/annonces/user/${userId}`)
        console.log("Statut de la réponse API annonces:", annonceResponse.status)
        
        if (annonceResponse.ok) {
          const data = await annonceResponse.json()
          console.log("Données annonces reçues:", data)
          
          if (data && Array.isArray(data)) {
            setAnnouncements(data.map((item: any) => ({
              id: item.id,
              title: `Annonce #${item.id} - ${item.title || 'Sans titre'}`
            })))
          } else if (data && data.annonces && Array.isArray(data.annonces)) {
            setAnnouncements(data.annonces.map((item: any) => ({
              id: item.id,
              title: `Annonce #${item.id} - ${item.title || 'Sans titre'}`
            })))
          } else {
            console.warn("Format de données inattendu pour les annonces:", data)
            setAnnouncements([
              { id: "1", title: "Annonce #1 - Test" },
              { id: "2", title: "Annonce #2 - Test" },
            ])
          }
        } else {
          console.error("Erreur API annonces:", await annonceResponse.text())
          setAnnouncements([
            { id: "1", title: "Annonce #1 - Test" },
            { id: "2", title: "Annonce #2 - Test" },
          ])
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des annonces:", error)
        setAnnouncements([
          { id: "1", title: "Annonce #1 - Test" },
          { id: "2", title: "Annonce #2 - Test" },
        ])
      }
    }
    
    fetchAnnouncements()
  }, [])

  useEffect(() => {
		const token =
			sessionStorage.getItem('authToken') ||
			localStorage.getItem('authToken');
		if (!token) return;

		fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			credentials: 'include',
		})
			.then((res) => {
				if (!res.ok) throw new Error('Unauthorized');
				return res.json();
			})
			.then((data) => {
				setUserName(data.firstName);
			})
			.catch((err) => console.error('Auth/me failed:', err));
	}, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
      
      if (!token) {
        console.error("Aucun token d'authentification trouvé")
        setIsSubmitting(false)
        return
      }
      
      // Récupérer l'ID de l'utilisateur connecté
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!userResponse.ok) {
        console.error("Erreur lors de la récupération des informations utilisateur")
        setIsSubmitting(false)
        return
      }
      
      const userData = await userResponse.json()
      const userId = userData.id
      
      if (!userId) {
        console.error("ID utilisateur non trouvé")
        setIsSubmitting(false)
        return
      }
      
      // Créer un sujet à partir de la description (limité aux 50 premiers caractères)
      const shortDescription = formData.description.substring(0, 50)
      const subject = shortDescription + (formData.description.length > 50 ? '...' : '')
      
      // Préparer les données de la réclamation
      const complaintData = {
        related_order_id: formData.announce,
        shipping_price: formData.shippingPrice,
        description: formData.description,
        utilisateur_id: userId,
        status: "open",
        priority: "medium",
        subject: subject
      }
      
      // Envoi de la réclamation
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/complaints`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(complaintData)
      })
      
      console.log("Données envoyées:", complaintData)
      console.log("Statut de la réponse:", response.status)
      
      if (response.ok) {
        router.push("/app_client/complaint")
      } else {
        const errorText = await response.text()
        try {
          const errorData = JSON.parse(errorText)
          console.error("Erreur lors de la soumission:", errorData)
        } catch {
          console.error("Erreur lors de la soumission (texte brut):", errorText)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la soumission de la plainte:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/app_client">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-NEF7Y3VVan4gaPKz0Ke4Q9FTKCgie4.png"
                alt="EcoDeli Logo"
                width={120}
                height={40}
                className="h-auto"
              />
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/app_client/announcements" className="text-gray-700 hover:text-green-500">
              {t("navigation.myAnnouncements")}
            </Link>
            <Link href="/app_client/payments" className="text-gray-700 hover:text-green-500">
              {t("navigation.myPayments")}
            </Link>
            <Link href="/app_client/messages" className="text-gray-700 hover:text-green-500">
              {t("navigation.messages")}
            </Link>
            <Link href="/app_client/complaint" className="text-green-500 font-medium border-b-2 border-green-500">
              {t("navigation.makeComplaint")}
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageSelector />

            {/* User Account Menu */}
            <div className="relative">
              <button
                className="flex items-center bg-green-50 text-white rounded-full px-4 py-1 hover:bg-green-400 transition-colors"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <User className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">{first_name}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-100">
                  <Link
                    href="/app_client/edit-account"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    <span>{t("common.editAccount")}</span>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <div className="px-4 py-1 text-xs text-gray-500">{t("common.registerAs")}</div>

                  <Link href="/register/delivery-man" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.deliveryMan")}
                  </Link>

                  <Link href="/register/shopkeeper" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.shopkeeper")}
                  </Link>

                  <Link href="/register/service-provider" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.serviceProvider")}
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <Link href="/logout" className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>{t("common.logout")}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/app_client/complaint" className="text-green-500 hover:underline flex items-center">
            <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
            {t("navigation.backToComplaints")}
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">{t("complaints.submitNewComplaint")}</h1>

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="announce" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("complaints.announceId")}
                </label>
                <select
                  id="announce"
                  name="announce"
                  value={formData.announce}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">{t("complaints.selectAnnouncement")}</option>
                  {announcements.map((announcement) => (
                    <option key={announcement.id} value={announcement.id}>
                      {announcement.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="shippingPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("complaints.shippingPrice")}
                </label>
                <input
                  type="text"
                  id="shippingPrice"
                  name="shippingPrice"
                  value={formData.shippingPrice}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("complaints.descriptionOfIssue")}
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                  placeholder={t("complaints.pleaseDescribeIssue")}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Link
                  href="/app_client/complaint"
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {t("common.cancel")}
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-50 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? t("common.submitting") : t("complaints.submitComplaint")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

