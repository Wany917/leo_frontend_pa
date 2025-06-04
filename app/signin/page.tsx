"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDownIcon, CheckIcon } from "lucide-react"
import { useLanguage } from "@/components/language-context"

type AccountType = "Client" | "DeliveryMan" | "ServiceProvider" | "Shopkeeper"

interface AccountOption {
  id: AccountType
  label: string
  requiresDocuments: boolean
}

export default function SignupPage() {
  const { t } = useLanguage()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    firstname: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  })

  const [selectedAccounts, setSelectedAccounts] = useState<AccountType[]>(["Client"])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const [error, setError] = useState("") // État pour afficher les erreurs

  const countries = ["France", "United Kingdom", "Germany", "Spain", "Italy", "Belgium", "Netherlands", "Switzerland"]

  const accountOptions: AccountOption[] = [
    { id: "Client", label: t("auth.client"), requiresDocuments: false },
    { id: "DeliveryMan", label: t("auth.deliveryMan"), requiresDocuments: true },
    { id: "ServiceProvider", label: t("auth.serviceProvider"), requiresDocuments: true },
    { id: "Shopkeeper", label: t("auth.shopkeeper"), requiresDocuments: true },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const selectCountry = (country: string) => {
    setFormData((prev) => ({ ...prev, country }))
    setShowCountryDropdown(false)
  }

  const toggleAccountType = (accountType: AccountType) => {
    setSelectedAccounts((prev) => {
      if (accountType === "Client" && prev.includes("Client")) return prev
      if (prev.includes(accountType)) return prev.filter((type) => type !== accountType)
      return [...prev, accountType]
    })
  }

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/
    return passwordRegex.test(password)
  }

  const areAllFieldsFilled = (): boolean => {
    return Object.entries(formData).every(([key, value]) => value.trim() !== "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("") // Réinitialiser l'erreur

    // Vérification que tous les champs sont remplis
    if (!areAllFieldsFilled()) {
      setError(t("auth.allFieldsRequired"))
      return
    }

    // Validation du mot de passe
    if (!validatePassword(formData.password)) {
      setError(t("auth.passwordRequirements"))
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.passwordsDoNotMatch"))
      return
    }

    setIsSubmitting(true)

    try {
      const genRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/codes-temporaire/generate-code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_info: `{'first_name': '${formData.firstname}', 'last_name': '${formData.name}', 'email': '${formData.email}'}`
          }),
        }
      )
      if (!genRes.ok) {
        throw new Error("failed to generate code")
      }
      const { code: verificationCode } = await genRes.json()

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: formData.email,
          subject: t("auth.verificationEmailSubject"),
          body: `
            <h2>${t("auth.welcomeToEcoDeli")}</h2>
            <p>${t("auth.thankYouForSigningUp", { firstname: formData.firstname })}</p>
            <p>${t("auth.yourVerificationCode")}:</p>
            <h3 style="font-size: 24px; color: #10B981;">${verificationCode}</h3>
            <p>${t("auth.enterCodeToVerify")}</p>
          `,
        }),
      })

      const requiresDocuments = selectedAccounts.some(
        (type) => accountOptions.find((opt) => opt.id === type)?.requiresDocuments
      )

      if (requiresDocuments) {
        // Rediriger vers la page de téléchargement des documents en fonction du compte
        const accountWithDocuments = selectedAccounts.find(
          (type) => accountOptions.find((opt) => opt.id === type)?.requiresDocuments
        )

        switch (accountWithDocuments) {
          case "DeliveryMan":
            router.push("/documents-verification/deliveryman")
            break
          case "ServiceProvider":
            router.push("/documents-verification/service-provider")
            break
          case "Shopkeeper":
            router.push("/documents-verification/shopkeeper")
            break
          default:
            router.push("/documents-verification")
            break
        }
      } else {
        // Rediriger vers la vérification d'e-mail
        sessionStorage.setItem("signupInfo", JSON.stringify({ formData }))
        router.push("/verify-email")
      }
    } catch (error) {
      console.error("Error sending email:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-5xl mx-4 my-8">
        <h1 className="text-2xl font-semibold text-center mb-2">{t("auth.createAccount")}</h1>

        <p className="text-gray-600 text-center mb-8">{t("auth.createAccountDescription")}</p>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Première colonne */}
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-2">
                  {t("auth.name")}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t("auth.enterName")}
                  className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                  required
                />
              </div>

              <div>
                <label htmlFor="firstname" className="block text-gray-700 mb-2">
                  {t("auth.firstName")}
                </label>
                <input
                  id="firstname"
                  name="firstname"
                  type="text"
                  value={formData.firstname}
                  onChange={handleChange}
                  placeholder={t("auth.enterFirstName")}
                  className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                  required
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-gray-700 mb-2">
                  {t("auth.dateOfBirth")}
                </label>
                <div className="relative">
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="text"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    placeholder={t("auth.enterDateOfBirth")}
                    className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                    required
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => (e.target.type = "text")}
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">{t("auth.accountTypes")}</label>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50 text-left flex justify-between items-center"
                    onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  >
                    <span>
                      {selectedAccounts.length === 1
                        ? accountOptions.find((opt) => opt.id === selectedAccounts[0])?.label
                        : t("auth.multipleAccountTypesSelected", { count: selectedAccounts.length })}
                    </span>
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  </button>

                  {showAccountDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {accountOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className="flex w-full text-left px-4 py-2 hover:bg-gray-100 justify-between items-center"
                          onClick={() => toggleAccountType(option.id)}
                          disabled={option.id === "Client"}
                        >
                          <span>{option.label}</span>
                          {selectedAccounts.includes(option.id) && <CheckIcon className="h-4 w-4 text-green-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedAccounts.some((type) => type !== "Client") && (
                  <p className="text-sm text-amber-600 mt-2">
                    {t("auth.additionalDocumentsRequired")}
                  </p>
                )}
              </div>
            </div>

            {/* Deuxième colonne */}
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  {t("auth.email")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("auth.enterEmail")}
                  className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-gray-700 mb-2">
                  {t("auth.phone")}
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t("auth.enterPhone")}
                  className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-gray-700 mb-2">
                  {t("auth.password")}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t("auth.enterPassword")}
                  className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                  {t("auth.confirmPassword")}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t("auth.confirmPasswordPlaceholder")}
                  className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                  required
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="address" className="block text-gray-700 mb-2">
                  {t("auth.address")}
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder={t("auth.enterAddress")}
                  className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                  required
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-gray-700 mb-2">
                  {t("auth.city")}
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder={t("auth.enterCity")}
                  className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                  required
                />
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-gray-700 mb-2">
                  {t("auth.postalCode")}
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder={t("auth.enterPostalCode")}
                  className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                  required
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-gray-700 mb-2">
                  {t("auth.country")}
                </label>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50 text-left flex justify-between items-center"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  >
                    <span>{formData.country || t("auth.selectCountry")}</span>
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  </button>

                  {showCountryDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {countries.map((country) => (
                        <button
                          key={country}
                          type="button"
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => selectCountry(country)}
                        >
                          {country}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-12 py-3 bg-green-50 text-white rounded-md hover:bg-green-400 transition-colors disabled:opacity-70"
            >
              {isSubmitting ? t("auth.creatingAccount") : t("auth.signUp")}
            </button>

            <div className="mt-4 text-center">
              <span className="text-gray-600">{t("auth.alreadyHaveAccount")} </span>
              <Link href="/login" className="text-green-50 hover:underline">
                {t("auth.login")}
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}