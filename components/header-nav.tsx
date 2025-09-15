"use client"

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { IconSpinner } from '@/components/ui/icons'

export function HeaderNav() {
  const pathname = usePathname() || '/'

  const isHome = pathname === '/' || pathname.startsWith('/chat')
  const isDesign = pathname === '/design'
  const isCode = pathname.startsWith('/design/code')
  const isCatalog = pathname.startsWith('/design/catalog')

  type NavVariant = 'secondary' | 'outline'
  const variant = (active: boolean): NavVariant => (active ? 'secondary' : 'outline')

  function NavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    useEffect(() => {
      // reset loading when active state changes (route changed)
      setLoading(false)
    }, [active])
    return (
      <Button
        variant={variant(active)}
        disabled={loading}
        onClick={() => {
          if (loading || pathname === href) return
          setLoading(true)
          router.push(href)
        }}
      >
        {loading ? <IconSpinner className="mr-2" /> : null}
        {label}
      </Button>
    )
  }

  return (
    <>
      <NavItem href="/" label="Home" active={isHome} />
      <NavItem href="/design/code" label="Code" active={isCode} />
      <NavItem href="/design/catalog" label="Catalog" active={isCatalog} />
      <NavItem href="/design" label="Design" active={isDesign} />
    </>
  )
}
