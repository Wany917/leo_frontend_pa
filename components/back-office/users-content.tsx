"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UserTable } from "@/components/back-office/user-table"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/components/language-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function UsersContent() {
  const { t } = useLanguage()
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", description: "", onConfirm: () => {} })
  const modalRef = useRef<HTMLDivElement>(null)

  // Données fictives pour les différentes catégories d'utilisateurs
const [allUsers, setAllUsers] = useState<any[]>([]);

useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/utilisateurs/all`);
      const data = await response.json();
      setAllUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  fetchUsers();
}, []);

const deliveryManData = allUsers
  .filter(user => user.livreur)
  .map(user => ({
    id: user.id,
    name: user.lastName,
    firstName: user.firstName,
    email: user.email,
    phone: user.phoneNumber,
    status: user.state === 'open' ? t("admin.active") : t('admin.inactive'),
    statusColor: user.state === 'open' ? "bg-[#8CD790] text-white" : "bg-[#E57373] text-white",
    justificatives: user.justificationPieces, // Placeholder until actual documents are implemented
  }));

const serviceProvidersData = allUsers
  .filter(user => user.prestataire)
  .map(user => ({
    id: user.id,
    name: user.lastName,
    firstName: user.firstName,
    email: user.email,
    phone: user.phoneNumber,
    status: user.state === 'open' ? t("admin.accepted") : t("admin.rejected"),
    statusColor: user.state === 'open' ? "bg-[#8CD790] text-white" : "bg-[#E57373] text-white",
    justificatives: user.justificationPieces, // Placeholder until actual documents are implemented
  }));

const usersData = allUsers
  .filter(user => !user.admin && !user.livreur && !user.prestataire)
  .map(user => ({
    id: user.id,
    name: user.lastName,
    firstName: user.firstName,
    email: user.email,
    phone: user.phoneNumber,
    status: user.state === 'open' ? t("admin.active") : t("admin.inactive"),
    statusColor: user.state === 'open' ? "bg-[#8CD790] text-white" : "bg-[#E57373] text-white",
  }));

const administratorsData = allUsers
  .filter(user => user.admin)
  .map(user => ({
    id: user.id,
    name: user.lastName,
    firstName: user.firstName,
    email: user.email,
    phone: user.phoneNumber,
    status: user.state === 'open' ? t("admin.active") : t("admin.inactive"),
    statusColor: user.state === 'open' ? "bg-[#8CD790] text-white" : "bg-[#E57373] text-white",
  }));

  const shopkeepersData = [
    {
      id: 3,
      name: "BIDAUX",
      firstName: "Killian",
      email: "kbidaux@myges.fr",
      phone: "0636760421",
      status: t("admin.rejected"),
      statusColor: "bg-[#E57373] text-white",
      justificatives: ["SIRET.pdf", "SIREN.pdf"],
    },
  ]

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (!token) return;

    const isCurrentlyActive = currentStatus === t("admin.active") || currentStatus === t("admin.accepted");
    const newState = isCurrentlyActive ? "closed" : "open";
    const actionText = isCurrentlyActive ? t("admin.deactivate") : t("admin.reactivate");

    setConfirmDialog({
      isOpen: true,
      title: t("admin.confirmAction"),
      description: `${t("admin.confirmAction")} ${actionText.toLowerCase()}?`,
      onConfirm: async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/toggle-user-status/${userId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ state: newState }),
          });

          if (response.ok) {
            window.location.reload();
          } else {
            console.error('Failed to toggle user status');
          }
        } catch (error) {
          console.error('Error toggling user status:', error);
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleStatusClick = (user: any) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleDelete = (userId: number) => {
    setConfirmDialog({
      isOpen: true,
      title: t("admin.confirmDelete"),
      description: t("admin.confirmDelete"),
      onConfirm: () => {
        const token =
          sessionStorage.getItem('authToken') ||
          localStorage.getItem('authToken');
        if (!token) return;

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/close-user/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ state: "closed" }),
        })
        window.location.reload()
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  }

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
        <h1 className="text-2xl font-bold">{t("admin.usersTitle")}</h1>
        <Link href="/admin/users/add">
          <Button className="bg-[#8CD790] hover:bg-[#7ac57e] text-white">
            <Plus className="mr-2 h-4 w-4" />
            {t("admin.newAccount")}
          </Button>
        </Link>
      </div>

      {/* Users Table */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">{t("admin.deliveryMan")}</h2>
          <UserTable
            data={deliveryManData}
            showJustificative={true}
            onStatusClick={handleStatusClick}
            onToggleStatus={handleToggleStatus}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">{t("admin.serviceProviders")}</h2>
          <UserTable
            data={serviceProvidersData}
            showJustificative={true}
            onStatusClick={handleStatusClick}
            onToggleStatus={handleToggleStatus}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">{t("admin.shopkeepers")}</h2>
          <UserTable
            data={shopkeepersData}
            showJustificative={false}
            onStatusClick={handleStatusClick}
            onToggleStatus={handleToggleStatus}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">{t("admin.clients")}</h2>
          <UserTable
            data={usersData.map(user => ({ ...user, justificatives: [] }))}
            showJustificative={false}
            onStatusClick={() => {}}
            onToggleStatus={handleToggleStatus}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">{t("admin.administrators")}</h2>
          <UserTable
            data={administratorsData.map(admin => ({ ...admin, justificatives: [] }))}
            showJustificative={true}
            onStatusClick={() => {}}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}>
              {t("admin.cancel") || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialog.onConfirm}>
              {t("admin.confirm") || "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

