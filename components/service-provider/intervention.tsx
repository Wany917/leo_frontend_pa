"use client"

import React, { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useLanguage } from "@/components/language-context"

export default function ServiceProviderIntervention() {
  const { t } = useLanguage()
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})

  // Données fictives pour les services
  const services = [
    {
      id: "1",
      name: "Dog-sitter",
      interventions: [
        {
          id: 1,
          image:"/dog-sitter.jpg",
          serviceName: "Dog-sitter",
          client: "Florence",
          grade: 5,
          comment: "Lorem ipsum dolor sit amet...",
          date: "April 15, 2025",
          hour : "10:00 AM",
          address: "123 Main St, Cityville",
        },
        {
          id: 2,
          image:"/dog-sitter.jpg",
          serviceName: "Dog-sitter",
          client: "Charlotte",
          grade: 5,
          comment: "Lorem ipsum dolor sit amet...",
          date: "April 10, 2025",
          hour : "10:00 AM",
          address: "123 Main St, Cityville",
        },
        {
          id: 3,
          image:"/dog-sitter.jpg",
          serviceName: "Dog-sitter",
          client: "Samy",
          grade: 5,
          comment: "Lorem ipsum dolor sit amet...",
          date: "April 5, 2025",
          hour : "10:00 AM",
          address: "123 Main St, Cityville",
        },
      ],
    },
  ]

  // Trouver le service correspondant à l'ID

  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const service = services.find((s) => s.id === id) || services[0]

  const toggleRowExpansion = (interventionId: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [interventionId]: !prev[interventionId],
    }))
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main content */}
      <div className="flex-1 overflow-x-hidden">
        {/* Page content */}
        <main className="p-4 lg:p-6">

          <h1 className="text-2xl font-bold mb-6">{t("serviceProvider.intervention")}</h1>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("serviceProvider.serviceName")}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("serviceProvider.client")}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("serviceProvider.addressClient")}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {service.interventions.map((intervention) => (
                    <React.Fragment key={intervention.id}>
                      <tr
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleRowExpansion(intervention.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">{intervention.serviceName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{intervention.client}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{intervention.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          
                        </td>
                      </tr>
                      {expandedRows[intervention.id] && (
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="p-0">
                            <div className="p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="flex items-start gap-6">
                                <div className="flex-1">
                                  <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-semibold">{t("serviceProvider.serviceFor")} {intervention.client}</h3>
                                  </div>
                                  <p className="text-gray-700 mb-4">{intervention.address} {t("serviceProvider.at")} {intervention.hour}</p>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">{t("serviceProvider.bookedOn")} {intervention.date}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}