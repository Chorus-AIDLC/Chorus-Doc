# Chorus documentation site

The public documentation site for [Chorus](https://github.com/Chorus-AIDLC/Chorus),
an AI Agent & Human collaboration platform built around the AI-DLC (AI-Driven
Development Lifecycle) workflow.

This is an independent static site built with [Astro](https://astro.build) and
[Starlight](https://starlight.astro.build), deployed to Cloudflare Pages. It is
separate from the Chorus application, its in-repo `docs/`, and the landing site.

## Structure

```
src/
├── assets/                 # Logo and imported image assets
├── components/             # Header, LanguageSelect, Screenshot (Astro components)
├── content/docs/           # All documentation content (MDX)
│   ├── guides/             # Task-oriented walkthroughs (English)
│   ├── reference/          # Stable product / API facts (English)
│   ├── zh/                 # Simplified Chinese translations
│   ├── ja/                 # Japanese translations
│   └── ko/                 # Korean translations
├── lib/                    # analytics.mjs (GA4), agent-docs-contract.mjs
└── styles/                 # custom.css

scripts/                    # Build + validation tooling
├── generate-artifacts.mjs  # Builds .md mirrors, llms.txt, sitemaps (post-build)
├── validate-content.mjs    # Frontmatter + route validation
├── check-links.mjs         # Internal + allowlisted-external link check
└── run-quality-gate.mjs    # Orchestrates the full `pnpm check` gate

tests/                      # Node-based contract + quality tests (.mjs)
config/                     # external-link-allowlist.json
public/                     # Static assets (favicon, images)
```

Four locales: English at the root (`/`), Simplified Chinese (`/zh/`), Japanese
(`/ja/`), and Korean (`/ko/`). Translations are additive — a missing page routes
to that locale's home rather than 404ing.

## Local development

Requires Node.js 22+ and pnpm.

```sh
pnpm install
pnpm exec playwright install chromium   # once, for the browser quality gate
pnpm dev                                 # local authoring server (prints URL)
```

Content lives under `src/content/docs`. Changes reload automatically. See
[`AUTHORING.md`](./AUTHORING.md) for content metadata rules, translation
conventions, and screenshot requirements.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the local authoring server |
| `pnpm build` | Content check + Astro build + generate `.md` mirrors, `llms.txt`, sitemaps |
| `pnpm content:check` | Validate frontmatter, routes, locale coverage, agent-docs contract |
| `pnpm check` | Full quality gate (content, types, build, links, browser a11y) |
| `pnpm check:links` | Internal + allowlisted-external link check |
| `pnpm check:browser` | Responsive, keyboard, and accessibility baseline |
| `pnpm preview` | Serve the production `dist` output |
| `pnpm deploy:check` | Validate the deployment configuration contract (no publish) |

Run `pnpm check` before opening a review — it is the same gate CI runs.

## Agent-readable Markdown

Every page has a raw `.md` mirror generated at build time (served by `preview`
and the live deploy, **not** by `pnpm dev`). Append `.md` to a page URL and drop
the trailing slash to fetch the plain Markdown source — for example
`/reference/mcp-tools.md`. Locale homes are `/index.md` and `/zh.md`. The build
also emits `/llms.txt` and sitemaps.

## Deployment

Publication uses the protected **Deploy Docs** GitHub Actions workflow
(`.github/workflows/docs-deploy.yml`) targeting Cloudflare Pages. See
[`DEPLOYMENT.md`](./DEPLOYMENT.md) for the required environment variables,
secrets, and the manual approval flow.

Google Analytics 4 is env-gated: the build injects `gtag.js` only when
`PUBLIC_GA_MEASUREMENT_ID` is set, so local dev, previews, and internal domains
stay analytics-free.
