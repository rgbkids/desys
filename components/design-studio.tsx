"use client"

import { useEffect, useMemo, useState } from 'react'
import type { DesignTokens } from '@/lib/design-tokens'
import { defaultTokens } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-hot-toast'

type Msg = { role: 'user' | 'assistant'; content: string }

function applyTokensToDocument(tokens: DesignTokens) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  Object.entries(tokens).forEach(([k, v]) => {
    root.style.setProperty(`--${k}`, String(v))
  })
}

export function DesignStudio({ initialTokens }: { initialTokens: DesignTokens }) {
  const [tokens, setTokens] = useState<DesignTokens>(initialTokens)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('落ち着いた高コントラストのダークテーマに')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    applyTokensToDocument(tokens)
  }, [tokens])

  const handleSend = async () => {
    if (!input.trim()) return
    const next: Msg = { role: 'user', content: input }
    setMessages(prev => [...prev, next])
    setInput('')
    setSending(true)
    try {
      const res = await fetch('/api/design/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, next] })
      })
      if (!res.ok) throw new Error(await res.text())
      const data = (await res.json()) as { reply: string; tokens: DesignTokens }
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      setTokens(data.tokens)
    } catch (e: any) {
      toast.error('更新に失敗しました')
    } finally {
      setSending(false)
    }
  }

  const reset = async () => {
    setTokens(defaultTokens)
    try {
      await fetch('/api/design/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens: defaultTokens })
      })
      toast.success('デフォルトに戻しました')
    } catch {}
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 h-[calc(100vh-6rem)]">
      <div className="flex flex-col border rounded-lg overflow-hidden">
        <div className="p-3 border-b flex items-center gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="例: もっとポップでカラフルに、角丸を大きく"
          />
          <Button onClick={handleSend} disabled={sending || !input.trim()}>送信</Button>
          <Button variant="secondary" onClick={reset}>リセット</Button>
        </div>
        <div className="flex-1 overflow-auto p-3 space-y-3">
          {messages.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              提案してほしい雰囲気や要件を日本語で伝えてください。
              例: 「より可読性の高い配色に」「寒色ベースで洗練された印象」「カードは角丸大きめ」
            </div>
          ) : null}
          {messages.map((m, i) => (
            <div key={i} className={cn('rounded-md p-3 text-sm', m.role === 'user' ? 'bg-secondary' : 'bg-accent')}>
              <div className="font-medium mb-1">{m.role === 'user' ? 'あなた' : 'アシスタント'}</div>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border rounded-lg overflow-auto">
        <Preview tokens={tokens} />
      </div>
    </div>
  )
}

function Swatch({ name, value }: { name: string; value: string }) {
  const isHsl = /%/.test(value)
  return (
    <div className="flex items-center gap-3 p-2 rounded border">
      <div
        className="size-8 rounded"
        style={{ backgroundColor: isHsl ? `hsl(${value})` : undefined }}
      />
      <div className="text-sm">
        <div className="font-medium">{name}</div>
        <div className="text-muted-foreground">{value}</div>
      </div>
    </div>
  )
}

function Preview({ tokens }: { tokens: DesignTokens }) {
  const entries = useMemo(
    () => Object.entries(tokens).filter(([k]) => k !== 'radius'),
    [tokens]
  )
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">プレビュー</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div className="mt-4 grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-lg border p-4 space-y-2">
              <div className="text-sm text-muted-foreground">Card {i}</div>
              <div className="font-medium">見出しテキスト</div>
              <p className="text-sm">本文の例文です。配色やコントラスト、余白を確認できます。</p>
              <div className="flex gap-2">
                <Button size="sm">Action</Button>
                <Button size="sm" variant="secondary">Alt</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">デザイントークン</h3>
        <div className="grid md:grid-cols-2 gap-2">
          {entries.map(([k, v]) => (
            <Swatch key={k} name={k} value={v as string} />
          ))}
        </div>
        <div className="text-sm mt-2">radius: {tokens.radius}</div>
      </div>
    </div>
  )
}
