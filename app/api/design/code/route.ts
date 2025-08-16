import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { auth } from '@/auth'
import { kv } from '@vercel/kv'
import { defaultTokens, type DesignTokens } from '@/lib/design-tokens'

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

  const { prompt, name } = (await req.json().catch(() => ({}))) as {
    prompt?: string
    name?: string
  }
  if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })

  // 生成名のヒント
  const compName = (name && /^[A-Za-z][A-Za-z0-9]+$/.test(name) ? name : 'GeneratedComponent')

  const tokens = (await kv.get<DesignTokens>(`design:tokens:${session.user.id}`)) || defaultTokens

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM },
    { role: 'system', content: `現在のトークン: ${JSON.stringify(tokens)}` },
    { role: 'user', content: `コンポーネント名: ${compName}\n要件: ${prompt}\n出力はコードのみ。TSX。`}]

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.4,
    messages
  })

  const code = res.choices[0]?.message?.content?.trim() || ''
  return NextResponse.json({ code })
}
