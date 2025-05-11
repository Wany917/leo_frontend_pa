"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Save, ChevronDown } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"

export default function DeliverymanEditAccount() {
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "LEBLANC",
    firstname: "Charlotte",
    email: "cleblanc@gmail.com",
    phone: "06 15 24 36 78",
    address: "242 rue Faubourg Saint Antoine",
    city: "Paris",
    postalCode: "75012",
    country: "France",
    dateOfBirth: "28/10/2005",
    accountType: "Delivery man",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Ici, vous pourriez ajouter la logique pour envoyer les données au serveur
    console.log("Form submitted:", formData)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white p-4 flex justify-between items-center shadow-sm">
        <Link href="/admin" className="flex items-center">
          <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto" />
        </Link>

        <div className="flex items-center mr-20">
          <LanguageSelector />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin" className="text-green-500 hover:underline flex items-center">
            <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
            {t("navigation.backToApp_Client")}
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">{t("auth.editYourAccount")}</h1>

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("auth.firstName")}
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstname}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("auth.name")}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("auth.emailAddress")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("auth.phoneNumber")}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("auth.address")}
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("auth.city")}
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("auth.postalCode")}
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("auth.country")}
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">{t("auth.selectCountry")}</option>
                    <option value="France">France</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="Spain">Spain</option>
                    <option value="Italy">Italy</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Link
                  href="/admin"
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {t("common.cancel")}
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-50 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-70 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2">{t("auth.savingChanges")}</span>
                      <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {t("auth.saveChanges")}
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">{t("auth.changePassword")}</h2>
                <Link href="/admin/edit-account/edit-password" className="text-sm text-green-500 hover:underline">
                  {t("auth.changePassword")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}