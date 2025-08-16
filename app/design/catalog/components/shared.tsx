"use client"

import { useEffect, useState } from 'react'
import { defaultComponentClasses } from '@/lib/design-components'

export type ComponentClasses = Record<string, string>
export type CX = (key: string, fallback: string) => string

export function useCatalogClasses(initial?: ComponentClasses) {
  const [classes, setClasses] = useState<ComponentClasses>(initial || {})
  useEffect(() => {
    if (initial) return
    ;(async () => {
      try {
        const res = await fetch('/api/design/components')
        if (res.ok) {
          const data = await res.json()
          if (data?.components) setClasses(data.components as ComponentClasses)
        }
      } catch {}
    })()
  }, [initial])
  return { classes, setClasses }
}

export function getCX(classes?: ComponentClasses): CX {
  return (key: string, fallback: string) => {
    return (classes && classes[key]) || (defaultComponentClasses as any)[key] || fallback
  }
}

