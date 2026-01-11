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

    // Create or update daily task for FAQ suggestions
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()
    const tomorrowISO = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()

    // Check if there's already a FAQ suggestions task for today
    const existingTaskResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/tasks?title=eq.FAQ%20suggesties%20bekijken&scheduled_at=gte.${encodeURIComponent(todayISO)}&scheduled_at=lt.${encodeURIComponent(tomorrowISO)}&select=id,description`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    )

    if (existingTaskResponse.ok) {
      const existingTasks = await existingTaskResponse.json()

      if (existingTasks.length > 0) {
        // Update existing task - increment counter
        const existingTask = existingTasks[0]
        // Extract count from "Er is/zijn X nieuwe vraag/vragen"
        const countMatch = existingTask.description?.match(/Er (?:is|zijn) (\d+) nieuwe/)
        const currentCount = countMatch ? parseInt(countMatch[1]) : 1
        const newCount = currentCount + 1

        const updatedDescription = `Er zijn ${newCount} nieuwe vragen binnengekomen via de FAQ pagina.\n\nBekijk de ingezonden vragen in Content → FAQ beheer.`

        await fetch(`${SUPABASE_URL}/rest/v1/tasks?id=eq.${existingTask.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: updatedDescription,
          }),
        })
      } else {
        // Create new task for today
        const taskData = {
          title: 'FAQ suggesties bekijken',
          description: 'Er is 1 nieuwe vraag binnengekomen via de FAQ pagina.\n\nBekijk de ingezonden vragen in Content → FAQ beheer.',
          scheduled_at: new Date().toISOString(),
          status: 'pending',
          is_recurring: false,
        }

        await fetch(`${SUPABASE_URL}/rest/v1/tasks`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        })
      }
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
