"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CodeEditor } from '@/components/code-editor'
import { CodeIframePreview } from '@/components/code-iframe-preview'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { toast } from 'react-hot-toast'

type Provider = 'openai' | 'gemini' | 'claude'

export function CatalogCodeDialog({
  section,
  basePrompt,
  provider,
  open,
  onOpenChange
}: {
  section: string
  basePrompt: string
  provider: Provider
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  function sanitizeGeneratedCode(input: string) {
    let content = (input || '').trim()
    if (content.startsWith('```')) {
      const end = content.lastIndexOf('```')
      if (end > 2) {
        let inner = content.slice(3, end)
        const firstNewline = inner.indexOf('\n')
        if (firstNewline !== -1) {
          const firstLine = inner.slice(0, firstNewline).trim().toLowerCase()
          if (/(tsx|typescript|ts|jsx|js|javascript)/.test(firstLine)) {
            inner = inner.slice(firstNewline + 1)
          }
        }
        content = inner.trim()
      }
    }
    const lines = content.split(/\r?\n/)
    const firstIdx = lines.findIndex(l => l.trim().length > 0)
    if (firstIdx !== -1) {
      const t = lines[firstIdx].trim()
      if (/^(?:use client|"use client"|'use client')(?:;)?$/.test(t)) {
        lines[firstIdx] = "'use client'"
      }
    }
    return lines.join('\n')
  }
  const [code, setCode] = useState<string>(`'use client'

export default function Catalog${section.replace(/\s+/g, '')}Demo(){
  return (<div className="rounded border p-4">ここに生成コードが表示されます</div>)
}`)
  const [loading, setLoading] = useState(false)
  const { copyToClipboard } = useCopyToClipboard({})

  const generate = async () => {
    setLoading(true)
    try {
      const prompt = `次のセクションのUIを生成してください: ${section}\n要求スタイル: ${basePrompt}\n- importは使わない\n- Button/Input/Textarea/Separatorはそのまま使用可能\n- コードのみ出力（TSX）`
      const name = `Catalog${section.replace(/\s+/g, '')}Demo`
      const res = await fetch('/api/design/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, name, provider })
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setCode(sanitizeGeneratedCode(data.code || code))
      toast.success('コードを生成しました')
    } catch (e: any) {
      toast.error('生成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const download = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `Catalog${section.replace(/\s+/g, '')}Demo.tsx`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const copy = async () => {
    await copyToClipboard(code)
    toast.success('コピーしました')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[920px]">
        <DialogHeader>
          <DialogTitle>{section} のコード</DialogTitle>
          <DialogDescription>生成AIでコードを作成し、編集・プレビュー・コピー/保存できます。</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button onClick={generate} disabled={loading}>{loading ? '生成中...' : '生成する'}</Button>
            <Button variant="secondary" onClick={copy}>コピー</Button>
            <Button variant="outline" onClick={download}>.tsx保存</Button>
          </div>
          <CodeEditor value={code} onChange={setCode} language="typescript" height={260} />
          <CodeIframePreview code={code} height={360} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
