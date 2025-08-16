"use client"

import { getCX, type ComponentClasses } from './shared'

export function SwitchSlider({ classes }: { classes?: ComponentClasses }) {
  const cx = getCX(classes)
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-3 text-sm select-none">
        <span>Switch</span>
        <input type="checkbox" className="peer sr-only" />
        <span className={cx('switch_track','inline-block w-12 h-7 rounded-full bg-[hsl(var(--muted))] relative transition-colors peer-checked:bg-[hsl(var(--primary))]')}>
          <span className={cx('switch_thumb','absolute left-1 top-1 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5')} />
        </span>
      </label>
      <div className="flex items中心 gap-3">
        <span className="text-sm text-muted-foreground w-14">Slider</span>
        <input
          type="range"
          className={cx('slider_track','w-full appearance-none h-2 rounded-full bg-[hsl(var(--muted))]')}
          style={{ backgroundImage: 'linear-gradient(hsl(var(--primary)), hsl(var(--primary)))', backgroundSize: '50% 100%', backgroundRepeat: 'no-repeat' }}
        />
      </div>
    </div>
  )
}

