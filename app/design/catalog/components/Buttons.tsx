"use client"

import { getCX, type ComponentClasses } from './shared'

export function Buttons({ classes }: { classes?: ComponentClasses }) {
  const cx = getCX(classes)
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

