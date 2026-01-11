import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET - Retrieve all settings or specific setting by key
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    let url = `${SUPABASE_URL}/rest/v1/app_settings`
    if (key) {
      url += `?key=eq.${encodeURIComponent(key)}`
    }

    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to fetch settings:', error)
      return NextResponse.json({ error: 'Kon instellingen niet ophalen' }, { status: 500 })
    }

    const settings = await response.json()

    // If fetching single key, return just the value
    if (key && settings.length > 0) {
      return NextResponse.json({ key, value: settings[0].value })
    }

    // Convert array to object for easier access
    const settingsObject: Record<string, string> = {}
    settings.forEach((s: { key: string; value: string }) => {
      settingsObject[s.key] = s.value
    })

    return NextResponse.json({ settings: settingsObject })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}

// PUT - Update a setting
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value } = body

    if (!key) {
      return NextResponse.json({ error: 'Key is verplicht' }, { status: 400 })
    }

    // Upsert the setting
    const response = await fetch(`${SUPABASE_URL}/rest/v1/app_settings`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({
        key,
        value: value || '',
        updated_at: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to update setting:', error)
      return NextResponse.json({ error: 'Kon instelling niet opslaan' }, { status: 500 })
    }

    return NextResponse.json({ success: true, key, value })
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}
