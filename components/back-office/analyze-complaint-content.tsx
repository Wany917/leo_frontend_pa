"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Download, ChevronDown } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { adminService } from "@/services/adminService"

interface AnalyzeComplaintContentProps {
  id: string
}

export function AnalyzeComplaintContent({ id }: AnalyzeComplaintContentProps) {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [complaint, setComplaint] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchComplaint()
  }, [id])

  const fetchComplaint = async () => {
    try {
      setLoading(true)
      const response = await adminService.getComplaint(parseInt(id))
      
      if (response.success && response.data) {
        setComplaint(response.data)
      } else {
        setError('Failed to fetch complaint')
      }
    } catch (err) {
      console.error('Error fetching complaint:', err)
      setError('Error loading complaint')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Loading complaint...</h1>
      </div>
    )
  }

  if (error || !complaint) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Error loading complaint</h1>
        <p className="text-red-500">{error || 'Complaint not found'}</p>
        <Link href="/admin/complaints" className="text-green-500 hover:underline">
          Back to complaints
        </Link>
      </div>
    )
  }

  // Transform backend data to match component format
  const complaintData = {
    id: complaint.id,
    client: complaint.utilisateur?.nom || complaint.utilisateur?.email || 'Unknown User',
    announceId: complaint.relatedOrderId || 'N/A',
    shippingPrice: 'N/A', // This field might need to be added to backend
    justificativePieces: complaint.imagePath ? [
      { id: 1, name: complaint.imagePath.split('/').pop() || 'attachment.png', url: complaint.imagePath }
    ] : [],
    description: complaint.description,
    status: complaint.status,
    priority: complaint.priority
  }

  const handleAccept = async () => {
    try {
      setIsLoading(true)
      await adminService.updateComplaintStatus(parseInt(id), {
        status: 'resolved',
        adminNotes: 'Complaint accepted and resolved by admin'
      })
      window.location.href = "/admin/complaints"
    } catch (err) {
      console.error('Error accepting complaint:', err)
      setError('Failed to accept complaint')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    try {
      setIsLoading(true)
      await adminService.updateComplaintStatus(parseInt(id), {
        status: 'closed',
        adminNotes: 'Complaint rejected by admin'
      })
      window.location.href = "/admin/complaints"
    } catch (err) {
      console.error('Error rejecting complaint:', err)
      setError('Failed to reject complaint')
    } finally {
      setIsLoading(false)
    }
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

