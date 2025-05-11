"use client"

import { useState } from "react"
import { ClientsChart } from "@/components/back-office/clients-chart"
import { StatCard } from "@/components/back-office/stat-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/components/language-context"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function DashboardContent() {
  const { t } = useLanguage()

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
                    {[
                      {
                        name: "Doe",
                        firstName: "John",
                        address: "123 Main St, Paris",
                        account: "Deliveryman",
                        date: "2025-04-01",
                      },
                      {
                        name: "Smith",
                        firstName: "Jane",
                        address: "456 Oak Ave, Lyon",
                        account: "User",
                        date: "2025-04-02",
                      },
                      {
                        name: "Johnson",
                        firstName: "Robert",
                        address: "789 Pine Rd, Marseille",
                        account: "Shopkeeper",
                        date: "2025-04-03",
                      },
                      {
                        name: "Davis",
                        firstName: "Emily",
                        address: "321 Cedar Ln, Bordeaux",
                        account: "Service Provider",
                        date: "2025-04-04",
                      },
                      {
                        name: "Brown",
                        firstName: "Michael",
                        address: "654 Elm Blvd, Nice",
                        account: "User",
                        date: "2025-04-05",
                      },
                    ].map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{item.firstName}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{item.address}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{item.account}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard title="Number of contract" value="83.9 K" change="+9.7 K this month" positive={true} />
        <StatCard title="Numbers of the month" value="£ 76 K" change="+5.4% than last month" positive={true} />
      </div>
    </div>
  )
}

