import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { auth } from '@/auth'
import { defaultTokens, type DesignTokens } from '@/lib/design-tokens'

export const runtime = 'edge'

const keyFor = (userId: string) => `design:tokens:${userId}`

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const saved = (await kv.get<DesignTokens>(keyFor(session.user.id))) || null
  return NextResponse.json({ tokens: saved ?? defaultTokens })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => ({}))
  const tokens = json?.tokens as Partial<DesignTokens> | undefined
  if (!tokens) return NextResponse.json({ error: 'Missing tokens' }, { status: 400 })

  const current = (await kv.get<DesignTokens>(keyFor(session.user.id))) || defaultTokens
  const merged = { ...current, ...tokens }
  await kv.set(keyFor(session.user.id), merged)
  return NextResponse.json({ tokens: merged })
}

