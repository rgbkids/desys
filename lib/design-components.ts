export type ComponentKey =
  | 'button_primary'
  | 'button_secondary'
  | 'button_outline'
  | 'button_ghost'
  | 'button_pill'
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'switch_track'
  | 'switch_thumb'
  | 'slider_track'
  | 'badge_neutral'
  | 'badge_secondary'
  | 'badge_destructive'
  | 'tabs_root'
  | 'tabs_trigger_active'
  | 'tabs_trigger_inactive'

export type ComponentClasses = Partial<Record<ComponentKey, string>>

export const defaultComponentClasses: Record<ComponentKey, string> = {
  button_primary:
    'px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow',
  button_secondary:
    'px-4 py-2 rounded-md bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]',
  button_outline: 'px-4 py-2 rounded-md border',
  button_ghost: 'px-4 py-2 rounded-md hover:bg-[hsl(var(--muted))] transition-colors',
  button_pill: 'px-4 py-2 rounded-full border',
  input:
    'w-full h-10 rounded-md border bg-[hsl(var(--background))] text-[hsl(var(--foreground))] px-3',
  textarea:
    'w-full rounded-md border bg-[hsl(var(--background))] text-[hsl(var(--foreground))] px-3 py-2',
  select:
    'h-9 rounded-md border bg-[hsl(var(--background))] text-[hsl(var(--foreground))] px-3 text-sm',
  checkbox: 'size-4 rounded border',
  radio: 'size-4 border rounded-full',
  switch_track:
    'inline-block w-12 h-7 rounded-full bg-[hsl(var(--muted))] relative transition-colors peer-checked:bg-[hsl(var(--primary))]'
    ,
  switch_thumb:
    'absolute left-1 top-1 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5',
  slider_track:
    'w-full appearance-none h-2 rounded-full bg-[hsl(var(--muted))]'
    ,
  badge_neutral: 'px-2 py-1 rounded-full text-xs bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]',
  badge_secondary:
    'px-2 py-1 rounded-full text-xs bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]',
  badge_destructive:
    'px-2 py-1 rounded-full text-xs bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]',
  tabs_root: 'inline-flex rounded-md border p-1 bg-[hsl(var(--muted))] gap-1',
  tabs_trigger_active: 'px-3 py-1.5 text-sm rounded bg-[hsl(var(--background))] shadow',
  tabs_trigger_inactive: 'px-3 py-1.5 text-sm rounded opacity-70 hover:opacity-100'
}

