# Agent-operations screenshot capture manifest

> **Status: captured (2026-08-08).** Four screenshots for the agent-connection module were
> captured in a prior pass, and three new daemon/online-agent surfaces were captured in a
> follow-up pass after the owner asked for them explicitly — the conversational idea entry,
> the project working-directory picker, and the presence panel (see "Captured" below); all
> are wired into their pages in both locales. To capture the new surfaces, a **local-dev
> agent was brought online**: a throwaway admin agent key was minted through the running
> dev server's own **Settings → Create API Key** UI, and a second `chorus daemon` was run
> with an **isolated `HOME`** (`/tmp/docs-daemon-home`) and explicit `--url
> http://localhost:8637 --api-key … --cwd …` flags (with the box's production `CHORUS_URL` /
> `CHORUS_API_KEY` env vars stripped via `env -u`) so it registered against **local dev**
> and never touched the production daemon's `~/.chorus/daemon.json`. One surface — the **Copy
> session id** control — remains deferred (see "Deferred"): it renders only once the backend
> records a resume id for a session, which needs a further resume cycle beyond a single
> first turn.
>
> **⚠️ Human redaction review required before public release.** Any screenshot captured on a
> real instance must have login name, email, agent-key (`cho_`) values, and internal
> identifiers masked, and should be eyeballed at full size before the docs site is published.
>
> This document is the **reproduction recipe** for (re-)capturing every agent-operations
> screenshot in one gate-safe pass.

## Gate-safe rule (read first)

`packages/docs/scripts/check-links.mjs` extracts every image `src` from the built HTML and
**fails the build** when a same-origin image URL has no file in `dist/`. `Screenshot.astro`
renders a plain `<img src=…>`. The marker comments (`{/* Screenshot surface: … */}` /
`{/* 截图位置：… */}`) are MDX/JSX comments — they emit **no** `<img>`, so they never trip
the link check. Therefore:

1. **A `<Screenshot>` component and its `.webp` file are added together, or neither is
   added.** Never leave a `<Screenshot>` pointing at a missing file. While the file does not
   exist, keep the marker comment in place — it is intentionally inert.
2. **Both locales together.** When a screenshot lands, wire its `<Screenshot>` into the
   English page *and* the `/zh` mirror in the same edit.

## Capture environment (recipe)

- **Instance:** a **local dev** server (`pnpm dev`, Docker Postgres on `:5433`), driven with
  the Playwright MCP. See the `e2e-verification` skill for the local login flow
  (`admin@chorus.local` via `DEFAULT_USER` / `DEFAULT_PASSWORD` in `.env`).
- **Online-agent surfaces need a live daemon.** The conversational entry, the Copy-session-id
  control, the running/interrupt/resume chat, the presence "agents online" list, and the
  project directory-anchoring picker only render populated when an agent is connected. Start
  a local daemon pointed at the local dev server first: `chorus login` (against
  `http://localhost:8637`) then `chorus daemon --cwd <a demo repo>`, and confirm the
  bottom-left presence pill shows ≥1 agent online before capturing.
- **Viewport:** 1440×900, **English** UI. **Theme:** Light (match the existing set).
- **Demo data:** use a fictitious public project (e.g. **Skylark Notes**). Mask the signed-in
  identity to a fictitious **Demo Reviewer / reviewer@demo.example**, replace agent-key names
  with fictitious values, and mask every `cho_` prefix. No browser URL bar in frame.
- **Export:** compressed **WebP** into `packages/docs/public/images/agent-operations/`.

## Captured (already committed and wired)

| File | Wired into (en + zh) | Shows |
|---|---|---|
| `connection-online.webp` | `guides/operator-onboarding` | A connected runtime showing as online |
| `remote-wake.webp` | `guides/remote-control` | Selecting a runtime + working directory and starting a session |
| `session-control.webp` | `guides/session-recovery` | A running conversation: active turn, elapsed time, Interrupt control |
| `credential-permissions.webp` | `guides/administrator-setup` | Agent key creation / permission preset UI (key masked) |
| `conversational-idea-entry.webp` | `guides/capture-an-idea` | New Idea dialog → "Describe to an agent" tab: agent select, working-directory picker, description, Send to agent |
| `project-fix-directory.webp` | `guides/create-a-project` | Project settings → "Agent working directories": per-agent host + working-directory picker |
| `presence-online-agents.webp` | `guides/online-agents-overview` | Presence panel listing an online connection by agent, backend, host, and working directory |

> The daemon-docs module also **reuses** existing committed screenshots rather than
> re-shooting: `guides/create-a-project` embeds `/images/workflow/create-project.webp` +
> `project-overview.webp`; `guides/capture-an-idea` embeds `/images/workflow/idea-elaboration.webp`,
> `idea-verify-elaborate.webp`, `idea-lineage.webp`; `guides/session-recovery` embeds the
> `session-control.webp` above. Those are recorded in their own modules' manifests.

## Deferred — new daemon surfaces (human follow-up)

Each row has an **inert marker comment** already placed on the target page(s). To land a
screenshot: capture per the recipe above, drop the `.webp` here, and replace the marker with
a `<Screenshot src=… alt=… width={1440} height={900} caption=… />` in **both** locales.
Until then the marker stays and the gate stays green.

| Proposed file | Target page(s) (en + zh) | Surface to capture | Requires |
|---|---|---|---|
| `copy-session-id.webp` | `guides/session-recovery` | Chat transcript header showing the **Copy session ID** control | a session whose **backend resume id** has been recorded (needs a resume cycle, not just a first turn) |

> The **Copy session id** control (`CopySessionIdButton`, `transcript-view.tsx`) renders only
> when `session.backendSessionId` is populated. A single fresh first turn does not always
> record it for the Claude backend; capture this after resuming a session at least once. The
> takeover flow itself is documented in prose on `guides/session-recovery` and the per-backend
> resume commands on the platform pages, so this image is an enhancement, not a gap.
>
> Interrupt/resume chat UI is already represented by `session-control.webp`; a dedicated
> resume-state shot is optional.

## Verification after (re-)capture

Run the full gate and confirm it stays green with the new images present:

```
pnpm docs:check
```

`check:links` will now require each newly-referenced `/images/agent-operations/*.webp` to
exist in `dist/`; a missing file fails the build. Confirm the passing tail
(`[docs:check] all quality gates passed`).
