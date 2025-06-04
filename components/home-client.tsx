"use client"

import Image from "next/image"
import Link from "next/link"
import { CheckIcon } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import LanguageSelector from "@/components/language-selector"
import { useLanguage } from "@/components/language-context"

export default function HomeClient() {
  const { t } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    const token =
      sessionStorage.getItem("authToken") ||
      localStorage.getItem("authToken")
    if (!token) return ;(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        )
        if (res.ok) {
          router.push("/app_client")
        }
      } catch (err) {
        console.error("Auth check failed", err)
      }
    })()
  }, [router])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="container mx-auto flex flex-col sm:flex-row justify-between items-center py-4 px-4 gap-4">
        <div className="flex items-center">
          <Link href="/">
            <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto" />
          </Link>
        </div>

        <div className="flex items-center ml-auto mr-4">
          <LanguageSelector />
        </div>

        <div className="flex gap-2">
          <Link
            href="/signin"
            className="px-4 py-2 rounded-md bg-green-100 text-green-500 hover:bg-green-200 transition-colors"
          >
            {t("common.signup")}
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-md bg-green-50 text-white hover:bg-green-600 transition-colors"
          >
            {t("common.login")}
          </Link>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto text-center py-8 sm:py-16 px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 max-w-2xl mx-auto">
            {t("app_client.welcome")}
          </h1>
        </section>

        {/* Features Section */}
        <section className="container mx-auto py-8 sm:py-16 px-4">
          <h2 className="text-2xl font-bold text-center mb-2">{t("home.coolThings")}</h2>
          <p className="text-center text-gray-600 mb-8 sm:mb-12">{t("home.thingsToKnow")}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-red-500"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">{t("home.fastDeliveries")}</h3>
              <p className="text-gray-600">{t("home.fastDeliveriesDesc")}</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-green-500"
                >
                  <path
                    d="M8 3V7M16 3V7M3 10H21M5 5H19C20.1046 5 21 5.89543 21 7V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V7C3 5.89543 3.89543 5 5 5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">{t("home.easyInterface")}</h3>
              <p className="text-gray-600">{t("home.easyInterfaceDesc")}</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-yellow-500"
                >
                  <path
                    d="M12 15V17M12 7V13M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">{t("home.newFeature")}</h3>
              <p className="text-gray-600">{t("home.newFeatureDesc")}</p>
            </div>
          </div>
        </section>

        {/* Metrics Section */}
        <section className="container mx-auto py-8 sm:py-16 px-4">
          <h2 className="text-2xl font-bold text-center mb-8 sm:mb-12">{t("home.metrics")}</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold">100k+</p>
              <p className="text-gray-600">{t("home.packagesDelivered")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold">93k+</p>
              <p className="text-gray-600">{t("home.servicesAvailable")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold">20k+</p>
              <p className="text-gray-600">{t("home.newUsers")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold">120k+</p>
              <p className="text-gray-600">{t("home.satisfiedClients")}</p>
            </div>
          </div>

          <div className="border-t border-b border-green-200 my-8"></div>
        </section>

        {/* Pricing Section */}
        <section className="container mx-auto py-8 sm:py-16 px-4">
          <h2 className="text-2xl font-bold text-center mb-2">{t("home.pricing")}</h2>
          <p className="text-center text-gray-600 mb-8 sm:mb-12">{t("home.pricingDesc")}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="border rounded-lg p-6">
              <h3 className="font-medium mb-4">{t("home.free")}</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-bold">0 €</span>
                <span className="text-gray-600 ml-1">/{t("home.month")}</span>
              </div>
              <p className="text-gray-600 mb-6">{t("home.forSmallOccasions")}</p>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <span className="text-sm">{t("home.priorityShipping")}</span>
                </li>
              </ul>

              <button className="w-full py-2 px-4 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors">
                {t("home.getStarted")}
              </button>
            </div>

            {/* Starter Plan */}
            <div className="border rounded-lg p-6">
              <h3 className="font-medium mb-4">{t("home.starter")}</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-bold">9.90 €</span>
                <span className="text-gray-600 ml-1">/{t("home.month")}</span>
              </div>
              <p className="text-gray-600 mb-6">{t("home.idealForMonthly")}</p>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-sm">{t("home.insurance")}</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-sm">{t("home.discount")}</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-sm">{t("home.priorityShippingStarter")}</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-sm">{t("home.permanentReduction")}</span>
                </li>
              </ul>

              <button className="w-full py-2 px-4 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors">
                {t("home.getStarted")}
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-green-50 text-white rounded-lg p-6">
              <h3 className="font-medium mb-4">{t("home.premium")}</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-bold">19.99 €</span>
                <span className="text-white ml-1">/{t("home.month")}</span>
              </div>
              <p className="text-white mb-6">{t("home.idealForWeekly")}</p>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-white mr-2 mt-0.5" />
                  <span className="text-sm">{t("home.insurancePremium")}</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-white mr-2 mt-0.5" />
                  <span className="text-sm">{t("home.discountPremium")}</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-white mr-2 mt-0.5" />
                  <span className="text-sm">{t("home.priorityShippingPremium")}</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-white mr-2 mt-0.5" />
                  <span className="text-sm">{t("home.permanentReductionPremium")}</span>
                </li>
              </ul>

              <button className="w-full py-2 px-4 bg-white text-green-500 rounded-md hover:bg-green-600 hover:text-white transition-colors">
                {t("home.getStarted")}
              </button>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="container mx-auto py-8 sm:py-16 px-4">
          <h2 className="text-2xl font-bold text-center mb-2">{t("home.stayTuned")}</h2>
          <p className="text-center text-gray-600 mb-8 sm:mb-12">{t("home.newsletterDesc")}</p>

          <div className="max-w-md mx-auto">
            <form className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm text-gray-600 mb-1">
                  {t("auth.fullName")}
                </label>
                <input
                  type="text"
                  id="fullName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm text-gray-600 mb-1">
                  {t("auth.emailAddress")}
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-green-50 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                {t("common.submit")}
              </button>

              <div className="text-center text-gray-600 text-sm">
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-green-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <div className="mb-6 md:mb-0">
              <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto mb-2" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-8 mt-6">
              <div>
                <Link href="/legal-notice">
                  <p className="text-sm font-bold mb-4">{t("footer.legalNotice")}</p>
                </Link>
              </div>
              <div>
                <Link href="/app_client">
                  <p className="text-sm font-bold mb-4">{t("footer.clientSpace")}</p>
                </Link>
              </div>
              <div>
                <Link href="/app_service-provider">
                  <p className="text-sm font-bold mb-4">{t("footer.serviceProviderSpace").trim()}</p>
                </Link>
              </div>
              <div>
                <Link href="/app_shopkeeper">
                  <p className="text-sm font-bold mb-4">{t("footer.shopkeeperSpace")}</p>
                </Link>
              </div>
              <div>
                <Link href="/app_deliveryman">
                  <p className="text-sm font-bold mb-4">{t("footer.deliverymanSpace")}</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

