"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { User, ChevronDown, Edit, LogOut, Plus, AlertCircle, FileText, CheckCircle } from "lucide-react"
import LanguageSelector from "@/components/language-selector"
import { useLanguage } from "@/components/language-context"

// Types for our data
interface ComplaintItem {
  id: string
  announce: string
  announceTitle?: string
  shippingPrice: string
  justificativePieces: number
  description: string
  status: "pending" | "in_progress" | "done" | "rejected"
  dateSubmitted: string
}

// Interface pour les annonces
interface Announcement {
  id: number
  title: string
}

export default function ComplaintClient() {
  const { t } = useLanguage()
  const [first_name, setUserName] = useState("")
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "resolved">("all")
  const [showComplaintModal, setShowComplaintModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  // État pour les réclamations
  const [complaints, setComplaints] = useState<ComplaintItem[]>([])

  // Filter complaints based on active tab
  const filteredComplaints = complaints.filter((item) => {
    if (activeTab === "all") return true
    if (activeTab === "pending") return ["pending", "in_progress"].includes(item.status)
    if (activeTab === "resolved") return ["done", "rejected"].includes(item.status)
    return true
  })

  // Récupérer les informations de l'utilisateur
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
        fetchUserComplaints(data.id);
        fetchUserAnnouncements(data.id);
			})
			.catch((err) => console.error('Auth/me failed:', err));
	}, []);

  // Récupérer les annonces de l'utilisateur
  const fetchUserAnnouncements = async (userId: number) => {
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/annonces/user/${userId}`, {
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
    }
  };

  // Récupérer les réclamations de l'utilisateur
  const fetchUserComplaints = async (userId: number) => {
    setIsLoading(true);
    try {
      // Provisoire : Récupérer depuis le localStorage
      const storedComplaints = localStorage.getItem('userComplaints');
      
      if (storedComplaints) {
        const parsedComplaints = JSON.parse(storedComplaints);
        setComplaints(parsedComplaints);
      } else {
        // Si aucune réclamation n'est trouvée dans le localStorage, on utilise des données fictives
        // Note: Ceci est à remplacer par un appel API réel plus tard
        const mockComplaints: ComplaintItem[] = [
          {
            id: "c1",
            announce: "000001",
            shippingPrice: "£20.00",
            justificativePieces: 0,
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            status: "done",
            dateSubmitted: new Date().toISOString().split("T")[0],
          }
        ];
        setComplaints(mockComplaints);
        localStorage.setItem('userComplaints', JSON.stringify(mockComplaints));
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setComplaints([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get announcement title by ID
  const getAnnouncementTitle = (announceId: string) => {
    const announcement = announcements.find(a => a.id.toString() === announceId);
    return announcement ? announcement.title : announceId;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Create new complaint
    const newComplaintItem: ComplaintItem = {
      id: `c${complaints.length + 1}`,
      announce: newComplaint.announce,
      shippingPrice: newComplaint.shippingPrice,
      justificativePieces: newComplaint.files.length,
      description: newComplaint.description,
      status: "pending",
      dateSubmitted: new Date().toISOString().split("T")[0],
    }

    // Add to complaints list
    setComplaints((prev) => [newComplaintItem, ...prev])

    // Reset form and close modal
    setNewComplaint({
      announce: "",
      shippingPrice: "",
      description: "",
      files: [],
    })
    setShowComplaintModal(false)
  }

  // New complaint form state
  const [newComplaint, setNewComplaint] = useState({
    announce: "",
    shippingPrice: "",
    description: "",
    files: [] as File[],
  })

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewComplaint((prev) => ({
        ...prev,
        files: [...Array.from(e.target.files || [])],
      }))
    }
  }

  // Get status badge color
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

  // Get status text
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

  // Get status icon
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
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-center text-green-400">
            {t("complaints.yourComplaints")}
          </h1>

          <Link
            href="/app_client/complaint/create"
            className="mt-4 sm:mt-0 px-4 py-2 bg-green-50 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("complaints.makeComplaint")}
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-sm rounded-md ${
                activeTab === "all" ? "bg-white shadow-sm" : "hover:bg-gray-200"
              }`}
            >
              {t("common.all")}
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 text-sm rounded-md ${
                activeTab === "pending" ? "bg-white shadow-sm" : "hover:bg-gray-200"
              }`}
            >
              {t("complaints.pending")}
            </button>
            <button
              onClick={() => setActiveTab("resolved")}
              className={`px-4 py-2 text-sm rounded-md ${
                activeTab === "resolved" ? "bg-white shadow-sm" : "hover:bg-gray-200"
              }`}
            >
              {t("complaints.resolved")}
            </button>
          </div>
        </div>

        {/* Complaints List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">{t("complaints.yourComplaints")}</h2>

            {isLoading ? (
              <div className="py-8 text-center text-gray-500">
                {t("common.loading")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                        {t("complaints.announce")}
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                        {t("complaints.shippingPrice")}
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                        {t("complaints.description")}
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">{t("complaints.status")}</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">{t("complaints.action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.length > 0 ? (
                      filteredComplaints.map((complaint) => (
                        <tr key={complaint.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">
                            {getAnnouncementTitle(complaint.announce)}
                          </td>
                          <td className="py-3 px-4">{complaint.shippingPrice}</td>
                          <td className="py-3 px-4 max-w-xs truncate">{complaint.description}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                                complaint.status,
                              )}`}
                            >
                              {getStatusText(complaint.status)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setShowDetailsModal(complaint.id)}
                              className="text-green-500 hover:text-green-700 font-medium"
                            >
                              {t("complaints.viewDetails")}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-500">
                          {t("complaints.noComplaints")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Complaint Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
            {(() => {
              const complaint = complaints.find((c) => c.id === showDetailsModal)
              if (!complaint) return null

              return (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-semibold">{t("complaints.complaintDetails")}</h3>
                    <div className="flex items-center">
                      {getStatusIcon(complaint.status)}
                      <span
                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                          complaint.status,
                        )}`}
                      >
                        {getStatusText(complaint.status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t("complaints.announceId")}</p>
                      <p className="font-medium">{getAnnouncementTitle(complaint.announce)}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t("complaints.shippingPrice")}</p>
                      <p className="font-medium">{complaint.shippingPrice}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t("complaints.dateSubmitted")}</p>
                      <p className="font-medium">{new Date(complaint.dateSubmitted).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-1">{t("complaints.description")}</p>
                    <p className="bg-gray-50 p-3 rounded-md">{complaint.description}</p>
                  </div>

                  {complaint.status === "done" && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-1">{t("complaints.resolution")}</p>
                      <p className="bg-green-50 bg-opacity-30 p-3 rounded-md text-green-800">
                        {t("complaints.resolutionMessage")} {complaint.shippingPrice}.
                      </p>
                    </div>
                  )}

                  {complaint.status === "in_progress" && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-1">{t("complaints.statusUpdate")}</p>
                      <p className="bg-blue-50 bg-opacity-30 p-3 rounded-md text-blue-800">
                        {t("complaints.statusUpdateMessage")}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowDetailsModal(null)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      {t("common.cancel")}
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

