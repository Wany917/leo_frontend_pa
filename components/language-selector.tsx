"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "./language-context"

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const { language, setLanguage, availableLocales } = useLanguage()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleDropdown = () => setIsOpen(open => !open)
  const selectLanguage = (lang: string) => {
    setLanguage(lang)
    setIsOpen(false)
  }

  // Fermer le menu déroulant lorsqu'on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center space-x-1 text-sm font-medium hover:text-green-500 transition-colors bg-gray-100 px-3 py-1.5 rounded-md"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <p className="font-semibold">{language.toUpperCase()}</p>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          {availableLocales.map((lang) => (
            <button
              key={lang}
              onClick={() => selectLanguage(lang)}
              className={`block w-full text-left px-4 py-2 text-sm ${
                language === lang
                  ? "bg-green-50 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
