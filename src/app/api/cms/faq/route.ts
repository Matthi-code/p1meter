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

// GET - Get all FAQ items
export async function GET() {
  try {
    const supabase = getAdminClient()

    const { data, error } = await supabase
      .from('faq_items')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Get FAQ error:', error)
      return NextResponse.json(
        { error: `Kon FAQ items niet ophalen: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ items: data })
  } catch (error) {
    console.error('Get FAQ error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

// POST - Create new FAQ item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, question, answer, sort_order, active } = body

    if (!category || !question || !answer) {
      return NextResponse.json(
        { error: 'Categorie, vraag en antwoord zijn verplicht' },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()

    const { data, error } = await supabase
      .from('faq_items')
      .insert({
        category,
        question,
        answer,
        sort_order: sort_order || 0,
        active: active !== false,
      })
      .select()
      .single()

    if (error) {
      console.error('Create FAQ error:', error)
      return NextResponse.json(
        { error: `Kon FAQ item niet aanmaken: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, item: data })
  } catch (error) {
    console.error('Create FAQ error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

// PUT - Update FAQ item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, category, question, answer, sort_order, active } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is verplicht' },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (category !== undefined) updateData.category = category
    if (question !== undefined) updateData.question = question
    if (answer !== undefined) updateData.answer = answer
    if (sort_order !== undefined) updateData.sort_order = sort_order
    if (active !== undefined) updateData.active = active

    const { data, error } = await supabase
      .from('faq_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update FAQ error:', error)
      return NextResponse.json(
        { error: `Kon FAQ item niet bijwerken: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, item: data })
  } catch (error) {
    console.error('Update FAQ error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

// DELETE - Delete FAQ item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is verplicht' },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()

    const { error } = await supabase
      .from('faq_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete FAQ error:', error)
      return NextResponse.json(
        { error: `Kon FAQ item niet verwijderen: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete FAQ error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
