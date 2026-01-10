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
    const { email, name } = body

    if (!email) {
      return NextResponse.json(
        { error: 'E-mailadres is verplicht' },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Generate password reset link (does NOT send email automatically)
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${appUrl}/reset-password`,
      },
    })

    if (error) {
      console.error('Reset password error:', error)
      return NextResponse.json(
        { error: `Kon reset link niet genereren: ${error.message}` },
        { status: 500 }
      )
    }

    const resetLink = data.properties.action_link

    // Generate Dutch email template
    const emailSubject = 'Wachtwoord herstellen - p1Meter Installaties'
    const emailBody = `Hallo${name ? ` ${name}` : ''},

Je hebt een wachtwoord reset aangevraagd voor je p1Meter account.

Klik op de onderstaande link om een nieuw wachtwoord in te stellen:

${resetLink}

Deze link is 24 uur geldig.

Als je geen wachtwoord reset hebt aangevraagd, kun je deze email negeren.

Met vriendelijke groet,
Het p1Meter team`

    return NextResponse.json({
      success: true,
      resetLink,
      emailSubject,
      emailBody,
      message: `Reset link gegenereerd voor ${email}`,
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
