"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { CatalogCodeDialog } from '@/components/catalog-code-dialog'
import { Buttons } from './components/Buttons'
import { Inputs } from './components/Inputs'
import { Checks } from './components/Checks'
import { SwitchSlider } from './components/SwitchSlider'
import { Badges } from './components/Badges'
import { Tabs } from './components/Tabs'

type Provider = 'openai' | 'gemini' | 'claude'

function applyTokens(tokens: Record<string, string>) {
  const root = document.documentElement
  for (const [k, v] of Object.entries(tokens)) {
    root.style.setProperty(`--${k}`, String(v))
  }
}

type ComponentClasses = Record<string, string>

export default function CatalogPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('iOS風でエレガント、やさしい色合い、角丸は大きめ')
  const [provider, setProvider] = useState<Provider>('openai')
  const [loading, setLoading] = useState(false)
  const [codeOpen, setCodeOpen] = useState(false)
  const [codeSection, setCodeSection] = useState('Buttons')
  const [classes, setClasses] = useState<ComponentClasses>({})
  // load saved component classes initially
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/design/components')
        if (res.ok) {
          const data = await res.json()
          if (data?.components) setClasses(data.components)
        }
      } catch {}
    })()
  }, [])

  const onApply = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/design/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, messages: [{ role: 'user', content: prompt }] })
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      if (data?.tokens) applyTokens(data.tokens)
      if (data?.components) setClasses((prev) => ({ ...prev, ...data.components }))
      // Refresh server components so layout picks latest tokens on SSR
      router.refresh()
      toast.success('カタログのスタイルを更新しました')
    } catch (e: any) {
      toast.error('更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const onReset = async () => {
    try {
      const [tRes, cRes] = await Promise.all([
        fetch('/api/design/tokens'),
        fetch('/api/design/components')
      ])
      const tData = await tRes.json()
      const cData = await cRes.json()
      if (tData?.tokens) applyTokens(tData.tokens)
      if (cData?.components) setClasses(cData.components)
      router.refresh()
      toast.success('現在のトークンを再適用しました')
    } catch {}
  }

  // helper: resolve class override
  const cx = (key: string, fallback: string) => classes[key] ?? fallback

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">UIカタログ</h1>
        <p className="text-sm text-muted-foreground">代表的なUIコンポーネントを一覧で確認し、メッセージから一括でスタイルを調整します（デザイントークン連動）。</p>
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={provider} onValueChange={v => setProvider(v as Provider)}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Provider" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="gemini">Gemini</SelectItem>
              <SelectItem value="claude">Claude</SelectItem>
            </SelectContent>
          </Select>
          <Input className="w-[460px]" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="例: iOS風で、やさしい色、角丸大きめ、コントラスト高め" />
          <Button onClick={onApply} disabled={loading || !prompt.trim()}>{loading ? '適用中...' : '適用'}</Button>
          <Button variant="secondary" onClick={onReset}>再適用</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Buttons" actions={<Button size="sm" variant="outline" onClick={() => { setCodeSection('Buttons'); setCodeOpen(true) }}>コードを生成</Button>}><Buttons classes={classes} /></Card>
        <Card title="Inputs" actions={<Button size="sm" variant="outline" onClick={() => { setCodeSection('Inputs'); setCodeOpen(true) }}>コードを生成</Button>}><Inputs classes={classes} /></Card>
        <Card title="Select / Checkbox / Radio" actions={<Button size="sm" variant="outline" onClick={() => { setCodeSection('Select / Checkbox / Radio'); setCodeOpen(true) }}>コードを生成</Button>}><Checks classes={classes} /></Card>
        <Card title="Switch / Slider" actions={<Button size="sm" variant="outline" onClick={() => { setCodeSection('Switch / Slider'); setCodeOpen(true) }}>コードを生成</Button>}><SwitchSlider classes={classes} /></Card>
        <Card title="Badges" actions={<Button size="sm" variant="outline" onClick={() => { setCodeSection('Badges'); setCodeOpen(true) }}>コードを生成</Button>}><Badges classes={classes} /></Card>
        <Card title="Tabs" actions={<Button size="sm" variant="outline" onClick={() => { setCodeSection('Tabs'); setCodeOpen(true) }}>コードを生成</Button>}><Tabs classes={classes} /></Card>
      </div>

      <CatalogCodeDialog section={codeSection} basePrompt={prompt} provider={provider} open={codeOpen} onOpenChange={setCodeOpen} />
    </div>
  )
}

function Card({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
      <div className="px-3 py-2 border-b text-sm font-medium flex items-center justify-between">
        <span>{title}</span>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
