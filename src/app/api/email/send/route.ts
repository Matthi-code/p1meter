import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Lazy initialization - only create Resend instance when API key is available
let resend: Resend | null = null

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, text, html } = body

    // Validatie
    if (!to || !subject || (!text && !html)) {
      return NextResponse.json(
        { error: 'Ontvanger, onderwerp en inhoud zijn verplicht' },
        { status: 400 }
      )
    }

    // Check if Resend API key is configured
    const resendClient = getResendClient()
    if (!resendClient) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Email service is niet geconfigureerd' },
        { status: 500 }
      )
    }

    // Send email via Resend
    const { data, error } = await resendClient.emails.send({
      from: process.env.EMAIL_FROM || 'p1Meter <noreply@jmtest.nl>',
      to: [to],
      subject,
      text,
      html: html || text?.replace(/\n/g, '<br>'),
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: `Kon email niet versturen: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      message: `Email verstuurd naar ${to}`,
    })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het versturen van de email' },
      { status: 500 }
    )
  }
}
