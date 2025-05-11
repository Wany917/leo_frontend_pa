"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UserTable } from "@/components/back-office/user-table"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/components/language-context"
// Removed unused import

export function UsersContent() {
  const { t } = useLanguage()
  const [selectedUser, setSelectedUser] = useState(null) // Removed unused variable type
  const [isModalOpen, setIsModalOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Données fictives pour les différentes catégories d'utilisateurs
  const deliveryManData = [
    {
      id: 1,
      name: "BIDAUX",
      firstName: "Killian",
      email: "kbidaux@myges.fr",
      phone: "0636760421",
      status: t("users.clickHere"),
      statusColor: "bg-[#8CD790] text-white",
      justificatives: ["ID Card.pdf", "Driving Licence.pdf"],
    },
  ]

  const serviceProvidersData = [
    {
      id: 2,
      name: "BIDAUX",
      firstName: "Killian",
      email: "kbidaux@myges.fr",
      phone: "0636760421",
      status: t("users.accepted"),
      statusColor: "bg-[#8CD790] text-white",
      justificatives: ["ID Card.pdf", "Service Certificate.pdf"],
    },
  ]

  const shopkeepersData = [
    {
      id: 3,
      name: "BIDAUX",
      firstName: "Killian",
      email: "kbidaux@myges.fr",
      phone: "0636760421",
      status: t("users.rejected"),
      statusColor: "bg-[#E57373] text-white",
      justificatives: ["SIRET.pdf", "SIREN.pdf"],
    },
  ]

  const usersData = [
    {
      id: 4,
      name: "DOE",
      firstName: "John",
      email: "johndoe@example.com",
      phone: "0612345678",
      status: t("users.active"),
      statusColor: "bg-[#8CD790] text-white",
    },
  ]

  const administratorsData = [
    {
      id: 5,
      name: "SMITH",
      firstName: "Jane",
      email: "janesmith@example.com",
      phone: "0698765432",
      status: t("users.active"),
      statusColor: "bg-[#8CD790] text-white",
    },
  ]

  const handleStatusClick = (user: any) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleDelete = (userId: number) => {
    if (window.confirm(t("users.confirmDelete"))) {
      console.log(t("users.userDeleted") + `: ${userId}`)
      // Ici, ajoutez la logique pour supprimer l'utilisateur
    }
  }

  // Fermer le modal en cliquant à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false)
      }
    }

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isModalOpen])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t("users.title")}</h1>
        <Link href="/admin/users/add">
          <Button className="bg-[#8CD790] hover:bg-[#7ac57e] text-white">
            <Plus className="mr-2 h-4 w-4" />
            {t("users.newAccount")}
          </Button>
        </Link>
      </div>

      {/* Users Table */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">{t("users.deliveryMan")}</h2>
          <UserTable
            data={deliveryManData}
            showJustificative={true}
            onStatusClick={handleStatusClick}
            onDelete={handleDelete}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">{t("users.serviceProviders")}</h2>
          <UserTable
            data={serviceProvidersData}
            showJustificative={true}
            onStatusClick={handleStatusClick}
            onDelete={handleDelete}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">{t("users.shopkeepers")}</h2>
          <UserTable
            data={shopkeepersData}
            showJustificative={true}
            onStatusClick={handleStatusClick}
            onDelete={handleDelete}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">{t("users.users")}</h2>
          <UserTable
            data={usersData.map(user => ({ ...user, justificatives: [] }))}
            showJustificative={false} // Pas de justificatifs pour les utilisateurs
            onStatusClick={() => {}} // Pas de clic sur le statut
            onDelete={handleDelete}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">{t("users.administrators")}</h2>
          <UserTable
            data={administratorsData.map(admin => ({ ...admin, justificatives: [] }))}
            showJustificative={false} // Pas de justificatifs pour les administrateurs
            onStatusClick={() => {}} // Pas de clic sur le statut
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  )
}

