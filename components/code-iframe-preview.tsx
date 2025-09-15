"use client"

import { useEffect, useRef, useState } from 'react'
import * as React from 'react'
import { tokenKeys } from '@/lib/design-tokens'

export interface CodeIframePreviewProps {
  code: string
  height?: number | string
}

export function CodeIframePreview({ code, height = 640 }: CodeIframePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    setError(null)

    const buildHtml = async () => {
      try {
        // Build CSS variables from current document tokens
        let varsCss = ''
        if (typeof window !== 'undefined') {
          const css: string[] = []
          const cs = getComputedStyle(document.documentElement)
          for (const k of tokenKeys) {
            const v = cs.getPropertyValue(`--${k}`)
            if (v) css.push(`--${k}: ${v.trim()};`)
          }
          varsCss = `:root{${css.join('')}}`
        }
        const Babel = await import('@babel/standalone')
        const sanitized = (code || '').replace(/^import[^\n]*$/gm, '')
        const js = Babel.transform(sanitized, {
          presets: [['react', { runtime: 'classic' }], 'typescript'],
          plugins: ['transform-modules-commonjs'],
          filename: 'Generated.tsx'
        }).code as string

        const runner = `
          (function(){
            try {
              var exports = {};
              var module = { exports: exports };
              // Basic UI components provided globally for preview
              var Button = (props) => React.createElement('button', Object.assign({
                className: 'inline-flex items-center justify-center rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2 text-sm font-medium shadow hover:opacity-90 disabled:opacity-50'
              }, props));
              var Input = (props) => React.createElement('input', Object.assign({
                className: 'flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-[hsl(var(--background))] text-[hsl(var(--foreground))]'
              }, props));
              var Textarea = (props) => React.createElement('textarea', Object.assign({
                className: 'w-full rounded-md border px-3 py-2 text-sm bg-[hsl(var(--background))] text-[hsl(var(--foreground))]'
              }, props));
              var Separator = (props) => React.createElement('div', Object.assign({ className: 'h-px bg-[hsl(var(--border))] my-2' }, props));
              ${js}
              var Comp = module.exports && module.exports.default ? module.exports.default : exports.default;
              if (!Comp) throw new Error('default export が見つかりません');
              var root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(React.createElement(Comp));
            } catch (e) {
              var el = document.getElementById('error');
              if (el) el.textContent = (e && e.message) ? e.message : 'プレビューに失敗しました';
            }
          })();
        `

        const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      html,body{height:100%;}
      body{margin:0;}
      ${varsCss}
    </style>
  </head>
  <body class="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
    <div id="root" class="min-h-screen"></div>
    <pre id="error" style="color:#ef4444;padding:8px"></pre>
    <script>${runner}<\/script>
  </body>
</html>`

        // use srcdoc for isolation
        iframe.srcdoc = html
      } catch (e: any) {
        setError(e?.message || 'プレビュー初期化に失敗しました')
      }
    }

    buildHtml()
  }, [code])

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b text-sm font-medium flex justify-between items-center">
        <span>フルページ プレビュー</span>
        <span className="text-xs text-muted-foreground">Tailwind CDN + デザイントークン適用</span>
      </div>
      {error ? (
        <div className="p-3 text-sm text-destructive">{error}</div>
      ) : null}
      <iframe
        ref={iframeRef}
        style={{ width: '100%', height }}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  )
}
