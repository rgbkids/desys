import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { auth } from '@/auth'
import { defaultComponentClasses } from '@/lib/design-components'

export const runtime = 'edge'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const saved = (await kv.get<Record<string, string>>(`design:components:${session.user.id}`)) || {}
  return NextResponse.json({ components: { ...defaultComponentClasses, ...saved } })
}

