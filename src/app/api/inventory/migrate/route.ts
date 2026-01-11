import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
  try {
    // Check if products table exists
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=id&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    )

    if (checkResponse.ok) {
      const products = await checkResponse.json()

      // Table exists, check if it has data
      if (products.length > 0) {
        return NextResponse.json({
          message: 'Products table already exists and has data',
          status: 'exists',
        })
      }

      // Table exists but is empty, seed default products
      const seedProducts = [
        {
          name: 'p1Meter',
          sku: 'P1M-001',
          category: 'meter',
          description: 'HomeWizard p1Meter voor slimme meter uitlezing',
          stock_quantity: 50,
          min_stock_level: 10,
        },
        {
          name: 'USB-C Adapter',
          sku: 'ADP-USB-C',
          category: 'adapter',
          description: 'USB-C naar RJ12 adapter voor nieuwe slimme meters',
          stock_quantity: 30,
          min_stock_level: 5,
        },
        {
          name: 'USB-A Adapter',
          sku: 'ADP-USB-A',
          category: 'adapter',
          description: 'USB-A naar RJ12 adapter voor oudere slimme meters',
          stock_quantity: 20,
          min_stock_level: 5,
        },
        {
          name: 'RJ12 Kabel 1m',
          sku: 'CBL-RJ12-1M',
          category: 'cable',
          description: 'RJ12 kabel 1 meter',
          stock_quantity: 40,
          min_stock_level: 10,
        },
        {
          name: 'RJ12 Kabel 3m',
          sku: 'CBL-RJ12-3M',
          category: 'cable',
          description: 'RJ12 kabel 3 meter',
          stock_quantity: 25,
          min_stock_level: 5,
        },
        {
          name: 'Velcro Strips',
          sku: 'ACC-VELCRO',
          category: 'accessory',
          description: 'Velcro strips voor bevestiging',
          stock_quantity: 100,
          min_stock_level: 20,
        },
        {
          name: 'Installatiehandleiding',
          sku: 'DOC-MANUAL',
          category: 'accessory',
          description: 'Gedrukte installatiehandleiding voor klant',
          stock_quantity: 100,
          min_stock_level: 25,
        },
      ]

      const seedResponse = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(seedProducts),
      })

      if (!seedResponse.ok) {
        const error = await seedResponse.text()
        return NextResponse.json({ error: `Failed to seed: ${error}` }, { status: 500 })
      }

      return NextResponse.json({
        message: 'Default products seeded successfully',
        status: 'seeded',
      })
    }

    // Table doesn't exist - need to run SQL migration
    return NextResponse.json({
      message: 'Products table does not exist. Please run the migration in Supabase Dashboard: supabase/migrations/006_inventory_management.sql',
      status: 'needs_migration',
    }, { status: 400 })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check table status
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=id&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    )

    if (checkResponse.ok) {
      const countResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/products?select=id`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Prefer': 'count=exact',
          },
        }
      )

      const count = countResponse.headers.get('content-range')?.split('/')[1] || '0'

      return NextResponse.json({
        status: 'ready',
        productCount: parseInt(count),
      })
    }

    return NextResponse.json({
      status: 'needs_migration',
      message: 'Run the SQL migration first',
    })
  } catch (error) {
    return NextResponse.json({ status: 'error', error: String(error) }, { status: 500 })
  }
}
