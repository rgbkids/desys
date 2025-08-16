"use client"

import { getCX, type ComponentClasses } from './shared'

export function Checks({ classes }: { classes?: ComponentClasses }) {
  const cx = getCX(classes)
  return (
    <div className="flex flex-wrap items-center gap-4">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className={cx('checkbox','size-4 rounded border')} /> Checkbox
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="radio" name="r" className={cx('radio','size-4 border rounded-full')} /> Radio
      </label>
      <select className={cx('select','h-9 rounded-md border bg-[hsl(var(--background))] px-3 text-sm')}>
        <option>Apple</option>
        <option>Orange</option>
        <option>Banana</option>
      </select>
    </div>
  )
}

