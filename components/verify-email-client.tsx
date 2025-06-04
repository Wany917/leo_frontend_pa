"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import LanguageSelector from "@/components/language-selector"
import { useLanguage } from "@/components/language-context"

export default function VerifyEmailClient() {
  const router = useRouter()
  const { t } = useLanguage()
  const [code, setCode] = useState<string[]>(Array(6).fill(""))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6)
  }, [])

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && !canResend) {
      setCanResend(true)
    }
  }, [countdown, canResend])

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    if (/^\d{1,6}$/.test(pastedData)) {
      const newCode = [...code]

      for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
        newCode[i] = pastedData[i]
      }

      setCode(newCode)

      const focusIndex = Math.min(pastedData.length, 5)
      inputRefs.current[focusIndex]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    const verificationCode = code.join("")
    const stored = sessionStorage.getItem("signupInfo")

    if (!stored) {
      setError("No signup data found")
      setIsSubmitting(false)
      return
    }

    const { formData } = JSON.parse(stored)

    if (verificationCode.length !== 6) {
      setError(t("auth.pleaseEnterCompleteCode"))
      setIsSubmitting(false)
      return
    }

    console.log(verificationCode)
    console.log(`{'first_name': ${formData.firstname}, 'last_name': ${formData.name}, 'email': ${formData.email}}`)
    const code_valid = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/codes-temporaire/check-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_info: `{'first_name': '${formData.firstname}', 'last_name': '${formData.name}', 'email': '${formData.email}'}`, 
          code: `${verificationCode}` 
        }),
        credentials: "include",
      })

    if (!code_valid.ok) {
      setError(t("auth.invalidVerificationCode"))
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: formData.firstname,
            last_name: formData.name,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
            password: formData.password,
            confirm_password: formData.confirmPassword,
            phone_number: formData.phone,
          }),
          credentials: "include",
        }
      )
    
      const data = await res.json()

      if (!res.ok) {
        console.log(data)
        const msg = (data as any).error_message || t("auth.invalidVerificationCode")
        throw new Error(msg)
      }
      
      sessionStorage.setItem("authToken", data.token)

      const clientRes = await fetch(process.env.NEXT_PUBLIC_API_URL + "/clients/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utilisateur_id: data.user.id,
        })
      })

      const clientData = await clientRes.json()

      if (!clientRes.ok) {
        console.log(clientData)
        throw new Error(t("auth.failedToCreateClient"))
      }

      router.push("/verification-success")
    } catch (err) {
      setError(t("auth.invalidVerificationCode"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    if (!canResend) return

    const signupInfoStr = sessionStorage.getItem("signupInfo")
    if (!signupInfoStr) {
      setError(t("auth.noSignupDataFound"))
      return
    }
    const { formData } = JSON.parse(signupInfoStr)

    setCanResend(false)

    try {
      const resetRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/codes-temporaire/reset-code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            user_info: `{'first_name': '${formData.firstname}', 'last_name': '${formData.name}', 'email': '${formData.email}'}`
          }),
          credentials: "include",
        }
      )
      if (!resetRes.ok) throw new Error("Failed to reset code")
      const { code: verificationCode } = await resetRes.json()

      const emailRes = await fetch(process.env.NEXT_PUBLIC_API_URL + "/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: formData.email,
          subject: "Your EcoDeli Verification Code",
          html: `
            <h2>Welcome to EcoDeli 👋</h2>
            <p>Thank you for signing up, ${formData.firstname}!</p>
            <p>Your verification code is:</p>
            <h3 style="font-size: 24px; color: #10B981;">${verificationCode}</h3>
            <p>Please enter this code to verify your account.</p>
          `,
        }),
      })
      if (!emailRes.ok) throw new Error("Failed to send email")

      setCountdown(60)
      console.log("Code resent")
    } catch (err) {
      setCanResend(true)
      setError(t("auth.failedToResendCode"))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="absolute top-4 right-4 mr-8">
        <LanguageSelector />
      </div>

      <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="EcoDeli" width={120} height={40} className="h-auto mx-auto" />
        </div>

        <h1 className="text-2xl font-semibold text-center mb-2">{t("auth.verifyEmail")}</h1>

        <p className="text-gray-600 text-center mb-8">{t("auth.verificationCodeSent")}</p>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-6 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center space-x-2">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                ref={(el: HTMLInputElement | null) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                maxLength={1}
                value={code[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-xl font-bold rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50"
                required
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-green-50 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-70"
          >
            {isSubmitting ? t("auth.verifyingEmail") : t("auth.verifyEmail")}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600 mb-2">{t("auth.didntReceiveCode")}</p>
          <button
            onClick={handleResendCode}
            disabled={!canResend}
            className="text-green-50 hover:underline disabled:text-gray-400 disabled:no-underline"
          >
            {canResend ? t("auth.resendCode") : `${t("auth.resendCodeIn")} ${countdown}s`}
          </button>
        </div>

        <div className="text-center mt-6">
          <Link href="/signin" className="text-gray-500 hover:text-green-50">
            {t("auth.backToSignUp")}
          </Link>
        </div>
      </div>
    </div>
  )
}

