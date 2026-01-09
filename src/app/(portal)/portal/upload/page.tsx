'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Camera, CheckCircle2, Loader2 } from 'lucide-react'
import PhotoUpload from '@/components/PhotoUpload'

type UploadedPhoto = {
  id?: string
  url: string
  path: string
}

function UploadContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [meterkastPhotos, setMeterkastPhotos] = useState<UploadedPhoto[]>([])
  const [meterPhotos, setMeterPhotos] = useState<UploadedPhoto[]>([])
  const [omgevingPhotos, setOmgevingPhotos] = useState<UploadedPhoto[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!token) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Geen geldige toegangstoken gevonden.
      </div>
    )
  }

  const totalPhotos = meterkastPhotos.length + meterPhotos.length + omgevingPhotos.length

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Photos are already uploaded, just mark as done
    setSubmitted(true)
    setIsSubmitting(false)
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
            Bedankt voor het uploaden van {totalPhotos} foto&apos;s. De Energie Buddy kan
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
          Upload foto&apos;s van uw meterkast zodat de Energie Buddy zich kan voorbereiden
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

      {/* Meterkast photos */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-4">
          <h2 className="font-semibold text-gray-900">Meterkast (overzicht)</h2>
          <p className="text-sm text-gray-500">Foto van de hele meterkast</p>
        </div>
        <PhotoUpload
          token={token}
          type="pre"
          maxPhotos={3}
          onUploadComplete={setMeterkastPhotos}
        />
      </div>

      {/* Meter photos */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-4">
          <h2 className="font-semibold text-gray-900">Slimme meter (close-up)</h2>
          <p className="text-sm text-gray-500">Duidelijke foto van de meter zelf</p>
        </div>
        <PhotoUpload
          token={token}
          type="pre"
          maxPhotos={3}
          onUploadComplete={setMeterPhotos}
        />
      </div>

      {/* Omgeving photos */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-4">
          <h2 className="font-semibold text-gray-900">Omgeving</h2>
          <p className="text-sm text-gray-500">Foto van de ruimte rondom de meterkast</p>
        </div>
        <PhotoUpload
          token={token}
          type="pre"
          maxPhotos={3}
          onUploadComplete={setOmgevingPhotos}
        />
      </div>

      {/* Submit */}
      {totalPhotos > 0 && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Verzenden...
            </>
          ) : (
            `${totalPhotos} foto's versturen`
          )}
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
