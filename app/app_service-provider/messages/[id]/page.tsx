"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Send } from "lucide-react"
import ResponsiveHeader from "../../responsive-header"
import { useLanguage } from "@/components/language-context"

export default function MessageDetailPage() {
  const { t } = useLanguage()
  const params = useParams()
  const router = useRouter()
  const { id } = params
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [conversation, setConversation] = useState<any>(null)

  // Simuler le chargement des données
  useEffect(() => {
    const timer = setTimeout(() => {
      // Dans une application réelle, vous feriez un appel API ici
      if (id === "1") {
        setConversation({
          id: 1,
          name: "John Doe",
          avatar: "/placeholder.svg?height=40&width=40",
          status: "online",
          messages: [
            {
              id: 1,
              sender: "them",
              text: "Hello! I'm your delivery person for today.",
              time: "10:15 AM",
            },
            {
              id: 2,
              sender: "them",
              text: "I've just picked up your package and will deliver it within the next hour.",
              time: "10:16 AM",
            },
            {
              id: 3,
              sender: "me",
              text: "Great! Thank you for the update.",
              time: "10:20 AM",
            },
            {
              id: 4,
              sender: "them",
              text: "Your package has been delivered successfully.",
              time: "10:30 AM",
            },
          ],
        })
      } else if (id === "2") {
        setConversation({
          id: 2,
          name: "Marie Dupont",
          avatar: "/placeholder.svg?height=40&width=40",
          status: "away",
          messages: [
            {
              id: 1,
              sender: "me",
              text: "Hi Marie, I need a babysitter for tomorrow at 3 PM. Are you available?",
              time: "Yesterday, 2:15 PM",
            },
            {
              id: 2,
              sender: "them",
              text: "Hello! Yes, I'm available tomorrow at 3 PM.",
              time: "Yesterday, 2:30 PM",
            },
            {
              id: 3,
              sender: "me",
              text: "Perfect! How long can you stay?",
              time: "Yesterday, 2:35 PM",
            },
            {
              id: 4,
              sender: "them",
              text: "I'll be there at 3 PM to take care of your kids.",
              time: "Yesterday, 2:40 PM",
            },
          ],
        })
      } else {
        setConversation(null)
      }
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [id])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    // Dans une application réelle, vous enverriez le message à l'API ici
    const newMessage = {
      id: conversation.messages.length + 1,
      sender: "me",
      text: message,
      time: "Just now",
    }

    setConversation({
      ...conversation,
      messages: [...conversation.messages, newMessage],
    })

    setMessage("")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ResponsiveHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <p>{t("messages.loadingConversation")}</p>
          </div>
        </main>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ResponsiveHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <p>{t("messages.conversationNotFound")}</p>
            <Link href="/app_service-provider/messages" className="mt-4 inline-block text-green-500 hover:underline">
              {t("messages.returnToMessages")}
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsiveHeader activePage="messages" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {/* Conversation Header */}
          <div className="p-4 border-b flex items-center">
            <Link href="/app_service-provider/messages" className="text-gray-600 hover:text-green-500 mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="relative">
              <Image
                src={conversation.avatar || "/placeholder.svg"}
                alt={conversation.name}
                width={48}
                height={48}
                className="rounded-full"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  conversation.status === "online"
                    ? "bg-green-500"
                    : conversation.status === "away"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                }`}
              ></span>
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-medium text-gray-900">{conversation.name}</h2>
              <p className="text-sm text-gray-500">
                {conversation.status === "online"
                  ? t("messages.online")
                  : conversation.status === "away"
                    ? t("messages.away")
                    : t("messages.offline")}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="p-4 h-96 overflow-y-auto">
            <div className="space-y-4">
              {conversation.messages.map((msg: any) => (
                <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs sm:max-w-md rounded-lg p-3 ${
                      msg.sender === "me" ? "bg-green-100 text-gray-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs text-gray-500 mt-1 text-right">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex">
              <input
                type="text"
                placeholder={t("messages.typeMessage")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-r-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}