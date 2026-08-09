# CLAUDE.md — Chorus documentation site

This is the standalone public documentation site for **Chorus** (an AI Agent &
Human collaboration platform built on the AI-DLC workflow). It is an Astro +
Starlight static site deployed to Cloudflare Pages. It is a separate repo from
the Chorus application.

## Tech stack

- **Astro 6** + **Starlight 0.39** (static output)
- **pnpm** (Node.js 22+)
- Content in **MDX** under `src/content/docs`
- **Cloudflare Pages** deploy via GitHub Actions
- Build-time tooling and tests are plain Node **`.mjs`** scripts (no test framework)

## Key commands

```sh
pnpm dev              # local authoring server (does NOT generate .md mirrors)
pnpm build            # content:check + astro build + generate .md/llms.txt/sitemaps
pnpm content:check    # frontmatter, routes, locale coverage, agent-docs contract
pnpm check            # full quality gate (content, types, build, links, browser a11y)
pnpm check:links      # internal + allowlisted-external links
pnpm check:browser    # responsive / keyboard / accessibility baseline
pnpm preview          # serve production dist (this DOES serve .md mirrors)
```

Always run `pnpm check` before considering docs work done — it is the CI gate.

## Content model

- Four locales: English at root (`/`), Simplified Chinese (`/zh/`), Japanese
  (`/ja/`), Korean (`/ko/`). Content lives under
  `src/content/docs/{guides,reference}` (English) and `src/content/docs/<locale>/…`.
- Translations are **additive**: a missing localized page routes to that locale's
  home, it does not 404. Keep translated filenames and route stems identical to
  their English counterpart.
- `guides/` = task-oriented walkthroughs. `reference/` = stable product/API facts.

### Frontmatter (required on every page)

Four required fields, validated by `scripts/validate-content.mjs`:

- `title`
- `description`
- `docsLocale` — `en` for unprefixed routes, `zh`/`ja`/`ko` for localized ones
- `route` — must match the source path, lowercase kebab-case, end in `/`
  (e.g. `/guides/getting-started/`, `/zh/reference/mcp-tools/`)

Optional: `sidebar: { order: N }`.

### Sidebar

The sidebar is an **explicit array in `astro.config.mjs`**, not file-driven.
Adding a page means adding its `{ slug: '…' }` entry to the right group there.
Slug `index` → `/`, `zh/index` → `/zh/`.

### Screenshots

Use the shared `Screenshot.astro` component. Import-path depth depends on nesting:

- EN root `index.mdx`: `../../components/`
- EN guide/reference page: `../../../components/`
- localized (`zh`/`ja`/`ko`) `index.mdx`: `../../../components/`
- localized guide/reference page: `../../../../components/`

Screenshots must be real captures of the running Chorus UI (never synthetic),
redacted of any sensitive/identifying values, exported as WebP at their exact
intrinsic width/height. See `AUTHORING.md` for the full review checklist.

## Writing rules (learned the hard way)

- **User docs give only user-useful information.** Never transcribe routes,
  placeholder text, or internal implementation names. Accuracy ≠ transcription —
  describe what the user sees and does, not how it is built. Borrowed internal
  names (e.g. calling a document a "reference artifact") are a bug.
- **No em dashes (`—`) in Chinese prose.** Use commas, `：`, or parentheses. Em
  dashes are fine inside English prose and inside code fences/comments in any
  locale. When sweeping, detect em dashes *outside* code fences only.
- **CJK bold-flanking gotcha (CommonMark).** A closing `**` immediately preceded
  by full-width/CJK punctuation AND immediately followed by a non-space CJK char
  is NOT valid right-flanking → it renders as a **literal** `**`. Fix: move the
  punctuation OUTSIDE the bold — write `**文本**。` not `**文本。**`. This is
  invisible to `content:check`; only a grep of the rendered `dist` HTML for
  stray `**` catches it. After any CJK bold edit, build and grep `dist`.

## Verification discipline

- `content:check` validates metadata and contracts but **cannot** see rendering
  bugs (literal `**`, broken emphasis). Ground-truth for rendering is the built
  HTML under `dist/` — build, then grep/inspect the actual output.
- The `.md` agent mirrors, `llms.txt`, and sitemaps are generated **only** by
  `pnpm build` (via `scripts/generate-artifacts.mjs`), served by `preview`/live
  deploy — **never** by `pnpm dev`. Don't test the `.md` contract against the dev
  server.
- `.md` URL contract: append `.md`, drop the trailing slash. Locale homes are
  `/index.md` and `/zh.md`. Enforced by `tests/agent-docs-contract.mjs`.

## Deployment

Cloudflare Pages **Git integration**: Cloudflare builds from the repo (build
command `pnpm build`) and auto-publishes `dist`. No GitHub Actions workflow and
no self-managed API token — see `DEPLOYMENT.md`. Run `pnpm check` locally before
merging; Cloudflare's build only runs `pnpm build` (no Playwright in its image).

GA4 is env-gated on `PUBLIC_GA_MEASUREMENT_ID`: unset ⇒ no analytics code emitted
anywhere (keeps dev/preview/internal domains analytics-free). It is deliberately
kept out of the required-vars validation loop so it stays optional.
