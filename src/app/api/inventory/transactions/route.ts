import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET transactions for a product or all
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const installationId = searchParams.get('installationId')
    const limit = searchParams.get('limit') || '50'

    let query = `${SUPABASE_URL}/rest/v1/inventory_transactions?select=*,product:products(*),installation:installations(*,customer:customers(*))&order=created_at.desc&limit=${limit}`

    if (productId) {
      query += `&product_id=eq.${productId}`
    }

    if (installationId) {
      query += `&installation_id=eq.${installationId}`
    }

    const response = await fetch(query, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error }, { status: response.status })
    }

    const transactions = await response.json()
    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

// POST create transaction and update stock
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id, type, quantity, installation_id, notes, created_by } = body

    // First, get current stock
    const productResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/products?id=eq.${product_id}&select=stock_quantity`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    )

    if (!productResponse.ok) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const products = await productResponse.json()
    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const currentStock = products[0].stock_quantity

    // Calculate new stock based on transaction type
    let stockChange = 0
    switch (type) {
      case 'purchase':
        stockChange = quantity // Add to stock
        break
      case 'usage':
        stockChange = -quantity // Remove from stock
        break
      case 'return':
        stockChange = quantity // Add back to stock
        break
      case 'adjustment':
        stockChange = quantity // Can be positive or negative
        break
    }

    const newStock = currentStock + stockChange

    // Prevent negative stock
    if (newStock < 0) {
      return NextResponse.json(
        { error: 'Onvoldoende voorraad beschikbaar' },
        { status: 400 }
      )
    }

    // Create transaction
    const transactionResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/inventory_transactions`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          product_id,
          type,
          quantity,
          installation_id: installation_id || null,
          notes: notes || null,
          created_by: created_by || null,
        }),
      }
    )

    if (!transactionResponse.ok) {
      const error = await transactionResponse.text()
      return NextResponse.json({ error }, { status: transactionResponse.status })
    }

    // Update product stock
    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/products?id=eq.${product_id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock_quantity: newStock }),
      }
    )

    if (!updateResponse.ok) {
      console.error('Failed to update stock:', await updateResponse.text())
    }

    const transaction = await transactionResponse.json()
    return NextResponse.json(transaction[0], { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
