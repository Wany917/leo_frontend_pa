"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Download, ChevronDown } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface AnalyzeComplaintContentProps {
  id: string
}

export function AnalyzeComplaintContent({ id }: AnalyzeComplaintContentProps) {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)

  // Données fictives pour la réclamation
  const complaintData = {
    id: id,
    client: "Killian",
    announceId: "000001",
    shippingPrice: "£20.00",
    justificativePieces: [
      { id: 1, name: "Picture_1_damage.png", url: "#" },
      { id: 2, name: "Picture_2_damage.png", url: "#" },
    ],
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.",
  }

  const handleAccept = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = "/complaints"
    }, 1000)
  }

  const handleReject = () => {
    setIsLoading(true)
    // Simuler une requête API
    setTimeout(() => {
      setIsLoading(false)
      // Rediriger vers la page des réclamations
      window.location.href = "/complaints"
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("admin.analyzeComplaintOf")} {complaintData.client}</h1>

      <Link href="/admin/complaints" className="text-green-50 hover:underline flex items-center">
        <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
        {t("common.back")}
      </Link>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label htmlFor="announceId" className="text-gray-500 mb-2 block">
              {t("admin.announcementId")}
            </Label>
            <Input id="announceId" value={complaintData.announceId} readOnly className="bg-gray-50" />
          </div>
          <div>
            <Label htmlFor="shippingPrice" className="text-gray-500 mb-2 block">
              {t("admin.shippingPrice")}
            </Label>
            <Input id="shippingPrice" value={complaintData.shippingPrice} readOnly className="bg-gray-50" />
          </div>
        </div>

        <div className="mb-6">
          <Label className="text-gray-500 mb-2 block">{t("admin.userJustificative")}</Label>
          {complaintData.justificativePieces.map((piece) => (
            <div key={piece.id} className="flex items-center mb-2 bg-gray-50 rounded-md p-2">
              <Button variant="ghost" size="sm" className="bg-gray-200 hover:bg-gray-300 mr-2">
                <Download className="h-4 w-4 mr-1" />
                {t("admin.download")}
              </Button>
              <span className="text-gray-600">{piece.name}</span>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <Label htmlFor="description" className="text-gray-500 mb-2 block">
            {t("admin.description")}
          </Label>
          <Textarea id="description" value={complaintData.description} readOnly className="bg-gray-50 min-h-[120px]" />
        </div>

        <div className="flex flex-col space-y-4">
          <Button onClick={handleAccept} disabled={isLoading} className="bg-[#8CD790] hover:bg-[#7ac57e] text-white">
            {t("common.accept")}
          </Button>
          <Button
            onClick={handleReject}
            disabled={isLoading}
            variant="destructive"
            className="bg-[#E57373] hover:bg-[#ef5350]"
          >
            {t("common.reject")}
          </Button>
        </div>
      </div>
    </div>
  )
}

