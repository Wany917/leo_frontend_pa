"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Minus, Package, MapPin } from "lucide-react"
import { useLanguage } from "@/components/language-context"

interface AddressSuggestion {
  label: string
  value: string
}

export default function CreateAnnouncementPage() {
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(0) // 0: type de livraison, 1: nombre de colis, 2: adresses, 3: date de livraison, 4: détails des colis
  const [packageCount, setPackageCount] = useState(1)
  const [currentPackage, setCurrentPackage] = useState(1)
  const [deliveryType, setDeliveryType] = useState<"normal" | "cart">("normal")

  // États pour les adresses
  const [destinationAddress, setDestinationAddress] = useState("")
  const [startingSuggestions, setStartingSuggestions] = useState<AddressSuggestion[]>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<AddressSuggestion[]>([])
  const [showStartingSuggestions, setShowStartingSuggestions] = useState(false)
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false)
  const [isLoadingStartingSuggestions, setIsLoadingStartingSuggestions] = useState(false)
  const [isLoadingDestinationSuggestions, setIsLoadingDestinationSuggestions] = useState(false)
  const [startingType, setStartingType] = useState<'address' | 'box'>('address')
  const [startingAddress, setStartingAddress] = useState("")
  const [startingBox, setStartingBox] = useState("")

  // État pour la date de livraison
  const [deliveryDate, setDeliveryDate] = useState("")

  const [packages, setPackages] = useState<any[]>([
    {
      priorityShipping: false,
      image: null,
      imagePreview: null,
    },
  ])

  const startingSuggestionsRef = useRef<HTMLDivElement | null>(null)
  const destinationSuggestionsRef = useRef<HTMLDivElement | null>(null)

  // Effet pour gérer les clics en dehors des suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (startingSuggestionsRef.current && !startingSuggestionsRef.current.contains(event.target as Node)) {
        setShowStartingSuggestions(false)
      }
      if (destinationSuggestionsRef.current && !destinationSuggestionsRef.current.contains(event.target as Node)) {
        setShowDestinationSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Fonction pour rechercher des adresses avec l'API
  const searchAddresses = async (query: string, isStarting: boolean) => {
    if (query.length < 3) {
      if (isStarting) {
        setStartingSuggestions([])
        setShowStartingSuggestions(false)
      } else {
        setDestinationSuggestions([])
        setShowDestinationSuggestions(false)
      }
      return
    }

    try {
      if (isStarting) {
        setIsLoadingStartingSuggestions(true)
      } else {
        setIsLoadingDestinationSuggestions(true)
      }

      // Appel à l'API d'adresses
      const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`)
      const data = await response.json()

      const suggestions = data.features.map((feature: any) => ({
        label: feature.properties.label,
        value: feature.properties.label,
      }))

      if (isStarting) {
        setStartingSuggestions(suggestions)
        setShowStartingSuggestions(true)
        setIsLoadingStartingSuggestions(false)
      } else {
        setDestinationSuggestions(suggestions)
        setShowDestinationSuggestions(true)
        setIsLoadingDestinationSuggestions(false)
      }
    } catch (error) {
      console.error("Error fetching address suggestions:", error)
      if (isStarting) {
        setIsLoadingStartingSuggestions(false)
      } else {
        setIsLoadingDestinationSuggestions(false)
      }
    }
  }

  // Debounce pour les recherches d'adresses
  useEffect(() => {
    const timer = setTimeout(() => {
      searchAddresses(startingAddress, true)
    }, 300)

    return () => clearTimeout(timer)
  }, [startingAddress])

  useEffect(() => {
    const timer = setTimeout(() => {
      searchAddresses(destinationAddress, false)
    }, 300)

    return () => clearTimeout(timer)
  }, [destinationAddress])

  const handlePackageCountChange = (count: number) => {
    if (count < 1) return
    setPackageCount(count)

    // Ajuster le tableau des packages
    if (count > packages.length) {
      const newPackages = [...packages]
      for (let i = packages.length; i < count; i++) {
        newPackages.push({
          priorityShipping: false,
          image: null,
          imagePreview: null,
        })
      }
      setPackages(newPackages)
    } else if (count < packages.length) {
      setPackages(packages.slice(0, count))
      if (currentPackage > count) {
        setCurrentPackage(count)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simuler une soumission
    setTimeout(() => {
      setIsSubmitting(false)
      window.location.href = "/app_shopkeeper/announcements"
    }, 1500)
  }

  const proceedToPackageCountStep = () => setStep(1)
  const proceedToAddressStep = () => setStep(2)
  const proceedToDeliveryDateStep = () => setStep(3)
  const proceedToPackageDetails = () => setStep(4)
  const goBackToPackageCount = () => setStep(1)
  const goBackToDeliveryType = () => setStep(0)
  const goBackToAddressStep = () => setStep(2)
  const goBackToDeliveryDateStep = () => setStep(3)

  const selectStartingAddress = (suggestion: AddressSuggestion) => {
    setStartingAddress(suggestion.value)
    setShowStartingSuggestions(false)
  }

  const selectDestinationAddress = (suggestion: AddressSuggestion) => {
    setDestinationAddress(suggestion.value)
    setShowDestinationSuggestions(false)
  }

  function goToPreviousPackage(event: React.MouseEvent<HTMLButtonElement>): void {
    throw new Error("Function not implemented.")
  }

  function goToNextPackage(event: React.MouseEvent<HTMLButtonElement>): void {
    throw new Error("Function not implemented.")
  }

  function togglePriorityShipping(index: number): void {
    throw new Error("Function not implemented.")
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>, index: number): void {
    throw new Error("Function not implemented.")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href="/app_shopkeeper/announcements" className="text-gray-600 hover:text-green-500 mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-green-400">{t("announcements.goBackToAnnouncements")}</h1>
          </div>

          {/* Étape 0: Choix du type de livraison */}
          {step === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-medium text-gray-800 mb-6">
                {t("announcements.selectDeliveryType") || "Sélectionnez le type de livraison"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
                {/* Option de livraison normale */}
                <div
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    deliveryType === "normal"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300 hover:bg-green-50/50"
                  }`}
                  onClick={() => setDeliveryType("normal")}
                >
                  <div className="flex flex-col items-center text-center">
                    <Package className="h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t("announcements.normalDelivery") || "Livraison normale"}</h3>
                    <p className="text-gray-600 text-sm">
                      {t("announcements.normalDeliveryDescription") || "Livraison standard pour vos colis et paquets"}
                    </p>
                  </div>
                </div>

                {/* Option de lâché de chariot */}
                <div
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    deliveryType === "cart"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300 hover:bg-green-50/50"
                  }`}
                  onClick={() => setDeliveryType("cart")}
                >
                  <div className="flex flex-col items-center text-center">
                    <Package className="h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t("announcements.cartDropOff") || "Lâché de chariot"}</h3>
                    <p className="text-gray-600 text-sm">
                      {t("announcements.cartDropOffDescription") || "Livraison de plusieurs articles par chariot"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  onClick={proceedToPackageCountStep}
                  className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  {t("common.next") || "Continuer"}
                </button>
              </div>
            </div>
          )}

          {/* Étape 1: Sélection du nombre de colis */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-medium text-gray-800 mb-6">{t("announcements.selectPackageCount")}</h2>

              <div className="flex flex-col items-center justify-center py-8">
                <div className="flex items-center justify-center mb-8">
                  <button
                    type="button"
                    onClick={() => handlePackageCountChange(packageCount - 1)}
                    className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                    disabled={packageCount <= 1}
                  >
                    <Minus className="h-5 w-5 text-gray-700" />
                  </button>

                  <div className="mx-8 text-center">
                    <div className="text-5xl font-bold text-green-500">{packageCount}</div>
                    <div className="text-gray-500 mt-2">{t("announcements.packages")}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePackageCountChange(packageCount + 1)}
                    className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                  >
                    <Plus className="h-5 w-5 text-gray-700" />
                  </button>
                </div>

                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {Array.from({ length: packageCount }).map((_, index) => (
                    <div key={index} className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-green-500" />
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mt-4 gap-4">
                  <button
                    type="button"
                    onClick={goBackToDeliveryType}
                    className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    {t("common.back")}
                  </button>
                  <button
                    type="button"
                    onClick={proceedToAddressStep}
                    className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    {t("announcements.continueToAddresses")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Saisie des adresses */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-medium text-gray-800 mb-6">{t("announcements.enterAddresses")}</h2>

              <div className="space-y-6">
                {/* Adresse de départ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("announcements.startingPoint")}</label>
                  <div className="flex items-center space-x-6 mb-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="startingType"
                        value="address"
                        checked={startingType === 'address'}
                        onChange={() => setStartingType('address')}
                        className="h-4 w-4 text-green-500"
                      />
                      <span>{t("announcements.addressOption")}</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="startingType"
                        value="box"
                        checked={startingType === 'box'}
                        onChange={() => setStartingType('box')}
                        className="h-4 w-4 text-green-500"
                      />
                      <span>{t("announcements.boxOption")}</span>
                    </label>
                  </div>
                  {startingType === 'address' ? (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="startingAddress"
                        value={startingAddress}
                        onChange={e => setStartingAddress(e.target.value)}
                        onFocus={() => startingAddress.length >= 3 && setShowStartingSuggestions(true)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder={t("announcements.enterStartingAddress")}
                      />
                      {isLoadingStartingSuggestions && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-green-500 rounded-full" />
                        </div>
                      )}
                      {showStartingSuggestions && startingSuggestions.length > 0 && (
                        <div ref={startingSuggestionsRef} className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                          {startingSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                              onClick={() => selectStartingAddress(suggestion)}
                            >
                              <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                              <span className="text-sm">{suggestion.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <select
                      id="startingBox"
                      name="startingBox"
                      value={startingBox}
                      onChange={e => setStartingBox(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">{t("common.selectYourStorageBox")}</option>
                      <option value="Storage box 1">Storage box 1</option>
                      <option value="Storage box 2">Storage box 2</option>
                      <option value="Storage box 3">Storage box 3</option>
                    </select>
                  )}
                </div>

                {/* Adresse de destination */}
                <div className="relative">
                  <label htmlFor="destinationAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("announcements.whereTo")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="destinationAddress"
                      value={destinationAddress}
                      onChange={(e) => setDestinationAddress(e.target.value)}
                      onFocus={() => destinationAddress.length >= 3 && setShowDestinationSuggestions(true)}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={t("announcements.enterDestinationAddress")}
                      required
                    />
                    {isLoadingDestinationSuggestions && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-green-500 rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* Suggestions d'adresses de destination */}
                  {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                    <div
                      ref={destinationSuggestionsRef}
                      className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto"
                    >
                      {destinationSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                          onClick={() => selectDestinationAddress(suggestion)}
                        >
                          <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-sm">{suggestion.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={goBackToPackageCount}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    {t("common.back")}
                  </button>
                  <button
                    type="button"
                    onClick={proceedToDeliveryDateStep}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    disabled={
                      startingType === 'address'
                        ? !startingAddress
                        : !startingBox
                    }
                  >
                    {t("announcements.continueToDeliveryDate")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Étape 3: Date de livraison */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-medium text-gray-800 mb-6">{t("announcements.deliveryDate")}</h2>

              <div className="mb-6">
                <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("announcements.selectDeliveryDate")}
                </label>
                <input
                  type="date"
                  id="deliveryDate"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={goBackToAddressStep}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {t("common.back")}
                </button>
                <button
                  type="button"
                  onClick={proceedToPackageDetails}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  disabled={!deliveryDate}
                >
                  {t("announcements.continueToDetails")}
                </button>
              </div>
            </div>
          )}

          {/* Étape 4: Détails des colis */}
          {step === 4 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-800">
                  {t("announcements.packageDetails")} {currentPackage}/{packageCount}
                </h2>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={goToPreviousPackage}
                    disabled={currentPackage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {t("common.previous")}
                  </button>
                  <button
                    type="button"
                    onClick={goToNextPackage}
                    disabled={currentPackage === packageCount}
                    className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {t("common.next")}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {packages.map((pkg, index) => (
                  <div key={index} className={index + 1 === currentPackage ? "block" : "hidden"}>
                    <div className="flex flex-col items-center mb-8">
                      <div className="w-64 h-64 mb-2 relative">
                        {pkg.imagePreview ? (
                          <img
                            src={pkg.imagePreview || "/placeholder.svg"}
                            alt={`Package ${index + 1} preview`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
                            <span className="text-gray-400">{t("announcements.noImage")}</span>
                          </div>
                        )}
                      </div>
                      <label
                        htmlFor={`photo-upload-${index}`}
                        className="text-green-500 hover:text-green-600 cursor-pointer text-sm"
                      >
                        {pkg.imagePreview ? t("announcements.editPhoto") : t("announcements.addPhoto")}
                        <input
                          id={`photo-upload-${index}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageChange(e, index)}
                        />
                      </label>
                    </div>

                    <div>
                      <label htmlFor={`name-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                        {t("announcements.packageName")}
                      </label>
                      <input
                        type="text"
                        id={`name-${index}`}
                        name={`package_${index + 1}_name`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                      <div>
                        <label htmlFor={`price-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          {t("announcements.price")}
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
                          <input
                            type="number"
                            id={`price-${index}`}
                            name={`package_${index + 1}_price`}
                            min="0"
                            step="0.01"
                            className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor={`weight-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          {t("announcements.weight")}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            id={`weight-${index}`}
                            name={`package_${index + 1}_weight`}
                            min="0"
                            step="0.1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          />
                          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">kg</span>
                        </div>
                      </div>
                    </div>  

                    <div className="mt-8">
                      <label htmlFor={`packageSize-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                        {t("announcements.packageSize")}
                      </label>
                      <select
                        id={`packageSize-${index}`}
                        name={`package_${index + 1}_packageSize`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="">{t("common.selectYourPackageSize")}</option>
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                      </select>
                    </div>

                    <div className="flex items-center mt-8">
                      <input
                        type="checkbox"
                        id={`priorityShipping-${index}`}
                        name={`package_${index + 1}_priorityShipping`}
                        checked={pkg.priorityShipping}
                        onChange={() => togglePriorityShipping(index)}
                        className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`priorityShipping-${index}`} className="ml-2 block text-sm text-gray-700">
                        {t("announcements.activatePriorityShipping")}
                      </label>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-800">
                      {t("announcements.priorityShippingInfo")}
                    </div>
                  </div>
                ))}

                <div className="flex justify-between space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={goBackToDeliveryDateStep}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    {t("common.back")}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t("common.adding") : t("announcements.addNow")}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}