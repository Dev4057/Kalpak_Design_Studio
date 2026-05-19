// CommonJS migration runner — no build step needed
// Run: node packages/db/scripts/migrate.cjs
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const DB_URL = process.env.DATABASE_URL

if (!DB_URL) {
  console.error('DATABASE_URL not set in packages/db/.env')
  process.exit(1)
}

const MIGRATIONS_DIR = path.join(__dirname, '../migrations')

const MIGRATIONS = [
  '001_initial_schema.sql',
  '002_triggers.sql',
  '003_rls_policies.sql',
]

async function runMigrations() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } })

  try {
    await client.connect()
    console.log('Connected to Supabase PostgreSQL\n')

    for (const file of MIGRATIONS) {
      const filePath = path.join(MIGRATIONS_DIR, file)
      if (!fs.existsSync(filePath)) {
        console.log(`  [SKIP] ${file} — file not found`)
        continue
      }

      const sql = fs.readFileSync(filePath, 'utf8')
      console.log(`  Running ${file}...`)

      try {
        await client.query(sql)
        console.log(`  [OK]   ${file}`)
      } catch (err) {
        console.error(`  [FAIL] ${file}: ${err.message}`)
        console.error('  Stopping migration. Fix the error above and re-run.')
        process.exit(1)
      }
    }

    console.log('\nAll migrations applied successfully.')
  } finally {
    await client.end()
  }
}

runMigrations().catch((err) => {
  console.error('Migration runner crashed:', err)
  process.exit(1)
})
