"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/components/language-context"
import LanguageSelector from "@/components/language-selector"
import { BarChart3, UserRoundCog, Tags, Angry, BadgeDollarSign, Languages, User, ChevronDown, Menu, Edit, LogOut } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function TranslationsAdmin() {
  const {t } = useLanguage()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [activeLocale, setActiveLocale] = useState("en")
  const [translations, setTranslations] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")
  const [availableLocales, setAvailableLocales] = useState(["en", "fr", "es"])

  useEffect(() => {
    const fetchTranslations = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/translations/${activeLocale}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch translations: ${response.status}`)
        }
        const data = await response.json()
        setTranslations(data)
      } catch (error) {
        console.error("Error loading translations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTranslations()
  }, [activeLocale])

  const updateTranslation = (path: string[], value: string) => {
    setTranslations((prev) => {
      const newTranslations = { ...prev }
      let current = newTranslations

      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {}
        }
        current = current[path[i]]
      }

      current[path[path.length - 1]] = value

      return newTranslations
    })
  }

  const saveTranslations = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/translations/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locale: activeLocale,
          translations,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save translations: ${response.status}`)
      }

      alert(`Translations for ${activeLocale} saved successfully!`)
    } catch (error) {
      console.error("Error saving translations:", error)
      alert("Failed to save translations")
    } finally {
      setIsSaving(false)
    }
  }

  const addTranslation = () => {
    if (!newKey || !newValue) return
    const path = newKey.split(".")
    updateTranslation(path, newValue)
    setNewKey("")
    setNewValue("")
  }

  const deleteTranslation = (path: string[]) => {
    setTranslations((prev) => {
      const newTranslations = { ...prev }
      let current = newTranslations

      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) return prev
        current = current[path[i]]
      }

      delete current[path[path.length - 1]]

      return newTranslations
    })
  }

  const addLocale = async () => {
    const newLocale = prompt("Enter the new locale code (e.g., 'de' for German):")
    if (newLocale && !availableLocales.includes(newLocale)) {
      try {
        const response = await fetch(`/api/translations/${newLocale}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        })

        if (!response.ok) {
          throw new Error(`Failed to create locale: ${response.status}`)
        }

        setAvailableLocales([...availableLocales, newLocale])
        setTranslations({})
        setActiveLocale(newLocale)
        alert(`Locale "${newLocale}" created successfully!`)
      } catch (error) {
        console.error("Error creating locale:", error)
        alert("Failed to create locale")
      }
    }
  }

  const deleteLocale = async (locale: string) => {
    if (confirm(`Are you sure you want to delete the locale "${locale}"?`)) {
      try {
        const response = await fetch(`/api/translations/delete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ locale }),
        })

        if (!response.ok) {
          throw new Error(`Failed to delete locale: ${response.status}`)
        }

        setAvailableLocales(availableLocales.filter((l) => l !== locale))
        if (activeLocale === locale) {
          setActiveLocale(availableLocales[0] || "en")
        }
        alert(`Locale "${locale}" deleted successfully!`)
      } catch (error) {
        console.error("Error deleting locale:", error)
        alert("Failed to delete locale")
      }
    }
  }

  const renderTranslationForm = (obj: Record<string, any>, path: string[] = []) => {
    return Object.entries(obj)
      .filter(([key, value]) => {
        const fullPath = [...path, key].join(".").toLowerCase()
        const search = searchTerm.toLowerCase()
        return fullPath.includes(search) || (typeof value === "string" && value.toLowerCase().includes(search))
      })
      .map(([key, value]) => {
        const currentPath = [...path, key]
        const pathString = currentPath.join(".")

        if (typeof value === "object" && value !== null) {
          return (
            <div key={pathString} className="mb-6">
              <h3 className="text-lg font-medium mb-2">{key}</h3>
              <div className="pl-4 border-l-2 border-gray-200">{renderTranslationForm(value, currentPath)}</div>
            </div>
          )
        }

        return (
          <div key={pathString} className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label htmlFor={pathString} className="text-sm font-medium">
              {pathString}
            </label>
            <Input
              id={pathString}
              value={value as string}
              onChange={(e) => updateTranslation(currentPath, e.target.value)}
              className="md:col-span-2"
            />
            <Button variant="destructive" onClick={() => deleteTranslation(currentPath)}>
              Delete
            </Button>
          </div>
        )
      })
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 lg:flex-row">
      <aside
              className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              } lg:translate-x-0 lg:static lg:inset-auto lg:z-auto`}
            >
              <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex h-16 items-center border-b px-6">
                  <Link href="/admin" className="flex items-center">
                    <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto" />
                  </Link>
                </div>
      
                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4">
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href="/admin"
                        className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                      >
                        <BarChart3 className="mr-3 h-5 w-5" />
                        <span>{t("admin.dashboard")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/users"
                        className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                      >
                        <UserRoundCog className="mr-3 h-5 w-5" />
                        <span>{t("admin.users")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/services"
                        className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                      >
                        <Tags className="mr-3 h-5 w-5" />
                        <span>{t("admin.services")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/translations"
                        className="flex items-center rounded-md bg-green-50 px-4 py-3 text-white"
                      >
                        <Languages className="mr-3 h-5 w-5" />
                        <span>{t("admin.translations")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/complaints"
                        className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                      >
                        <Angry className="mr-3 h-5 w-5" />
                        <span>{t("admin.complaints")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/finance"
                        className="flex items-center rounded-md px-4 py-3 text-gray-700 hover:bg-gray-100"
                      >
                        <BadgeDollarSign className="mr-3 h-5 w-5" />
                        <span>{t("admin.finance")}</span>
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </aside>

      {/* Main content */}
      <div className="flex-1 overflow-x-hidden">
        {/* Header */}
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
                    href="/admin/edit-account"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    <span>{t("common.editAccount")}</span>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <Link href="/app_client" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                    <User className="h-4 w-4 mr-2" />
                    <span>{t("common.clientSpace")}</span>
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <div className="px-4 py-1 text-xs text-gray-500">{t("common.accessToSpace")}</div>

                  <Link href="/register/shopkeeper" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.shopkeeper")}
                  </Link>

                  <Link href="/register/service-provider" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    {t("common.serviceProvider")}
                  </Link>

                  <Link href="/register/service-provider" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
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
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Translation Management</CardTitle>
          <CardDescription>Edit and manage translations for your application</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeLocale} onValueChange={setActiveLocale}>
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                {availableLocales.map((locale) => (
                  <TabsTrigger key={locale} value={locale}>
                    {locale.toUpperCase()}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="flex gap-2">
                <Button onClick={addLocale} className="bg-green-50 hover:bg-green-600 text-white">
                  Add Language
                </Button>
                <Button onClick={() => deleteLocale(activeLocale)} variant="destructive">
                  Delete Language
                </Button>
                <Button onClick={saveTranslations} disabled={isSaving} className="bg-green-50 hover:bg-green-600 text-white">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <Input
                placeholder="Search translations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="New key (e.g., 'auth.login')"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
              <Input
                placeholder="New value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
              <Button onClick={addTranslation} className="bg-green-50 hover:bg-green-600 text-white">
                Add Translation
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <TabsContent value={activeLocale} className="mt-0">
                <div className="space-y-6">{renderTranslationForm(translations)}</div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  </div>
  </div>
  )
}
