"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, ChevronDown, Edit, LogOut, Upload, X } from "lucide-react"
import LanguageSelector from "@/components/language-selector"
import { useLanguage } from "@/components/language-context"

// Interface pour les annonces
interface Announcement {
  id: number
  title: string
}

export default function CreateComplaintClient() {
  const router = useRouter()
  const { t } = useLanguage()
  const [first_name, setUserName] = useState("")
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false)

  const [formData, setFormData] = useState({
    announce: "",
    shippingPrice: "",
    description: "",
  })

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

  // Récupérer les annonces de l'utilisateur
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoadingAnnouncements(true);
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        
        // D'abord, récupérer l'ID de l'utilisateur connecté
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!userResponse.ok) {
          throw new Error("Impossible de récupérer les informations utilisateur");
        }
        
        const userData = await userResponse.json();
        const utilisateurId = userData.id;
        
        // Ensuite, récupérer les annonces de l'utilisateur
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/annonces/user/${utilisateurId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const annoncesData = Array.isArray(data) ? data : data.data || data.annonces || [];
          
          if (annoncesData.length > 0) {
            const formattedAnnouncements = annoncesData.map((item: any) => ({
              id: item.id,
              title: item.title || `Annonce #${item.id}`
            }));
            setAnnouncements(formattedAnnouncements);
          }
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setIsLoadingAnnouncements(false);
      }
    };

    fetchAnnouncements();
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
      // Créer une nouvelle réclamation
      const newComplaint = {
        id: `c${Date.now()}`,
        announce: formData.announce,
        shippingPrice: formData.shippingPrice,
        justificativePieces: 0,
        description: formData.description,
        status: "pending" as const,
        dateSubmitted: new Date().toISOString().split('T')[0]
      };

      // Récupérer les réclamations existantes du localStorage
      const existingComplaints = localStorage.getItem('userComplaints');
      let allComplaints = [];
      
      if (existingComplaints) {
        allComplaints = JSON.parse(existingComplaints);
      }
      
      // Ajouter la nouvelle réclamation
      allComplaints = [newComplaint, ...allComplaints];
      
      // Sauvegarder dans le localStorage
      localStorage.setItem('userComplaints', JSON.stringify(allComplaints));

      // Redirection vers la page des réclamations
      router.push("/app_client/complaint")
    } catch (error) {
      console.error("Error submitting complaint:", error)
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
                src="/logo.png"
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
                  {t("complaints.announce")}
                </label>
                <select
                  id="announce"
                  name="announce"
                  value={formData.announce}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">{isLoadingAnnouncements ? t("common.loading") : t("common.selectOption")}</option>
                  {announcements.map((announcement) => (
                    <option key={announcement.id} value={announcement.id}>
                      {announcement.title} (#{announcement.id})
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

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// File icon component
function FileIcon({ extension }: { extension: string }) {
  // Determine icon based on file extension
  switch (extension.toLowerCase()) {
    case "pdf":
      return <div className="text-red-500 text-xs font-bold">PDF</div>
    case "doc":
    case "docx":
      return <div className="text-blue-500 text-xs font-bold">DOC</div>
    case "xls":
    case "xlsx":
      return <div className="text-green-500 text-xs font-bold">XLS</div>
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return <div className="text-purple-500 text-xs font-bold">IMG</div>
    default:
      return <div className="text-gray-500 text-xs font-bold">FILE</div>
  }
}

