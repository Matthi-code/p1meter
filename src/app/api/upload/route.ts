import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const token = formData.get('token') as string | null
    const type = formData.get('type') as string | null // 'pre' | 'post' | 'issue'
    const installationId = formData.get('installation_id') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only images are allowed' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    // Get customer by portal token
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('portal_token', token)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'jpg'
    const photoType = type || 'pre'
    const filename = `${customer.id}/${photoType}/${timestamp}.${extension}`

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('customer-photos')
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Upload failed: ' + uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('customer-photos')
      .getPublicUrl(uploadData.path)

    // Save photo record to database
    const { data: photoRecord, error: dbError } = await supabase
      .from('customer_photos')
      .insert({
        customer_id: customer.id,
        installation_id: installationId || null,
        type: photoType as 'pre' | 'post' | 'issue',
        url: urlData.publicUrl,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Still return success - photo is uploaded, just not tracked in DB
    }

    return NextResponse.json({
      success: true,
      data: {
        url: urlData.publicUrl,
        path: uploadData.path,
        id: photoRecord?.id,
      },
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het uploaden' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const token = searchParams.get('token')
    const photoId = searchParams.get('id')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Verify token
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('portal_token', token)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Delete from storage if path provided
    if (path) {
      const { error: deleteError } = await supabase.storage
        .from('customer-photos')
        .remove([path])

      if (deleteError) {
        console.error('Storage delete error:', deleteError)
      }
    }

    // Delete from database if id provided
    if (photoId) {
      await supabase
        .from('customer_photos')
        .delete()
        .eq('id', photoId)
        .eq('customer_id', customer.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het verwijderen' },
      { status: 500 }
    )
  }
}
