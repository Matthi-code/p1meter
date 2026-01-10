'use client'

import { useState, useEffect, useRef } from 'react'
import { Camera, Upload, Trash2, Loader2, Image, X, ZoomIn } from 'lucide-react'
import type { CustomerPhoto } from '@/types/supabase'
import type { PhotoType } from '@/types/database'

interface InstallationPhotosProps {
  installationId: string
  readOnly?: boolean
}

export function InstallationPhotos({ installationId, readOnly = false }: InstallationPhotosProps) {
  const [photos, setPhotos] = useState<CustomerPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState<PhotoType | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<CustomerPhoto | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadType, setUploadType] = useState<PhotoType>('pre')

  // Fetch photos on mount
  useEffect(() => {
    fetchPhotos()
  }, [installationId])

  async function fetchPhotos() {
    try {
      const response = await fetch(`/api/installations/${installationId}/photos`)
      const data = await response.json()
      if (data.photos) {
        setPhotos(data.photos)
      }
    } catch (error) {
      console.error('Error fetching photos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpload(file: File, type: PhotoType) {
    setIsUploading(type)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch(`/api/installations/${installationId}/photos`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success && data.photo) {
        setPhotos((prev) => [data.photo, ...prev])
      } else {
        alert(data.error || 'Upload mislukt')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Er is een fout opgetreden bij het uploaden')
    } finally {
      setIsUploading(null)
    }
  }

  async function handleDelete(photo: CustomerPhoto) {
    if (!confirm('Weet je zeker dat je deze foto wilt verwijderen?')) return

    try {
      const response = await fetch(
        `/api/installations/${installationId}/photos?photoId=${photo.id}`,
        { method: 'DELETE' }
      )

      const data = await response.json()

      if (data.success) {
        setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
      } else {
        alert(data.error || 'Verwijderen mislukt')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Er is een fout opgetreden bij het verwijderen')
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      handleUpload(file, uploadType)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function triggerUpload(type: PhotoType) {
    setUploadType(type)
    fileInputRef.current?.click()
  }

  const prePhotos = photos.filter((p) => p.type === 'pre')
  const postPhotos = photos.filter((p) => p.type === 'post')
  const issuePhotos = photos.filter((p) => p.type === 'issue')

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <Camera className="h-4 w-4 text-slate-500" />
        Foto&apos;s
      </h3>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pre-installation photos */}
          <PhotoSection
            title="Voor installatie"
            photos={prePhotos}
            type="pre"
            isUploading={isUploading === 'pre'}
            onUpload={() => triggerUpload('pre')}
            onDelete={handleDelete}
            onView={setSelectedPhoto}
            readOnly={readOnly}
          />

          {/* Post-installation photos */}
          <PhotoSection
            title="Na installatie"
            photos={postPhotos}
            type="post"
            isUploading={isUploading === 'post'}
            onUpload={() => triggerUpload('post')}
            onDelete={handleDelete}
            onView={setSelectedPhoto}
            readOnly={readOnly}
          />

          {/* Issue photos (only show if there are any) */}
          {issuePhotos.length > 0 && (
            <PhotoSection
              title="Problemen"
              photos={issuePhotos}
              type="issue"
              isUploading={isUploading === 'issue'}
              onUpload={() => triggerUpload('issue')}
              onDelete={handleDelete}
              onView={setSelectedPhoto}
              readOnly={readOnly}
            />
          )}
        </div>
      )}

      {/* Photo viewer modal */}
      {selectedPhoto && (
        <PhotoViewer photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </div>
  )
}

interface PhotoSectionProps {
  title: string
  photos: CustomerPhoto[]
  type: PhotoType
  isUploading: boolean
  onUpload: () => void
  onDelete: (photo: CustomerPhoto) => void
  onView: (photo: CustomerPhoto) => void
  readOnly: boolean
}

function PhotoSection({
  title,
  photos,
  type,
  isUploading,
  onUpload,
  onDelete,
  onView,
  readOnly,
}: PhotoSectionProps) {
  const bgColors = {
    pre: 'bg-amber-50 border-amber-200',
    post: 'bg-emerald-50 border-emerald-200',
    issue: 'bg-red-50 border-red-200',
  }

  const iconColors = {
    pre: 'text-amber-600',
    post: 'text-emerald-600',
    issue: 'text-red-600',
  }

  return (
    <div className={`rounded-xl border p-4 ${bgColors[type]}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`text-sm font-medium ${iconColors[type]}`}>{title}</h4>
        {!readOnly && (
          <button
            onClick={onUpload}
            disabled={isUploading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isUploading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white text-slate-700 hover:bg-slate-100 shadow-sm'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Uploaden...
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" />
                Foto toevoegen
              </>
            )}
          </button>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="flex items-center justify-center py-6 text-slate-400">
          <div className="text-center">
            <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Geen foto's</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square">
              <img
                src={photo.url}
                alt={`${title} foto`}
                className="w-full h-full object-cover rounded-lg cursor-pointer"
                onClick={() => onView(photo)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onView(photo)
                }}
                className="absolute top-1 left-1 p-1.5 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ZoomIn className="h-3 w-3" />
              </button>
              {!readOnly && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(photo)
                  }}
                  className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface PhotoViewerProps {
  photo: CustomerPhoto
  onClose: () => void
}

function PhotoViewer({ photo, onClose }: PhotoViewerProps) {
  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
      >
        <X className="h-6 w-6" />
      </button>
      <img
        src={photo.url}
        alt="Foto"
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {new Date(photo.uploaded_at).toLocaleDateString('nl-NL', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  )
}
