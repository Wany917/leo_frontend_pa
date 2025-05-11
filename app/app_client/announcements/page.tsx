"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Plus } from "lucide-react"
import ResponsiveHeader from "../responsive-header"
import { useLanguage } from "@/components/language-context"
import { useRouter } from "next/navigation"
import { formatDateRange } from '@/app/utils/date-formats'

interface Announcement {
  id: number;
  title: string;
  image: string;
  deliveryAddress: string;
  price: string;
  deliveryDate: string;
  amount: number;
  storageBox: string;
  shoppingList?: string;
}

export default function AnnouncementsPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showShoppingForm, setShowShoppingForm] = useState(false)
  const [shopTitle, setShopTitle] = useState("")
  const [shopPrice, setShopPrice] = useState("")
  const [shopList, setShopList] = useState("")
  const [shopDeliveryAddress, setShopDeliveryAddress] = useState("")
  const [shopDeliveryDate, setShopDeliveryDate] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Ref pour détecter le clic en dehors du modal
  const modalRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowCreateModal(false)
        setShowShoppingForm(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const openCreateModal = () => {
    // reset form / mode chaque ouverture
    setShowShoppingForm(false)
    setShopTitle("")
    setShopPrice("")
    setShopList("")
    setShopDeliveryAddress("")
    setShopDeliveryDate("")
    setShowCreateModal(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm(t("announcements.confirmDelete"))) {
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/annonces/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setAnnouncements(announcements.filter((announcement) => announcement.id !== id));
        } else {
          console.error("Erreur lors de la suppression de l'annonce");
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  }

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      
      // Récupérer l'ID de l'utilisateur connecté
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!userResponse.ok) {
        throw new Error("Erreur lors de la récupération des informations utilisateur");
      }
      
      const userData = await userResponse.json();
      const userId = userData.id;
      
      // Récupérer les annonces de l'utilisateur
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/annonces/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.annonces && Array.isArray(data.annonces) && data.annonces.length > 0) {
          // Convertir au format attendu par le composant
          const formattedAnnouncements = data.annonces.map((item: any) => ({
            id: item.id,
            title: item.title || "Package",
            image: item.imagePath ? `${process.env.NEXT_PUBLIC_API_URL}/${item.imagePath}` : "/announcements.jpg",
            deliveryAddress: item.destinationAddress || "Not specified",
            price: `£${item.price || 0}`,
            deliveryDate: formatDateRange(item.scheduledDate),
            amount: 1,
            storageBox: item.storageBoxId ? `Storage box ${item.storageBoxId}` : "No storage box",
            shoppingList: item.description
          }));
          setAnnouncements(formattedAnnouncements);
        } else {
          // Aucune annonce trouvée
          setAnnouncements([]);
        }
      } else {
        // Gérer l'erreur de requête
        console.error("Erreur lors de la récupération des annonces:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShoppingListSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      
      // Récupérer l'ID de l'utilisateur connecté
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!userResponse.ok) {
        throw new Error("Impossible de récupérer les informations utilisateur");
      }
      
      const userData = await userResponse.json();
      const utilisateur_id = userData.id;
      
      const formData = new FormData();
      formData.append("utilisateur_id", utilisateur_id.toString());
      formData.append("title", shopTitle);
      formData.append("price", shopPrice);
      formData.append("shopping_list", shopList);
      formData.append("delivery_address", shopDeliveryAddress);
      formData.append("delivery_date", shopDeliveryDate);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/annonces/shopping-list`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        // Réinitialiser le formulaire et fermer la modal
        setShowShoppingForm(false);
        setShowCreateModal(false);
        // Recharger les annonces
        fetchAnnouncements();
      } else {
        const errorData = await response.json();
        setError(`Erreur: ${errorData.error || "Impossible de créer la liste de courses"}`);
        console.error("Erreur lors de la création de la liste de courses:", JSON.stringify(errorData));
      }
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue");
      console.error("Erreur:", error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Utiliser le composant ResponsiveHeader avec la page active */}
      <ResponsiveHeader activePage="announcements" />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <h1 className="text-2xl font-semibold text-center text-green-400">{t("announcements.yourAnnouncements")}</h1>

          <button
            onClick={openCreateModal}
            className="bg-green-400 text-white px-4 py-2 rounded-full flex items-center hover:bg-green-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t("announcements.makeNewAnnouncement")}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 mb-6 rounded-lg">
            {error}
            <button 
              className="ml-2 text-red-900 font-bold"
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">{t("announcements.noAnnouncements")}</p>
            <button
              onClick={openCreateModal}
              className="bg-green-400 text-white px-4 py-2 rounded-full flex items-center mx-auto hover:bg-green-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t("announcements.createYourFirst")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 relative bg-green-200">
                  <Image 
                    src={announcement.image || "/announcements.jpg"} 
                    alt={announcement.title}
                    fill
                    style={{ objectFit: "contain" }}
                    className="mx-auto h-full"
                  />
                </div>

                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-2">{announcement.title}</h2>
                  
                  <div className="space-y-1 text-sm mb-4">
                    <p><span className="font-medium">{t("announcements.deliveryAddress")}:</span> {announcement.deliveryAddress}</p>
                    <p><span className="font-medium">{t("announcements.priceForDelivery")}:</span> {announcement.price}</p>
                    <p><span className="font-medium">{t("announcements.deliveryDate")}:</span> {announcement.deliveryDate}</p>
                    {announcement.storageBox && (
                      <p><span className="font-medium">{t("announcements.storageBox")}:</span> {announcement.storageBox}</p>
                    )}
                    {announcement.shoppingList && (
                      <div>
                        <strong>{t("announcements.shoppingList")}:</strong>
                        <p className="text-sm italic">{announcement.shoppingList}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link 
                      href={`/app_client/announcements/edit/${announcement.id}`}
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 py-2 px-3 rounded text-center text-sm transition-colors"
                    >
                      {t("common.edit")}
                    </Link>
                    <button 
                      onClick={() => handleDelete(announcement.id)}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 py-2 px-3 rounded text-sm transition-colors"
                    >
                      {t("common.delete")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal pour créer une nouvelle annonce */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md">
            {!showShoppingForm ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">{t("announcements.createType")}</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    router.push("/app_client/announcements/create")
                  }}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded"
                >
                  {t("announcements.createPackage")}
                </button>
                <button
                  onClick={() => setShowShoppingForm(true)}
                  className="w-full px-4 py-2 bg-green-700 text-white rounded"
                >
                  {t("announcements.createShoppingList")}
                </button>
                <button onClick={() => setShowCreateModal(false)} className="mt-2 w-full px-4 py-2 border rounded">
                  {t("common.cancel")}
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleShoppingListSubmit}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold">{t("announcements.shoppingList")}</h2>
                <input
                  value={shopTitle}
                  onChange={(e) => setShopTitle(e.target.value)}
                  placeholder={t("announcements.title")}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <input
                  value={shopDeliveryAddress}
                  onChange={(e) => setShopDeliveryAddress(e.target.value)}
                  placeholder={t("announcements.deliveryAddress")}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <div className="flex items-center justify-between">
                  {t("announcements.deliveryDate")}
                </div>  
                <input
                  type="date"
                  value={shopDeliveryDate}
                  onChange={(e) => setShopDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <input
                  value={shopPrice}
                  onChange={(e) => setShopPrice(e.target.value)}
                  type="number"
                  placeholder={t("announcements.listPrice")}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <textarea
                  value={shopList}
                  onChange={(e) => setShopList(e.target.value)}
                  placeholder={t("announcements.shoppingListItems")}
                  className="w-full px-3 py-2 border rounded h-24"
                  required
                />
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowShoppingForm(false)}
                    className="flex-1 px-4 py-2 border rounded"
                  >
                    {t("common.back")}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded"
                  >
                    {t("common.create")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

