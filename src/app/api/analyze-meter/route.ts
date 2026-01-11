import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

// Lazy initialization to avoid build-time errors
let anthropicClient: Anthropic | null = null

function getAnthropicClient() {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured')
    }
    anthropicClient = new Anthropic({ apiKey })
  }
  return anthropicClient
}

// Known smart meters with adapter requirements
const KNOWN_METERS = `
Bekende slimme meters in Nederland en of ze een USB-C adapter nodig hebben voor de p1Meter:

GEEN ADAPTER NODIG (SMR 5.0):
- Landis+Gyr E360 (SMR 5.0) - Heeft standaard RJ12 P1-poort
- Landis+Gyr E350 (SMR 5.0) - Heeft standaard RJ12 P1-poort
- Kaifa MA304 (SMR 5.0) - Heeft standaard RJ12 P1-poort
- Sagemcom T210-D (SMR 5.0) - Heeft standaard RJ12 P1-poort

WEL ADAPTER NODIG (SMR 4.x of ouder):
- Iskra ME382 (SMR 4.2) - Heeft USB-C poort, adapter nodig
- Kamstrup 382JxC (SMR 4.0) - Heeft USB-C poort, adapter nodig
- Oudere meters met SMR versie 4.x of lager hebben meestal een USB-C adapter nodig

HERKENNINGSPUNTEN:
- Kijk naar het merk/logo op de meter (Landis+Gyr, Kaifa, Iskra, Sagemcom, Kamstrup)
- Kijk naar het modelnummer op het etiket
- SMR versie staat vaak op een sticker of display
- P1-poort type: RJ12 (telefoonaansluiting) = geen adapter, USB-C = wel adapter
`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageBase64, imageUrl } = body

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json(
        { error: 'Afbeelding is verplicht (base64 of URL)' },
        { status: 400 }
      )
    }

    const anthropic = getAnthropicClient()

    // Build the image content
    const imageContent = imageBase64
      ? {
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: 'image/jpeg' as const,
            data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
          },
        }
      : {
          type: 'image' as const,
          source: {
            type: 'url' as const,
            url: imageUrl,
          },
        }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            imageContent,
            {
              type: 'text',
              text: `Analyseer deze foto van een slimme meter (elektriciteits-/gasmeter).

${KNOWN_METERS}

Bepaal:
1. Het merk van de meter
2. Het model (indien zichtbaar)
3. De SMR versie (indien zichtbaar)
4. Of een USB-C adapter nodig is voor de HomeWizard p1Meter

Antwoord ALLEEN in dit exacte JSON formaat, geen andere tekst:
{
  "brand": "merknaam of 'Onbekend'",
  "model": "modelnummer of 'Niet zichtbaar'",
  "smr_version": "versienummer of 'Niet zichtbaar'",
  "needs_adapter": true of false,
  "confidence": "high", "medium" of "low",
  "reasoning": "korte uitleg waarom je tot deze conclusie komt"
}`,
            },
          ],
        },
      ],
    })

    // Extract text content from response
    const textContent = response.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('Geen tekst response ontvangen')
    }

    // Parse the JSON response
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Geen JSON gevonden in response')
      }

      const result = JSON.parse(jsonMatch[0])

      return NextResponse.json({
        success: true,
        ...result,
      })
    } catch (parseError) {
      console.error('JSON parse error:', parseError, textContent.text)
      return NextResponse.json({
        success: true,
        brand: 'Onbekend',
        model: 'Niet herkend',
        smr_version: 'Onbekend',
        needs_adapter: false,
        confidence: 'low',
        reasoning: 'Kon de meter niet automatisch herkennen. Controleer handmatig of er een USB-C poort op de meter zit.',
        raw_response: textContent.text,
      })
    }
  } catch (error) {
    console.error('Meter analysis error:', error)

    if (error instanceof Error && error.message.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        { error: 'AI service is niet geconfigureerd' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij de analyse' },
      { status: 500 }
    )
  }
}
