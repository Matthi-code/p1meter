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

    // 1. Check of er een ACTIEF team_member bestaat
    const { data: existingTeamMember } = await supabase
      .from('team_members')
      .select('id, active, user_id')
      .eq('email', email)
      .single()

    if (existingTeamMember?.active) {
      return NextResponse.json(
        { error: 'Dit e-mailadres is al geregistreerd als actief teamlid' },
        { status: 400 }
      )
    }

    // 2. Check of er een auth user bestaat (via listUsers)
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const existingAuthUser = authUsers?.users?.find(u => u.email === email)

    let userId: string
    let inviteLink: string

    if (existingAuthUser) {
      // Auth user bestaat al - genereer een recovery link (voor wachtwoord reset)
      userId = existingAuthUser.id

      const { data: recoveryData, error: recoveryError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: {
          redirectTo: `${appUrl}/accept-invite`,
        },
      })

      if (recoveryError) {
        console.error('Recovery link error:', recoveryError)
        return NextResponse.json(
          { error: `Kon herstellink niet genereren: ${recoveryError.message}` },
          { status: 500 }
        )
      }

      inviteLink = recoveryData.properties.action_link

      // Update user metadata
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { name, role },
      })

    } else {
      // Nieuwe auth user - genereer invite link
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

      userId = linkData.user.id
      inviteLink = linkData.properties.action_link
    }

    // 3. Maak of update team_members record
    let teamMember

    if (existingTeamMember) {
      // Reactiveer bestaand teamlid
      const { data, error } = await supabase
        .from('team_members')
        .update({
          name,
          role,
          active: true,
          user_id: userId,
        })
        .eq('id', existingTeamMember.id)
        .select()
        .single()

      if (error) {
        console.error('Team member update error:', error)
        return NextResponse.json(
          { error: `Kon teamlid niet bijwerken: ${error.message}` },
          { status: 500 }
        )
      }
      teamMember = data
    } else {
      // Maak nieuw teamlid
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          user_id: userId,
          name,
          email,
          role,
          active: true,
        })
        .select()
        .single()

      if (error) {
        console.error('Team member insert error:', error)
        // Als insert faalt en we hebben een nieuwe auth user gemaakt, verwijder deze
        if (!existingAuthUser) {
          await supabase.auth.admin.deleteUser(userId)
        }
        return NextResponse.json(
          { error: `Kon teamlid niet aanmaken: ${error.message}` },
          { status: 500 }
        )
      }
      teamMember = data
    }

    // 5. Genereer Nederlandse email tekst
    const emailSubject = 'Uitnodiging voor p1Meter Installaties'
    const emailBody = `Hallo ${name},

Je bent uitgenodigd om deel te nemen aan het p1Meter Installaties team als ${getRoleName(role)}.

Klik op de onderstaande link om je account te activeren en een wachtwoord in te stellen:

${inviteLink}

Deze link is 24 uur geldig.

Met vriendelijke groet,
Het p1Meter team`

    const emailHtml = generateInviteEmailHtml(name, getRoleName(role), inviteLink)

    return NextResponse.json({
      success: true,
      teamMember,
      inviteLink,
      emailSubject,
      emailBody,
      emailHtml,
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

function generateInviteEmailHtml(name: string, roleName: string, inviteLink: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Uitnodiging p1Meter</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">⚡ p1Meter</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 20px;">Hallo ${name},</h2>

              <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Je bent uitgenodigd om deel te nemen aan het <strong>p1Meter Installaties</strong> team als <strong>${roleName}</strong>.
              </p>

              <p style="margin: 0 0 32px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Klik op de knop hieronder om je account te activeren en een wachtwoord in te stellen:
              </p>

              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 32px 0;">
                    <a href="${inviteLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; padding: 16px 32px; border-radius: 8px;">
                      Account activeren
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                Of kopieer deze link in je browser:
              </p>

              <p style="margin: 0 0 24px 0; padding: 12px 16px; background-color: #f1f5f9; border-radius: 6px; word-break: break-all;">
                <a href="${inviteLink}" style="color: #2563eb; text-decoration: none; font-size: 13px;">${inviteLink}</a>
              </p>

              <p style="margin: 0; color: #94a3b8; font-size: 14px;">
                Deze link is 24 uur geldig.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
                Met vriendelijke groet,<br>
                <strong>Het p1Meter team</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}
