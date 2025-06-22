"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, ChevronDown, CheckCircle, AlertCircle, CheckIcon, FileText, Upload, Building2, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLanguage } from "@/components/language-context"

interface FormData {
  last_name: string
  first_name: string
  email: string
  password: string
  confirm_password: string
  phone_number?: string
  address?: string
  city?: string
  postal_code?: string
  pays?: string
  date_naissance?: string
  type_compte: string
  is_admin: boolean
  roles: string[]
}

interface DocumentFiles {
  idCard: File | null
  drivingLicense: File | null
  professionalCertificate: File | null
  businessLicense: File | null
}

interface SiretData {
  siret: string
  siren: string
  storeName: string
  businessAddress: string
  contactNumber: string
  companyActivity: string
  isValidated: boolean
}

export function AddUsersContent() {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  const [accountType, setAccountType] = useState<string>("")
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [country, setCountry] = useState<string>("")
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [documentFiles, setDocumentFiles] = useState<DocumentFiles>({
    idCard: null,
    drivingLicense: null,
    professionalCertificate: null,
    businessLicense: null
  })
  const [siretData, setSiretData] = useState<SiretData>({
    siret: '',
    siren: '',
    storeName: '',
    businessAddress: '',
    contactNumber: '',
    companyActivity: '',
    isValidated: false
  })
  const [isValidatingSiret, setIsValidatingSiret] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    last_name: "",
    first_name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone_number: "",
    address: "",
    city: "",
    postal_code: "",
    pays: "",
    date_naissance: "",
    type_compte: "",
    is_admin: false,
    roles: []
  })

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear errors when user starts typing
    if (error) setError(null)
  }

  const toggleRoleType = (roleType: string) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleType)) {
        return prev.filter((type) => type !== roleType)
      }
      return [...prev, roleType]
    })
  }

  const handleFileUpload = (type: 'idCard' | 'drivingLicense' | 'professionalCertificate' | 'businessLicense', file: File | null) => {
    setDocumentFiles(prev => ({ ...prev, [type]: file }))
  }

  const handleSiretChange = (field: keyof SiretData, value: string) => {
    setSiretData(prev => ({ ...prev, [field]: value, isValidated: false }))
  }

  const validateSiret = async () => {
    const companySiret = siretData.siret || siretData.siren
    if (!companySiret.trim()) {
      setError('Please enter a SIRET or SIREN number')
      return
    }

    setIsValidatingSiret(true)
    setError(null)

    try {
      const response = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${companySiret}`)
      const data = await response.json()

      if (data.total_results === 0) {
        setError('Invalid SIRET or SIREN number')
        return
      }

      const company = data.results[0]
      setSiretData(prev => ({
        ...prev,
        storeName: company.nom_complet || '',
        businessAddress: company.siege?.adresse || '',
        companyActivity: company.activite_principale || '',
        isValidated: true
      }))

      setSuccess('Company information validated successfully!')
    } catch (err) {
      setError('Error validating SIRET/SIREN number')
    } finally {
      setIsValidatingSiret(false)
    }
  }

  const uploadDocument = async (userId: number, documentType: string, file: File, accountType: string, token: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('utilisateur_id', userId.toString())
    formData.append('document_type', documentType)
    formData.append('account_type', accountType)

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/justification-pieces/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Failed to upload ${documentType}: ${errorData.message}`)
    }

    return response.json()
  }

  const createMerchantProfile = async (userId: number, token: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/commercants/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        utilisateur_id: userId,
        store_name: siretData.storeName,
        business_address: siretData.businessAddress,
        contact_number: siretData.contactNumber || formData.phone_number || '',
        contract_start_date: new Date().toISOString(),
        contract_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        siret: siretData.siret,
        siren: siretData.siren,
        company_activity: siretData.companyActivity
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Failed to create merchant profile: ${errorData.message}`)
    }

    return response.json()
  }

  const roleOptions = [
    { id: "livreur", label: t("admin.deliveryMan") },
    { id: "commercant", label: t("admin.shopkeepers") },
    { id: "prestataire", label: t("admin.serviceProviders") },
    { id: "administrateur", label: t("admin.administrator") },
  ]

  const validateForm = (): string | null => {
    if (!formData.last_name.trim()) return "Name is required"
    if (!formData.first_name.trim()) return "First name is required"
    if (!formData.email.trim()) return "Email is required"
    if (!formData.password) return "Password is required"
    if (formData.password !== formData.confirm_password) return "Passwords do not match"
    if (formData.password.length < 6) return "Password must be at least 6 characters"
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) return "Please enter a valid email address"
    
    // Validate documents for deliveryman role
    if (selectedRoles.includes('livreur')) {
      if (!documentFiles.idCard) return "ID Card is required for deliveryman role"
      if (!documentFiles.drivingLicense) return "Driving License is required for deliveryman role"
    }
    
    // Validate documents for service provider role
    if (selectedRoles.includes('prestataire')) {
      if (!documentFiles.professionalCertificate) return "Professional Certificate is required for service provider role"
      if (!documentFiles.businessLicense) return "Business License is required for service provider role"
    }
    
    // Validate SIRET for merchant role
    if (selectedRoles.includes('commercant')) {
      if (!siretData.siret.trim() && !siretData.siren.trim()) return "SIRET or SIREN number is required for merchant role"
      if (!siretData.isValidated) return "Please validate the SIRET/SIREN number before submitting"
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    
    setIsLoading(true)

    try {
      const apiData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        postalCode: formData.postal_code || undefined,
        country: country || undefined,
        birth_date: date ? format(date, "yyyy-MM-dd") : undefined,
        roles: selectedRoles.length > 0 ? selectedRoles : undefined,
        privileges: selectedRoles.includes("administrateur") ? "basic" : undefined
      }

      // Get auth token from localStorage or wherever it's stored
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 400 && result.error_message && result.error_message.includes('This email address is already used')) {
          throw new Error('This email address is already registered. Please use a different email address.')
        }
        throw new Error(result.error_message || result.message || `HTTP error! status: ${response.status}`)
      }

      const createdUserId = result.user.id

      // Upload documents for deliveryman role
      if (selectedRoles.includes('livreur')) {
        await uploadDocument(createdUserId, 'idCard', documentFiles.idCard!, 'livreur', token)
        await uploadDocument(createdUserId, 'drivingLicense', documentFiles.drivingLicense!, 'livreur', token)
      }

      // Upload documents for service provider role
      if (selectedRoles.includes('prestataire')) {
        if (documentFiles.professionalCertificate) {
          await uploadDocument(createdUserId, 'professional_certificate', documentFiles.professionalCertificate, 'prestataire', token)
        }
        if (documentFiles.businessLicense) {
          await uploadDocument(createdUserId, 'business_license', documentFiles.businessLicense, 'prestataire', token)
        }
      }

      // Create merchant profile with SIRET data
      if (selectedRoles.includes('commercant')) {
        await createMerchantProfile(createdUserId, token)
      }

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formData.email,
          subject: "Ecoldeli Account Creation Successful",
          body: `
            <p>Dear ${formData.first_name} ${formData.last_name},</p>
            
            <p>Welcome to Ecoldeli! Your account has been successfully created.</p>
            
            <div style="margin: 20px 0;">
              <p><strong>Account Details:</strong></p>
              <ul style="list-style-type: none; padding-left: 20px;">
                <li>Email: ${formData.email}</li>
                <li>Roles: Client${selectedRoles.length > 0 ? ', ' + selectedRoles.join(', ') : ''}</li>
              </ul>
            </div>

            <p>You can now log in to your account using your email address and the password you provided during registration.</p>
            
            <p>For security reasons, we recommend changing your password after your first login.</p>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p style="margin-top: 30px;">
              Best regards,<br>
              The Ecoldeli Team
            </p>
          `
        })
      })

      setSuccess(`User created successfully! A confirmation email has been sent to ${formData.email}.`)
      
      // Store user data for potential document upload
      const createdUserData = {
        email: formData.email,
        firstName: formData.first_name,
        lastName: formData.last_name,
        roles: selectedRoles
      }
      sessionStorage.setItem('lastCreatedUser', JSON.stringify(createdUserData))
      
      setFormData({
        last_name: "",
        first_name: "",
        email: "",
        password: "",
        confirm_password: "",
        phone_number: "",
        address: "",
        city: "",
        postal_code: "",
        pays: "",
        date_naissance: "",
        type_compte: "",
        is_admin: false,
        roles: []
      })
      setDate(undefined)
      setAccountType("")
      setSelectedRoles([])
      setShowRoleDropdown(false)
      setCountry("")
      setDocumentFiles({
        idCard: null,
        drivingLicense: null,
        professionalCertificate: null,
        businessLicense: null
      })
      setSiretData({
        siret: '',
        siren: '',
        storeName: '',
        businessAddress: '',
        contactNumber: '',
        companyActivity: '',
        isValidated: false
      })
      
    } catch (err) {
      console.error('Error creating user:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("admin.addNewAccount")}</h1>

      <div className="mb-6">
        <Link href="/admin/users" className="text-green-50 hover:underline flex items-center">
          <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
          {t("common.back")}
        </Link>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-center mb-8">{t("admin.createAccount")}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="name" className="mb-2 block">
                {t("admin.userName")}
              </Label>
              <Input 
                id="name" 
                placeholder={t("admin.enterUserName")} 
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                required 
              />
            </div>

            <div>
              <Label htmlFor="email" className="mb-2 block">
                {t("admin.userEmail")}
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder={t("admin.enterUserEmail")} 
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required 
              />
            </div>

            <div>
              <Label htmlFor="address" className="mb-2 block">
                {t("admin.address")}
              </Label>
              <Input 
                id="address" 
                placeholder={t("admin.enterAddress")} 
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="firstname" className="mb-2 block">
                {t("admin.userFirstName")}
              </Label>
              <Input 
                id="firstname" 
                placeholder={t("admin.enterFirstName")} 
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                required 
              />
            </div>

            <div>
              <Label htmlFor="phone" className="mb-2 block">
                {t("admin.userPhone")}
              </Label>
              <Input 
                id="phone" 
                placeholder={t("admin.enterPhone")} 
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="city" className="mb-2 block">
                {t("admin.city")}
              </Label>
              <Input 
                id="city" 
                placeholder={t("admin.enterCity")} 
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dob" className="mb-2 block">
                {t("admin.userDateOfBirth")}
              </Label>
              <Input 
                id="dob" 
                type="date" 
                placeholder="YYYY-MM-DD" 
                value={date ? format(date, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setDate(new Date(e.target.value))
                  } else {
                    setDate(undefined)
                  }
                }}
              />
            </div>

            <div>
              <Label htmlFor="password" className="mb-2 block">
                {t("admin.password")}
              </Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••" 
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required 
              />
            </div>

            <div>
              <Label htmlFor="postal" className="mb-2 block">
                {t("admin.postalCode")}
              </Label>
              <Input 
                id="postal" 
                placeholder={t("admin.enterPostalCode")} 
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
              />
            </div>

            <div>
              <Label className="mb-2 block">
                {t("admin.accountType")}
              </Label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full px-4 py-3 rounded-md bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-50 text-left flex justify-between items-center"
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                >
                  <span>
                    {selectedRoles.length === 0
                      ? t("admin.client") + " (Default)"
                      : `${t("admin.client")}, ` + selectedRoles.map(role => roleOptions.find(opt => opt.id === role)?.label).join(", ")}
                  </span>
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      className="flex w-full text-left px-4 py-2 bg-gray-50 justify-between items-center cursor-not-allowed"
                      disabled
                    >
                      <span className="text-gray-600">{t("admin.client")} (Default)</span>
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    </button>
                    {roleOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className="flex w-full text-left px-4 py-2 hover:bg-gray-100 justify-between items-center"
                        onClick={() => toggleRoleType(option.id)}
                      >
                        <span>{option.label}</span>
                        {selectedRoles.includes(option.id) && <CheckIcon className="h-4 w-4 text-green-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="confirm-password" className="mb-2 block">
                {t("admin.confirmPassword")}
              </Label>
              <Input 
                id="confirm-password" 
                type="password" 
                placeholder="••••••" 
                value={formData.confirm_password}
                onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                required 
              />
            </div>

            <div>
              <Label htmlFor="country" className="mb-2 block">
                {t("admin.country")}
              </Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger id="country" className="w-full">
                  <SelectValue placeholder={t("admin.selectCountry")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNITED KINGDOM">{t("admin.unitedKingdom")}</SelectItem>
                  <SelectItem value="UNITED STATES">{t("admin.unitedStates")}</SelectItem>
                  <SelectItem value="FRANCE">{t("admin.france")}</SelectItem>
                  <SelectItem value="GERMANY">{t("admin.germany")}</SelectItem>
                  <SelectItem value="SPAIN">{t("admin.spain")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Document Upload and SIRET Sections */}
          {selectedRoles.length > 0 && (
            <div className="space-y-6">
              {/* Deliveryman Documents */}
              {selectedRoles.includes('livreur') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Deliveryman Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block text-blue-700">ID Card</Label>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('idCard', e.target.files?.[0] || null)}
                        className="border-blue-300"
                      />
                      {documentFiles.idCard && (
                        <p className="text-sm text-blue-600 mt-1">Selected: {documentFiles.idCard.name}</p>
                      )}
                    </div>
                    <div>
                      <Label className="mb-2 block text-blue-700">Driving License</Label>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('drivingLicense', e.target.files?.[0] || null)}
                        className="border-blue-300"
                      />
                      {documentFiles.drivingLicense && (
                        <p className="text-sm text-blue-600 mt-1">Selected: {documentFiles.drivingLicense.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Service Provider Documents */}
               {selectedRoles.includes('prestataire') && (
                 <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                   <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                     <FileText className="h-5 w-5 mr-2" />
                     Service Provider Documents
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <Label className="mb-2 block text-green-700">Professional Certificate</Label>
                       <Input
                         type="file"
                         accept=".pdf,.jpg,.jpeg,.png"
                         onChange={(e) => handleFileUpload('professionalCertificate', e.target.files?.[0] || null)}
                         className="border-green-300"
                       />
                       {documentFiles.professionalCertificate && (
                         <p className="text-sm text-green-600 mt-1">Selected: {documentFiles.professionalCertificate.name}</p>
                       )}
                     </div>
                     <div>
                       <Label className="mb-2 block text-green-700">Business License</Label>
                       <Input
                         type="file"
                         accept=".pdf,.jpg,.jpeg,.png"
                         onChange={(e) => handleFileUpload('businessLicense', e.target.files?.[0] || null)}
                         className="border-green-300"
                       />
                       {documentFiles.businessLicense && (
                         <p className="text-sm text-green-600 mt-1">Selected: {documentFiles.businessLicense.name}</p>
                       )}
                     </div>
                   </div>
                 </div>
               )}

              {/* Merchant SIRET/SIREN */}
              {selectedRoles.includes('commercant') && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Merchant Registration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block text-purple-700">SIRET Number</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter SIRET number"
                          value={siretData.siret}
                          onChange={(e) => handleSiretChange('siret', e.target.value)}
                          className="border-purple-300"
                        />
                        <Button
                          type="button"
                          onClick={validateSiret}
                          disabled={isValidatingSiret || !siretData.siret}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {isValidatingSiret ? 'Validating...' : 'Validate'}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block text-purple-700">SIREN Number</Label>
                      <Input
                        placeholder="Enter SIREN number"
                        value={siretData.siren}
                        onChange={(e) => handleSiretChange('siren', e.target.value)}
                        className="border-purple-300"
                      />
                    </div>
                  </div>
                  
                  {siretData.isValidated && (
                    <div className="mt-4 p-4 bg-white border border-purple-300 rounded">
                      <h4 className="font-medium text-purple-800 mb-2">Company Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-purple-700">Store Name:</span>
                          <p className="text-purple-600">{siretData.storeName}</p>
                        </div>
                        <div>
                          <span className="font-medium text-purple-700">Business Address:</span>
                          <p className="text-purple-600">{siretData.businessAddress}</p>
                        </div>
                        <div>
                          <span className="font-medium text-purple-700">Activity:</span>
                          <p className="text-purple-600">{siretData.companyActivity}</p>
                        </div>
                        <div>
                          <span className="font-medium text-purple-700">Contact:</span>
                          <p className="text-purple-600">{siretData.contactNumber || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center mt-8">
            <Button type="submit" disabled={isLoading} className="bg-[#8CD790] hover:bg-[#7ac57e] text-white px-8">
              {isLoading ? "Creating..." : t("common.create")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

