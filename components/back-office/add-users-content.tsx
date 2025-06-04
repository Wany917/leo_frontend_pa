"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, ChevronDown } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Link from "next/link"
import { useLanguage } from "@/components/language-context"

export function AddUsersContent() {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date>()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simuler une requête API
    setTimeout(() => {
      setIsLoading(false)
      // Rediriger vers la page des utilisateurs
      window.location.href = "/admin/users"
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("admin.addNewAccount")}</h1>

      <div className="mb-6">
        <Link href="/admin/users" className="text-green-50 hover:underline flex items-center">
          <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
          {t("common.back")}
        </Link>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-center mb-8">{t("admin.createAccount")}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="name" className="mb-2 block">
                {t("admin.userName")}
              </Label>
              <Input id="name" placeholder={t("admin.enterUserName")} required />
            </div>

            <div>
              <Label htmlFor="email" className="mb-2 block">
                {t("admin.userEmail")}
              </Label>
              <Input id="email" type="email" placeholder={t("admin.enterUserEmail")} required />
            </div>

            <div>
              <Label htmlFor="address" className="mb-2 block">
                {t("admin.address")}
              </Label>
              <Input id="address" placeholder={t("admin.enterAddress")} required />
            </div>

            <div>
              <Label htmlFor="firstname" className="mb-2 block">
                {t("admin.userFirstName")}
              </Label>
              <Input id="firstname" placeholder={t("admin.enterFirstName")} required />
            </div>

            <div>
              <Label htmlFor="phone" className="mb-2 block">
                {t("admin.userPhone")}
              </Label>
              <Input id="phone" placeholder={t("admin.enterPhone")} />
            </div>

            <div>
              <Label htmlFor="city" className="mb-2 block">
                {t("admin.city")}
              </Label>
              <Input id="city" placeholder={t("admin.enterCity")} />
            </div>

            <div>
              <Label htmlFor="dob" className="mb-2 block">
                {t("admin.userDateOfBirth")}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : t("admin.enterDateOfBirth")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="password" className="mb-2 block">
                {t("admin.password")}
              </Label>
              <Input id="password" type="password" placeholder="••••••" required />
            </div>

            <div>
              <Label htmlFor="postal" className="mb-2 block">
                {t("admin.postalCode")}
              </Label>
              <Input id="postal" placeholder={t("admin.enterPostalCode")} />
            </div>

            <div>
              <Label htmlFor="account-type" className="mb-2 block">
                {t("admin.accountType")}
              </Label>
              <Select>
                <SelectTrigger id="account-type" className="w-full">
                  <SelectValue placeholder={t("admin.selectAccountType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">{t("admin.client")}</SelectItem>
                  <SelectItem value="livreur">{t("admin.deliveryMan")}</SelectItem>
                  <SelectItem value="commercant">{t("admin.shopkeepers")}</SelectItem>
                  <SelectItem value="prestataire">{t("admin.serviceProviders")}</SelectItem>
                  <SelectItem value="administrateur">{t("admin.administrator")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="confirm-password" className="mb-2 block">
                {t("admin.confirmPassword")}
              </Label>
              <Input id="confirm-password" type="password" placeholder="••••••" required />
            </div>

            <div>
              <Label htmlFor="country" className="mb-2 block">
                {t("admin.country")}
              </Label>
              <Select>
                <SelectTrigger id="country" className="w-full">
                  <SelectValue placeholder={t("admin.selectCountry")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uk">{t("admin.unitedKingdom")}</SelectItem>
                  <SelectItem value="us">{t("admin.unitedStates")}</SelectItem>
                  <SelectItem value="fr">{t("admin.france")}</SelectItem>
                  <SelectItem value="de">{t("admin.germany")}</SelectItem>
                  <SelectItem value="es">{t("admin.spain")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <Button type="submit" disabled={isLoading} className="bg-[#8CD790] hover:bg-[#7ac57e] text-white px-8">
              {t("common.create")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

