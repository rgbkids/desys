export type HslString = string // e.g. "240 5.9% 10%"

export interface DesignTokens {
  background: HslString
  foreground: HslString
  muted: HslString
  "muted-foreground": HslString
  popover: HslString
  "popover-foreground": HslString
  card: HslString
  "card-foreground": HslString
  border: HslString
  input: HslString
  primary: HslString
  "primary-foreground": HslString
  secondary: HslString
  "secondary-foreground": HslString
  accent: HslString
  "accent-foreground": HslString
  destructive: HslString
  "destructive-foreground": HslString
  ring: HslString
  radius: string // e.g. "0.5rem"
}

export const defaultTokens: DesignTokens = {
  background: '0 0% 100%',
  foreground: '240 10% 3.9%',
  muted: '240 4.8% 95.9%',
  'muted-foreground': '240 3.8% 46.1%',
  popover: '0 0% 100%',
  'popover-foreground': '240 10% 3.9%',
  card: '0 0% 100%',
  'card-foreground': '240 10% 3.9%',
  border: '240 5.9% 90%',
  input: '240 5.9% 90%',
  primary: '240 5.9% 10%',
  'primary-foreground': '0 0% 98%',
  secondary: '240 4.8% 95.9%',
  'secondary-foreground': '240 5.9% 10%',
  accent: '240 4.8% 95.9%',
  'accent-foreground': '240 5.9% 10%',
  destructive: '0 84.2% 60.2%',
  'destructive-foreground': '0 0% 98%',
  ring: '240 5% 64.9%',
  radius: '0.5rem'
}

export const tokenKeys = Object.keys(defaultTokens) as (keyof DesignTokens)[]

