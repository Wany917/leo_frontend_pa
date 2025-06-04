"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star, Upload, X, Camera, ArrowLeft, Trash2 } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"

interface Service {
  id: number
  name: string
  description: string
  price: string
  rating: number
  image: string
}

interface EditServiceContentProps {
  params: { id: string }
}

export default function ServiceProviderEditPage({ params }: EditServiceContentProps) {
  const { id } = useParams()
  const router = useRouter()
  const { t } = useLanguage()

  const [service, setService] = useState<Service | null>(null)
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // États pour la gestion du fichier et de l'aperçu
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    // Simulation de récupération de données
    const services: Service[] = [
      {
        id: 1,
        name: "Dog-sitter",
        description:
          "Professional dog sitting service with years of experience. We take care of your furry friends with love and attention while you're away. Daily walks, feeding, and playtime included.",
        price: "£20/hour",
        rating: 5,
        image: "/dog-sitter.jpg",
      },
    ]
    const serviceId = Number.parseInt(id as string, 10)
    const found = services.find((s) => s.id === serviceId)
    if (found) {
      setService(found)
      setPrice(found.price.replace("£", "").replace("/hour", ""))
      setDescription(found.description)
      setImagePreview(found.image)
    }
  }, [id])

  const renderStars = (rating: number) => (
    <div className="flex">
      {Array.from({ length: 5 }, (_, i) =>
        i < rating ? (
          <Star key={i} className="h-5 w-5 fill-[#FFD700] text-[#FFD700]" />
        ) : (
          <Star key={i} className="h-5 w-5 text-gray-300" />
        ),
      )}
    </div>
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0] ?? null
    if (file && file.type.startsWith("image/")) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setImageFile(null)
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview(service?.image || "")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulation d'envoi de données
    setTimeout(() => {
      setIsLoading(false)
      router.push("/provider/services")
    }, 1000)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this service?")) {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        router.push("/app_service-provider/services")
      }, 1000)
    }
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-50"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header avec bouton de traduction */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-green-50 hover:bg-green-50/10 p-2 h-auto"
            onClick={() => router.push("/app_service-provider/services")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {t("common.back")} 
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aperçu */}
        <Card className="overflow-hidden border-none shadow-lg rounded-xl lg:col-span-1">
          <div className="relative h-48 w-full overflow-hidden">
            {imagePreview ? (
              <img src={imagePreview || "/placeholder.svg"} alt={service.name} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Camera className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-xl font-semibold">{service.name}</h2>
              {renderStars(service.rating)}
            </div>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">
              {description || service.description}
            </p>
            <span className="bg-green-50/20 text-green-50 px-3 py-1.5 rounded-full text-sm font-medium">
              £{price || service.price.replace("£", "").replace("/hour", "")}/hour
            </span>
          </CardContent>
        </Card>

        {/* Formulaire */}
        <Card className="border-none shadow-lg rounded-xl lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">{t("serviceProvider.serviceDetails")}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Prix */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-base font-medium">
                  {t("serviceProvider.price")}
                </Label>
                <div className="flex items-center">
                  <div className="relative flex-1 max-w-[200px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                    <Input
                      id="price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="pl-8 h-12 text-lg"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-medium">
                  {t("serviceProvider.description")}
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="resize-none text-base"
                  required
                />
              </div>

              {/* Upload d'image */}
              <div className="space-y-3">
                <Label htmlFor="image" className="text-base font-medium">
                  {t("serviceProvider.image")}
                </Label>

                <div
                  className={`border-2 border-dashed rounded-xl p-6 transition-colors ${
                    isDragging ? "border-green-50 bg-green-50/5" : "border-gray-300"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    {imagePreview ? (
                      <div className="relative w-full max-w-xs mx-auto">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg shadow-md"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-[#8CD790]" />
                        <p className="text-center text-gray-600">
                          <span className="font-medium">{t("service.uploadImage")}</span>
                        </p>
                        <p className="text-xs text-gray-500">{t("service.imageFormats")}</p>
                      </>
                    )}

                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleFileChange}
                      className={imagePreview ? "hidden" : "absolute inset-0 w-full h-full opacity-0 cursor-pointer"}
                    />

                    {imagePreview && (
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        onClick={() => document.getElementById("image")?.click()}
                      >
                        {t("serviceProvider.changeImage")}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white gap-2"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                  {t("common.delete")}
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/app_service-provider/services")}
                    disabled={isLoading}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-50 hover:bg-green-50 text-white px-6"
                    onClick={() => router.push("/app_service-provider/services")}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        {t("serviceProvider.saving")}
                      </>
                    ) : (
                      t("common.save")
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
