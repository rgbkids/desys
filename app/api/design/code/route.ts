import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { auth } from '@/auth'
import { kv } from '@vercel/kv'
import { defaultTokens, type DesignTokens } from '@/lib/design-tokens'
import { geminiComplete, DEFAULT_GEMINI_MODEL } from '@/lib/gemini'
import { anthropicComplete, DEFAULT_CLAUDE_MODEL } from '@/lib/anthropic'

export const runtime = 'edge'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM = `あなたはフロントエンドの熟練エンジニアです。指示に基づいて、Next.js(App Router)でそのまま使える“単一のReactクライアントコンポーネント”(TypeScript/TSX)だけを出力します。
必須要件:
- 先頭に 'use client' を記述
- export default function <PascalCaseName>(props: Props) を定義
- Tailwind CSS と本プロジェクトのデザイントークン(CSS変数)に準拠
- import 文は禁止（プレビュー互換のため）。必要なUIは Button, Input, Textarea, Separator を“グローバルに存在するコンポーネント”として直接使用（import不要）。もしくは素のHTMLで実装
- 外部CDNや追加パッケージは使わない
- 返答はコードのみ(JSONや説明、バッククォート、前後文言は不要)

デザイントークンのHSLは CSS var(--primary) のように参照できます。
例) className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]"`;

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { prompt, name, provider } = (await req.json().catch(() => ({}))) as {
    prompt?: string
    name?: string
    provider?: 'openai' | 'gemini' | 'claude'
  }
  if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })

  // 生成名のヒント
  const compName = (name && /^[A-Za-z][A-Za-z0-9]+$/.test(name) ? name : 'GeneratedComponent')

  const tokens = (await kv.get<DesignTokens>(`design:tokens:${session.user.id}`)) || defaultTokens

  let code = ''
  if (provider === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 400 })
    try {
      const text = await geminiComplete({
        apiKey,
        model: DEFAULT_GEMINI_MODEL,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'system', content: `現在のトークン: ${JSON.stringify(tokens)}` },
          { role: 'user', content: `コンポーネント名: ${compName}\n要件: ${prompt}\n出力はコードのみ。TSX。` }
        ]
      })
      code = text.trim()
    } catch (e: any) {
      const msg = String(e?.message || '')
      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
        // Fallback to OpenAI
        const key = process.env.OPENAI_API_KEY
        if (!key) return NextResponse.json({ error: 'Gemini quota exceeded and OPENAI_API_KEY missing' }, { status: 429 })
        const res = await openai.chat.completions.create({
          model: 'gpt-4o-mini', temperature: 0.4,
          messages: [
            { role: 'system', content: SYSTEM },
            { role: 'system', content: `現在のトークン: ${JSON.stringify(tokens)}` },
            { role: 'user', content: `コンポーネント名: ${compName}\n要件: ${prompt}\n出力はコードのみ。TSX。` }
          ]
        })
        code = res.choices[0]?.message?.content?.trim() || ''
      } else {
        return NextResponse.json({ error: msg || 'Gemini failed' }, { status: 500 })
      }
    }
  } else {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM },
      { role: 'system', content: `現在のトークン: ${JSON.stringify(tokens)}` },
      { role: 'user', content: `コンポーネント名: ${compName}\n要件: ${prompt}\n出力はコードのみ。TSX。`}]
    if (provider === 'claude') {
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) return NextResponse.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 400 })
      try {
        const text = await anthropicComplete({
          apiKey,
          model: DEFAULT_CLAUDE_MODEL,
          messages: [
            { role: 'system', content: SYSTEM },
            { role: 'system', content: `現在のトークン: ${JSON.stringify(tokens)}` },
            { role: 'user', content: `コンポーネント名: ${compName}\n要件: ${prompt}\n出力はコードのみ。TSX。` }
          ]
        })
        code = text.trim()
      } catch (e: any) {
        const msg = String(e?.message || '')
        // Fallback to OpenAI
        const key = process.env.OPENAI_API_KEY
        if (!key) return NextResponse.json({ error: msg || 'Claude failed and OPENAI_API_KEY missing' }, { status: 500 })
        const res = await openai.chat.completions.create({ model: 'gpt-4o-mini', temperature: 0.4, messages })
        code = res.choices[0]?.message?.content?.trim() || ''
      }
    } else {
      const key = process.env.OPENAI_API_KEY
      if (!key) return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 400 })
      const res = await openai.chat.completions.create({ model: 'gpt-4o-mini', temperature: 0.4, messages })
      code = res.choices[0]?.message?.content?.trim() || ''
    }
  }
  return NextResponse.json({ code })
}
