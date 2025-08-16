"use client"

import { getCX, type ComponentClasses } from './shared'

export function Badges({ classes }: { classes?: ComponentClasses }) {
  const cx = getCX(classes)
  return (
    <div className="flex flex-wrap gap-2">
      <span className={cx('badge_neutral','px-2 py-1 rounded-full text-xs bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]')}>Neutral</span>
      <span className={cx('badge_secondary','px-2 py-1 rounded-full text-xs bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]')}>Secondary</span>
      <span className={cx('badge_destructive','px-2 py-1 rounded-full text-xs bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]')}>Destructive</span>
    </div>
  )
}

