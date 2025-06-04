"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/components/language-context"

const gifSrc = "/giphy.gif"

export default function PendingValidationPage() {
  const router = useRouter()
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <Card className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
        <CardContent className="p-8 flex flex-col items-center space-y-6">
          <h1 className="text-2xl font-bold text-center">
            {t("shopkeeper.pendingThanksTitle")}
          </h1>
          <div className="text-center text-gray-700 space-y-2">
            <p>{t("shopkeeper.pendingMessageLine1")}</p>
            <p>{t("shopkeeper.pendingMessageLine2")}</p>
          </div>
          <img
            src={gifSrc}
            alt="Quality work"
            className="w-full h-auto rounded-lg shadow-md"
          />
          <Button
            onClick={() => router.push("/app_client")}
            className="bg-green-50 hover:bg-green-600 text-white px-6 py-2 rounded-md"
          >
            {t("common.appClient")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}