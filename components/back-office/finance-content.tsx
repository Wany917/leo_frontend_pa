"use client"

import { useState } from "react"
import { ContractsTable } from "@/components/back-office/contracts-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function FinanceContent() {
  const [selectedMonth, setSelectedMonth] = useState("March")

  // Données fictives pour les contrats utilisateurs
  const usersContractsData = [
    {
      id: 1,
      client: "Killian",
      contract: "Premium",
      price: "£19.99",
    },
  ]

  // Données fictives pour les contrats commerçants
  const shopkeepersContractsData = [
    {
      id: 1,
      client: "Killian",
      contract: "Ultimate",
      price: "£89.99",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Finance</h1>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pick one month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="January">January</SelectItem>
            <SelectItem value="February">February</SelectItem>
            <SelectItem value="March">March</SelectItem>
            <SelectItem value="April">April</SelectItem>
            <SelectItem value="May">May</SelectItem>
            <SelectItem value="June">June</SelectItem>
            <SelectItem value="July">July</SelectItem>
            <SelectItem value="August">August</SelectItem>
            <SelectItem value="September">September</SelectItem>
            <SelectItem value="October">October</SelectItem>
            <SelectItem value="November">November</SelectItem>
            <SelectItem value="December">December</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Users contracts</h2>
          <ContractsTable data={usersContractsData} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Shopkeepers contracts</h2>
          <ContractsTable data={shopkeepersContractsData} />
        </div>
      </div>
    </div>
  )
}

