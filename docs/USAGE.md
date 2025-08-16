# Using the App

## Overview
This app is a Next.js + TypeScript workspace for AI‑assisted product design and prototyping. It provides:
- Chat to converse with the model.
- Design Studio to tune design tokens via natural language.
- Code Studio to generate previewable React components.
- UI Catalog to preview and adjust common UI parts.

Quick links appear in the header and on the empty chat screen:
- Design: `/design`
- Code: `/design/code`
- Catalog: `/design/catalog`
- Ask for help: posts “How to use this app” into chat.

## Getting Started
- Sign in: Use the Login link in the header. Unauthenticated users are redirected from `/design`.
- Preview environments only: you may be asked for an OpenAI API key (stored in `localStorage` as `ai-token`).

## Chat
- Go to `/` and start typing, or click the “How to use this app” button on the empty screen to auto‑post a help prompt.
- Threads save to your local session; use the sidebar to access history when logged in.

## Design Studio (`/design`)
- Describe the desired style (e.g., “High‑contrast dark theme with larger radius”).
- Pick a provider (OpenAI, Gemini, Claude) and Send.
- The app updates CSS variables (design tokens) live and persists them per user.
- Use Reset to revert to defaults.

## Code Studio (`/design/code`)
- Enter a component name and a prompt (e.g., “Hero section with title, description, two buttons”).
- Enable Preview Compatible mode to generate code without imports for the sandbox preview.
- Generate, edit in the editor, preview in the iframe, then Copy or Save (`.tsx`) into the project.

## UI Catalog (`/design/catalog`)
- Type a style prompt and Apply to update styles for catalog components (Buttons, Inputs, Tabs, etc.).
- Use “コードを見る” to view example code for the current section.
- Reapply to reload your latest saved tokens and component class overrides.

## Tips
- Environment: configure secrets in `.env.local`; do not commit real keys.
- If styles don’t reflect immediately, use the page’s Reapply/Reset or refresh to sync server and client state.
