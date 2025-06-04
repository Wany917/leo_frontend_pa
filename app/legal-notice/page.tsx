"use client"

import Link from "next/link"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"
import Image from "next/image"


export default function LegalNoticePage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/">
                <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto" />
          </Link>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-green-50 mb-6">{t("legalNotice.title")}</h1>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{t("legalNotice.companyInfo")}</h2>
            <p className="text-gray-600">
              {t("legalNotice.companyName")}: EcoDeli<br />
              {t("legalNotice.address")}: 123 Rue des Livraisons, 75001 Paris, France<br />
              {t("legalNotice.phone")}: +33 1 23 45 67 89<br />
              {t("legalNotice.email")}: contact@ecodeli.com
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{t("legalNotice.hostingInfo")}</h2>
            <p className="text-gray-600">
              {t("legalNotice.hostingProvider")}: OVH<br />
              {t("legalNotice.hostingAddress")}: 2 Rue Kellermann, 59100 Roubaix, France<br />
              {t("legalNotice.hostingPhone")}: +33 9 72 10 10 07
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{t("legalNotice.intellectualProperty")}</h2>
            <p className="text-gray-600">
              {t("legalNotice.intellectualPropertyText")}
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{t("legalNotice.liability")}</h2>
            <p className="text-gray-600">
              {t("legalNotice.liabilityText")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{t("legalNotice.contactUs")}</h2>
            <p className="text-gray-600">
              {t("legalNotice.contactText")}
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}