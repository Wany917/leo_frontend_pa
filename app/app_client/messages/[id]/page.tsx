"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Send } from "lucide-react"
import ResponsiveHeader from "../../responsive-header"
import { useLanguage } from "@/components/language-context"
import { io, Socket } from "socket.io-client"
export default function MessageDetailPage() {
  const { t } = useLanguage()
  const params = useParams()
  const router = useRouter()
  const { id } = params
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [conversation, setConversation] = useState<any>(null)


// Ajouter cette fonction dans votre composant MessageDetailPage
const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  // Si c'est aujourd'hui
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Si c'est hier
  if (date.toDateString() === yesterday.toDateString()) {
    return `Hier, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Pour les autres dates
  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Dans useEffect
useEffect(() => {
  const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
  if (!token) return
  
  setIsLoading(true)
  
  // Récupérer les détails de la conversation
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/inbox`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => res.json())
  .then(data => {
    // Chercher la conversation correspondant à l'ID
    const conversationId = id as string
    const matchingMessages = data.messages.filter((msg: any) => 
      msg.senderId.toString() === conversationId || 
      msg.receiverId.toString() === conversationId
    )
    
    if (matchingMessages.length > 0) {
      // Créer la conversation depuis les messages
      const firstMessage = matchingMessages[0]
      const otherUser = firstMessage.senderId.toString() === conversationId 
        ? firstMessage.sender 
        : firstMessage.receiver
      
      // Gérer le cas où les noms sont undefined
      const firstName = otherUser?.first_name || otherUser?.firstName || 'Utilisateur';
      const lastName = otherUser?.last_name || otherUser?.lastName || '';
      const userName = `${firstName} ${lastName}`.trim();
      
      // Trier les messages par date (du plus ancien au plus récent)
      matchingMessages.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      const formattedMessages = matchingMessages.map((msg: any) => ({
        id: msg.id,
        sender: msg.senderId.toString() === conversationId ? "them" : "me",
        text: msg.content,
        time: formatMessageTime(msg.createdAt)
      }))
      
      setConversation({
        id: parseInt(conversationId),
        name: userName,
        avatar: "/placeholder.svg?height=40&width=40",
        status: "offline", // Par défaut
        messages: formattedMessages
      })
      
      // Aussi initialiser WebSocket pour les mises à jour en temps réel
      initializeWebSocket(token, parseInt(conversationId))
      
      // Faire défiler vers le bas pour voir les messages les plus récents
      setTimeout(() => {
        const messagesContainer = document.querySelector('.messages-scroll-container')
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight
        }
      }, 100)
    }
    
    setIsLoading(false)
  })
  .catch(err => {
    console.error('Failed to load conversation:', err)
    setIsLoading(false)
  })
}, [id])

const initializeWebSocket = (token: string, conversationId: number) => {
  // Récupérer l'ID utilisateur
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => res.json())
  .then(data => {
    const socketIo = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
      query: { user_id: data.id.toString() },
      auth: { userId: data.id.toString() },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })
    
    socketIo.on('new_message', (message) => {
      // Ajouter le nouveau message s'il fait partie de cette conversation
      if (message.senderId === conversationId || message.receiverId === conversationId) {
        const newMsg = {
          id: message.id || Date.now(),
          sender: message.senderId === conversationId ? "them" : "me",
          text: message.content,
          time: "Just now"
        }
        
        setConversation((prev: any) => {
          if (!prev) return prev;
          
          // Vérifier si ce message existe déjà
          const messageExists = prev.messages.some((m: any) => 
            (m.id === newMsg.id) || 
            (m.text === newMsg.text && m.sender === newMsg.sender && m.time === "Just now")
          );
          
          if (messageExists) return prev;
          
          const updatedMessages = [...prev.messages, newMsg]
          // Trier les messages par date (du plus ancien au plus récent)
          updatedMessages.sort((a: any, b: any) => {
            // Pour les nouveaux messages qui ont "Just now" comme temps
            if (a.time === "Just now" && b.time !== "Just now") return 1;
            if (a.time !== "Just now" && b.time === "Just now") return -1;
            if (a.time === "Just now" && b.time === "Just now") return 0;
            
            // Sinon, comparer en fonction de l'ID en ordre croissant
            return a.id - b.id;
          });
          
          // Faire défiler vers le bas pour voir le nouveau message
          setTimeout(() => {
            const messagesContainer = document.querySelector('.messages-scroll-container')
            if (messagesContainer) {
              messagesContainer.scrollTop = messagesContainer.scrollHeight
            }
          }, 100)
          
          return {
            ...prev,
            messages: updatedMessages
          }
        })
      }
    })
    
    // Ajout d'un événement pour les messages envoyés par cet utilisateur
    socketIo.on('message_sent', (message) => {
      if (message.senderId === data.id && message.receiverId === conversationId) {
        const newMsg = {
          id: message.id || Date.now(),
          sender: "me",
          text: message.content,
          time: "Just now"
        }
        
        setConversation((prev: any) => {
          if (!prev) return prev;
          
          // Vérifier si ce message existe déjà
          const messageExists = prev.messages.some((m: any) => 
            (m.id === newMsg.id) || 
            (m.text === newMsg.text && m.sender === newMsg.sender && m.time === "Just now")
          );
          
          if (messageExists) return prev;
          
          const updatedMessages = [...prev.messages, newMsg];
          
          // Trier du plus ancien au plus récent
          updatedMessages.sort((a: any, b: any) => {
            if (a.time === "Just now" && b.time !== "Just now") return 1;
            if (a.time !== "Just now" && b.time === "Just now") return -1;
            if (a.time === "Just now" && b.time === "Just now") return 0;
            return a.id - b.id;
          });
          
          // Faire défiler vers le bas pour voir le nouveau message
          setTimeout(() => {
            const messagesContainer = document.querySelector('.messages-scroll-container')
            if (messagesContainer) {
              messagesContainer.scrollTop = messagesContainer.scrollHeight
            }
          }, 100)
          
          return {
            ...prev,
            messages: updatedMessages
          }
        })
      }
    })
    
    // Gérer le statut en ligne/hors ligne
    socketIo.on('user_status_change', (data) => {
      if (data.userId === conversationId) {
        setConversation((prev: any) => ({
          ...prev,
          status: data.status
        }))
      }
    })
    
    return () => {
      socketIo.disconnect()
    }
  })
}

// Dans handleSendMessage
const handleSendMessage = (e: React.FormEvent) => {
  e.preventDefault()
  if (!message.trim() || !conversation) return

  const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
  if (!token) return
  
  // Récupérer l'ID utilisateur
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => res.json())
  .then(userData => {
    // Envoyer le message via l'API
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        senderId: userData.id,
        receiverId: conversation.id,
        content: message
      })
    })
    .then(res => res.json())
    .then(data => {
      // Mettre à jour l'UI
      const newMessage = {
        id: conversation.messages.length + 1,
        sender: "me",
        text: message,
        time: "Just now",
      }
      
      // Créer une nouvelle liste de messages incluant le nouveau message
      const updatedMessages = [...conversation.messages, newMessage];
      
      // Trier les messages par date (du plus ancien au plus récent)
      updatedMessages.sort((a, b) => {
        // Pour les nouveaux messages qui ont "Just now" comme temps
        if (a.time === "Just now" && b.time !== "Just now") return 1;
        if (a.time !== "Just now" && b.time === "Just now") return -1;
        if (a.time === "Just now" && b.time === "Just now") return 0;
        
        // Sinon, comparer en fonction de l'ID en ordre croissant
        return a.id - b.id;
      });
      
      setConversation({
        ...conversation,
        messages: updatedMessages,
      })
      
      // Faire défiler vers le bas pour voir le nouveau message
      setTimeout(() => {
        const messagesContainer = document.querySelector('.messages-scroll-container')
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight
        }
      }, 100)
      
      setMessage("")
    })
    .catch(err => console.error('Failed to send message:', err))
  })
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
            <Link href="/app_client/messages" className="mt-4 inline-block text-green-500 hover:underline">
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
            <Link href="/app_client/messages" className="text-gray-600 hover:text-green-500 mr-4">
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
          <div className="p-4 h-96 overflow-y-auto messages-scroll-container">
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
