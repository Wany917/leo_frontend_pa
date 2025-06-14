"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserTable } from "@/components/back-office/user-table"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/components/language-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", description: "", onConfirm: () => {} })
  const modalRef = useRef<HTMLDivElement>(null)

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

  // Search function
  const filterUsers = (users: any[], searchTerm: string) => {
    if (!searchTerm) return users;
    
    return users.filter(user => 
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Modified to allow users with multiple roles to appear in multiple sections
  const deliveryManData = filterUsers(
    allUsers.filter(user => user.livreur),
    searchTerm
  ).map(user => ({
    id: user.id,
    name: user.lastName,
    firstName: user.firstName,
    email: user.email,
    phone: user.phoneNumber,
    status: user.state === 'open' ? t("admin.active") : t('admin.inactive'),
    statusColor: user.state === 'open' ? "bg-[#8CD790] text-white" : "bg-[#E57373] text-white",
    justificatives: user.justificationPieces,
  }));

  const serviceProvidersData = filterUsers(
    allUsers.filter(user => user.prestataire),
    searchTerm
  ).map(user => ({
    id: user.id,
    name: user.lastName,
    firstName: user.firstName,
    email: user.email,
    phone: user.phoneNumber,
    status: user.state === 'open' ? t("admin.accepted") : t("admin.rejected"),
    statusColor: user.state === 'open' ? "bg-[#8CD790] text-white" : "bg-[#E57373] text-white",
    justificatives: user.justificationPieces,
  }));

  const usersData = filterUsers(
    allUsers.filter(user => !user.admin && !user.livreur && !user.prestataire && !user.commercant),
    searchTerm
  ).map(user => ({
    id: user.id,
    name: user.lastName,
    firstName: user.firstName,
    email: user.email,
    phone: user.phoneNumber,
    status: user.state === 'open' ? t("admin.active") : t("admin.inactive"),
    statusColor: user.state === 'open' ? "bg-[#8CD790] text-white" : "bg-[#E57373] text-white",
  }));

  const administratorsData = filterUsers(
    allUsers.filter(user => user.admin),
    searchTerm
  ).map(user => ({
    id: user.id,
    name: user.lastName,
    firstName: user.firstName,
    email: user.email,
    phone: user.phoneNumber,
    status: user.state === 'open' ? t("admin.active") : t("admin.inactive"),
    statusColor: user.state === 'open' ? "bg-[#8CD790] text-white" : "bg-[#E57373] text-white",
  }));

  const shopkeepersData = filterUsers(
    allUsers.filter(user => user.commercant),
    searchTerm
  ).map(user => ({
    id: user.id,
    name: user.lastName,
    firstName: user.firstName,
    email: user.email,
    phone: user.phoneNumber,
    status: user.state === 'open' ? t("admin.active") : t("admin.inactive"),
    statusColor: user.state === 'open' ? "bg-[#8CD790] text-white" : "bg-[#E57373] text-white",
    justificatives: user.justificationPieces,
  }));

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

  // Component to render empty state
  const EmptyUserSection = ({ userType }: { userType: string }) => (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <div className="text-gray-500">
        <p className="text-lg font-medium">{t("admin.noUsersFound")}</p>
        <p className="text-sm mt-1">{t("admin.noUsersOfType")} {userType.toLowerCase()}</p>
      </div>
    </div>
  );

  // Filter sections based on selected filter
  const shouldShowSection = (sectionType: string) => {
    return selectedFilter === "all" || selectedFilter === sectionType;
  };

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

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t("admin.searchUsers") || "Search by name, email, or phone..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="w-full sm:w-64">
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("admin.filterByUserType") || "Filter by user type"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.allUsers") || "All Users"}</SelectItem>
                <SelectItem value="deliveryMan">{t("admin.deliveryMan")}</SelectItem>
                <SelectItem value="serviceProviders">{t("admin.serviceProviders")}</SelectItem>
                <SelectItem value="shopkeepers">{t("admin.shopkeepers")}</SelectItem>
                <SelectItem value="clients">{t("admin.clients")}</SelectItem>
                <SelectItem value="administrators">{t("admin.administrators")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Search Results Summary */}
        {searchTerm && (
          <div className="text-sm text-gray-600">
            {t("admin.searchResults") || "Search results for:"} <span className="font-medium">"{searchTerm}"</span>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="space-y-6">
        {shouldShowSection("deliveryMan") && (
          <div>
            <h2 className="text-xl font-semibold mb-4">{t("admin.deliveryMan")}</h2>
            {deliveryManData.length > 0 ? (
              <UserTable
                data={deliveryManData}
                showJustificative={true}
                onStatusClick={handleStatusClick}
                onToggleStatus={handleToggleStatus}
              />
            ) : (
              <EmptyUserSection userType={t("admin.deliveryMan")} />
            )}
          </div>
        )}

        {shouldShowSection("serviceProviders") && (
          <div>
            <h2 className="text-xl font-semibold mb-4">{t("admin.serviceProviders")}</h2>
            {serviceProvidersData.length > 0 ? (
              <UserTable
                data={serviceProvidersData}
                showJustificative={true}
                onStatusClick={handleStatusClick}
                onToggleStatus={handleToggleStatus}
              />
            ) : (
              <EmptyUserSection userType={t("admin.serviceProviders")} />
            )}
          </div>
        )}

        {shouldShowSection("shopkeepers") && (
          <div>
            <h2 className="text-xl font-semibold mb-4">{t("admin.shopkeepers")}</h2>
            {shopkeepersData.length > 0 ? (
              <UserTable
                data={shopkeepersData}
                showJustificative={true}
                onStatusClick={handleStatusClick}
                onToggleStatus={handleToggleStatus}
              />
            ) : (
              <EmptyUserSection userType={t("admin.shopkeepers")} />
            )}
          </div>
        )}

        {shouldShowSection("clients") && (
          <div>
            <h2 className="text-xl font-semibold mb-4">{t("admin.clients")}</h2>
            {usersData.length > 0 ? (
              <UserTable
                data={usersData.map(user => ({ ...user, justificatives: [] }))}
                showJustificative={false}
                onStatusClick={() => {}}
                onToggleStatus={handleToggleStatus}
              />
            ) : (
              <EmptyUserSection userType={t("admin.clients")} />
            )}
          </div>
        )}

        {shouldShowSection("administrators") && (
          <div>
            <h2 className="text-xl font-semibold mb-4">{t("admin.administrators")}</h2>
            {administratorsData.length > 0 ? (
              <UserTable
                data={administratorsData.map(admin => ({ ...admin, justificatives: [] }))}
                showJustificative={false}
                onStatusClick={() => {}}
                onToggleStatus={handleToggleStatus}
              />
            ) : (
              <EmptyUserSection userType={t("admin.administrators")} />
            )}
          </div>
        )}
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

