"use client"

import { useState, useEffect } from "react"
import { ClientsChart } from "@/components/back-office/clients-chart"
import { StatCard } from "@/components/back-office/stat-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/components/language-context"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function DashboardContent() {
  const { t } = useLanguage()
  const router = useRouter()
  const [users, setUsers] = useState([
    {
      first_name: "",
      last_name: "",
      address: "",
      role: "",
      created_at: "",
    }
  ])

  useEffect(() => {
    const fetchUsers = async () => {
      const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken")
      if (!token) {
        router.push("/login")
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/utilisateurs/get-recent`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        })

        if (!response.ok) throw new Error("Unauthorized")
        const userData = await response.json()
        setUsers(userData)
      } catch (err) {
        console.error("Fetch recent users failed:", err)
      }
    }

    fetchUsers()
      
  }, [])

  useEffect(() => {
    const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken")
    if (!token) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized")
        return res.json()
      })
      .then((data) => {
        if (data.role !== "admin") {
          router.push("/app_client")
        }
      })
      .catch((err) => console.error("Auth/me failed:", err))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("admin.dashboard")}</h1>    
        
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="flex items-center justify-between p-6">
              <h2 className="text-lg font-medium text-gray-900">{t("admin.recentUsers")}</h2>
              <Link
                href="/admin/users"
                className="flex items-center text-sm font-medium text-green-600 hover:text-green-500"
              >
                {t("admin.viewAll")}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t("admin.userFirstName")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t("admin.userName")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t("admin.address")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t("admin.accountType")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t("admin.dateCreated")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {users.map((item) => (
                        <tr key={`${item.last_name}-${item.first_name}`} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{item.first_name}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{item.last_name}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{item.address != null ? item.address : "No Address"}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{item.role}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {new Date(item.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard title={t("admin.numberContracts")} value="83.9 K" change="+9.7 K this month" positive={true} />
        <StatCard title={t("admin.numberMonth")} value="£ 76 K" change="+5.4% than last month" positive={true} />
      </div>
    </div>
  )
}
