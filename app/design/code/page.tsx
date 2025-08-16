"use client"

import { useState } from 'react'
import { CodeEditor } from '@/components/code-editor'
import { CodePreview } from '@/components/code-preview'
import { CodeIframePreview } from '@/components/code-iframe-preview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { toast } from 'react-hot-toast'

const DEFAULT_CODE = `'use client'

export default function GeneratedComponent() {
  return (
    <div className="rounded-lg border p-4 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
      <div className="text-sm text-muted-foreground">Sample</div>
      <div className="font-semibold">ここに生成コードが表示されます</div>
    </div>
  )
}
`

function sanitizeGeneratedCode(input: string) {
  let code = (input || '').trim()
  // Strip surrounding triple backticks, with optional language (```tsx, ```ts, etc.)
  if (code.startsWith('```')) {
    const start = code.indexOf('```')
    const end = code.lastIndexOf('```')
    if (end > start) {
      let inner = code.slice(start + 3, end)
      // Remove leading language identifier line if present
      const firstNewline = inner.indexOf('\n')
      if (firstNewline !== -1) {
        const firstLine = inner.slice(0, firstNewline).trim().toLowerCase()
        if (/(tsx|typescript|ts|jsx|js|javascript)/.test(firstLine)) {
          inner = inner.slice(firstNewline + 1)
        }
      } else {
        inner = ''
      }
      code = inner.trim()
    }
  }
  // Normalize top 'use client' directive to single quotes if present
  const lines = code.split(/\r?\n/)
  const firstIdx = lines.findIndex(l => l.trim().length > 0)
  if (firstIdx !== -1) {
    const t = lines[firstIdx].trim()
    // Matches: use client | "use client" | 'use client' with optional semicolon
    if (/^(?:use client|"use client"|'use client')(?:;)?$/.test(t)) {
      lines[firstIdx] = "'use client'"
    }
  }
  return lines.join('\n')
}

export default function CodeStudioPage() {
  const [name, setName] = useState('GeneratedComponent')
  const [prompt, setPrompt] = useState('ヒーローセクション(見出し、説明、2つのボタン、カード背景)を生成して')
  const [code, setCode] = useState(DEFAULT_CODE)
  const { copyToClipboard } = useCopyToClipboard({})
  const [loading, setLoading] = useState(false)
  const [compatible, setCompatible] = useState(true)
  const [provider, setProvider] = useState<'openai' | 'gemini' | 'claude'>('openai')

  const generate = async () => {
    setLoading(true)
    try {
      const finalPrompt = compatible
        ? `【制約】import禁止。提供コンポーネント(Button, Input, Textarea, Separator)のみ使用可 or 素のHTMLで実装。${prompt}`
        : prompt
      const res = await fetch('/api/design/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt, name, provider })
      })
      if (!res.ok) throw new Error(await res.text())
      const data = (await res.json()) as { code: string }
      setCode(sanitizeGeneratedCode(data.code || DEFAULT_CODE))
      toast.success('コードを生成しました')
    } catch (e: any) {
      toast.error('コード生成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const copyCode = async () => {
    await copyToClipboard(code)
    toast.success('コードをコピーしました')
  }

  const download = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${name || 'GeneratedComponent'}.tsx`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="container py-6 space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">コードスタジオ</h1>
        <p className="text-sm text-muted-foreground">デザインを直接Reactコンポーネントに。エディタで編集→プレビュー→コピー/保存。</p>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <div className="border rounded-lg p-3 md:col-span-1">
          <h2 className="text-sm font-medium">使い方</h2>
          <ol className="text-sm text-muted-foreground list-decimal ml-5 mt-1 space-y-1">
            <li>コンポーネント名と要件を入力</li>
            <li>「生成する」を押してエディタに反映</li>
            <li>プレビューで見た目を確認</li>
            <li>必要に応じて編集→コピー/保存</li>
          </ol>
          <div className="mt-3 text-xs bg-muted/60 rounded p-2">
            プレビュー互換モードをONにすると、importなしで動くコードを生成します。
          </div>
        </div>
        <div className="border rounded-lg p-3 md:col-span-2">
          <h2 className="text-sm font-medium">プリセット</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <Button size="sm" variant="secondary" onClick={() => setPrompt('ヒーローセクション（見出し・説明・2ボタン・背景グラデーション）')}>Hero</Button>
            <Button size="sm" variant="secondary" onClick={() => setPrompt('料金プラン3列、カード、見出し、価格、特徴リスト、購入ボタン')}>Pricing</Button>
            <Button size="sm" variant="secondary" onClick={() => setPrompt('シンプルなCTA（見出し・説明・メール入力と送信ボタン）')}>CTA</Button>
            <Button size="sm" variant="secondary" onClick={() => setPrompt('サインアップフォーム（名前、メール、パスワード、送信ボタン）')}>Form</Button>
          </div>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-1 space-y-2">
          <div className="flex items-center gap-2">
            <Select value={provider} onValueChange={v => setProvider(v as any)}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Provider" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="gemini">Gemini</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="text-sm font-medium">コンポーネント名</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="GeneratedComponent" />
          <label className="text-sm font-medium">要件（日本語でOK）</label>
          <Textarea rows={8} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="例: 料金表カードを3列で、Hoverで影、アクセント色はprimary、角丸大きめ" />
          <div className="flex items-center gap-2">
            <Switch id="compat" checked={compatible} onCheckedChange={setCompatible} />
            <Label htmlFor="compat">プレビュー互換モード（importなしで動くコード）</Label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={generate} disabled={loading}>{loading ? '生成中...' : '生成する'}</Button>
            <Button variant="secondary" onClick={copyCode}>コピー</Button>
            <Button variant="outline" onClick={download}>.tsx保存</Button>
            <SaveButton name={name} code={code} />
          </div>
        </div>
        <div className="md:col-span-2 space-y-3">
          <CodeEditor value={code} onChange={setCode} language="typescript" height={300} />
          <CodeIframePreview code={code} height={600} />
        </div>
      </div>
    </div>
  )
}

import { saveGeneratedComponent } from '@/app/actions'
function SaveButton({ name, code }: { name: string; code: string }) {
  const [saving, setSaving] = useState(false)
  const onSave = async () => {
    setSaving(true)
    try {
      const res = await saveGeneratedComponent(name, code)
      toast.success(`保存しました: ${res.path}`)
    } catch (e: any) {
      toast.error(e?.message || '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }
  return <Button variant="default" onClick={onSave} disabled={saving || !name.trim() || !code.trim()}>{saving ? '保存中...' : 'プロジェクトへ追加'}</Button>
}
