import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Server-side Supabase client with service role key (admin privileges)
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, role } = body

    // Validatie
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Naam, email en rol zijn verplicht' },
        { status: 400 }
      )
    }

    if (!['admin', 'planner', 'energiebuddy'].includes(role)) {
      return NextResponse.json(
        { error: 'Ongeldige rol' },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()

    // 1. Maak Supabase Auth user aan via invite
    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        name,
        role,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`,
    })

    if (authError) {
      console.error('Auth error:', authError)

      // Check of user al bestaat
      if (authError.message.includes('already been registered')) {
        return NextResponse.json(
          { error: 'Dit e-mailadres is al geregistreerd' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: `Kon gebruiker niet uitnodigen: ${authError.message}` },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Geen gebruiker aangemaakt' },
        { status: 500 }
      )
    }

    // 2. Maak team_members record aan
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .insert({
        user_id: authData.user.id,
        name,
        email,
        role,
        active: true,
      })
      .select()
      .single()

    if (teamError) {
      console.error('Team member error:', teamError)

      // Probeer de auth user te verwijderen als team_member insert faalt
      await supabase.auth.admin.deleteUser(authData.user.id)

      return NextResponse.json(
        { error: `Kon teamlid niet aanmaken: ${teamError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      teamMember,
      message: `Uitnodiging verstuurd naar ${email}`,
    })
  } catch (error) {
    console.error('Invite error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
