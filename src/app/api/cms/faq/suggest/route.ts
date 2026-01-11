import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, email } = body

    if (!question || question.trim().length < 5) {
      return NextResponse.json(
        { error: 'Vraag moet minimaal 5 karakters bevatten' },
        { status: 400 }
      )
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
