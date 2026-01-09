import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }
  return createClient(url, key)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Get customer by portal token
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, name, address, postal_code, city')
      .eq('portal_token', token)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get house profile
    const { data: profile, error: profileError } = await supabase
      .from('house_profiles')
      .select('*')
      .eq('customer_id', customer.id)
      .single()

    // Profile might not exist yet, that's OK
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile error:', profileError)
    }

    return NextResponse.json({
      customer,
      profile: profile || null,
    })
  } catch (error) {
    console.error('GET dossier error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { token, profile } = body

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

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('house_profiles')
      .select('id')
      .eq('customer_id', customer.id)
      .single()

    let result
    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('house_profiles')
        .update({
          ...profile,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProfile.id)
        .select()
        .single()
    } else {
      // Create new profile
      result = await supabase
        .from('house_profiles')
        .insert({
          customer_id: customer.id,
          ...profile,
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error('Save profile error:', result.error)
      return NextResponse.json(
        { error: 'Opslaan mislukt: ' + result.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: result.data,
    })
  } catch (error) {
    console.error('POST dossier error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
