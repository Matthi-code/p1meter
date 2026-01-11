import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const MAX_SUBMISSIONS_PER_DAY = 3

// Get client IP from request headers
function getClientIP(request: NextRequest): string {
  // Vercel/Cloudflare headers
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  return 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, email } = body
    const clientIP = getClientIP(request)

    if (!question || question.trim().length < 5) {
      return NextResponse.json(
        { error: 'Vraag moet minimaal 5 karakters bevatten' },
        { status: 400 }
      )
    }

    // Check rate limit: count submissions from this IP in last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const countResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/faq_submissions?ip_address=eq.${encodeURIComponent(clientIP)}&created_at=gte.${encodeURIComponent(yesterday)}&select=id`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    )

    if (countResponse.ok) {
      const submissions = await countResponse.json()
      if (submissions.length >= MAX_SUBMISSIONS_PER_DAY) {
        return NextResponse.json(
          { error: `Je hebt vandaag al ${MAX_SUBMISSIONS_PER_DAY} vragen gesteld. Probeer het morgen opnieuw.` },
          { status: 429 }
        )
      }
    }

    // Create a suggestion as an inactive FAQ item with special category
    const suggestionData = {
      category: 'Suggestie',
      question: question.trim(),
      answer: email
        ? `[Ingezonden door: ${email}]\n\nNog geen antwoord - te beantwoorden door planner.`
        : 'Nog geen antwoord - te beantwoorden door planner.',
      sort_order: 999, // Put at the end
      active: false, // Not visible on public FAQ
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/faq_items`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(suggestionData),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to save suggestion:', error)
      return NextResponse.json(
        { error: 'Kon vraag niet opslaan' },
        { status: 500 }
      )
    }

    const savedItem = await response.json()

    // Record this submission for rate limiting
    await fetch(`${SUPABASE_URL}/rest/v1/faq_submissions`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ip_address: clientIP }),
    })

    // Create a task for the planner to answer the question
    const taskData = {
      title: 'FAQ vraag beantwoorden',
      description: `Ingezonden vraag via FAQ pagina:\n\n"${question.trim()}"${email ? `\n\nIngestuurd door: ${email}` : ''}`,
      scheduled_at: new Date().toISOString(),
      status: 'pending',
      is_recurring: false,
    }

    const taskResponse = await fetch(`${SUPABASE_URL}/rest/v1/tasks`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(taskData),
    })

    if (!taskResponse.ok) {
      console.error('Failed to create task:', await taskResponse.text())
      // Don't fail the whole request if task creation fails
    }

    return NextResponse.json({
      success: true,
      message: 'Vraag ontvangen',
      item: savedItem[0],
    })
  } catch (error) {
    console.error('Suggestion error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
