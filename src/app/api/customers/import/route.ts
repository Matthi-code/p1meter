import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Column mapping from Dutch to database fields
const columnMapping: Record<string, string> = {
  'naam': 'name',
  'name': 'name',
  'e-mail': 'email',
  'email': 'email',
  'telefoon': 'phone',
  'phone': 'phone',
  'adres': 'address',
  'address': 'address',
  'postcode': 'postal_code',
  'postal_code': 'postal_code',
  'plaats': 'city',
  'city': 'city',
}

type ImportResult = {
  success: number
  failed: number
  errors: string[]
  duplicates: string[]
}

// Generate a unique portal token
function generatePortalToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const skipDuplicates = formData.get('skipDuplicates') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'Geen bestand geüpload' }, { status: 400 })
    }

    // Read Excel file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[]

    if (data.length === 0) {
      return NextResponse.json({ error: 'Bestand is leeg of geen geldige data gevonden' }, { status: 400 })
    }

    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      duplicates: [],
    }

    // Get existing emails to check for duplicates
    const existingResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/customers?select=email`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    )
    const existingCustomers = await existingResponse.json()
    const existingEmails = new Set(existingCustomers.map((c: { email: string }) => c.email.toLowerCase()))

    // Process each row
    const customersToInsert: Array<{
      name: string
      email: string
      phone: string
      address: string
      postal_code: string
      city: string
      portal_token: string
    }> = []

    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const rowNum = i + 2 // +2 because Excel rows start at 1 and first row is header

      // Map columns to database fields
      const customer: Record<string, string> = {}
      for (const [key, value] of Object.entries(row)) {
        const normalizedKey = key.toLowerCase().trim()
        const dbField = columnMapping[normalizedKey]
        if (dbField) {
          customer[dbField] = String(value || '').trim()
        }
      }

      // Validate required fields
      if (!customer.name) {
        result.failed++
        result.errors.push(`Rij ${rowNum}: Naam ontbreekt`)
        continue
      }

      if (!customer.email) {
        result.failed++
        result.errors.push(`Rij ${rowNum}: E-mail ontbreekt`)
        continue
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(customer.email)) {
        result.failed++
        result.errors.push(`Rij ${rowNum}: Ongeldig e-mailadres "${customer.email}"`)
        continue
      }

      // Check for duplicate
      if (existingEmails.has(customer.email.toLowerCase())) {
        if (skipDuplicates) {
          result.duplicates.push(customer.email)
          continue
        } else {
          result.failed++
          result.errors.push(`Rij ${rowNum}: E-mailadres "${customer.email}" bestaat al`)
          continue
        }
      }

      // Add to insert list (also check within import file for duplicates)
      if (customersToInsert.some(c => c.email.toLowerCase() === customer.email.toLowerCase())) {
        result.failed++
        result.errors.push(`Rij ${rowNum}: Dubbel e-mailadres in import bestand "${customer.email}"`)
        continue
      }

      customersToInsert.push({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address || '',
        postal_code: customer.postal_code || '',
        city: customer.city || '',
        portal_token: generatePortalToken(),
      })
    }

    // Insert customers in batches
    if (customersToInsert.length > 0) {
      const batchSize = 50
      for (let i = 0; i < customersToInsert.length; i += batchSize) {
        const batch = customersToInsert.slice(i, i + batchSize)

        const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(batch),
        })

        if (insertResponse.ok) {
          const inserted = await insertResponse.json()
          result.success += inserted.length
        } else {
          const error = await insertResponse.text()
          result.failed += batch.length
          result.errors.push(`Database fout bij batch ${Math.floor(i / batchSize) + 1}: ${error}`)
        }
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: `Import mislukt: ${error instanceof Error ? error.message : 'Onbekende fout'}` },
      { status: 500 }
    )
  }
}

// GET endpoint to download template
export async function GET() {
  // Create a template workbook
  const workbook = XLSX.utils.book_new()
  const templateData = [
    {
      'Naam': 'Jan Jansen',
      'E-mail': 'jan.jansen@voorbeeld.nl',
      'Telefoon': '06-12345678',
      'Adres': 'Voorbeeldstraat 123',
      'Postcode': '1234 AB',
      'Plaats': 'Amsterdam',
    },
    {
      'Naam': 'Petra de Vries',
      'E-mail': 'petra.devries@voorbeeld.nl',
      'Telefoon': '06-87654321',
      'Adres': 'Testlaan 456',
      'Postcode': '5678 CD',
      'Plaats': 'Rotterdam',
    },
  ]

  const sheet = XLSX.utils.json_to_sheet(templateData)

  // Set column widths
  sheet['!cols'] = [
    { wch: 25 }, // Naam
    { wch: 30 }, // E-mail
    { wch: 15 }, // Telefoon
    { wch: 30 }, // Adres
    { wch: 10 }, // Postcode
    { wch: 20 }, // Plaats
  ]

  XLSX.utils.book_append_sheet(workbook, sheet, 'Klanten')

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="klanten_template.xlsx"',
    },
  })
}
