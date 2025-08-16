"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { CatalogCodeDialog } from '@/components/catalog-code-dialog'

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
        <Card title="Buttons" actions={<Button size="sm" variant="outline" onClick={() => { setCodeSection('Buttons'); setCodeOpen(true) }}>コードを見る</Button>}><ButtonsDemo cx={cx} /></Card>
        <Card title="Inputs" actions={<Button size="sm" variant="outline" onClick={() => { setCodeSection('Inputs'); setCodeOpen(true) }}>コードを見る</Button>}><InputsDemo cx={cx} /></Card>
        <Card title="Select / Checkbox / Radio" actions={<Button size="sm" variant="outline" onClick={() => { setCodeSection('Select / Checkbox / Radio'); setCodeOpen(true) }}>コードを見る</Button>}><ChecksDemo cx={cx} /></Card>
        <Card title="Switch / Slider" actions={<Button size="sm" variant="outline" onClick={() => { setCodeSection('Switch / Slider'); setCodeOpen(true) }}>コードを見る</Button>}><SwitchSliderDemo cx={cx} /></Card>
        <Card title="Badges" actions={<Button size="sm" variant="outline" onClick={() => { setCodeSection('Badges'); setCodeOpen(true) }}>コードを見る</Button>}><BadgesDemo cx={cx} /></Card>
        <Card title="Tabs" actions={<Button size="sm" variant="outline" onClick={() => { setCodeSection('Tabs'); setCodeOpen(true) }}>コードを見る</Button>}><TabsDemo cx={cx} /></Card>
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

function ButtonsDemo({ cx }: { cx: (key: string, fallback: string) => string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button className={cx('button_primary','px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow')}>Primary</button>
      <button className={cx('button_secondary','px-4 py-2 rounded-md bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]')}>Secondary</button>
      <button className={cx('button_outline','px-4 py-2 rounded-md border')}>Outline</button>
      <button className={cx('button_ghost','px-4 py-2 rounded-md hover:bg-[hsl(var(--muted))]')}>Ghost</button>
      <button className={cx('button_pill','px-4 py-2 rounded-full border')}>Pill</button>
    </div>
  )
}

function InputsDemo({ cx }: { cx: (key: string, fallback: string) => string }) {
  return (
    <div className="space-y-3">
      <input className={cx('input','w-full h-10 rounded-md border bg-[hsl(var(--background))] px-3')} placeholder="Text input" />
      <textarea className={cx('textarea','w-full rounded-md border bg-[hsl(var(--background))] px-3 py-2')} rows={3} placeholder="Textarea" />
    </div>
  )
}

function ChecksDemo({ cx }: { cx: (key: string, fallback: string) => string }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className={cx('checkbox','size-4 rounded border')} /> Checkbox
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="radio" name="r" className={cx('radio','size-4 border rounded-full')} /> Radio
      </label>
      <select className={cx('select','h-9 rounded-md border bg-[hsl(var(--background))] px-3 text-sm')}>
        <option>Apple</option>
        <option>Orange</option>
        <option>Banana</option>
      </select>
    </div>
  )
}

function SwitchSliderDemo({ cx }: { cx: (key: string, fallback: string) => string }) {
  return (
    <div className="space-y-4">
      {/* iOS-like switch using checkbox + peer */}
      <label className="flex items-center gap-3 text-sm select-none">
        <span>Switch</span>
        <input type="checkbox" className="peer sr-only" />
        <span className={cx('switch_track','inline-block w-12 h-7 rounded-full bg-[hsl(var(--muted))] relative transition-colors peer-checked:bg-[hsl(var(--primary))]')}>
          <span className={cx('switch_thumb','absolute left-1 top-1 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5')} />
        </span>
      </label>

      {/* Slider (range) */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground w-14">Slider</span>
        <input
          type="range"
          className={cx('slider_track','w-full appearance-none h-2 rounded-full bg-[hsl(var(--muted))]')}
          style={{
            backgroundImage: 'linear-gradient(hsl(var(--primary)), hsl(var(--primary)))',
            backgroundSize: '50% 100%',
            backgroundRepeat: 'no-repeat'
          }}
        />
      </div>
    </div>
  )
}

function BadgesDemo({ cx }: { cx: (key: string, fallback: string) => string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className={cx('badge_neutral','px-2 py-1 rounded-full text-xs bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]')}>Neutral</span>
      <span className={cx('badge_secondary','px-2 py-1 rounded-full text-xs bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]')}>Secondary</span>
      <span className={cx('badge_destructive','px-2 py-1 rounded-full text-xs bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]')}>Destructive</span>
    </div>
  )
}

function TabsDemo({ cx }: { cx: (key: string, fallback: string) => string }) {
  const [tab, setTab] = useState<'one' | 'two' | 'three'>('one')
  return (
    <div>
      <div className={cx('tabs_root','inline-flex rounded-md border p-1 bg-[hsl(var(--muted))] gap-1')}>
        {[
          { id: 'one', label: 'Tab 1' },
          { id: 'two', label: 'Tab 2' },
          { id: 'three', label: 'Tab 3' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={tab === t.id ? cx('tabs_trigger_active','px-3 py-1.5 text-sm rounded bg-[hsl(var(--background))] shadow') : cx('tabs_trigger_inactive','px-3 py-1.5 text-sm rounded opacity-70 hover:opacity-100')}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-3 text-sm text-muted-foreground">{`Content of ${tab}`}</div>
    </div>
  )
}
