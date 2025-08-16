"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export function HeaderNav() {
  const pathname = usePathname() || '/'

  const isHome = pathname === '/' || pathname.startsWith('/chat')
  const isDesign = pathname === '/design'
  const isCode = pathname.startsWith('/design/code')
  const isCatalog = pathname.startsWith('/design/catalog')

  const variant = (active: boolean) => (active ? 'secondary' : 'outline') as const

  return (
    <>
      <Link href="/" className={cn(buttonVariants({ variant: variant(isHome) }))}>Home</Link>
      <Link href="/design/code" className={cn(buttonVariants({ variant: variant(isCode) }))}>Code</Link>
      <Link href="/design/catalog" className={cn(buttonVariants({ variant: variant(isCatalog) }))}>Catalog</Link>
      <Link href="/design" className={cn(buttonVariants({ variant: variant(isDesign) }))}>Design</Link>
    </>
  )
}

