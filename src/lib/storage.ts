import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type PhotoType = 'pre' | 'post' | 'issue'

/**
 * Upload a photo to Supabase Storage
 */
export async function uploadPhoto(
  file: File,
  customerId: string,
  type: PhotoType
): Promise<{ url: string; path: string } | null> {
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `${customerId}/${type}/${timestamp}.${extension}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('customer-photos')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('customer-photos')
      .getPublicUrl(data.path)

    return {
      url: urlData.publicUrl,
      path: data.path,
    }
  } catch (error) {
    console.error('Upload error:', error)
    return null
  }
}

/**
 * Delete a photo from Supabase Storage
 */
export async function deletePhoto(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('customer-photos')
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}

/**
 * Get a signed URL for a private photo (if bucket is not public)
 */
export async function getSignedUrl(
  path: string,
  expiresIn = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('customer-photos')
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error('Signed URL error:', error)
      return null
    }

    return data.signedUrl
  } catch (error) {
    console.error('Signed URL error:', error)
    return null
  }
}

/**
 * List all photos for a customer
 */
export async function listCustomerPhotos(
  customerId: string,
  type?: PhotoType
): Promise<string[]> {
  try {
    const path = type ? `${customerId}/${type}` : customerId

    const { data, error } = await supabase.storage
      .from('customer-photos')
      .list(path)

    if (error) {
      console.error('List error:', error)
      return []
    }

    return data.map((file) => `${path}/${file.name}`)
  } catch (error) {
    console.error('List error:', error)
    return []
  }
}
