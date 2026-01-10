import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

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

// GET - Get page by slug
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    const supabase = getAdminClient()

    if (slug) {
      // Get single page
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) {
        console.error('Get page error:', error)
        return NextResponse.json(
          { error: `Pagina niet gevonden` },
          { status: 404 }
        )
      }

      return NextResponse.json({ page: data })
    } else {
      // Get all pages
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .order('slug', { ascending: true })

      if (error) {
        console.error('Get pages error:', error)
        return NextResponse.json(
          { error: `Kon pagina's niet ophalen: ${error.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json({ pages: data })
    }
  } catch (error) {
    console.error('Get page error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

// PUT - Update page content
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, title, content } = body

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is verplicht' },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content

    const { data, error } = await supabase
      .from('cms_pages')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single()

    if (error) {
      console.error('Update page error:', error)
      return NextResponse.json(
        { error: `Kon pagina niet bijwerken: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, page: data })
  } catch (error) {
    console.error('Update page error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
