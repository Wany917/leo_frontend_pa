"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, Star, User, Clock, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { fr, enUS, es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import LanguageSelector from "@/components/language-selector"
import { useLanguage } from "@/components/language-context"

interface Service {
  id: number
  title: string
  image: string
  description: string
  price: string
  rating: number
  provider: string
}

interface TimeSlot {
  id: string
  time: string
  available: boolean
}

export default function ServiceDetailClient({ id }: { id: string }) {
  const { t, language } = useLanguage()
  const serviceId = id
  const [first_name, setUserName] = useState("")
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [availableDates, setAvailableDates] = useState<Date[]>([])

  const getLocale = () => {
    switch (language as string) {
      case "fr":
        return fr
      case "en":
        return enUS
      case "es":
        return es
      default:
        return enUS
    }
  }

  useEffect(() => {
		const token =
			sessionStorage.getItem('authToken') ||
			localStorage.getItem('authToken');
		if (!token) return;

		fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			credentials: 'include',
		})
			.then((res) => {
				if (!res.ok) throw new Error('Unauthorized');
				return res.json();
			})
			.then((data) => {
				setUserName(data.firstName);
			})
			.catch((err) => console.error('Auth/me failed:', err));
	}, []);

  useEffect(() => {
    const services: Service[] = [
      {
        id: 1,
        title: t("services.babySitter"),
        image: "/baby-sitter.jpg",
        description: t("services.babySitterDesc"),
        price: "£17/hour",
        rating: 5,
        provider: "Emma",
      },
      {
        id: 2,
        title: t("services.dogSitter"),
        image: "/dog-sitter.jpg",
        description: t("services.dogSitterDesc"),
        price: "£20/hour",
        rating: 5,
        provider: "Charlotte",
      },
      {
        id: 3,
        title: t("services.airportRide"),
        image: "/airport-ride.jpg",
        description: t("services.airportRideDesc"),
        price: "£30 + £2/km",
        rating: 5,
        provider: "Thomas",
      },
    ]

    const foundService = services.find((s) => s.id.toString() === serviceId)

    setTimeout(() => {
      setService(foundService || null)
      setLoading(false)

      const today = new Date()
      const dates: Date[] = []

      for (let i = 1; i <= 30; i++) {
        if (i % 2 === 0 || i % 3 === 0) {
          const date = new Date(today)
          date.setDate(today.getDate() + i)
          dates.push(date)
        }
      }

      setAvailableDates(dates)
    }, 500)
  }, [serviceId, t])

  useEffect(() => {
    if (!date) {
      setAvailableTimeSlots([])
      return
    }

    const dayOfWeek = date.getDay()
    const slots: TimeSlot[] = []

    const startHour = dayOfWeek === 0 || dayOfWeek === 6 ? 10 : 9
    const endHour = dayOfWeek === 5 || dayOfWeek === 6 ? 18 : 17

    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push({
        id: `slot-${hour}`,
        time: `${hour}:00`,
        available: Math.random() > 0.3,
      })

      if (hour < endHour && Math.random() > 0.5) {
        slots.push({
          id: `slot-${hour}-30`,
          time: `${hour}:30`,
          available: Math.random() > 0.3,
        })
      }
    }

    setAvailableTimeSlots(slots)
    setSelectedTimeSlot(null)
  }, [date])

  const isDateAvailable = (date: Date) => {
    return availableDates.some(
      (availableDate) =>
        availableDate.getDate() === date.getDate() &&
        availableDate.getMonth() === date.getMonth() &&
        availableDate.getFullYear() === date.getFullYear(),
    )
  }

  const handleBooking = () => {
    if (!date || !selectedTimeSlot) return

    alert(`Réservation confirmée pour le ${format(date, "dd/MM/yyyy")} à ${selectedTimeSlot}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">{t("services.serviceNotFound")}</h1>
        <Link
          href="/app_client"
          className="bg-green-50 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
        >
          {t("navigation.backToApp_Client")}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/app_client">
              <Image
                src="/logo.png"
                alt="EcoDeli Logo"
                width={120}
                height={40}
                className="h-auto"
              />
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/app_client/announcements" className="text-gray-700 hover:text-green-500">
              {t("navigation.myAnnouncements")}
            </Link>
            <Link href="/app_client/payments" className="text-gray-700 hover:text-green-500">
              {t("navigation.myPayments")}
            </Link>
            <Link href="/app_client/messages" className="text-gray-700 hover:text-green-500">
              {t("navigation.messages")}
            </Link>
            <Link href="/app_client/complaint" className="text-gray-700 hover:text-green-500">
              {t("navigation.makeComplaint")}
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <Link
              href="/app_client"
              className="flex items-center bg-green-200 text-green-800 rounded-full px-4 py-1 hover:bg-green-300 transition-colors"
            >
              <User className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">{first_name}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/app_client" className="inline-flex items-center text-gray-600 hover:text-green-500">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("navigation.backToApp_Client")}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-64">
                <Image
                  src={service.image || "/placeholder.svg?height=300&width=400"}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-2">{service.title}</h1>
                <h2 className="text-xl mb-2">{service.provider}</h2>
                <div className="flex mb-4">
                  {[...Array(service.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">{t("services.price")} :</span>
                    <span>{service.price}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">{t("services.book")} {service.title}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">{t("services.selectDate")}</h3>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP", { locale: getLocale() }) : <span>{t("services.selectADate")}</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          locale={getLocale()}
                          disabled={(date) => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            return date < today || !isDateAvailable(date)
                          }}
                          modifiers={{
                            available: isDateAvailable,
                          }}
                          modifiersClassNames={{
                            available: "font-bold text-green-500",
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      {date
                        ? `${t("services.slotsAvailableOn")} ${format(date, "dd MMMM yyyy", { locale: getLocale() })}`
                        : t("services.selectADateFirst")}
                    </h3>

                    {date ? (
                      availableTimeSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {availableTimeSlots.map((slot) => (
                            <Button
                              key={slot.id}
                              variant={selectedTimeSlot === slot.time ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedTimeSlot(slot.time)}
                              disabled={!slot.available}
                              className="h-10"
                            >
                              {slot.time}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">{t("services.noAvailableSlots")}</p>
                      )
                    ) : (
                      <div className="border rounded-md p-4 text-center text-muted-foreground">
                        {t("services.availableTimeSlots")}
                      </div>
                    )}
                  </div>
                </div>

                {date && selectedTimeSlot && (
                  <div className="mt-6 p-4 bg-green-50 rounded-md">
                    <h3 className="font-medium mb-2">{t("services.summary")}</h3>
                    <div className="flex items-center mb-2">
                      <CalendarIcon className="h-4 w-4 mr-2 text-green-500" />
                      <span>{format(date, "EEEE d MMMM yyyy", { locale: getLocale() })}</span>
                    </div>
                    <div className="flex items-center mb-4">
                      <Clock className="h-4 w-4 mr-2 text-green-500" />
                      <span>{selectedTimeSlot}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold">{service.price}</div>
                      <Button onClick={handleBooking}>{t("services.bookNow")}</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}