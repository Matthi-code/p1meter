'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Loader2, Camera, Image as ImageIcon } from 'lucide-react'

type PhotoUploadProps = {
  token: string
  type: 'pre' | 'post' | 'issue'
  installationId?: string
  maxPhotos?: number
  onUploadComplete?: (photos: UploadedPhoto[]) => void
  className?: string
}

type UploadedPhoto = {
  id?: string
  url: string
  path: string
  file?: File
  preview?: string
  uploading?: boolean
  error?: string
}

export default function PhotoUpload({
  token,
  type,
  installationId,
  maxPhotos = 5,
  onUploadComplete,
  className = '',
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const uploadPhoto = async (file: File): Promise<UploadedPhoto | null> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('token', token)
    formData.append('type', type)
    if (installationId) {
      formData.append('installation_id', installationId)
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      return {
        id: result.data.id,
        url: result.data.url,
        path: result.data.path,
      }
    } catch (error) {
      console.error('Upload error:', error)
      return null
    }
  }

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      const remainingSlots = maxPhotos - photos.length
      const filesToUpload = fileArray.slice(0, remainingSlots)

      if (filesToUpload.length === 0) return

      // Create preview entries
      const newPhotos: UploadedPhoto[] = filesToUpload.map((file) => ({
        url: '',
        path: '',
        file,
        preview: URL.createObjectURL(file),
        uploading: true,
      }))

      setPhotos((prev) => [...prev, ...newPhotos])

      // Upload each file
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i]
        const result = await uploadPhoto(file)

        setPhotos((prev) => {
          const updated = [...prev]
          const index = prev.length - filesToUpload.length + i
          if (result) {
            updated[index] = {
              ...updated[index],
              id: result.id,
              url: result.url,
              path: result.path,
              uploading: false,
            }
          } else {
            updated[index] = {
              ...updated[index],
              uploading: false,
              error: 'Upload mislukt',
            }
          }
          return updated
        })
      }

      // Notify parent
      if (onUploadComplete) {
        setPhotos((currentPhotos) => {
          const successfulPhotos = currentPhotos.filter((p) => p.url && !p.error)
          onUploadComplete(successfulPhotos)
          return currentPhotos
        })
      }
    },
    [photos.length, maxPhotos, token, type, installationId, onUploadComplete]
  )

  const removePhoto = async (index: number) => {
    const photo = photos[index]

    // Remove from UI immediately
    setPhotos((prev) => prev.filter((_, i) => i !== index))

    // Clean up preview URL
    if (photo.preview) {
      URL.revokeObjectURL(photo.preview)
    }

    // Delete from server if uploaded
    if (photo.path || photo.id) {
      try {
        const params = new URLSearchParams({ token })
        if (photo.path) params.append('path', photo.path)
        if (photo.id) params.append('id', photo.id)

        await fetch(`/api/upload?${params}`, {
          method: 'DELETE',
        })
      } catch (error) {
        console.error('Delete error:', error)
      }
    }

    // Notify parent
    if (onUploadComplete) {
      const remainingPhotos = photos.filter((_, i) => i !== index).filter((p) => p.url && !p.error)
      onUploadComplete(remainingPhotos)
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  return (
    <div className={className}>
      {/* Upload area */}
      {photos.length < maxPhotos && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-xl p-6 text-center transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          `}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
            id={`photo-upload-${type}`}
          />
          <label
            htmlFor={`photo-upload-${type}`}
            className="cursor-pointer block"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Camera className="h-5 w-5 text-blue-600" />
                </div>
                <div className="bg-gray-100 p-2 rounded-full">
                  <ImageIcon className="h-5 w-5 text-gray-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Foto&apos;s toevoegen
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Sleep foto&apos;s hierheen of klik om te selecteren
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Max {maxPhotos} foto&apos;s, 10MB per foto
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
            >
              {/* Image */}
              <img
                src={photo.preview || photo.url}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Loading overlay */}
              {photo.uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}

              {/* Error overlay */}
              {photo.error && (
                <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                  <p className="text-white text-xs text-center px-2">{photo.error}</p>
                </div>
              )}

              {/* Remove button */}
              {!photo.uploading && (
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}

          {/* Add more button if under limit */}
          {photos.length < maxPhotos && (
            <label
              htmlFor={`photo-upload-${type}`}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <Upload className="h-6 w-6 text-gray-400" />
            </label>
          )}
        </div>
      )}

      {/* Counter */}
      <p className="text-xs text-gray-500 mt-2 text-right">
        {photos.length} / {maxPhotos} foto&apos;s
      </p>
    </div>
  )
}
