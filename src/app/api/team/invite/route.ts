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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // 1. Check of user al bestaat
    const { data: existingUsers } = await supabase
      .from('team_members')
      .select('id')
      .eq('email', email)
      .limit(1)

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Dit e-mailadres is al geregistreerd' },
        { status: 400 }
      )
    }

    // 2. Genereer invite link (zonder automatische email)
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'invite',
      email,
      options: {
        data: {
          name,
          role,
        },
        redirectTo: `${appUrl}/accept-invite`,
      },
    })

    if (linkError) {
      console.error('Link generation error:', linkError)

      if (linkError.message.includes('already been registered')) {
        return NextResponse.json(
          { error: 'Dit e-mailadres is al geregistreerd in het systeem' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: `Kon uitnodigingslink niet genereren: ${linkError.message}` },
        { status: 500 }
      )
    }

    if (!linkData.user) {
      return NextResponse.json(
        { error: 'Geen gebruiker aangemaakt' },
        { status: 500 }
      )
    }

    // 3. Maak team_members record aan
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .insert({
        user_id: linkData.user.id,
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
      await supabase.auth.admin.deleteUser(linkData.user.id)

      return NextResponse.json(
        { error: `Kon teamlid niet aanmaken: ${teamError.message}` },
        { status: 500 }
      )
    }

    // 4. Gebruik de action_link (die al de tokens bevat)
    // De action_link gaat via Supabase, die redirect naar onze app met tokens in de hash
    const inviteLink = linkData.properties.action_link

    // 5. Genereer Nederlandse email tekst
    const emailSubject = 'Uitnodiging voor p1Meter Installaties'
    const emailBody = `Hallo ${name},

Je bent uitgenodigd om deel te nemen aan het p1Meter Installaties team als ${getRoleName(role)}.

Klik op de onderstaande link om je account te activeren en een wachtwoord in te stellen:

${inviteLink}

Deze link is 24 uur geldig.

Met vriendelijke groet,
Het p1Meter team`

    return NextResponse.json({
      success: true,
      teamMember,
      inviteLink,
      emailSubject,
      emailBody,
      message: `Teamlid aangemaakt. Kopieer de uitnodigingslink om te versturen.`,
    })
  } catch (error) {
    console.error('Invite error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

function getRoleName(role: string): string {
  switch (role) {
    case 'admin':
      return 'Administrator'
    case 'planner':
      return 'Planner'
    case 'energiebuddy':
      return 'Energie Buddy'
    default:
      return role
  }
}
