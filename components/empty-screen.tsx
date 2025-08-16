import Link from 'next/link'
import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { IconUser } from '@/components/ui/icons'

const navLinks = [
  { heading: 'Code', message: 'コンポーネントをAIで生成してプレビュー', href: '/design/code' },
  { heading: 'Catalog', message: 'このアプリのUIコンポーネントを生成', href: '/design/catalog' },
  { heading: 'Design', message: 'このアプリのUIコンポーネントを生成', href: '/design' },
]

export function EmptyScreen({ setInput, append }: Pick<UseChatHelpers, 'setInput' | 'append'>) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
      <div className="text-center mb-8">
        <div className="p-4 rounded-full flex items-center justify-center">
          <IconUser className='size-12' />
        </div>

        <h1 className="text-2xl font-medium mb-12">
          Vibe Design System,
          <br />
          How can I help you today?
        </h1>
      </div>

      <div className="w-full max-w-2xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            variant="ghost"
            className="h-auto p-4 text-left justify-start rounded-lg transition-all duration-200 border border-input hover:bg-accent hover:text-accent-foreground"
            onClick={async () => {
              try {
                const res = await fetch('/api/docs/usage')
                const usage = res.ok ? await res.text() : ''
                const prompt = usage
                  ? `You are a helpful product guide. Refer to the following documentation to explain how to use this app. Keep it concise and actionable.\n\n--- USAGE.md ---\n${usage}\n\n---\nNow, explain in Japanese for this user.`
                  : 'このデザインシステムの使い方を教えてください。'
                await append({ role: 'user', content: prompt })
              } catch {
                await append({ role: 'user', content: 'このデザインシステムの使い方を教えてください。' })
              }
            }}
          >
            <div className="flex flex-col w-full text-left">
              <div className="font-medium mb-1 text-sm">Help</div>
              <div className="text-sm">このデザインシステムの使い方</div>
            </div>
          </Button>
          {navLinks.map((item, index) => (
            <Button
              key={index}
              asChild
              variant="ghost"
              className="h-auto p-4 text-left justify-start rounded-lg transition-all duration-200 border border-input hover:bg-accent hover:text-accent-foreground"
            >
              <Link href={item.href}>
                <div className="flex flex-col w-full text-left">
                  <div className="font-medium mb-1 text-sm">
                    {item.heading}
                  </div>
                  <div className="text-sm">
                    {item.message}
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
