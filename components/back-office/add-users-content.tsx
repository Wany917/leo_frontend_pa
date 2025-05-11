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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState<Date>()


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simuler une requête API
    setTimeout(() => {
      setIsLoading(false)
      // Rediriger vers la page des utilisateurs
      window.location.href = "/users"
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add a new account</h1>

      <div className="mb-6">
          <Link href="/admin/users" className="text-green-50 hover:underline flex items-center">
            <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
            {t("common.back")}
          </Link>
        </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-center mb-8">Create an Account</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="name" className="mb-2 block">
                Name
              </Label>
              <Input id="name" placeholder="Enter name" required />
            </div>

            <div>
              <Label htmlFor="email" className="mb-2 block">
                Email address:
              </Label>
              <Input id="email" type="email" placeholder="Enter email" required />
            </div>

            <div>
              <Label htmlFor="address" className="mb-2 block">
                Address
              </Label>
              <Input id="address" placeholder="Enter address" required />
            </div>

            <div>
              <Label htmlFor="firstname" className="mb-2 block">
                Firstname
              </Label>
              <Input id="firstname" placeholder="Enter first name" required />
            </div>

            <div>
              <Label htmlFor="phone" className="mb-2 block">
                Phone number
              </Label>
              <Input id="phone" placeholder="Enter phone number" required />
            </div>

            <div>
              <Label htmlFor="city" className="mb-2 block">
                City
              </Label>
              <Input id="city" placeholder="Enter city" required />
            </div>

            <div>
              <Label htmlFor="dob" className="mb-2 block">
                Date of birth
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Enter date of birth"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="password" className="mb-2 block">
                Password
              </Label>
              <Input id="password" type="password" placeholder="••••••" required />
            </div>

            <div>
              <Label htmlFor="postal" className="mb-2 block">
                Postal code
              </Label>
              <Input id="postal" placeholder="Enter postal code" required />
            </div>

            <div>
              <Label htmlFor="account-type" className="mb-2 block">
              Type of account
              </Label>
              <Select>
              <SelectTrigger id="account-type" className="w-full">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="livreur">Livreur</SelectItem>
                <SelectItem value="commercant">Commerçant</SelectItem>
                <SelectItem value="prestataire">Prestataire de service</SelectItem>
              </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="confirm-password" className="mb-2 block">
                Confirm password
              </Label>
              <Input id="confirm-password" type="password" placeholder="••••••" required />
            </div>

            <div>
              <Label htmlFor="country" className="mb-2 block">
                Country
              </Label>
              <Select>
                <SelectTrigger id="country" className="w-full">
                  <SelectValue placeholder="Enter country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="fr">France</SelectItem>
                  <SelectItem value="de">Germany</SelectItem>
                  <SelectItem value="es">Spain</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <Button type="submit" disabled={isLoading} className="bg-[#8CD790] hover:bg-[#7ac57e] text-white px-8">
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

