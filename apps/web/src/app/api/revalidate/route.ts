import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret')
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  revalidatePath('/portfolio')
  revalidatePath('/portfolio/[slug]', 'page')

  return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() })
}
