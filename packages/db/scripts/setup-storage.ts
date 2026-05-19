import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../../../packages/db/.env') })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type BucketConfig = {
  name: string
  public: boolean
  fileSizeLimit: number
  allowedMimeTypes?: string[]
}

const buckets: BucketConfig[] = [
  {
    name: 'project-documents',
    public: false,
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
  },
  {
    name: 'site-photos',
    public: false,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  },
  {
    name: 'avatars',
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  {
    name: 'bill-photos',
    public: false,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  },
]

async function setupStorage() {
  console.log('Setting up Supabase Storage buckets...\n')

  const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()
  if (listError) {
    console.error('Failed to list buckets:', listError.message)
    process.exit(1)
  }

  const existingNames = new Set(existingBuckets.map((b) => b.name))

  for (const bucket of buckets) {
    if (existingNames.has(bucket.name)) {
      console.log(`  [SKIP] Bucket "${bucket.name}" already exists`)
      continue
    }

    const { error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
      allowedMimeTypes: bucket.allowedMimeTypes,
    })

    if (error) {
      console.error(`  [FAIL] Bucket "${bucket.name}": ${error.message}`)
    } else {
      console.log(`  [OK]   Bucket "${bucket.name}" created (public=${bucket.public}, limit=${bucket.fileSizeLimit / 1024 / 1024}MB)`)
    }
  }

  // Storage policies are defined in Supabase dashboard or via SQL.
  // See packages/db/migrations/004_storage_policies.sql
  console.log('\nStorage setup complete.')
  console.log('Note: Apply storage RLS policies from migrations/004_storage_policies.sql in the Supabase SQL editor.')
}

setupStorage()
