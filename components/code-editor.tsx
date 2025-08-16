"use client"
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useRef } from 'react'
import type * as monacoApi from 'monaco-editor/esm/vs/editor/editor.api'

export interface CodeEditorProps {
  value: string
  language?: string
  onMount?: (editor: monacoApi.editor.IStandaloneCodeEditor, monaco: typeof monacoApi) => void
  onChange?: (value: string) => void
  height?: number | string
}

export function CodeEditor({ value, language = 'typescript', onMount, onChange, height = 500 }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<monacoApi.editor.IStandaloneCodeEditor | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let disposed = false
    let monaco: typeof monacoApi | null = null
    ;(async () => {
      const m = await import('monaco-editor/esm/vs/editor/editor.api')
      // Configure workers for Next.js (webpack 5 supports new URL(import.meta.url))
      // @ts-ignore - attach to global
      self.MonacoEnvironment = {
        getWorker(_: string, label: string) {
          if (label === 'json') {
            return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url))
          }
          if (label === 'css' || label === 'scss' || label === 'less') {
            return new Worker(new URL('monaco-editor/esm/vs/language/css/css.worker.js', import.meta.url))
          }
          if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new Worker(new URL('monaco-editor/esm/vs/language/html/html.worker.js', import.meta.url))
          }
          if (label === 'typescript' || label === 'javascript') {
            return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url))
          }
          return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url))
        }
      }
      if (disposed) return
      monaco = m
      const editor = m.editor.create(containerRef.current!, {
        value,
        language,
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 13,
      })
      editorRef.current = editor
      onMount?.(editor, m)
      editor.onDidChangeModelContent(() => {
        onChange?.(editor.getValue())
      })
    })()
    return () => {
      disposed = true
      if (editorRef.current) {
        editorRef.current.dispose()
      }
    }
  }, [])

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      const pos = editorRef.current.getPosition()
      editorRef.current.setValue(value)
      if (pos) editorRef.current.setPosition(pos)
    }
  }, [value])

  return <div style={{ height }} ref={containerRef} />
}
