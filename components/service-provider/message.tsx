"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { User, ChevronDown, Edit, LogOut, Send, Search, Phone, Video, Info, ArrowLeft, BarChart3, Star, Tag, Calendar, LayoutList, MessageSquare, CreditCard, Menu } from "lucide-react"
import LanguageSelector from "@/components/language-selector"
import { useLanguage } from "@/components/language-context"

// Types for our data
interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  isRead: boolean
  isFromUser: boolean
}

interface Conversation {
  id: string
  recipientId: string
  recipientName: string
  recipientAvatar: string
  recipientType: "client" 
  serviceType?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  messages: Message[]
  status: "online" | "offline" | "away"
}

export default function ServiceProviderMessage() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const activeTab = "all"

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { t } = useLanguage()

  // Mock data for conversations
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "c1",
      recipientId: "d1",
      recipientName: "Thomas (Delivery)",
      recipientAvatar: "/placeholder.svg?height=40&width=40",
      recipientType: "client",
      lastMessage: "Your package will be delivered tomorrow between 2-4 PM.",
      lastMessageTime: "2025-04-02T14:30:00",
      unreadCount: 1,
      status: "online",
      messages: [
        {
          id: "m1",
          senderId: "d1",
          senderName: "Thomas",
          content: "Hello! I'll be delivering your package tomorrow.",
          timestamp: "2025-04-01T10:15:00",
          isRead: true,
          isFromUser: false,
        },
        {
          id: "m2",
          senderId: "user",
          senderName: "You",
          content: "Great! What time should I expect it?",
          timestamp: "2025-04-01T10:20:00",
          isRead: true,
          isFromUser: true,
        },
        {
          id: "m3",
          senderId: "d1",
          senderName: "Thomas",
          content: "Your package will be delivered tomorrow between 2-4 PM.",
          timestamp: "2025-04-02T14:30:00",
          isRead: false,
          isFromUser: false,
        },
      ],
    },
    {
      id: "c2",
      recipientId: "s1",
      recipientName: "Emma (Baby-sitter)",
      recipientAvatar: "/placeholder.svg?height=40&width=40",
      recipientType: "client",
      serviceType: "Baby-sitting",
      lastMessage: "I can take care of your children this Saturday from 7 PM.",
      lastMessageTime: "2025-04-02T09:45:00",
      unreadCount: 2,
      status: "online",
      messages: [
        {
          id: "m4",
          senderId: "user",
          senderName: "You",
          content: "Hi Emma, are you available for baby-sitting this Saturday evening?",
          timestamp: "2025-04-01T18:30:00",
          isRead: true,
          isFromUser: true,
        },
        {
          id: "m5",
          senderId: "s1",
          senderName: "Emma",
          content: "Hello! Yes, I'm available. What time do you need me?",
          timestamp: "2025-04-01T19:15:00",
          isRead: true,
          isFromUser: false,
        },
        {
          id: "m6",
          senderId: "user",
          senderName: "You",
          content: "Great! We need someone from 7 PM to midnight. Is that okay?",
          timestamp: "2025-04-02T08:20:00",
          isRead: true,
          isFromUser: true,
        },
        {
          id: "m7",
          senderId: "s1",
          senderName: "Emma",
          content: "I can take care of your children this Saturday from 7 PM.",
          timestamp: "2025-04-02T09:45:00",
          isRead: false,
          isFromUser: false,
        },
        {
          id: "m8",
          senderId: "s1",
          senderName: "Emma",
          content: "Do you need me to prepare dinner for them or will they have eaten already?",
          timestamp: "2025-04-02T09:46:00",
          isRead: false,
          isFromUser: false,
        },
      ],
    },
    {
      id: "c3",
      recipientId: "d2",
      recipientName: "Lucas (Delivery)",
      recipientAvatar: "/placeholder.svg?height=40&width=40",
      recipientType: "client",
      lastMessage: "I've picked up your package from the storage box.",
      lastMessageTime: "2025-04-01T16:20:00",
      unreadCount: 0,
      status: "offline",
      messages: [
        {
          id: "m9",
          senderId: "d2",
          senderName: "Lucas",
          content: "Hello, I'm assigned to deliver your package #ECO-87654321.",
          timestamp: "2025-04-01T15:10:00",
          isRead: true,
          isFromUser: false,
        },
        {
          id: "m10",
          senderId: "user",
          senderName: "You",
          content: "Hi Lucas, thanks for letting me know. When will you pick it up?",
          timestamp: "2025-04-01T15:15:00",
          isRead: true,
          isFromUser: true,
        },
        {
          id: "m11",
          senderId: "d2",
          senderName: "Lucas",
          content: "I'll be at the storage box in about an hour.",
          timestamp: "2025-04-01T15:20:00",
          isRead: true,
          isFromUser: false,
        },
        {
          id: "m12",
          senderId: "d2",
          senderName: "Lucas",
          content: "I've picked up your package from the storage box.",
          timestamp: "2025-04-01T16:20:00",
          isRead: true,
          isFromUser: false,
        },
      ],
    },
    {
      id: "c4",
      recipientId: "s2",
      recipientName: "Charlotte (Dog-sitter)",
      recipientAvatar: "/placeholder.svg?height=40&width=40",
      recipientType: "client",
      serviceType: "Dog-sitting",
      lastMessage: "Your dog is doing great! We just came back from a walk.",
      lastMessageTime: "2025-04-02T11:05:00",
      unreadCount: 0,
      status: "away",
      messages: [
        {
          id: "m13",
          senderId: "s2",
          senderName: "Charlotte",
          content: "Hello! I'm here to pick up Max for his dog-sitting session.",
          timestamp: "2025-04-02T09:00:00",
          isRead: true,
          isFromUser: false,
        },
        {
          id: "m14",
          senderId: "user",
          senderName: "You",
          content: "Hi Charlotte! I'll bring him down in a minute. He's very excited!",
          timestamp: "2025-04-02T09:02:00",
          isRead: true,
          isFromUser: true,
        },
        {
          id: "m15",
          senderId: "s2",
          senderName: "Charlotte",
          content: "No problem, I'll wait outside. Does he need his special food today?",
          timestamp: "2025-04-02T09:03:00",
          isRead: true,
          isFromUser: false,
        },
        {
          id: "m16",
          senderId: "user",
          senderName: "You",
          content: "Yes, I'll pack it with his leash and toys. Thanks for asking!",
          timestamp: "2025-04-02T09:05:00",
          isRead: true,
          isFromUser: true,
        },
        {
          id: "m17",
          senderId: "s2",
          senderName: "Charlotte",
          content: "Your dog is doing great! We just came back from a walk.",
          timestamp: "2025-04-02T11:05:00",
          isRead: true,
          isFromUser: false,
        },
      ],
    },
  ])

  // Filtrage par recherche seulement
  const filteredConversations = conversations.filter((conversation) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        conversation.recipientName.toLowerCase().includes(query) ||
        (conversation.serviceType && conversation.serviceType.toLowerCase().includes(query))
      )
    }
    return true
  })

  // Get the selected conversation
  const currentConversation = conversations.find((c) => c.id === selectedConversation)

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const updatedConversations = conversations.map((conversation) => {
      if (conversation.id === selectedConversation) {
        // Create new message
        const newMsg: Message = {
          id: `m${Date.now()}`,
          senderId: "user",
          senderName: "You",
          content: newMessage,
          timestamp: new Date().toISOString(),
          isRead: true,
          isFromUser: true,
        }

        // Update conversation
        return {
          ...conversation,
          lastMessage: newMessage,
          lastMessageTime: new Date().toISOString(),
          messages: [...conversation.messages, newMsg],
        }
      }
      return conversation
    })

    setConversations(updatedConversations)
    setNewMessage("")
  }

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      setConversations((prevConversations) =>
        prevConversations.map((conversation) => {
          if (conversation.id === selectedConversation) {
            return {
              ...conversation,
              unreadCount: 0,
              messages: conversation.messages.map((message) => ({
                ...message,
                isRead: true,
              })),
            }
          }
          return conversation
        }),
      )
    }
  }, [selectedConversation])

  // Scroll to bottom of messages when a new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentConversation?.messages])

  // Format date for display
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    // Check if date is today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // Check if date is yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    }

    // Otherwise return full date
    return date.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get status indicator color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-auto lg:z-auto`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/app_service-provider" className="flex items-center">
              <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/app_service-provider"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.dashboard")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_service-provider/review"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <Star className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.review")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_service-provider/services"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <Tag className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.services")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_service-provider/calendar"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <Calendar className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.calendar")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_service-provider/interventions"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <LayoutList className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.interventions")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_service-provider/messages"
                  className="flex items-center rounded-md bg-green-50 px-4 py-3 text-white"
                >
                  <MessageSquare className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.messages")}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/app_service-provider/payments"
                  className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <CreditCard className="mr-3 h-5 w-5" />
                  <span>{t("serviceProvider.payments")}</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-x-hidden">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Right actions */}
          <div className="ml-auto flex items-center space-x-4">
            <LanguageSelector />

            {/* User menu - style adapté du dashboard client */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center bg-green-50 text-white rounded-full px-4 py-1 hover:bg-green-400 transition-colors"
              >
                <User className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Charlotte</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-100">
                  <Link
                    href="/app_service-provider/edit_account"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    <span>{t("common.editAccount")}</span>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <Link href="/app_client" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <User className="h-4 w-4 mr-2" />
                    {t("common.clientSpace")}
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <div className="px-4 py-1 text-xs text-gray-500">{t("common.accessToSpace")}</div>

                  <Link href="/register/shopkeeper" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.shopkeeper")}
                  </Link>

                  <Link href="/register/deliveryman" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.deliveryMan")}
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <Link href="/logout" className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>{t("common.logout")}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="container mx-auto px-4 py-8">
                <h1 className="text-2xl sm:text-3xl font-semibold text-center text-green-400 mb-8">
                  {t("messages.yourMessages")}
                </h1>
        
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="flex flex-col md:flex-row h-[calc(80vh-100px)]">
                    {/* Conversations List */}
                    <div
                      className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${selectedConversation ? "hidden md:flex" : "flex"}`}
                    >
                      {/* Search and Filter */}
                      <div className="p-4 border-b border-gray-200">
                        <div className="relative mb-4">
                          <input
                            type="text"
                            placeholder={t("messages.searchConversations")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        </div>
        
                        {/* Uniquement onglet Tous */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                          <button className="flex-1 px-4 py-2 text-sm rounded-md bg-white shadow-sm">
                            {t("common.all")}
                          </button>
                        </div>
                      </div>
        
                      {/* Conversations */}
                      <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length > 0 ? (
                          filteredConversations.map((conversation) => (
                            <div
                              key={conversation.id}
                              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                                selectedConversation === conversation.id ? "bg-gray-50" : ""
                              }`}
                              onClick={() => setSelectedConversation(conversation.id)}
                            >
                              <div className="flex items-start">
                                <div className="relative mr-3 flex-shrink-0">
                                  <Image
                                    src={conversation.recipientAvatar || "/placeholder.svg"}
                                    alt={conversation.recipientName}
                                    width={48}
                                    height={48}
                                    className="rounded-full"
                                  />
                                  <span
                                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(conversation.status)}`}
                                  ></span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <h3 className="text-sm font-medium truncate">{conversation.recipientName}</h3>
                                    <span className="text-xs text-gray-500">
                                      {formatMessageDate(conversation.lastMessageTime).split(",")[0]}
                                    </span>
                                  </div>
                                  {conversation.serviceType && (
                                    <p className="text-xs text-green-500 mb-1">{conversation.serviceType}</p>
                                  )}
                                  <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                                </div>
                                {conversation.unreadCount > 0 && (
                                  <div className="ml-2 bg-green-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {conversation.unreadCount}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">{t("messages.noConversations")}</div>
                        )}
                      </div>
                    </div>
        
                    {/* Conversation Detail */}
                    <div className={`w-full md:w-2/3 flex flex-col ${!selectedConversation ? "hidden md:flex" : "flex"}`}>
                      {!currentConversation ? (
                        <div className="flex-1 flex items-center justify-center p-4 text-gray-500">
                          <div className="text-center">
                            <div className="mb-4">
                              <Image
                                src="/placeholder.svg?height=100&width=100"
                                alt={t("messages.selectConversation")}
                                width={100}
                                height={100}
                                className="mx-auto opacity-50"
                              />
                            </div>
                            <p>{t("messages.selectConversation")}</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Conversation Header */}
                          <div className="p-4 border-b border-gray-200 flex items-center">
                            <button className="md:hidden mr-2 text-gray-500" onClick={() => setSelectedConversation(null)}>
                              <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div className="relative mr-3">
                              <Image
                                src={currentConversation.recipientAvatar || "/placeholder.svg"}
                                alt={currentConversation.recipientName}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                              <span
                                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${getStatusColor(currentConversation.status)}`}
                              ></span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{currentConversation.recipientName}</h3>
                              <p className="text-xs text-gray-500">
                                {currentConversation.status === "online"
                                  ? t("messages.online")
                                  : currentConversation.status === "away"
                                    ? t("messages.away")
                                    : t("messages.offline")}
                              </p>
                            </div>
                          </div>
        
                          {/* Messages */}
                          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                            <div className="space-y-4">
                              {currentConversation.messages.map((message) => (
                                <div
                                  key={message.id}
                                  className={`flex ${message.isFromUser ? "justify-end" : "justify-start"}`}
                                >
                                  <div
                                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                                      message.isFromUser
                                        ? "bg-green-50 text-white"
                                        : "bg-white border border-gray-200 text-gray-800"
                                    }`}
                                  >
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-medium text-sm">{message.senderName}</span>
                                      <span className="text-xs text-opacity-80 ml-2">
                                        {formatMessageDate(message.timestamp).split(",")[1] ||
                                          formatMessageDate(message.timestamp)}
                                      </span>
                                    </div>
                                    <p className="text-sm">{message.content}</p>
                                  </div>
                                </div>
                              ))}
                              <div ref={messagesEndRef} />
                            </div>
                          </div>
        
                          {/* Message Input */}
                          <div className="p-4 border-t border-gray-200">
                            <div className="flex items-center">
                              <input
                                type="text"
                                placeholder={t("messages.typeMessage")}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                              <button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                                className="px-4 py-2 bg-green-500 text-white rounded-r-md hover:bg-green-600 transition-colors disabled:opacity-50"
                              >
                                <Send className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </main>
      </div>
    </div>
  )
}