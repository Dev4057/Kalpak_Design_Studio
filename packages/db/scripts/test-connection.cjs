const { Client } = require('pg')

const password = encodeURIComponent('[Kalpak_Design_Studio@12345]')
const ref = 'vdujrflruolueslwnjpb'

const urls = [
  `postgresql://postgres.${ref}:${password}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${ref}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${ref}:${password}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${ref}:${password}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
]

async function tryConnect(url) {
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 5000 })
  try {
    await client.connect()
    const res = await client.query('SELECT version()')
    console.log('SUCCESS:', url.split('@')[1])
    console.log(res.rows[0].version.split(' ').slice(0,2).join(' '))
    await client.end()
    return url
  } catch (e) {
    console.log('FAIL:', url.split('@')[1].split(':')[0], '-', e.message)
    return null
  }
}

async function main() {
  for (const url of urls) {
    const result = await tryConnect(url)
    if (result) {
      console.log('\nUse this DATABASE_URL in your .env:')
      console.log(result)
      process.exit(0)
    }
  }
  console.log('\nAll pooler connections failed. Please apply migrations via Supabase dashboard.')
  process.exit(1)
}

main()
