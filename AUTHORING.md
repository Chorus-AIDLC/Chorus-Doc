# Documentation authoring

## Scope and local development

V1 documents the current Chorus release only. Do not add version selectors or historical
copies yet.

Install dependencies and the browser runtime, then start the local authoring server:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm dev
```

Astro prints the local URL. Changes under `src/content/docs` reload automatically.

## Content metadata and routes

Every Markdown or MDX page must declare `title`, `description`, `docsLocale`, and `route`.
Use `docsLocale: en` for unprefixed English routes and `docsLocale: zh` for routes under
`/zh/`. Keep the path after the locale prefix identical for translated counterparts. The
declared route must match the source path, use lowercase kebab-case segments, and end in
`/`.

Run `pnpm content:check` before opening a review. Missing or invalid metadata blocks
the check and reports the source file. A successful check writes the deterministic
`.astro/docs-route-manifest.json` consumed by generated documentation outputs.

## Add or translate content

Add English pages under `src/content/docs/<section>/` and Chinese counterparts under
`src/content/docs/zh/<section>/`. Keep translated filenames and route stems identical,
for example:

```text
src/content/docs/guides/create-an-idea.mdx
src/content/docs/zh/guides/create-an-idea.mdx
```

Use `guides/` for task-oriented walkthroughs and `reference/` for stable product or API
facts. A missing translation is allowed; the language switch then routes to the selected
locale's home instead of a nonexistent page. Run `pnpm content:check` after adding
or moving content so route collisions and invalid metadata fail early.

## Local quality gate

Install the pinned Chromium test runtime once with
`pnpm exec playwright install chromium`, then run `pnpm check`. The command validates
content and types, performs a production build, checks generated outputs and links, and
tests representative English and Chinese pages for responsive overflow, keyboard access,
visible focus, and serious accessibility violations.

External-link exceptions belong in `config/external-link-allowlist.json` as exact URLs with
a maintenance rationale. Internal links and generated artifacts cannot be allowlisted.

After the check passes, inspect the production output through Astro's preview server:

```sh
pnpm preview --host 127.0.0.1
```

Verify the affected English and Chinese pages, search, language switching, raw `.md`
routes, `/llms.txt`, and the sitemap in this production preview rather than relying only
on the development server. With the preview running on its default integration-test port,
run `pnpm check:preview`; set `DOCS_PREVIEW_URL` when using another preview origin.

## Screenshots

Use the shared `Screenshot.astro` component for product captures. Before an asset is
published, its author and reviewer must inspect the image itself and confirm all items:

- Capture the English Chorus UI by default.
- Capture desktop UI at 1440 x 900 or larger and verify labels remain legible after
  responsive scaling.
- Frame screenshots at page or primary-workspace scale by default so readers can see
  navigation, page location, and the surrounding task context. A complete modal or side
  panel may be the capture boundary when it is the task surface, but keep enough of the
  page behind it to establish context. Never crop down to one or two isolated controls.
- Capture product UI from a running Chorus page in a real browser. Do not generate,
  redraw, reconstruct, or composite product screens, controls, page shells, modals, or
  panels. Synthetic data and text-only redaction are allowed inside the real rendered UI;
  synthetic UI is not.
- Keep capture evidence in the browser automation output until review so the source page,
  viewport, and visible state are traceable.
- Export a compressed WebP or AVIF and pass its exact intrinsic width and height to the
  component so layout remains stable while it loads.
- Write descriptive alternative text that explains the useful UI state; do not repeat a
  nearby caption.
- Use only obviously fictitious public demo content. Never capture a real workspace,
  account, customer, or production environment.
- Remove or mask login names, user names, email addresses, credentials, access tokens,
  API keys, secret values, internal IDs, UUIDs, hostnames, account numbers, and any other
  sensitive or identifying value.
- Perform a manual review at full resolution after redaction. Automated checks do not
  prove that an image is safe to publish.

The illustrative fixture at `public/images/chorus-workflow-demo.webp` predates this rule
and is not a product screenshot. Do not use it as precedent for product documentation.

## Release handoff

Do not run a Cloudflare deployment as part of routine authoring. Complete the local
`pnpm check` and production-preview review, then follow `DEPLOYMENT.md`. Publication
uses the protected **Deploy Docs** workflow and requires the configured environment plus
human approval. The release workflow reruns the same quality gate before uploading only
`dist`.
