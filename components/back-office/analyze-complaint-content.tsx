"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"

interface AnalyzeComplaintContentProps {
  id: string
}

export function AnalyzeComplaintContent({ id }: AnalyzeComplaintContentProps) {
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
    // Simuler une requête API
    setTimeout(() => {
      setIsLoading(false)
      // Rediriger vers la page des réclamations
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
      <h1 className="text-2xl font-bold">Analyze {complaintData.client}&apos;s complaint</h1>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label htmlFor="announceId" className="text-gray-500 mb-2 block">
              Announce&apos;s ID
            </Label>
            <Input id="announceId" value={complaintData.announceId} readOnly className="bg-gray-50" />
          </div>
          <div>
            <Label htmlFor="shippingPrice" className="text-gray-500 mb-2 block">
              Shipping price
            </Label>
            <Input id="shippingPrice" value={complaintData.shippingPrice} readOnly className="bg-gray-50" />
          </div>
        </div>

        <div className="mb-6">
          <Label className="text-gray-500 mb-2 block">Justificative pieces</Label>
          {complaintData.justificativePieces.map((piece) => (
            <div key={piece.id} className="flex items-center mb-2 bg-gray-50 rounded-md p-2">
              <Button variant="ghost" size="sm" className="bg-gray-200 hover:bg-gray-300 mr-2">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <span className="text-gray-600">{piece.name}</span>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <Label htmlFor="description" className="text-gray-500 mb-2 block">
            Description
          </Label>
          <Textarea id="description" value={complaintData.description} readOnly className="bg-gray-50 min-h-[120px]" />
        </div>

        <div className="flex flex-col space-y-4">
          <Button onClick={handleAccept} disabled={isLoading} className="bg-[#8CD790] hover:bg-[#7ac57e] text-white">
            Accept
          </Button>
          <Button
            onClick={handleReject}
            disabled={isLoading}
            variant="destructive"
            className="bg-[#E57373] hover:bg-[#ef5350]"
          >
            Reject
          </Button>
        </div>
      </div>
    </div>
  )
}

