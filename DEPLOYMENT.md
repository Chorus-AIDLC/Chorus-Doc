# Documentation deployment

The documentation site is an independent static Cloudflare Pages deployment. It
does not replace the Chorus application repository, its README, or the landing
site.

## GitHub configuration

Create a protected GitHub environment named `docs-production`. Require reviewers
for that environment, then configure:

| Name                       | Kind                 | Purpose                                                        |
| -------------------------- | -------------------- | -------------------------------------------------------------- |
| `DOCS_SITE_URL`            | environment variable | Public canonical URL, including `https://`                     |
| `CLOUDFLARE_ACCOUNT_ID`    | environment variable | Cloudflare account containing the Pages project                |
| `CLOUDFLARE_PROJECT_NAME`  | environment variable | Existing Pages project name                                    |
| `CLOUDFLARE_API_TOKEN`     | environment secret   | Token scoped to deploy that Pages project                     |
| `PUBLIC_GA_MEASUREMENT_ID` | environment variable | Optional. Google Analytics 4 measurement id (`G-…`) to enable analytics; leave unset to keep the site analytics-free |

Pull-request CI has read-only repository permission and does not reference the
environment or any Cloudflare secret.

`PUBLIC_GA_MEASUREMENT_ID` is optional. When it is set, the build injects the GA4
`gtag.js` snippet on every page; when it is unset or blank, the build emits no
analytics code at all, so local development, previews, and internal/demo
deployments stay analytics-free without any per-environment toggle. It is
deliberately separate from the landing site's Google Analytics property — set a
distinct measurement id here to keep documentation traffic in its own report.

## Local validation

Use Node.js 22 and pnpm. The validation commands do not contact Cloudflare or
require credentials:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm check
pnpm deploy:check
```

`deploy:check` validates the workflow/configuration contract and asks the
installed Wrangler CLI to parse its current `pages deploy` help. It does not run
the deploy command.

Review the generated site locally before requesting publication:

```sh
pnpm preview --host 127.0.0.1
```

The preview serves the production `dist` output. Check the affected
English and Chinese routes, search, language switching, `.md` mirrors, `llms.txt`,
and sitemap at the URL printed by Astro.

## Production deployment

1. Create the Cloudflare Pages project named by `CLOUDFLARE_PROJECT_NAME`.
2. Configure the `docs-production` GitHub environment and its approval policy.
3. Run the **Deploy Docs** workflow manually and confirm the deployment branch.
4. Approve the protected environment prompt.
5. Confirm the workflow passes `pnpm check` before its publish step.
6. Verify the deployment at `DOCS_SITE_URL`.

V1 publishes only documentation for the current Chorus version.

The upload command is:

```sh
wrangler pages deploy dist \
  --project-name "$CLOUDFLARE_PROJECT_NAME" \
  --branch main
```

It runs from the repository root, so only `dist` is uploaded.

## Rollback and disablement

To roll back content, use Cloudflare Pages deployment history to promote the last
known-good production deployment, or rerun **Deploy Docs** from a known-good
commit. Verify the restored site at `DOCS_SITE_URL`.

To stop publication, disable `.github/workflows/docs-deploy.yml` or remove
approval access from the `docs-production` environment. Do not remove
`.github/workflows/docs-pr.yml`; it remains an unprivileged quality gate.

Disabling or rolling back this deployment does not alter the Chorus application
repository, the landing site, or the Chorus application deployment.

Cloudflare references:

- [Wrangler Pages commands](https://developers.cloudflare.com/workers/wrangler/commands/pages/)
- [Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Pages Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
