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

// GET - Fetch energy consumption for a year
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const year = searchParams.get('year') || new Date().getFullYear() - 1

    if (!token) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
    }

    // Get customer from token
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('portal_token', token)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Klant niet gevonden' }, { status: 404 })
    }

    // Fetch consumption data
    const { data: consumption, error: consumptionError } = await supabase
      .from('customer_energy_input')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('year', year)
      .single()

    if (consumptionError && consumptionError.code !== 'PGRST116') {
      console.error('Error fetching consumption:', consumptionError)
      return NextResponse.json({ error: 'Fout bij ophalen verbruik' }, { status: 500 })
    }

    return NextResponse.json({ consumption: consumption || null })
  } catch (error) {
    console.error('Error in GET /api/portal/verbruik:', error)
    return NextResponse.json({ error: 'Server fout' }, { status: 500 })
  }
}

// POST - Save energy consumption
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
    }

    // Get customer from token
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('portal_token', token)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Klant niet gevonden' }, { status: 404 })
    }

    const body = await request.json()
    const {
      year,
      gas_m3,
      gas_cost_euro,
      electricity_kwh_total,
      electricity_kwh_high,
      electricity_kwh_low,
      electricity_cost_euro,
      electricity_returned_kwh,
      energy_supplier,
    } = body

    // Check if record exists for this year
    const { data: existing } = await supabase
      .from('customer_energy_input')
      .select('id')
      .eq('customer_id', customer.id)
      .eq('year', year)
      .single()

    const consumptionData = {
      customer_id: customer.id,
      year,
      source: 'jaarafrekening',
      period_months: 12,
      gas_m3,
      gas_cost_euro,
      electricity_kwh_total,
      electricity_kwh_high,
      electricity_kwh_low,
      electricity_cost_euro,
      electricity_returned_kwh,
      energy_supplier,
      updated_at: new Date().toISOString(),
    }

    let result
    if (existing) {
      // Update existing record
      result = await supabase
        .from('customer_energy_input')
        .update(consumptionData)
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      // Insert new record
      result = await supabase
        .from('customer_energy_input')
        .insert(consumptionData)
        .select()
        .single()
    }

    if (result.error) {
      console.error('Error saving consumption:', result.error)
      return NextResponse.json({ error: 'Fout bij opslaan verbruik' }, { status: 500 })
    }

    return NextResponse.json({ consumption: result.data })
  } catch (error) {
    console.error('Error in POST /api/portal/verbruik:', error)
    return NextResponse.json({ error: 'Server fout' }, { status: 500 })
  }
}
