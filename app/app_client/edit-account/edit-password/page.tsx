"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { User, ChevronDown, Edit, LogOut, Save, Lock } from "lucide-react"
import LanguageSelector from "@/components/language-selector"
import { useLanguage } from "@/components/language-context"

export default function ChangePasswordPage() {
  const { t } = useLanguage()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [first_name, setFirstName] = useState("")
  const [email, setEmail] = useState("")
  const [userId, setUserId] = useState("")

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })

  useEffect(() => {
      const token =
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("authToken")
      if (!token) return
  
      ;(async () => {
        try {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
          })
            .then((res) => {
              if (!res.ok) throw new Error('Unauthorized');
              return res.json();
            })
            .then((data) => {
              setUserId(data.id)
              setFirstName(data.firstName)
              setEmail(data.email)
            })
            .catch((err) => console.error('Auth/me failed:', err));
        } catch (err) {
          console.error("⚠️ auth/me error:", err)
        }
      })()
    }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    const { currentPassword, newPassword, confirmNewPassword } = formData

    const passwordCheck = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/utilisateurs/check-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: currentPassword }),
        credentials: "include",
      }
    )

    if (!passwordCheck.ok) {
      setError(t("auth.invalidCurrentPassword"))
      setIsSubmitting(false)
      return
    }

    if (currentPassword === newPassword) {
      setError(t("auth.newPasswordSameAsCurrent"))
      setIsSubmitting(false)
      return
    }

    if (newPassword !== confirmNewPassword) {
      setError(t("auth.passwordsDoNotMatch"))
      setIsSubmitting(false)
      return
    }

    if (newPassword.length < 8) {
      setError(t("auth.passwordTooShort"))
      setIsSubmitting(false)
      return
    }

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/utilisateurs/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: newPassword }),
          credentials: "include",
        }
      )
      console.log("Password updated")
      setSuccess(t("auth.passwordUpdatedSuccessfully"))
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      })
    } catch (error) {
      console.error("Error updating password:", error)
      setError(t("auth.errorUpdatingPassword"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/app_client">
              <Image
                src="/logo.png"
                alt="EcoDeli Logo"
                width={120}
                height={40}
                className="h-auto"
              />
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/app_client/announcements" className="text-gray-700 hover:text-green-500">
              {t("navigation.myAnnouncements")}
            </Link>
            <Link href="/app_client/payments" className="text-gray-700 hover:text-green-500">
              {t("navigation.myPayments")}
            </Link>
            <Link href="/app_client/messages" className="text-gray-700 hover:text-green-500">
              {t("navigation.messages")}
            </Link>
            <Link href="/app_client/complaint" className="text-gray-700 hover:text-green-500">
              {t("navigation.makeComplaint")}
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageSelector />

            {/* User Account Menu */}
            <div className="relative">
              <button
                className="flex items-center bg-green-50 text-white rounded-full px-4 py-1 hover:bg-green-400 transition-colors"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <User className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">{first_name}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-100">
                  <Link
                    href="/app_client/edit-account"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    <span>{t("common.editAccount")}</span>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <div className="px-4 py-1 text-xs text-gray-500">{t("common.registerAs")}</div>

                  <Link href="/register/delivery-man" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.deliveryMan")}
                  </Link>

                  <Link href="/register/shopkeeper" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.shopkeeper")}
                  </Link>

                  <Link href="/register/service-provider" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.serviceProvider")}
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <Link href="/logout" className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>{t("common.logout")}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/app_client/edit-account" className="text-green-500 hover:underline flex items-center">
            <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
            {t("common.back")}
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">{t("auth.changePassword")}</h1>

          <div className="bg-white rounded-lg shadow-md p-6">
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">{success}</div>
            )}

            {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("auth.currentPassword")}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("auth.newPassword")}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <p className="mt-1 text-xs text-gray-500">{t("auth.passwordRequirements")}</p>
              </div>

              <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("auth.confirmNewPassword")}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    value={formData.confirmNewPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Link
                  href="/app_client/edit-account"
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
          </div>
        </div>
      </main>
    </div>
  )
}