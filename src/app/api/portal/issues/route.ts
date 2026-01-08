import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Map frontend issue types to database categories
const categoryMap: Record<string, 'malfunction' | 'question' | 'complaint'> = {
  'no_data': 'malfunction',
  'connection': 'malfunction',
  'led_red': 'malfunction',
  'physical': 'malfunction',
  'question': 'question',
  'other': 'question',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, issue_type, description, photo_url } = body

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    if (!issue_type || !description) {
      return NextResponse.json(
        { error: 'Issue type and description are required' },
        { status: 400 }
      )
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

    // Get latest installation for this customer (optional link)
    const { data: installation } = await supabase
      .from('installations')
      .select('id')
      .eq('customer_id', customer.id)
      .order('scheduled_at', { ascending: false })
      .limit(1)
      .single()

    // Map category
    const category = categoryMap[issue_type] || 'question'

    // Create issue
    const { data, error } = await supabase
      .from('issues')
      .insert({
        customer_id: customer.id,
        installation_id: installation?.id || null,
        category,
        description: `[${issue_type}] ${description}`,
        photo_url: photo_url || null,
        status: 'open',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Issue creation error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het opslaan' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
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

    // Get issues for this customer
    const { data: issues } = await supabase
      .from('issues')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ data: issues || [] })
  } catch (error) {
    console.error('Get issues error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
