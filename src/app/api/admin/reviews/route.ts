import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

// GET - Get all reviews for admin
export async function GET() {
  try {
    const supabase = getAdminClient()

    // Get all evaluations with customer info
    const { data: evaluations, error } = await supabase
      .from('evaluations')
      .select(`
        id,
        rating_overall,
        feedback,
        recommend,
        featured,
        created_at,
        customers (
          name,
          city
        )
      `)
      .not('feedback', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch reviews error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform to review format
    const reviews = (evaluations || [])
      .filter((e) => e.feedback && e.feedback.trim().length > 0)
      .map((e) => {
        const customer = e.customers as unknown as { name: string; city: string } | null
        return {
          id: e.id,
          rating_overall: e.rating_overall,
          feedback: e.feedback,
          recommend: e.recommend,
          featured: e.featured ?? false,
          created_at: e.created_at,
          customer_name: customer?.name || 'Onbekend',
          customer_city: customer?.city || '',
        }
      })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}

// PUT - Update review (toggle featured)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, featured } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is verplicht' }, { status: 400 })
    }

    const supabase = getAdminClient()

    const { error } = await supabase
      .from('evaluations')
      .update({ featured })
      .eq('id', id)

    if (error) {
      console.error('Update review error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update review error:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}
