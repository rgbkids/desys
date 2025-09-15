import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { kv } from '@vercel/kv'
import { auth } from '@/auth'
import { defaultTokens, tokenKeys, type DesignTokens } from '@/lib/design-tokens'
import { defaultComponentClasses, type ComponentClasses, type ComponentKey } from '@/lib/design-components'
import { geminiComplete, DEFAULT_GEMINI_MODEL } from '@/lib/gemini'
import { anthropicComplete, DEFAULT_CLAUDE_MODEL } from '@/lib/anthropic'
import { DEFAULT_OPENAI_MINI_MODEL } from '@/lib/openai'

export const runtime = 'edge'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const keyFor = (userId: string) => `design:tokens:${userId}`

const SYSTEM_PROMPT = `あなたはUIデザインのアシスタントです。Tailwind + CSSカスタムプロパティのデザイントークンを調整し、あわせてUIコンポーネントのclass名(スタイル)も上書きして、雰囲気(色/コントラスト/曲率/可読性/密度)を調整します。
必ずJSONのみで応答し、説明文は含めません。構造は次のとおり:
{"reply": string, "tokens"?: Partial<DesignTokens>, "components"?: Record<string,string>}
- reply: ユーザーへの簡潔な説明(日本語)
- tokens: 変更したいキーと値(hsl三つ組の文字列、またはradiusはrem)。未変更のキーは含めない。
- components: 次のキーに対して、Tailwind className文字列を上書き指定(未変更キーは含めない)。
  キー一覧: button_primary, button_secondary, button_outline, button_ghost, button_pill, input, textarea, select, checkbox, radio, switch_track, switch_thumb, slider_track, badge_neutral, badge_secondary, badge_destructive, tabs_root, tabs_trigger_active, tabs_trigger_inactive

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
  const { messages, previewToken, provider } = json as { messages: { role: 'user' | 'assistant' | 'system'; content: string }[]; provider?: 'openai' | 'gemini' | 'claude'; previewToken?: string | null }

  if (previewToken) {
    openai.apiKey = previewToken
  }

  // Seed with current tokens for better grounding
  const current = (await kv.get<DesignTokens>(keyFor(session.user.id))) || defaultTokens

  let text = '{}'
  if (provider === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 400 })
    try {
      text = await geminiComplete({
        apiKey,
        model: DEFAULT_GEMINI_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'system', content: `現在のトークン: ${JSON.stringify(current)}` },
          ...messages
        ],
        responseMimeType: 'application/json'
      })
    } catch (e: any) {
      const msg = String(e?.message || '')
      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
        // Fallback to OpenAI for chat JSON
        const completion = await openai.chat.completions.create({
          model: DEFAULT_OPENAI_MINI_MODEL, temperature: 0.4, response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'system', content: `現在のトークン: ${JSON.stringify(current)}` },
            ...messages
          ]
        })
        text = completion.choices[0]?.message?.content || '{}'
      } else {
        return NextResponse.json({ error: msg || 'Gemini failed' }, { status: 500 })
      }
    }
  } else if (provider === 'claude') {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 400 })
    try {
      text = await anthropicComplete({
        apiKey,
        model: DEFAULT_CLAUDE_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'system', content: `現在のトークン: ${JSON.stringify(current)}` },
          ...messages
        ],
        json: true
      })
    } catch (e: any) {
      const msg = String(e?.message || '')
      // Fallback to OpenAI JSON
      const completion = await openai.chat.completions.create({
        model: DEFAULT_OPENAI_MINI_MODEL, temperature: 0.4, response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'system', content: `現在のトークン: ${JSON.stringify(current)}` },
          ...messages
        ]
      })
      text = completion.choices[0]?.message?.content || '{}'
    }
  } else {
    const completion = await openai.chat.completions.create({
      model: DEFAULT_OPENAI_MINI_MODEL,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: `現在のトークン: ${JSON.stringify(current)}` },
        ...messages
      ]
    })
    text = completion.choices[0]?.message?.content || '{}'
  }
  let parsed: { reply?: string; tokens?: Partial<DesignTokens>; components?: ComponentClasses } = {}
  try {
    parsed = JSON.parse(text)
  } catch {}

  const updates = (parsed.tokens ?? {}) as Partial<DesignTokens>
  const compUpdates = (parsed.components ?? {}) as ComponentClasses

  // Validate keys and simple value formats
  const allowedKeys = new Set(tokenKeys)
  const cleaned: Partial<DesignTokens> = {}
  for (const [k, v] of Object.entries(updates)) {
    if (!allowedKeys.has(k as any)) continue
    if (typeof v !== 'string') continue
    cleaned[k as keyof DesignTokens] = v as any
  }

  // Validate component keys
  const compAllowed = new Set(Object.keys(defaultComponentClasses))
  const compCleaned: ComponentClasses = {}
  for (const [k, v] of Object.entries(compUpdates)) {
    if (!compAllowed.has(k)) continue
    if (typeof v !== 'string') continue
    compCleaned[k as ComponentKey] = v
  }

  const merged = { ...current, ...cleaned }
  await kv.set(keyFor(session.user.id), merged)
  if (Object.keys(compCleaned).length > 0) {
    const saved = (await kv.get<Record<string, string>>(`design:components:${session.user.id}`)) || {}
    await kv.set(`design:components:${session.user.id}`, { ...saved, ...compCleaned })
  }

  return NextResponse.json({ reply: parsed.reply ?? '更新しました', tokens: merged, components: compCleaned })
}
