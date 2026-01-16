import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

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
    const { email, name, sendEmail } = body

    if (!email) {
      return NextResponse.json(
        { error: 'E-mailadres is verplicht' },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // First check if user exists in auth
    const { data: users } = await supabase.auth.admin.listUsers()
    const userExists = users?.users?.some(u => u.email === email)

    let resetLink: string
    let isInvite = false

    if (!userExists) {
      // User doesn't have auth account - create invite link instead
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.generateLink({
        type: 'invite',
        email,
        options: {
          redirectTo: `${appUrl}/accept-invite`,
        },
      })

      if (inviteError) {
        console.error('Invite error:', inviteError)
        return NextResponse.json(
          { error: `Kon uitnodiging niet genereren: ${inviteError.message}` },
          { status: 500 }
        )
      }

      resetLink = inviteData.properties.action_link
      isInvite = true
    } else {
      // User exists - generate password reset link
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

      resetLink = data.properties.action_link
    }

    // Generate Dutch email template
    const displayName = name || ''
    const emailSubject = isInvite
      ? 'Activeer je account - p1Meter Installaties'
      : 'Wachtwoord herstellen - p1Meter Installaties'

    const emailBody = isInvite
      ? `Hallo${displayName ? ` ${displayName}` : ''},

Je bent uitgenodigd voor p1Meter Installaties.

Klik op de onderstaande link om je account te activeren en een wachtwoord in te stellen:

${resetLink}

Deze link is 24 uur geldig.

Met vriendelijke groet,
Het p1Meter team`
      : `Hallo${displayName ? ` ${displayName}` : ''},

Je hebt een wachtwoord reset aangevraagd voor je p1Meter account.

Klik op de onderstaande link om een nieuw wachtwoord in te stellen:

${resetLink}

Deze link is 24 uur geldig.

Als je geen wachtwoord reset hebt aangevraagd, kun je deze email negeren.

Met vriendelijke groet,
Het p1Meter team`

    const emailHtml = isInvite
      ? generateInviteEmailHtml(displayName, resetLink)
      : generateResetEmailHtml(displayName, resetLink)

    // Send email if requested
    let emailSent = false
    let emailError: string | null = null

    if (sendEmail) {
      const resendApiKey = process.env.RESEND_API_KEY
      if (!resendApiKey) {
        emailError = 'Resend API key niet geconfigureerd'
      } else {
        try {
          const resend = new Resend(resendApiKey)
          const { error: sendError } = await resend.emails.send({
            from: 'p1Meter <noreply@jmtest.nl>',
            to: email,
            subject: emailSubject,
            html: emailHtml,
          })

          if (sendError) {
            emailError = sendError.message
          } else {
            emailSent = true
          }
        } catch (err) {
          emailError = err instanceof Error ? err.message : 'Onbekende fout bij versturen email'
        }
      }
    }

    return NextResponse.json({
      success: true,
      resetLink,
      emailSubject,
      emailBody,
      emailHtml,
      isInvite,
      emailSent,
      emailError,
      message: emailSent
        ? isInvite
          ? `Uitnodiging verstuurd naar ${email}`
          : `Reset link verstuurd naar ${email}`
        : isInvite
          ? `Uitnodigingslink gegenereerd voor ${email} (geen bestaand account)`
          : `Reset link gegenereerd voor ${email}`,
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

function generateResetEmailHtml(name: string, resetLink: string): string {
  const greeting = name ? `Hallo ${name},` : 'Hallo,'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wachtwoord herstellen - p1Meter</title>
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
              <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 20px;">${greeting}</h2>

              <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Je hebt een wachtwoord reset aangevraagd voor je <strong>p1Meter</strong> account.
              </p>

              <p style="margin: 0 0 32px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Klik op de knop hieronder om een nieuw wachtwoord in te stellen:
              </p>

              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 32px 0;">
                    <a href="${resetLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; padding: 16px 32px; border-radius: 8px;">
                      Nieuw wachtwoord instellen
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                Of kopieer deze link in je browser:
              </p>

              <p style="margin: 0 0 24px 0; padding: 12px 16px; background-color: #f1f5f9; border-radius: 6px; word-break: break-all;">
                <a href="${resetLink}" style="color: #2563eb; text-decoration: none; font-size: 13px;">${resetLink}</a>
              </p>

              <p style="margin: 0 0 16px 0; color: #94a3b8; font-size: 14px;">
                Deze link is 24 uur geldig.
              </p>

              <p style="margin: 0; color: #94a3b8; font-size: 14px;">
                Als je geen wachtwoord reset hebt aangevraagd, kun je deze email negeren.
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

function generateInviteEmailHtml(name: string, inviteLink: string): string {
  const greeting = name ? `Hallo ${name},` : 'Hallo,'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Activeer je account - p1Meter</title>
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
              <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 20px;">${greeting}</h2>

              <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Je bent uitgenodigd voor <strong>p1Meter Installaties</strong>.
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
