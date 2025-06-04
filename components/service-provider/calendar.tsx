"use client";
import React from 'react';
import { useLanguage } from "@/components/language-context";
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Planning from '@/components/planning'

type Event = {
  id: number
  title: string
  start: Date
  end: Date
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const { t } = useLanguage()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetch('/api/interventions')
      .then(res => res.json())
      .then((data: any[]) => {
        const parsed = data.map(evt => ({
          id: evt.id,
          title: evt.title,
          start: new Date(evt.start),
          end: new Date(evt.end),
        }))
        setEvents(parsed)
      })
      .catch(err => console.error('Erreur API interventions :', err))
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
          {/* Main content */}
          <div className="flex-1 overflow-x-hidden">

            <main className="min-h-screen bg-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold text-gray-800">{t("serviceProvider.calendar")}</h1>
                <Link href="/app_service-provider/calendar/availabilities">
                <p className="bg-green-50 text-white px-4 py-2 rounded hover:bg-green-600">
                {t("serviceProvider.myAvailabilities")}
                </p>
                </Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <Planning events={events as any} />
            </div>
            </main>
        </div>        
    </div>
  )
}
