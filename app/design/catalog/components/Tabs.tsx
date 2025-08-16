"use client"

import { useState } from 'react'
import { getCX, type ComponentClasses } from './shared'

export function Tabs({ classes }: { classes?: ComponentClasses }) {
  const [tab, setTab] = useState<'one' | 'two' | 'three'>('one')
  const cx = getCX(classes)
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

