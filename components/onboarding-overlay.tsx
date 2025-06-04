"use client"

import { useState, useEffect } from "react"
import { X, ArrowRight, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/components/language-context"

interface OnboardingStep {
  title: string
  description: string
  target: string
  position: "top" | "right" | "bottom" | "left" | "center"
  offsetX?: number
  beforeStep?: () => void
}

interface OnboardingOverlayProps {
  onComplete: () => void
}

const ONBOARDING_STORAGE_KEY = "ecodeli-onboarding-completed"

export default function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
  const { t } = useLanguage()
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState<DOMRect | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Détection du mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Étapes desktop
  const desktopSteps: OnboardingStep[] = [
    {
      title: t("onboarding.welcome"),
      description: t("onboarding.welcomeDescription"),
      target: "body",
      position: "center",
    },
    {
      title: t("onboarding.announcements"),
      description: t("onboarding.announcementsDescription"),
      target: 'a[href*="announcements"]',
      position: "bottom",
    },
    {
      title: t("onboarding.payments"),
      description: t("onboarding.paymentsDescription"),
      target: 'a[href*="payments"]',
      position: "bottom",
    },
    {
      title: t("onboarding.messages"),
      description: t("onboarding.messagesDescription"),
      target: 'a[href*="messages"]',
      position: "bottom",
    },
    {
      title: t("onboarding.complaints"),
      description: t("onboarding.complaintsDescription"),
      target: 'a[href*="complaint"]',
      position: "bottom",
    },
    {
      title: t("onboarding.profile"),
      description: t("onboarding.profileDescription"),
      target: "button:has(.lucide-user)",
      position: "bottom",
      offsetX: -80,
    },
  ]

  // Étapes mobile
  const mobileSteps: OnboardingStep[] = [
    {
      title: t("onboarding.welcome"),
      description: t("onboarding.welcomeDescription"),
      target: "body",
      position: "center",
    },
    {
      title: t("onboarding.openMenu"),
      description: t("onboarding.openMenuDescription"),
      target: "button[aria-label='Open navigation menu']",
      position: "bottom",
      beforeStep: () => {
        const btn = document.querySelector("button[aria-label='Open navigation menu']") as HTMLElement
        btn?.click()
      },
    },
    {
      title: t("onboarding.announcements"),
      description: t("onboarding.announcementsDescription"),
      target: 'nav a[href*="announcements"]',
      position: "right",
    },
    {
      title: t("onboarding.payments"),
      description: t("onboarding.paymentsDescription"),
      target: 'nav a[href*="payments"]',
      position: "right",
    },
    {
      title: t("onboarding.messages"),
      description: t("onboarding.messagesDescription"),
      target: 'nav a[href*="messages"]',
      position: "right",
    },
    {
      title: t("onboarding.complaints"),
      description: t("onboarding.complaintsDescription"),
      target: 'nav a[href*="complaint"]',
      position: "right",
    },
    {
      title: t("onboarding.profile"),
      description: t("onboarding.profileDescription"),
      target: 'button:has(.lucide-user)',
      position: "right",
      offsetX: -80,
    },
  ]

  const steps = isMobile ? mobileSteps : desktopSteps

  // Mise à jour du target + beforeStep
  useEffect(() => {
    const updateTargetPosition = () => {
      const step = steps[currentStep]
      if (step.beforeStep) {
        step.beforeStep()
        setTimeout(doLocate, 300)
      } else {
        doLocate()
      }

      function doLocate() {
        const element = document.querySelector(step.target)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
          setTargetElement(element.getBoundingClientRect())
        } else {
          setTargetElement(null)
        }
      }
    }

    updateTargetPosition()
    window.addEventListener("resize", updateTargetPosition)
    return () => window.removeEventListener("resize", updateTargetPosition)
  }, [currentStep, isMobile])

  const getTooltipPosition = () => {
    const step = steps[currentStep]
    const offsetX = step.offsetX ?? 0
    if (!targetElement || step.position === "center") {
      return {
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      }
    }
    const { left, right, top, bottom, width, height } = targetElement
    const padding = 20
    switch (step.position) {
      case "top":
        return {
          left: `${left + width / 2 + offsetX}px`,
          top: `${top - padding}px`,
          transform: "translate(-50%, -100%)",
        }
      case "right":
        return {
          left: `${right + padding + offsetX}px`,
          top: `${top + height / 2}px`,
          transform: "translateY(-50%)",
        }
      case "bottom":
        return {
          left: `${left + width / 2 + offsetX}px`,
          top: `${bottom + padding}px`,
          transform: "translateX(-50%)",
        }
      case "left":
        return {
          left: `${left - padding + offsetX}px`,
          top: `${top + height / 2}px`,
          transform: "translate(-100%, -50%)",
        }
      default:
        return {
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }
    }
  }

  const getHighlightPosition = () => {
    if (!targetElement || steps[currentStep].position === "center") {
      return {
        left: "50%",
        top: "50%",
        width: "100px",
        height: "100px",
        transform: "translate(-50%, -50%)",
      }
    }
    const padding = 10
    return {
      left: `${targetElement.left - padding}px`,
      top: `${targetElement.top - padding}px`,
      width: `${targetElement.width + padding * 2}px`,
      height: `${targetElement.height + padding * 2}px`,
      transform: "none",
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      complete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const complete = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "true")
    }
    onComplete()
  }

  const tooltipPosition = getTooltipPosition()
  const highlightPosition = getHighlightPosition()

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out" />

      <div
        className="absolute bg-transparent rounded-lg pointer-events-none"
        style={{
          ...highlightPosition,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
          transition: "all 0.3s ease",
        }}
      />

      <div
        className="absolute bg-white rounded-lg shadow-xl p-6 max-w-md z-50 pointer-events-auto"
        style={{
          ...tooltipPosition,
          transition: "all 0.3s ease",
        }}
      >
        <button
          onClick={complete}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label={t("common.close")}
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-semibold text-green-500 mb-2">
          {steps[currentStep].title}
        </h3>
        <p className="text-gray-600 mb-6">
          {steps[currentStep].description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? "bg-green-500" : "bg-gray-300"
                }`} />
            ))}
          </div>

          <div className="flex space-x-3">
            {currentStep > 0 && (
              <button onClick={handlePrevious} className="flex items-center text-gray-600 hover:text-gray-800">
                <ArrowLeft size={16} className="mr-1" />
                {t("common.previous")}
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                {t("common.next")}
                <ArrowRight size={16} className="ml-1" />
              </button>
            ) : (
              <button
                onClick={complete}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                {t("common.getStarted")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
