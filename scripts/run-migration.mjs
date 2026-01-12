// Script to run database migration
// Usage: node scripts/run-migration.mjs

import pg from 'pg'

const { Client } = pg

async function runMigration() {
  // Try to connect using the pooler with transaction mode
  // The password needs to be provided as an environment variable
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.log('DATABASE_URL not set.')
    console.log('')
    console.log('To run this migration, you need to:')
    console.log('')
    console.log('1. Go to Supabase Dashboard > Project Settings > Database')
    console.log('2. Copy the "Connection string" (URI format)')
    console.log('3. Run: DATABASE_URL="your-connection-string" node scripts/run-migration.mjs')
    console.log('')
    console.log('Or simply run this SQL in Supabase SQL Editor:')
    console.log('')
    console.log('ALTER TABLE installations ADD COLUMN IF NOT EXISTS checklist_data JSONB DEFAULT NULL;')
    console.log('')
    process.exit(1)
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('Connecting to database...')
    await client.connect()

    console.log('Running migration...')
    await client.query(`
      ALTER TABLE installations
      ADD COLUMN IF NOT EXISTS checklist_data JSONB DEFAULT NULL;
    `)

    console.log('✅ Migration completed successfully!')
    console.log('The checklist_data column has been added to the installations table.')
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
