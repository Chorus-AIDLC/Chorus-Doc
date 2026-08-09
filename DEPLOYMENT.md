# Documentation deployment

The documentation site is an independent static Cloudflare Pages deployment. It
does not replace the Chorus application repository, its README, or the landing
site.

Publication uses the **Cloudflare Pages Git integration**: Cloudflare watches the
repository, runs the build, and publishes the generated `dist` output. There is
no GitHub Actions workflow and no self-managed API token in this flow — the Git
integration is authorized by Cloudflare itself.

## Cloudflare Pages build settings

In the Cloudflare dashboard, under **Workers & Pages → the docs project →
Settings → Build**:

| Setting                | Value        |
| ---------------------- | ------------ |
| Build command          | `pnpm build` |
| Deploy command         | `pnpm build` |
| Root directory         | *(repository root)* |

`pnpm build` runs `content:check`, `astro build`, and generates the `.md`
mirrors, `llms.txt`, and sitemaps. It publishes to `dist`, which matches
`pages_build_output_dir` in `wrangler.jsonc` — keep the two in sync.

### Analytics (optional)

Google Analytics 4 is env-gated on `PUBLIC_GA_MEASUREMENT_ID`. To enable
analytics, add it as a build environment variable in the same Build settings;
when it is unset or blank the build emits no analytics code at all, so previews
and internal deployments stay analytics-free without any per-environment toggle.
Set a distinct measurement id from the landing site's Google Analytics property
to keep documentation traffic in its own report.

### Quality-gate note

The Cloudflare build runs only `pnpm build`, not the full `pnpm check` gate. The
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

The preview serves the production `dist` output. Check the affected
English and Chinese routes, search, language switching, `.md` mirrors, `llms.txt`,
and sitemap at the URL printed by Astro.

## Production deployment

1. Create the Cloudflare Pages project connected to this Git repository.
2. Configure the Build settings above (build command `pnpm build`).
3. Merge to the production branch; Cloudflare builds and publishes automatically.
4. Verify the deployment at the project's public URL.

V1 publishes only documentation for the current Chorus version.

## Rollback and disablement

To roll back content, use Cloudflare Pages deployment history to promote the last
known-good production deployment, or revert the offending commit on the
production branch and let Cloudflare rebuild.

To stop publication, disconnect the Git integration or pause automatic
deployments in the Cloudflare Pages project settings.

Disabling or rolling back this deployment does not alter the Chorus application
repository, the landing site, or the Chorus application deployment.

Cloudflare references:

- [Pages Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/)
- [Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Pages Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
