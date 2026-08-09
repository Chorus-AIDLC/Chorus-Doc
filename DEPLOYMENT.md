# Documentation deployment

The documentation site is an independent static Cloudflare deployment. It does
not replace the Chorus application repository, its README, or the landing site.

It deploys the same way as the sibling landing site (`../ai-pm/packages/landing`):
a Cloudflare **Workers static-asset** upload. The built `dist` directory is
served directly as static assets — there is no Worker script, no GitHub Actions
workflow, and no self-managed API token in this flow.

## Configuration

`wrangler.jsonc` declares the site name and the assets directory:

```jsonc
{
  "name": "chorus-doc",
  "compatibility_date": "2026-08-07",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  }
}
```

`assets.directory` points at the Astro build output. `not_found_handling:
"404-page"` serves the generated 404 page for unmatched routes. Because the
config uses `assets` (Workers) rather than `pages_build_output_dir` (Pages), the
deploy command is `wrangler deploy`, not `wrangler pages deploy`.

## Deploy

Build first, then deploy the `dist` assets:

```sh
pnpm build
npx wrangler deploy
```

`pnpm build` runs `content:check`, `astro build`, and generates the `.md`
mirrors, `llms.txt`, and sitemaps into `dist`. `wrangler deploy` uploads that
directory. In Cloudflare's own Git build, set the build command to `pnpm build`
and the deploy command to `npx wrangler deploy`; the build system supplies
deploy credentials automatically, so do not set a `CLOUDFLARE_API_TOKEN` build
variable — a stray token overrides the built-in one and causes an
authentication error.

Verify the config resolves without publishing:

```sh
npx wrangler deploy --dry-run   # reads the dist assets directory, uploads nothing
```

### Analytics (optional)

Google Analytics 4 is env-gated on `PUBLIC_GA_MEASUREMENT_ID`. Set it as a build
environment variable to inject `gtag.js`; leave it unset or blank and the build
emits no analytics code at all, so local development, previews, and internal
deployments stay analytics-free without any per-environment toggle. Use a
distinct measurement id from the landing site's Google Analytics property to
keep documentation traffic in its own report.

### Quality-gate note

Cloudflare's build runs only `pnpm build`, not the full `pnpm check` gate. The
link and accessibility checks depend on a Playwright browser that is not present
in Cloudflare's build image, so they do not run during deployment. Run
`pnpm check` locally before merging to `main` — it is the real quality bar.

## Local validation

Use Node.js 22 and pnpm. The validation commands do not contact Cloudflare or
require credentials:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm check
```

Review the generated site locally before merging:

```sh
pnpm preview --host 127.0.0.1
```

The preview serves the production `dist` output. Check the affected English and
Chinese routes, search, language switching, `.md` mirrors, `llms.txt`, and
sitemap at the URL printed by Astro.

## Rollback and disablement

To roll back content, use the Cloudflare dashboard's deployment history to
promote the last known-good deployment, or revert the offending commit on the
production branch and redeploy.

To stop publication, disconnect the Git integration or pause automatic
deployments in the Cloudflare project settings.

Disabling or rolling back this deployment does not alter the Chorus application
repository, the landing site, or the Chorus application deployment.

Cloudflare references:

- [Workers static assets](https://developers.cloudflare.com/workers/static-assets/)
- [`wrangler deploy`](https://developers.cloudflare.com/workers/wrangler/commands/#deploy)
- [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
