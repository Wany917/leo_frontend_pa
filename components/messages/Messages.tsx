"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { User, ChevronDown, Edit, LogOut, Send, Search, Phone, Video, Info, ArrowLeft } from "lucide-react"
import LanguageSelector from "@/components/language-selector"
import { useLanguage } from "@/components/language-context"
import { io, Socket } from "socket.io-client"

// Types pour nos données
export interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  isRead: boolean
  isFromUser: boolean
  isPending?: boolean
  failed?: boolean
}

export interface Conversation {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  recipientType: "delivery" | "service";
  serviceType?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
  status: "online" | "offline" | "away";
}

interface MessagesProps {
  userType: "client" | "deliveryman" | "service-provider" | "shopkeeper"
  apiBaseUrl: string
  navigationLinks: Array<{ href: string, label: string, active?: boolean }>
  editAccountUrl: string
  registerLinks: Array<{ href: string, label: string }>
  hideNavigation?: boolean
}

export default function Messages({
  userType,
  apiBaseUrl,
  navigationLinks,
  editAccountUrl,
  registerLinks,
  hideNavigation = false
}: MessagesProps) {
  // --- LOGIQUE ET ÉTATS ---
  const [socket, setSocket] = useState<Socket | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [first_name, setUserName] = useState("")
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "delivery" | "service">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [availableUsers, setAvailableUsers] = useState<{id: number, name: string}[]>([])
  const [selectedRecipient, setSelectedRecipient] = useState<number | null>(null)
  const [typingUsers, setTypingUsers] = useState<{[key: string]: {typing: boolean, timeout: ReturnType<typeof setTimeout> | null}}>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)
  const lastTypingTime = useRef<number>(0)
  const typingTimeoutRef = useRef<{[key: string]: ReturnType<typeof setTimeout> | null}>({})

  const { t } = useLanguage()

  useEffect(() => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
    if (!token) return
    fetch(`${apiBaseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      credentials: 'include'
    })
    .then(res => {
      if (!res.ok) throw new Error('Unauthorized')
      return res.json()
    })
    .then(data => {
      setUserName(data.firstName)
      setUserId(data.id)
      const socketIo = io(`${apiBaseUrl}`, {
        query: { user_id: data.id.toString() },
        auth: { userId: data.id.toString() },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      })
      setSocket(socketIo)
      socketIo.on('connect', () => {
        socketIo.emit('authenticate', { userId: data.id })
      })
      socketIo.on('new_message', (message) => {
        handleNewMessage(message)
        if (message.senderId) {
          clearTypingIndicator(message.senderId.toString())
        }
      })
      socketIo.on('message_sent', (message) => {
        handleNewMessage(message)
      })
      socketIo.on('user_typing', (data) => {
        if (data.userId) {
          setTypingUsers(prev => {
            if (prev[data.userId]?.timeout) {
              clearTimeout(prev[data.userId].timeout as NodeJS.Timeout)
            }
            const timeout = setTimeout(() => {
              setTypingUsers(prevTyping => ({
                ...prevTyping,
                [data.userId]: { typing: false, timeout: null }
              }))
            }, 3000)
            return {
              ...prev,
              [data.userId]: { typing: true, timeout }
            }
          })
        }
      })
      socketIo.on('message_read', (data) => {
        if (data.messageId) {
          setConversations(prevConversations => 
            prevConversations.map(conversation => ({
              ...conversation,
              messages: conversation.messages.map(msg => 
                msg.id === data.messageId ? { ...msg, isRead: true } : msg
              )
            }))
          )
        }
      })
      socketIo.on('user_status_change', (data) => {
        updateUserStatus(data.userId, data.status)
      })
      socketIo.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error)
      })
      socketIo.on('error', (error) => {
        console.error('WebSocket error:', error)
      })
      loadConversations(data.id, token)
    })
    .catch(err => console.error('Auth/me failed:', err))
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  const loadConversations = (userId: number, token: string) => {
    fetch(`${apiBaseUrl}/messages/inbox`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`)
      }
      return res.json()
    })
    .then(data => {
      const formattedConversations = formatConversations(data.messages, userId)
      formattedConversations.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      )
      setConversations(formattedConversations)
    })
    .catch(err => {
      if (err.message.includes('401')) {
        window.location.href = '/login'
      }
    })
  }

  const formatConversations = (messages: any[], currentUserId: number) => {
    const conversationMap = new Map()
    messages.forEach(msg => {
      const otherUserId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId
      const otherUser = msg.senderId === currentUserId ? msg.receiver : msg.sender
      if (!conversationMap.has(otherUserId)) {
        const firstName = otherUser?.first_name || otherUser?.firstName || 'Utilisateur'
        const lastName = otherUser?.last_name || otherUser?.lastName || `#${otherUserId}`
        conversationMap.set(otherUserId, {
          id: `conv_${currentUserId}_${otherUserId}`,
          recipientId: otherUserId.toString(),
          recipientName: `${firstName} ${lastName}`.trim(),
          recipientAvatar: "/placeholder.svg?height=40&width=40",
          recipientType: determineUserType(otherUser),
          lastMessage: msg.content || "",
          lastMessageTime: msg.createdAt || new Date().toISOString(),
          unreadCount: 0,
          messages: [],
          status: "offline"
        })
      }
      const conversation = conversationMap.get(otherUserId)
      const senderFirstName = msg.senderId === currentUserId ? "Vous" : (otherUser?.first_name || otherUser?.firstName || 'Utilisateur')
      const senderLastName = msg.senderId === currentUserId ? "" : (otherUser?.last_name || otherUser?.lastName || "")
      const senderName = msg.senderId === currentUserId ? "Vous" : `${senderFirstName} ${senderLastName}`.trim()
      conversation.messages.push({
        id: msg.id?.toString() || `temp_${Date.now()}`,
        senderId: msg.senderId?.toString() || "",
        senderName: senderName,
        content: msg.content || "",
        timestamp: msg.createdAt || new Date().toISOString(),
        isRead: msg.isRead || false,
        isFromUser: msg.senderId === currentUserId
      })
      if (new Date(msg.createdAt || 0) > new Date(conversation.lastMessageTime || 0)) {
        conversation.lastMessage = msg.content || ""
        conversation.lastMessageTime = msg.createdAt || new Date().toISOString()
      }
      if (msg.senderId !== currentUserId && !msg.isRead) {
        conversation.unreadCount++
      }
    })
    const result = Array.from(conversationMap.values())
    result.forEach(conversation => {
      conversation.messages.sort((a: any, b: any) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    })
    return result
  }

  const determineUserType = (user: any) => {
    if (user.livreur) return "delivery"
    if (user.prestataire) return "service"
    return "delivery"
  }

  const clearTypingIndicator = (userId: string) => {
    setTypingUsers(prev => {
      const newState = { ...prev }
      if (newState[userId]?.timeout) {
        clearTimeout(newState[userId].timeout as NodeJS.Timeout)
      }
      delete newState[userId]
      return newState
    })
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation || !socket || !userId) return
    const currentConv = conversations.find(c => c.id === selectedConversation)
    if (!currentConv) return
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
    clearTypingIndicator(userId.toString())
    socket.emit('typing', { 
      receiverId: parseInt(currentConv.recipientId),
      typing: false 
    })
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const tempMessage = {
      id: tempId,
      senderId: userId.toString(),
      senderName: "Vous",
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false,
      isFromUser: true,
      isPending: true
    }
    setConversations(prevConversations => 
      prevConversations.map(conversation => {
        if (conversation.id === selectedConversation) {
          const updatedMessages = [...conversation.messages, tempMessage].sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
          return {
            ...conversation,
            lastMessage: newMessage,
            lastMessageTime: new Date().toISOString(),
            messages: updatedMessages
          }
        }
        return conversation
      })
    )
    ensureWebSocketConnection(userId)
    fetch(`${apiBaseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        senderId: userId,
        receiverId: parseInt(currentConv.recipientId),
        content: newMessage,
        tempId: tempId
      })
    })
    .then(res => {
      if (!res.ok) {
        setConversations(prevConversations => 
          prevConversations.map(conversation => {
            if (conversation.id === selectedConversation) {
              return {
                ...conversation,
                messages: conversation.messages.map(msg => 
                  msg.id === tempId 
                    ? {...msg, failed: true, isPending: false} 
                    : msg
                )
              }
            }
            return conversation
          })
        )
        throw new Error('Failed to send message')
      }
      return res.json()
    })
    .catch(() => {
      alert("Le message n'a pas pu être envoyé. Veuillez réessayer.")
    })
    setNewMessage("")
    if (messageInputRef.current) {
      messageInputRef.current.focus()
    }
  }

  const handleTyping = () => {
    if (!selectedConversation || !socket || !userId) return
    const currentConv = conversations.find(c => c.id === selectedConversation)
    if (!currentConv) return
    const currentTime = Date.now()
    if (currentTime - lastTypingTime.current > 3000) {
      lastTypingTime.current = currentTime
      socket.emit('typing', { 
        receiverId: parseInt(currentConv.recipientId),
        typing: true 
      })
      if (typingTimeoutRef.current[currentConv.recipientId]) {
        clearTimeout(typingTimeoutRef.current[currentConv.recipientId] as NodeJS.Timeout)
      }
      typingTimeoutRef.current[currentConv.recipientId] = setTimeout(() => {
        socket.emit('typing', { 
          receiverId: parseInt(currentConv.recipientId),
          typing: false 
        })
      }, 3000)
    }
  }

  useEffect(() => {
    if (selectedConversation && userId) {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
      const currentConv = conversations.find(c => c.id === selectedConversation)
      if (!currentConv) return
      setConversations(prevConversations => 
        prevConversations.map(conversation => {
          if (conversation.id === selectedConversation) {
            const updatedMessages = conversation.messages.map(message => ({
              ...message,
              isRead: true
            }))
            return {
              ...conversation,
              unreadCount: 0,
              messages: updatedMessages
            }
          }
          return conversation
        })
      )
      if (currentConv && userId) {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
        if (!token) return
        const unreadMessages = currentConv.messages.filter(
          m => !m.isRead && m.senderId === currentConv.recipientId
        )
        unreadMessages.forEach(msg => {
          fetch(`${apiBaseUrl}/messages/${msg.id}/read`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }).catch(() => {})
        })
      }
    }
  }, [selectedConversation, userId])

  const handleNewMessage = (message: any) => {
    const senderId = message.senderId.toString()
    const receiverId = message.receiverId.toString()
    const tempId = message.tempId
    if (senderId !== userId?.toString() && receiverId !== userId?.toString()) {
      return
    }
    const otherPersonId = senderId === userId?.toString() ? receiverId : senderId
    const existingConvIndex = conversations.findIndex(c => c.recipientId === otherPersonId)
    if (existingConvIndex >= 0) {
      setConversations(prevConversations => {
        const updatedConversations = [...prevConversations]
        const conversation = updatedConversations[existingConvIndex]
        const newMsg = {
          id: message.id || `msg_${Date.now()}`,
          senderId: senderId,
          senderName: senderId === userId?.toString() ? "Vous" : conversation.recipientName,
          content: message.content,
          timestamp: message.timestamp || message.createdAt || new Date().toISOString(),
          isRead: selectedConversation === conversation.id || senderId === userId?.toString(),
          isFromUser: senderId === userId?.toString(),
          isPending: false
        }
        if (tempId && conversation.messages.some(m => m.id === tempId)) {
          const updatedMessages = conversation.messages.map(m => 
            m.id === tempId ? newMsg : m
          )
          const sortedMessages = updatedMessages.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
          conversation.messages = sortedMessages
          conversation.lastMessage = message.content
          conversation.lastMessageTime = message.timestamp || message.createdAt || new Date().toISOString()
          if (selectedConversation !== conversation.id && 
              senderId !== userId?.toString() && 
              !newMsg.isRead) {
            conversation.unreadCount++
          }
        }
        return updatedConversations
      })
    } else {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
      if (token && userId) {
        loadConversations(userId, token)
      }
    }
  }

  const updateUserStatus = (userId: number, status: string) => {
    setConversations(prevConversations =>
      prevConversations.map(conversation => {
        if (conversation.recipientId === userId.toString()) {
          return {
            ...conversation,
            status: status as "online" | "offline" | "away"
          }
        }
        return conversation
      })
    )
  }

  const filteredConversations = conversations.filter((conversation) => {
    if (activeTab === "delivery" && conversation.recipientType !== "delivery") return false
    if (activeTab === "service" && conversation.recipientType !== "service") return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        conversation.recipientName.toLowerCase().includes(query) ||
        (conversation.serviceType && conversation.serviceType.toLowerCase().includes(query))
      )
    }
    return true
  })

  const currentConversation = conversations.find((c) => c.id === selectedConversation)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentConversation?.messages])

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `Hier, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    }
    return date.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

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

  useEffect(() => {
    if (showNewChatModal) {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
      if (!token) return
      fetch(`${apiBaseUrl}/messages/available-users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        setAvailableUsers(data.users || [])
      })
      .catch(() => {})
    }
  }, [showNewChatModal])

  const handleStartNewConversation = () => {
    if (!selectedRecipient || !userId) {
      return
    }
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
    if (!token) return
    fetch(`${apiBaseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        senderId: userId,
        receiverId: selectedRecipient,
        content: t("messages.conversationStarted")
      })
    })
    .then(res => res.json())
    .then(() => {
      loadConversations(userId, token)
      setShowNewChatModal(false)
      setSelectedRecipient(null)
    })
    .catch(() => {})
  }

  const ensureWebSocketConnection = (userId: number) => {
    if (!socket || !socket.connected) {
      const newSocket = io(`${apiBaseUrl}`, {
        query: { user_id: userId.toString() },
        auth: { userId: userId.toString() },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      })
      newSocket.on('connect', () => {
        newSocket.emit('authenticate', { userId })
      })
      newSocket.on('connect_error', (error) => {
        console.error('Erreur de reconnexion WebSocket:', error)
      })
      setSocket(newSocket)
      return newSocket
    }
    return socket
  }

  const refreshConversations = () => {
    if (!userId) return
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
    if (!token) return
    ensureWebSocketConnection(userId)
    loadConversations(userId, token)
  }

  useEffect(() => {
    if (!userId) return
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
    if (!token) return
    refreshConversations()
    const wsCheckInterval = setInterval(() => {
      ensureWebSocketConnection(userId)
    }, 10000)
    const intervalId = setInterval(() => {
      refreshConversations()
    }, 15000)
    return () => {
      clearInterval(intervalId)
      clearInterval(wsCheckInterval)
    }
  }, [userId])

  useEffect(() => {
    const handleFocus = () => {
      if (userId) {
        refreshConversations()
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [userId])

  useEffect(() => {
    if (selectedConversation) {
      const messagesContainer = document.querySelector('.messages-container')
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
      }
    }
  }, [selectedConversation, conversations])

  // --- RENDU JSX ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - N'afficher que si hideNavigation est false */}
      {!hideNavigation && (
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/app_client">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-NEF7Y3VVan4gaPKz0Ke4Q9FTKCgie4.png"
                  alt="EcoDeli Logo"
                  width={120}
                  height={40}
                  className="h-auto"
                />
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              {navigationLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    link.active
                      ? "text-green-500 font-medium border-b-2 border-green-500"
                      : "text-gray-700 hover:text-green-500"
                  }
                >
                  {t(link.label)}
                </Link>
              ))}
            </nav>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              {/* User Account Menu */}
              <div className="relative">
                <button
                  className="flex items-center bg-green-50 text-white rounded-full px-4 py-1 hover:bg-green-400 transition-colors"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <User className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">{first_name}</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 py-2 border border-gray-100">
                    <Link
                      href={editAccountUrl}
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      <span>{t("common.editAccount")}</span>
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <div className="px-4 py-1 text-xs text-gray-500">{t("common.registerAs")}</div>
                    {registerLinks.map(link => (
                      <Link key={link.href} href={link.href} className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        {t(link.label)}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 my-1"></div>
                    <Link href="/logout" className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>{t("common.logout")}</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`container mx-auto px-4 ${hideNavigation ? '' : 'py-8'}`}>
        {!hideNavigation && (
          <h1 className="text-2xl sm:text-3xl font-semibold text-center text-green-400 mb-8">
            {t("messages.yourMessages")}
          </h1>
        )}

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
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`flex-1 px-4 py-2 text-sm rounded-md ${activeTab === "all" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                  >
                    {t("common.all")}
                  </button>
                  <button
                    onClick={() => setActiveTab("delivery")}
                    className={`flex-1 px-4 py-2 text-sm rounded-md ${activeTab === "delivery" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                  >
                    {t("messages.delivery")}
                  </button>
                  <button
                    onClick={() => setActiveTab("service")}
                    className={`flex-1 px-4 py-2 text-sm rounded-md ${activeTab === "service" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                  >
                    {t("messages.services")}
                  </button>
                  <button
                    onClick={() => setShowNewChatModal(true)}
                    className="ml-2 bg-green-500 text-white h-9 w-9 rounded-full flex items-center justify-center hover:bg-green-600 focus:outline-none"
                    title={t("messages.newConversation")}
                  >
                    <span className="text-xl font-bold">+</span>
                  </button>
                </div>
              </div>
              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${selectedConversation === conversation.id ? "bg-gray-50" : ""}`}
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
                          {typingUsers[conversation.recipientId]?.typing ? (
                            <p className="text-sm italic text-gray-600">
                              {t("messages.isTyping")}...
                            </p>
                          ) : (
                            <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                          )}
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
                        {typingUsers[currentConversation.recipientId]?.typing 
                           ? t("messages.isTyping") + "..."
                           : currentConversation.status === "online"
                             ? t("messages.online")
                             : currentConversation.status === "away"
                               ? t("messages.away")
                               : t("messages.offline")
                        }
                      </p>
                    </div>
                  </div>
                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto messages-container">
                    <div className="space-y-4">
                      {currentConversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isFromUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg px-4 py-2 ${
                              message.isFromUser
                                ? "bg-green-100 text-gray-800"
                                : "bg-white border border-gray-200 text-gray-800"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-sm">{message.senderName}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                {formatMessageDate(message.timestamp).split(",")[1] ||
                                  formatMessageDate(message.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                            {message.isFromUser && (
                              <div className="text-right mt-1">
                                {message.isPending ? (
                                  <span className="text-xs text-gray-400">
                                    {t("messages.sending")}...
                                  </span>
                                ) : message.failed ? (
                                  <span className="text-xs text-red-500">
                                    {t("messages.failed")}
                                  </span>
                                ) : message.isRead ? (
                                  <span className="text-xs text-green-500">
                                    {t("messages.read")}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    {t("messages.sent")}
                                  </span>
                                )}
                              </div>
                            )}
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
                        onKeyDown={handleTyping}
                        ref={messageInputRef}
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
      {/* Modal pour nouvelle conversation */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">{t("messages.startNewConversation")}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("messages.selectRecipient")}
              </label>
              <select 
                className="w-full border border-gray-300 rounded-md p-2"
                value={selectedRecipient || ""}
                onChange={(e) => setSelectedRecipient(Number(e.target.value))}
              >
                <option value="">-- {t("messages.selectUser")} --</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowNewChatModal(false)
                  setSelectedRecipient(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleStartNewConversation}
                disabled={!selectedRecipient}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                {t("common.start")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 