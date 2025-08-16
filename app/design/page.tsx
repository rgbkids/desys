import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { kv } from '@vercel/kv'
import { defaultTokens, type DesignTokens } from '@/lib/design-tokens'
import { DesignStudio } from '@/components/design-studio'

export const metadata = {
  title: 'Design Studio'
}

const keyFor = (userId: string) => `design:tokens:${userId}`

export default async function DesignPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in?next=/design')

  const tokens = (await kv.get<DesignTokens>(keyFor(session.user.id))) || defaultTokens
  return (
    <div className="container py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">デザインモード</h1>
        <p className="text-sm text-muted-foreground">生成AIに雰囲気を伝えて、配色や角丸などのトークンを自動調整します。</p>
      </div>
      <DesignStudio initialTokens={tokens} />
    </div>
  )
}

