import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, installation_id, rating, feedback, confirmed } = body

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Valid rating (1-5) is required' }, { status: 400 })
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

    // Get installation for this customer (if not provided)
    let installationId = installation_id
    if (!installationId) {
      const { data: installation } = await supabase
        .from('installations')
        .select('id')
        .eq('customer_id', customer.id)
        .eq('status', 'completed')
        .order('scheduled_at', { ascending: false })
        .limit(1)
        .single()

      if (!installation) {
        return NextResponse.json(
          { error: 'Geen voltooide installatie gevonden' },
          { status: 400 }
        )
      }
      installationId = installation.id
    }

    // Check if evaluation already exists
    const { data: existingEval } = await supabase
      .from('evaluations')
      .select('id')
      .eq('installation_id', installationId)
      .single()

    if (existingEval) {
      return NextResponse.json(
        { error: 'Er is al een evaluatie voor deze installatie' },
        { status: 400 }
      )
    }

    // Create evaluation
    const evaluationData = {
      installation_id: installationId,
      customer_id: customer.id,
      rating_overall: rating,
      feedback: feedback || null,
      confirmed_at: confirmed ? new Date().toISOString() : null,
    }
    const { data, error } = await supabase
      .from('evaluations')
      .insert(evaluationData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Evaluation error:', error)
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

    // Get evaluations for this customer
    const { data: evaluations } = await supabase
      .from('evaluations')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ data: evaluations || [] })
  } catch (error) {
    console.error('Get evaluations error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
