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

// GET - Verify token and get customer data
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is verplicht' }, { status: 400 })
    }

    // Get customer from token
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, name, email, phone, address, city, postal_code, portal_token')
      .eq('portal_token', token)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Ongeldige token' }, { status: 401 })
    }

    // Get house profile if exists
    const { data: houseProfile } = await supabase
      .from('house_profiles')
      .select('*')
      .eq('customer_id', customer.id)
      .single()

    // Get active installation if exists
    const { data: installation } = await supabase
      .from('installations')
      .select('*')
      .eq('customer_id', customer.id)
      .neq('status', 'completed')
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      customer,
      houseProfile: houseProfile || null,
      installation: installation || null,
    })
  } catch (error) {
    console.error('Error in GET /api/portal/auth:', error)
    return NextResponse.json({ error: 'Server fout' }, { status: 500 })
  }
}
