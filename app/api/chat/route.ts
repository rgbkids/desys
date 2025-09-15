import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'
import { DEFAULT_OPENAI_MODEL } from '@/lib/openai'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken, provider } = json as any
  const userId = (await auth())?.user.id

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  if (previewToken) {
    openai.apiKey = previewToken
  }

  if (provider === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return new Response('Missing GEMINI_API_KEY', { status: 400 })
    const { geminiComplete, DEFAULT_GEMINI_MODEL } = await import('@/lib/gemini')
    try {
      const text = await geminiComplete({ apiKey, model: DEFAULT_GEMINI_MODEL, messages })
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(text))
          controller.close()
        }
      })
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId,
        createdAt,
        path,
        messages: [
          ...messages,
          { content: text, role: 'assistant' }
        ]
      }
      await kv.hmset(`chat:${id}`, payload)
      await kv.zadd(`user:chat:${userId}`, { score: createdAt, member: `chat:${id}` })
      return new StreamingTextResponse(stream)
    } catch (e: any) {
      const msg = String(e?.message || '')
      if (!(msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED'))) {
        return new Response(msg || 'Gemini failed', { status: 500 })
      }
      // Fallback to OpenAI
    }
  }

  if (provider === 'claude') {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return new Response('Missing ANTHROPIC_API_KEY', { status: 400 })
    const { anthropicComplete, DEFAULT_CLAUDE_MODEL } = await import('@/lib/anthropic')
    try {
      const text = await anthropicComplete({ apiKey, model: DEFAULT_CLAUDE_MODEL, messages })
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(text))
          controller.close()
        }
      })
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = { id, title, userId, createdAt, path, messages: [...messages, { content: text, role: 'assistant' }] }
      await kv.hmset(`chat:${id}`, payload)
      await kv.zadd(`user:chat:${userId}`, { score: createdAt, member: `chat:${id}` })
      return new StreamingTextResponse(stream)
    } catch (e: any) {
      const msg = String(e?.message || '')
      if (!(msg.includes('429') || msg.includes('rate') || msg.includes('quota'))) {
        return new Response(msg || 'Claude failed', { status: 500 })
      }
      // Fallback to OpenAI below
    }
  }

  const res = await openai.chat.completions.create({
    model: DEFAULT_OPENAI_MODEL,
    messages,
    temperature: 0.7,
    stream: true
  })
  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId,
        createdAt,
        path,
        messages: [
          ...messages,
          { content: completion, role: 'assistant' }
        ]
      }
      await kv.hmset(`chat:${id}`, payload)
      await kv.zadd(`user:chat:${userId}`, { score: createdAt, member: `chat:${id}` })
    }
  })
  return new StreamingTextResponse(stream)
}
