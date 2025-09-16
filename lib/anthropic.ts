export const DEFAULT_CLAUDE_MODEL = 'claude-3-5-sonnet-20241022'

export interface AnthropicMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

function toAnthropicPayload(messages: AnthropicMessage[]) {
  const systemParts: string[] = []
  const converted: any[] = []
  for (const m of messages) {
    if (m.role === 'system') {
      systemParts.push(m.content)
    } else {
      converted.push({ role: m.role, content: [{ type: 'text', text: m.content }] })
    }
  }
  return { system: systemParts.join('\n'), messages: converted }
}

export async function anthropicComplete(opts: {
  apiKey: string
  model?: string
  messages: AnthropicMessage[]
  json?: boolean
}): Promise<string> {
  const { apiKey, model = DEFAULT_CLAUDE_MODEL, messages, json } = opts
  const url = 'https://api.anthropic.com/v1/messages'
  const payloadBase = toAnthropicPayload(messages)
  const body: any = {
    model,
    max_tokens: 4096,
    messages: payloadBase.messages
  }
  if (payloadBase.system) body.system = payloadBase.system
  if (json) body.response_format = { type: 'json_object' }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Claude error ${res.status}: ${text}`)
  }
  const data = await res.json()
  const text: string = (data?.content || [])
    .map((p: any) => (p?.type === 'text' ? p?.text || '' : ''))
    .join('')
  return text
}

