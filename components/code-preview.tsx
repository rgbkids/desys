"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

export interface CodePreviewProps {
  code: string
  height?: number | string
}

// 注意: セキュリティより利便性を優先したシンプルなプレビュー（eval実行）
// 社内限定ツールなど信頼できる環境での利用を想定
export function CodePreview({ code, height = 420 }: CodePreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<ReactDOM.Root | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function render() {
      setError(null)
      try {
        const Babel = await import('@babel/standalone')
        const sanitized = (code || '').replace(/^import[^\n]*$/gm, '')
        const transformed = Babel.transform(sanitized, {
          presets: [['react', { runtime: 'classic' }], 'typescript'],
          plugins: ['transform-modules-commonjs'],
          filename: 'Generated.tsx'
        }).code as string

        const exportsObj: any = {}
        const moduleObj: any = { exports: exportsObj }

        // eslint-disable-next-line no-new-func
        const fn = new Function(
          'exports',
          'module',
          'require',
          'React',
          'ReactDOM',
          'Button',
          'Input',
          'Textarea',
          'Separator',
          transformed!
        )
        fn(exportsObj, moduleObj, undefined, React, ReactDOM, Button, Input, Textarea, Separator)
        const Comp = (moduleObj.exports?.default || exportsObj.default) as React.ComponentType<any>
        if (!Comp) throw new Error('default export が見つかりません')

        if (!rootRef.current) {
          rootRef.current = ReactDOM.createRoot(containerRef.current!)
        }
        rootRef.current.render(React.createElement(Comp))
      } catch (e: any) {
        setError(e?.message || 'プレビューに失敗しました')
      }
    }
    render()
    return () => {
      // アンマウント時にツリーを破棄
      if (rootRef.current) {
        rootRef.current.unmount()
        rootRef.current = null
      }
    }
  }, [code])

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b text-sm font-medium flex justify-between items-center">
        <span>プレビュー</span>
        <span className="text-xs text-muted-foreground">Button/Input/Textarea/Separator が使用可能（import不要）</span>
      </div>
      {error ? (
        <div className="p-3 text-sm text-destructive">{error}</div>
      ) : null}
      <div ref={containerRef} style={{ height }} className="p-4 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]" />
    </div>
  )
}
