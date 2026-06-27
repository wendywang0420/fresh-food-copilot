# Fresh Food Copilot

This app is a Next.js chatbot frontend with a server-side chat route at `app/api/chat/route.ts`. It calls the OpenAI Responses API from the server, so browser clients never need direct OpenAI credentials.

## How AI Is Wired

- `lib/env.ts` reads `OPENAI_*` variables first.
- `lib/env.ts` also supports `TENCENT_RELAY_*` as backward-compatible aliases.
- `lib/ai-transport.ts` decides whether requests go directly to OpenAI or through Cloudflare AI Gateway.
- `lib/foreground-tasks.ts` is the future-facing task layer for normal chat, research, retrieval, and eventual agent-backed execution.
- `lib/retrieval.ts` is the phase-one retrieval seam. It currently returns no internal context, but it is where Vectorize-backed retrieval should plug in later.
- `lib/research-bot.ts` is the centralized web research service. It owns search policy, tool configuration, source extraction, and normalized research payloads.
- `lib/chat-log.ts` is now the internal audit service for conversation history and operation history in Supabase.
- If no base URL is provided, the app now defaults to the official OpenAI API:

```text
https://api.openai.com/v1
```

- `lib/openai-client.ts` builds the OpenAI SDK client from those env vars.
- `app/api/chat/route.ts` uses `openai.responses.create(...)` directly on the server for normal chat, and delegates research-enabled requests through the centralized research bot wrapper.
- `app/api/research/route.ts` exposes the same research bot as a normalized JSON API for other bots or services in your stack.

This means the chatbot can run directly against OpenAI or route through Cloudflare AI Gateway without a separate relay service.

If you want the picker to include non-OpenAI providers through AI Gateway, make sure those provider keys or dynamic routes are configured in Cloudflare first. The app only exposes models you explicitly allowlist.

## Environment Variables

### Local Dev

Create `.env.local`:

```env
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_RESEARCH_MODEL=gpt-5.4-mini
AI_CHAT_MODEL_OPTIONS=gpt-4.1-mini,gpt-4o-mini,dynamic/food-chat
AI_RESEARCH_MODEL_OPTIONS=gpt-5.4-mini,claude-3-5-sonnet-latest,dynamic/food-research
OPENAI_RESEARCH_REASONING_EFFORT=low
OPENAI_RESEARCH_SEARCH_CONTEXT_SIZE=medium
AI_GATEWAY_ENABLED=true
AI_GATEWAY_ACCOUNT_ID=your-cloudflare-account-id
AI_GATEWAY_GATEWAY_ID=default
AI_GATEWAY_API_TOKEN=your-cloudflare-ai-gateway-token
AI_GATEWAY_BYPASS_ON_ERROR=true
AI_CHAT_FALLBACK_ENABLED=false
AI_RESEARCH_FALLBACK_ENABLED=false
AUDIT_LOGGING_ENABLED=true
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
APP_SESSION_SECRET=replace-with-a-long-random-secret
ENABLE_TURNSTILE=false
TURNSTILE_SECRET_KEY=your-turnstile-secret-key
TURNSTILE_EXPECTED_HOSTNAME=
ENABLE_RESEARCH_MODE=false
RESEARCH_BOT_API_KEY=
NEXT_PUBLIC_ENABLE_RESEARCH_MODE=false
NEXT_PUBLIC_ENABLE_TURNSTILE=false
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
```

Optional:

```env
OPENAI_BASE_URL=https://api.openai.com/v1
AI_GATEWAY_BASE_URL=https://gateway.ai.cloudflare.com/v1/your-account-id/default/openai
WORKERS_AI_ENABLED=false
VECTORIZE_ENABLED=false
AGENTS_ENABLED=false
```

`AI_CHAT_MODEL_OPTIONS` and `AI_RESEARCH_MODEL_OPTIONS` are comma-separated allowlists for the model picker. Values can be direct provider model IDs or AI Gateway dynamic route aliases like `dynamic/food-chat`.

### Singapore Production

Set these on the production host:

```env
OPENAI_API_KEY=your-new-rotated-openai-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4.1-mini
OPENAI_RESEARCH_MODEL=gpt-5.4-mini
AI_CHAT_MODEL_OPTIONS=gpt-4.1-mini,gpt-4o-mini,dynamic/food-chat
AI_RESEARCH_MODEL_OPTIONS=gpt-5.4-mini,claude-3-5-sonnet-latest,dynamic/food-research
OPENAI_RESEARCH_REASONING_EFFORT=low
OPENAI_RESEARCH_SEARCH_CONTEXT_SIZE=medium
AI_GATEWAY_ENABLED=true
AI_GATEWAY_ACCOUNT_ID=your-cloudflare-account-id
AI_GATEWAY_GATEWAY_ID=default
AI_GATEWAY_API_TOKEN=your-cloudflare-ai-gateway-token
AI_GATEWAY_BYPASS_ON_ERROR=true
AI_CHAT_FALLBACK_ENABLED=false
AI_RESEARCH_FALLBACK_ENABLED=false
AUDIT_LOGGING_ENABLED=true
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
APP_SESSION_SECRET=replace-with-a-long-random-secret
ENABLE_TURNSTILE=false
TURNSTILE_SECRET_KEY=your-turnstile-secret-key
TURNSTILE_EXPECTED_HOSTNAME=your-production-hostname
ENABLE_RESEARCH_MODE=false
RESEARCH_BOT_API_KEY=
NEXT_PUBLIC_ENABLE_RESEARCH_MODE=false
NEXT_PUBLIC_ENABLE_TURNSTILE=false
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
NODE_ENV=production
```

Backward-compatible alias form is still supported if you need it:

```env
TENCENT_RELAY_BASE_URL=https://api.openai.com/v1
TENCENT_RELAY_API_KEY=your-openai-api-key
```

## Supabase Audit Schema

Apply the audit schema before relying on persistent history:

```bash
psql "$SUPABASE_DB_URL" -f deploy/supabase.audit.sql
```

The rollout adds:

- `conversation_sessions`
- `conversation_messages`
- `ai_operations`
- `ai_operation_events`
- `admin_allowlist`
- `lead_submissions`
- `invite_codes`
- `invite_redemptions`
- `app_settings`

## Access Roles

The app now supports four access states:

- `public_visitor`
- `lead_unlocked`
- `invite_unlocked`
- `admin`

`admin` is a strict superset role. An admin can see the public, lead-unlocked, AI-unlocked, and admin-only surfaces from the same app.

### What To Configure

1. Apply `deploy/supabase.audit.sql`.
2. Set `APP_SESSION_SECRET` to a long random value.
3. Enable Supabase email auth for magic-link or OTP sign-in.
4. Seed at least one row in `admin_allowlist` with the admin email address.
5. Open [`/admin`](http://localhost:3000/admin) in local dev or `/admin` in production to start admin sign-in.

### Visitor Flow

- Anonymous visitors can load the product shell.
- Submitting lead details unlocks the fuller product experience.
- Redeeming a valid invite code unlocks AI chat and research.
- Admins do not need invite codes to use AI.

### Runtime Settings

Admin settings and feature toggles now live in the `app_settings` table. Phase-one settings include:

- `lead_gate_enabled`
- `invite_gate_enabled`
- `research_mode_enabled`
- `chat_model_options`
- `research_model_options`

Secrets still stay in environment variables rather than the database.

## Health Check

A lightweight readiness endpoint is available at:

```text
/api/health
```

Example response:

```json
{
  "ok": true,
  "openAIConfigured": true,
  "openAIBaseURL": "https://api.openai.com/v1",
  "model": "gpt-4.1-mini",
  "aiGatewayActive": true,
  "auditLoggingEnabled": true
}
```

When research mode is enabled, the health response also reports:

- `researchModeEnabled`
- `researchModel`
- `researchReasoningEffort`
- `researchBotProtected`
- `transports`

## Research Bot API

A dedicated research endpoint is available at:

```text
/api/research
```

This endpoint normalizes responses into:

```json
{
  "answer": "string",
  "sources": [{ "title": "string", "url": "string" }],
  "researchUsed": true,
  "querySummary": "string",
  "fetchedAt": "2026-05-07T00:00:00.000Z",
  "policy": {
    "searchMode": "auto",
    "freshnessSensitive": true,
    "liveWebAccess": true,
    "reason": "string",
    "allowedDomains": [],
    "blockedDomains": []
  },
  "responseId": "resp_...",
  "status": "completed",
  "model": "gpt-5.4-mini"
}
```

Useful request fields:

- `input`
- `messages`
- `instructions`
- `allowedDomains`
- `blockedDomains`
- `externalWebAccess`
- `userLocation`
- `forceSearch`
- `model`
- `reasoningEffort`

If `RESEARCH_BOT_API_KEY` is set, callers must send it in the `x-research-bot-key` header.

## Local Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Singapore Deployment Notes

Recommended shape on the Singapore server:

- keep the WeChat relay on port `8000`
- run this chatbot app on port `3000`
- place a reverse proxy in front later if you want one clean domain

Basic deployment flow:

1. Put this repo on the Singapore server.
2. Install Node.js and dependencies:

```bash
npm install
```

3. Create a production env file such as `.env.production` with the variables above.
   A ready-to-copy template lives at `deploy/.env.production.example`.
4. Build the app:

```bash
npm run build
```

5. Start it:

```bash
npm run start -- --hostname 0.0.0.0 --port 3000
```

6. Add a process manager or service so it survives reboot.
   A starter `systemd` unit lives at `deploy/fresh-food-copilot.service.example`.
7. Open port `3000` in the server firewall if you are testing directly by IP.

## Remaining Risks

- Rotate any OpenAI API key that was exposed during setup before production deployment.
- Turnstile and Supabase values still need to be valid in production or chat requests may fail.
- Direct IP + open firewall is fine for smoke tests, but a reverse proxy with HTTPS is safer for real production traffic.
