"use client"

import { useState } from "react"
import { ContractsTable } from "@/components/back-office/contracts-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/components/language-context"

export function FinanceContent() {
  const { t } = useLanguage()
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
        <h1 className="text-2xl font-bold">{t("admin.finance")}</h1>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pick one month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="January">{t("admin.january")}</SelectItem>
            <SelectItem value="February">{t("admin.february")}</SelectItem>
            <SelectItem value="March">{t("admin.march")}</SelectItem>
            <SelectItem value="April">{t("admin.april")}</SelectItem>
            <SelectItem value="May">{t("admin.may")}</SelectItem>
            <SelectItem value="June">{t("admin.june")}</SelectItem>
            <SelectItem value="July">{t("admin.july")}</SelectItem>
            <SelectItem value="August">{t("admin.august")}</SelectItem>
            <SelectItem value="September">{t("admin.september")}</SelectItem>
            <SelectItem value="October">{t("admin.october")}</SelectItem>
            <SelectItem value="November">{t("admin.november")}</SelectItem>
            <SelectItem value="December">{t("admin.december")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">{t("admin.clientContract")}</h2>
          <ContractsTable data={usersContractsData} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">{t("admin.shopkeeperContract")}</h2>
          <ContractsTable data={shopkeepersContractsData} />
        </div>
      </div>
    </div>
  )
}

