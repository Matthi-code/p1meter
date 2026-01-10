import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Server-side Supabase client with service role key (admin privileges)
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// GET - Get all photos for an installation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: installationId } = await params

    if (!installationId) {
      return NextResponse.json(
        { error: 'Installation ID is required' },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()

    const { data: photos, error } = await supabase
      .from('customer_photos')
      .select('*')
      .eq('installation_id', installationId)
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('Get photos error:', error)
      return NextResponse.json(
        { error: `Kon foto\'s niet ophalen: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ photos })
  } catch (error) {
    console.error('Get photos error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

// POST - Upload a photo for an installation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: installationId } = await params

    if (!installationId) {
      return NextResponse.json(
        { error: 'Installation ID is required' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'pre' | 'post' | 'issue'

    if (!file) {
      return NextResponse.json(
        { error: 'Geen bestand ontvangen' },
        { status: 400 }
      )
    }

    if (!type || !['pre', 'post', 'issue'].includes(type)) {
      return NextResponse.json(
        { error: 'Ongeldig foto type' },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()

    // Get installation to find customer_id
    const { data: installation, error: installationError } = await supabase
      .from('installations')
      .select('id, customer_id')
      .eq('id', installationId)
      .single()

    if (installationError || !installation) {
      return NextResponse.json(
        { error: 'Installatie niet gevonden' },
        { status: 404 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `${installation.customer_id}/${installationId}/${type}_${Date.now()}.${fileExtension}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('customer-photos')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: `Upload mislukt: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('customer-photos')
      .getPublicUrl(fileName)

    // Save photo record to database
    const { data: photoRecord, error: dbError } = await supabase
      .from('customer_photos')
      .insert({
        customer_id: installation.customer_id,
        installation_id: installationId,
        type,
        url: publicUrl,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Try to delete uploaded file
      await supabase.storage.from('customer-photos').remove([fileName])
      return NextResponse.json(
        { error: `Database fout: ${dbError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      photo: photoRecord,
      message: 'Foto succesvol geüpload',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: installationId } = await params
    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get('photoId')

    if (!installationId || !photoId) {
      return NextResponse.json(
        { error: 'Installation ID en Photo ID zijn verplicht' },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()

    // Get photo to find file path
    const { data: photo, error: fetchError } = await supabase
      .from('customer_photos')
      .select('*')
      .eq('id', photoId)
      .eq('installation_id', installationId)
      .single()

    if (fetchError || !photo) {
      return NextResponse.json(
        { error: 'Foto niet gevonden' },
        { status: 404 }
      )
    }

    // Extract file path from URL
    const urlParts = photo.url.split('/customer-photos/')
    if (urlParts.length > 1) {
      const filePath = urlParts[1]
      await supabase.storage.from('customer-photos').remove([filePath])
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('customer_photos')
      .delete()
      .eq('id', photoId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: `Kon foto niet verwijderen: ${deleteError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Foto verwijderd',
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
