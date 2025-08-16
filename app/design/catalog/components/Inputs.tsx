"use client"

import { getCX, type ComponentClasses } from './shared'

export function Inputs({ classes }: { classes?: ComponentClasses }) {
  const cx = getCX(classes)
  return (
    <div className="space-y-3">
      <input className={cx('input','w-full h-10 rounded-md border bg-[hsl(var(--background))] px-3')} placeholder="Text input" />
      <textarea className={cx('textarea','w-full rounded-md border bg-[hsl(var(--background))] px-3 py-2')} rows={3} placeholder="Textarea" />
    </div>
  )
}

