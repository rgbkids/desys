
'use client'

type Props = {}

export default function GeneratedComponent(props: Props) {
  return (
    <div className="bg-[hsl(var(--card))] p-8 rounded-[var(--radius)]">
      <h1 className="text-[hsl(var(--foreground))] text-4xl font-bold mb-4">ヒーローセクション</h1>
      <p className="text-[hsl(var(--muted-foreground))] mb-6">
        これはヒーローセクションの説明文です。ここに魅力的な内容を追加してください。
      </p>
      <div className="flex space-x-4">
        <button className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2 rounded-[var(--radius)]">
          ボタン1
        </button>
        <button className="bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] px-4 py-2 rounded-[var(--radius)]">
          ボタン2
        </button>
      </div>
    </div>
  )
}
