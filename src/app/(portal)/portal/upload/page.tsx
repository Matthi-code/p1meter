'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { mockCustomers } from '@/lib/mock-data'
import { Camera, Upload, X, CheckCircle2, Image, Loader2 } from 'lucide-react'
import type { Customer } from '@/types/database'

function getCustomerByToken(token: string | null): Customer | null {
  if (!token) return null
  return mockCustomers.find((c) => c.portal_token === token) || null
}

type PhotoUpload = {
  id: string
  file: File
  preview: string
  type: 'meterkast' | 'meter' | 'omgeving'
}

const photoTypes = [
  { key: 'meterkast', label: 'Meterkast (overzicht)', description: 'Foto van de hele meterkast' },
  { key: 'meter', label: 'Slimme meter (close-up)', description: 'Duidelijke foto van de meter zelf' },
  { key: 'omgeving', label: 'Omgeving', description: 'Foto van de ruimte rondom de meterkast' },
] as const

function UploadContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const customer = getCustomerByToken(token)

  const [photos, setPhotos] = useState<PhotoUpload[]>([])
  const [submitted, setSubmitted] = useState(false)

  if (!customer) {
    return null
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: PhotoUpload['type']) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const newPhoto: PhotoUpload = {
          id: Math.random().toString(36).substring(7),
          file,
          preview: reader.result as string,
          type,
        }
        setPhotos((prev) => [...prev, newPhoto])
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    e.target.value = ''
  }

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  const handleSubmit = () => {
    // Mock submit
    console.log('Photos submitted:', photos.map((p) => ({ type: p.type, name: p.file.name })))
    setSubmitted(true)
  }

  const getPhotosOfType = (type: PhotoUpload['type']) => {
    return photos.filter((p) => p.type === type)
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Foto&apos;s ontvangen!
          </h1>
          <p className="text-gray-600">
            Bedankt voor het uploaden van {photos.length} foto&apos;s. De monteur kan
            zich nu goed voorbereiden.
          </p>
          <a
            href={`/portal?token=${token}`}
            className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Terug naar overzicht
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Foto&apos;s uploaden</h1>
        <p className="text-gray-600 mt-1">
          Upload foto&apos;s van uw meterkast zodat de monteur zich kan voorbereiden
        </p>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Camera className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Tips voor goede foto&apos;s:</p>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>Zorg voor voldoende licht</li>
              <li>Maak scherpe foto&apos;s (niet bewogen)</li>
              <li>Zorg dat de hele meterkast zichtbaar is</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload sections */}
      {photoTypes.map((photoType) => (
        <div key={photoType.key} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">{photoType.label}</h2>
              <p className="text-sm text-gray-500">{photoType.description}</p>
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={(e) => handleFileSelect(e, photoType.key)}
                className="hidden"
              />
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Upload className="h-4 w-4" />
                <span className="text-sm font-medium">Upload</span>
              </div>
            </label>
          </div>

          {/* Preview */}
          {getPhotosOfType(photoType.key).length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {getPhotosOfType(photoType.key).map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.preview}
                    alt={`${photoType.label} preview`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
              <Image className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Nog geen foto&apos;s</p>
            </div>
          )}
        </div>
      ))}

      {/* Submit */}
      {photos.length > 0 && (
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {photos.length} foto&apos;s versturen
        </button>
      )}
    </div>
  )
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 text-blue-600 animate-spin" /></div>}>
      <UploadContent />
    </Suspense>
  )
}
