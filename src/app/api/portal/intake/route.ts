import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, location, accessibility, parking_available, parking_notes, pets_present, pets_info, doorbell_works, notes } = body

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

    // Check if intake form already exists
    const { data: existingForm } = await supabase
      .from('intake_forms')
      .select('id')
      .eq('customer_id', customer.id)
      .single()

    // Build parking_info string
    const parkingInfo = parking_available
      ? `Parkeren beschikbaar${parking_notes ? `: ${parking_notes}` : ''}`
      : `Geen parkeren${parking_notes ? `: ${parking_notes}` : ''}`

    // Build pets string
    const petsString = pets_present
      ? `Huisdieren aanwezig${pets_info ? `: ${pets_info}` : ''}`
      : 'Geen huisdieren'

    // Build notes with doorbell info
    const fullNotes = [
      notes,
      doorbell_works === false ? 'Deurbel werkt niet' : null
    ].filter(Boolean).join('. ')

    const intakeData = {
      customer_id: customer.id,
      location: location || null,
      accessibility: accessibility || null,
      parking_info: parkingInfo,
      pets: petsString,
      notes: fullNotes || null,
    }

    let result
    if (existingForm) {
      // Update existing form
      const { data, error } = await supabase
        .from('intake_forms')
        .update(intakeData)
        .eq('id', existingForm.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new form
      const { data, error } = await supabase
        .from('intake_forms')
        .insert(intakeData)
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Intake form error:', error)
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

    // Get intake form
    const { data: intakeForm } = await supabase
      .from('intake_forms')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({ data: intakeForm || null })
  } catch (error) {
    console.error('Get intake form error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
