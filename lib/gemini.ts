export const DEFAULT_GEMINI_MODEL = 'gemini-1.5-flash'

export interface GeminiMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

function toGeminiContents(messages: GeminiMessage[]) {
  // Gemini expects alternating user/model roles. We'll flatten system as a user preface.
  const parts: any[] = []
  let preface = ''
  for (const m of messages) {
    if (m.role === 'system') {
      preface += m.content + '\n'
    }
  }
  if (preface) {
    parts.push({ role: 'user', parts: [{ text: preface.trim() }] })
  }
  for (const m of messages) {
    if (m.role === 'user') parts.push({ role: 'user', parts: [{ text: m.content }] })
    if (m.role === 'assistant') parts.push({ role: 'model', parts: [{ text: m.content }] })
  }
  return parts
}

export async function geminiComplete(opts: {
  apiKey: string
  model?: string
  messages: GeminiMessage[]
  responseMimeType?: string
}): Promise<string> {
  const { apiKey, model = DEFAULT_GEMINI_MODEL, messages, responseMimeType } = opts
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const body: any = {
    contents: toGeminiContents(messages)
  }
  if (responseMimeType) {
    body.generationConfig = { responseMimeType }
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Gemini error ${res.status}: ${text}`)
  }
  const data = await res.json()
  const text: string = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || '').join('') || ''
  return text
}
