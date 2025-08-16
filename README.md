<a href="https://chat.vercel.ai/">
  <h1 align="center">#desys</h1>
</a>

<p align="center">
  An open-source AI chatbot app template built with Next.js, the Vercel AI SDK, OpenAI, and Vercel KV.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a> ·
  <a href="#design-mode"><strong>Design mode</strong></a> ·
  <a href="#code-studio"><strong>Code studio</strong></a> ·
  <a href="#authors"><strong>Authors</strong></a>
</p>
<br/>

## Features

- [Next.js](https://nextjs.org) App Router
- React Server Components (RSCs), Suspense, and Server Actions
- [Vercel AI SDK](https://sdk.vercel.ai/docs) for streaming chat UI
- Support for OpenAI (default), Anthropic, Cohere, Hugging Face, or custom AI chat models and/or LangChain
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - [Radix UI](https://radix-ui.com) for headless component primitives
  - Icons from [Phosphor Icons](https://phosphoricons.com)
- Chat History, rate limiting, and session storage with [Vercel KV](https://vercel.com/storage/kv)
- [NextAuth.js](https://github.com/nextauthjs/next-auth) for authentication

## Model Providers

This template ships with OpenAI `gpt-4o` as the default. However, thanks to the [Vercel AI SDK](https://sdk.vercel.ai/docs), you can switch LLM providers to [Anthropic](https://anthropic.com), [Cohere](https://cohere.com/), [Hugging Face](https://huggingface.co), or using [LangChain](https://js.langchain.com) with just a few lines of code.

## Creating a KV Database Instance

Follow the steps outlined in the [quick start guide](https://vercel.com/docs/storage/vercel-kv/quickstart#create-a-kv-database) provided by Vercel. This guide will assist you in creating and configuring your KV database instance on Vercel, enabling your application to interact with it.

Remember to update your environment variables (`KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`) in the `.env` file with the appropriate credentials provided during the KV database setup.

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various OpenAI and authentication provider accounts.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev
```

Your app template should now be running on [localhost:3000](http://localhost:3000/).

## Design mode

For designers to vibe-code the UI using AI, this repo includes a design studio:

- Path: `/design` (requires login)
- What it does: Chat your desired vibe in Japanese, and the AI adjusts theme design tokens (CSS variables) for colors and radius.
- Persistence: Tokens are saved per-user in Vercel KV and applied globally via CSS variables.

Notes:
- You can reset to defaults anytime from the design studio.
- In preview deployments, you may set an OpenAI key in the dialog to try without server secrets.

### Using Gemini
- Set `GEMINI_API_KEY` in `.env.local` (preferred) or `.env`.
- In the Design and Code studios, switch the provider to "Gemini" and (optionally) provide a preview key.

## Code studio

Generate React components directly from prompts and copy/download the code.

- Path: `/design/code` (requires login)
- Editor: Monaco (`monaco-editor`)
- API: `POST /api/design/code` returns TSX code only; the component uses current design tokens and Tailwind.
 - Providers: OpenAI (default) or Gemini via `GEMINI_API_KEY`.

Suggested workflow:
- Describe the component (“Hero section with headline, subtext, two buttons”).
- Set a PascalCase name.
- Generate → Copy or download `.tsx` → paste into your app.

## Authors

This project is based on the original AI Chatbot template created by [Vercel](https://vercel.com) and [Next.js](https://nextjs.org) team members, with contributions from:

- Jared Palmer ([@jaredpalmer](https://twitter.com/jaredpalmer)) - [Vercel](https://vercel.com)
- Shu Ding ([@shuding\_](https://twitter.com/shuding_)) - [Vercel](https://vercel.com)
- shadcn ([@shadcn](https://twitter.com/shadcn)) - [Vercel](https://vercel.com)

Modified and maintained by:
- rgbkids ([@rgbkids](https://github.com/rgbkids)) - Fork with custom modifications
