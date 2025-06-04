"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Download, Upload, ChevronDown } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"

export default function DeliverymanEditJustificative() {
  const { t } = useLanguage()
  const [files, setFiles] = useState({
    licence: {
      current: "Charlotte_Licence.pdf",
      new: null as File | null,
    },
    id: {
      current: "ID_Charlotte.pdf",
      new: null as File | null,
    },
  })

  // Handle file selection for licence
  const handleLicenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => ({
        ...prev,
        licence: {
          ...prev.licence,
          new: e.target.files![0],
        },
      }))
    }
  }

  // Handle file selection for ID
  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => ({
        ...prev,
        id: {
          ...prev.id,
          new: e.target.files![0],
        },
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white p-4 flex justify-between items-center shadow-sm">
        <Link href="/app_deliveryman" className="flex items-center">
          <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto" />
        </Link>

        <div className="flex items-center mr-20">
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">

        <div className="mb-6">
          <Link href="/app_deliveryman/edit-account" className="text-green-500 hover:underline flex items-center">
            <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
            {t("common.back")}
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 my-8">
          <h1 className="text-2xl font-semibold text-center mb-12">
            {t("deliveryman.editJustificative.editYourJustificativePieces")}
          </h1>

          {/* Licence Section */}
          <div className="mb-10">
            <h2 className="text-center font-medium mb-4">{t("deliveryman.editJustificative.yourLicence")}</h2>

            <div className="flex items-center justify-center mb-4">
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-l-md hover:bg-gray-300 transition-colors">
                <Download className="h-5 w-5 inline mr-2" />
                {t("deliveryman.editJustificative.download")}
              </button>
              <div className="bg-gray-100 px-4 py-2 rounded-r-md flex-grow max-w-md">{files.licence.current}</div>
            </div>

            <div className="flex items-center justify-center">
              <label
                htmlFor="licence-upload"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-l-md hover:bg-gray-300 transition-colors cursor-pointer"
              >
                <Upload className="h-5 w-5 inline mr-2" />
                {t("deliveryman.editJustificative.upload")}
              </label>
              <div className="bg-gray-100 px-4 py-2 rounded-r-md flex-grow max-w-md text-gray-500">
                {files.licence.new ? files.licence.new.name : t("deliveryman.editJustificative.uploadNewLicence")}
              </div>
              <input id="licence-upload" type="file" accept=".pdf" onChange={handleLicenceUpload} className="hidden" />
            </div>
          </div>

          {/* ID Section */}
          <div className="mb-12">
            <h2 className="text-center font-medium mb-4">{t("deliveryman.editJustificative.yourID")}</h2>

            <div className="flex items-center justify-center mb-4">
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-l-md hover:bg-gray-300 transition-colors">
                <Download className="h-5 w-5 inline mr-2" />
                {t("deliveryman.editJustificative.download")}
              </button>
              <div className="bg-gray-100 px-4 py-2 rounded-r-md flex-grow max-w-md">{files.id.current}</div>
            </div>

            <div className="flex items-center justify-center">
              <label
                htmlFor="id-upload"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-l-md hover:bg-gray-300 transition-colors cursor-pointer"
              >
                <Upload className="h-5 w-5 inline mr-2" />
                {t("deliveryman.editJustificative.upload")}
              </label>
              <div className="bg-gray-100 px-4 py-2 rounded-r-md flex-grow max-w-md text-gray-500">
                {files.id.new ? files.id.new.name : t("deliveryman.editJustificative.uploadNewID")}
              </div>
              <input id="id-upload" type="file" accept=".pdf" onChange={handleIdUpload} className="hidden" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              className="px-8 py-2 bg-green-50 text-white rounded-md hover:bg-green-400 transition-colors"
            >
              {t("deliveryman.editJustificative.confirm")}
            </button>
            <Link
              href="/deliveryman/edit-account"
              className="px-8 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              {t("deliveryman.editJustificative.quit")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}