import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { kv } from '@vercel/kv'
import { auth } from '@/auth'
import { defaultTokens, tokenKeys, type DesignTokens } from '@/lib/design-tokens'

export const runtime = 'edge'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const keyFor = (userId: string) => `design:tokens:${userId}`

const SYSTEM_PROMPT = `あなたはUIデザインのアシスタントです。Tailwind + CSSカスタムプロパティに基づいたデザイントークン(以下一覧)だけを更新することで、デザインの雰囲気(色/コントラスト/曲率)を調整します。
必ずJSONのみで応答し、説明文は含めません。構造は次のとおり:
{"reply": string, "tokens": Partial<DesignTokens>}
- reply: ユーザーへの簡潔な説明(日本語)
- tokens: 変更したいキーと値(hsl三つ組の文字列、またはradiusはrem)。未変更のキーは含めない。

更新可能なキー: ${tokenKeys.join(', ')}
値の形式:
- 色系: "H S% L%" (例: "240 5.9% 10%")
- radius: "0.5rem" のようなCSS長さ

例:
{"reply":"コントラストを高めました","tokens":{"background":"0 0% 100%","foreground":"240 10% 3.9%","primary":"240 5.9% 10%"}}
`

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  if (!json) return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  const { messages, previewToken } = json as { messages: { role: 'user' | 'assistant' | 'system'; content: string }[]; previewToken?: string | null }

  if (previewToken) {
    openai.apiKey = previewToken
  }

  // Seed with current tokens for better grounding
  const current = (await kv.get<DesignTokens>(keyFor(session.user.id))) || defaultTokens

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.4,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: `現在のトークン: ${JSON.stringify(current)}` },
      ...messages
    ]
  })

  const text = completion.choices[0]?.message?.content || '{}'
  let parsed: { reply?: string; tokens?: Partial<DesignTokens> } = {}
  try {
    parsed = JSON.parse(text)
  } catch {}

  const updates = (parsed.tokens ?? {}) as Partial<DesignTokens>

  // Validate keys and simple value formats
  const allowedKeys = new Set(tokenKeys)
  const cleaned: Partial<DesignTokens> = {}
  for (const [k, v] of Object.entries(updates)) {
    if (!allowedKeys.has(k as any)) continue
    if (typeof v !== 'string') continue
    cleaned[k as keyof DesignTokens] = v as any
  }

  const merged = { ...current, ...cleaned }
  await kv.set(keyFor(session.user.id), merged)

  return NextResponse.json({ reply: parsed.reply ?? '更新しました', tokens: merged })
}

