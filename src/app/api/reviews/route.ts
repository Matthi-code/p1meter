import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    // Fetch evaluations with rating >= 4 and feedback, joined with customer name
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/evaluations?rating_overall=gte.4&feedback=not.is.null&select=id,rating_overall,feedback,created_at,customers(name,city)&order=created_at.desc&limit=6`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to fetch reviews:', error)
      return NextResponse.json({ reviews: [] })
    }

    const evaluations = await response.json()

    // Transform to review format with anonymized names
    const reviews = evaluations
      .filter((e: { feedback: string | null }) => e.feedback && e.feedback.trim().length > 10)
      .map((e: {
        id: string
        rating_overall: number
        feedback: string
        created_at: string
        customers: { name: string; city: string } | null
      }) => {
        // Anonymize name: "Jan de Vries" -> "Jan d."
        const fullName = e.customers?.name || 'Klant'
        const nameParts = fullName.split(' ')
        const firstName = nameParts[0]
        const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] + '.' : ''
        const displayName = `${firstName} ${lastInitial}`.trim()

        return {
          id: e.id,
          rating: e.rating_overall,
          feedback: e.feedback,
          name: displayName,
          city: e.customers?.city || '',
          date: e.created_at,
        }
      })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Reviews error:', error)
    return NextResponse.json({ reviews: [] })
  }
}
