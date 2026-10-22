# Chorus 0.23.0 documentation handoff

## Scope

- Product baseline: `Chorus` commit `333ca14b7819cb317dcff0ae9a62a01b995fa434`.
- Previous release: `v0.22.2`; documentation starting commit: `d20ac999ae8bde1be1ad981991d5ab4824547647`.
- Initial delivery: local documentation, captures and tests only, without a branch, commit, push, pull request, version bump or deployment. See the subsequent authorization below.
- All page stems below apply to English (`src/content/docs/`) and the `zh/`, `ja/`, `ko/` counterparts. Existing routes remain unchanged.
- The source baseline is the agreed release target, not a claim that 0.23.0 packages or a release tag are already published.

## Feature-to-page coverage

| Source change | Reader-visible contract | Four-locale page stems |
| --- | --- | --- |
| `f7e58d10` local workspace users | Local account setup and invitations, unified discovery-first login, Workspace Admin user lifecycle and authentication boundaries | `guides/account-and-workspace`, `guides/administrator-setup`, `guides/authentication-setup`, `guides/getting-started`, `guides/operator-onboarding`, `reference/authentication`; deployment and troubleshooting pages below |
| `30db2212` Personas avatars | Randomize is a preview, explicit save persists the avatar, cancel/leave discards the preview | `guides/account-and-workspace` |
| `3b3c7109` display names | Self-service saved display name, Unicode code-point limit and login identity unchanged | `guides/account-and-workspace` |
| `a8a89f7d`, `2036a870` shared auth limits | Shared Redis authentication limits versus SSE, single-process fallback, outage/timeout behavior and operator recovery | `guides/deploy-operations`, `guides/deploy-local`, `guides/deploy-docker`, `guides/deploy-production`, `guides/deployment-overview`, `guides/troubleshooting` |
| `7c7f2e88` proposal validation | Invalid dependency errors versus task-kind coverage warnings; documentation-only proposals remain valid | `guides/review-a-proposal`, `reference/mcp-tools` |
| `0a5cb2dd`, `158e05a6` safe submission | Report progress and self-check criteria before the explicit submission step; do not use a progress report to submit early | `guides/run-tasks`, `guides/verify-and-complete`, `guides/plugin-automation`, `reference/mcp-tools`, `reference/agents/pi` |
| `ec2e2547` optional Pi gate | `CHORUS_SUBMIT_GATE` opt-in modes, read-back freshness and client-side scope | `reference/agents/pi`, `guides/plugin-automation` |
| `f3bd92a2`, `531fd2eb` actor and mention fixes | Actions attributed to the acting user/agent; unchanged mentions are not re-notified on every edit | `guides/activity-stream`, `guides/notifications`, `reference/collaboration`, `reference/mcp-tools` |
| Related existing MCP drift | Check-in includes up to 10 recently active projects with uncapped counts within each, versus the complete on-demand assignment tracker | `reference/mcp-tools` |

## Deliberate exclusions

| Commit | Reason no additional user guide is needed |
| --- | --- |
| `ca0af324` | Adds a regression test for existing daemon mention cwd precedence; does not change the runtime contract. |
| `b3f0097b` | bcryptjs 3.x maintenance upgrade preserves existing password-hash compatibility; no new installation or login step. |
| `333ca14b` | Vite dependency/CI and installer signal-test stabilization; no new user-facing command or workflow. |

Existing 0.22.2 TRAE, self-hosting and SSE coverage is retained. No unrelated whole-site rewrite or screenshot refresh is included.

## Screenshots

See `public/images/workspace/CAPTURE-0.23.0.md` for capture state, privacy checks and retained-image rationale.
The obsolete OIDC configuration image is replaced, and notification preferences are recaptured to remove uncertain older demo provenance; local workspace creation, Workspace users and profile settings gain three real demo captures.
All five are English UI WebP images. Four use a 1440×1000 viewport (the full setup forms extend to 1021 and 1018 pixels high); notification preferences retain 1440×900 dimensions.
No generated or reconstructed product UI is used.

## Verification

Completed 2026-10-22 for 84 updated MDX pages, five new/replaced captures and three focused test updates.

| Check | Result |
| --- | --- |
| `pnpm content:check` | PASS: metadata, routes, documentation contracts, all four locale counterparts and analytics. |
| `pnpm check` | PASS: full runner exits 0, including Astro diagnostics, production build, generated artifacts, rendering, Pagefind, locale fallback, analytics, negative contracts, links in 225 HTML files and responsive/keyboard/accessibility checks. |
| `pnpm check:preview` | PASS against production preview at `http://127.0.0.1:4322`: routes, search, language switching, visible focus, responsive layout and generated resources. |
| `git diff --check` | PASS in both checkouts. |
| Independent content reviews | Account round 2 PASS; operations round 1 PASS (77 focused auth tests); workflow round 1 PASS after the project-cap note was resolved (30 Pi gate tests and one focused project-cap regression). |
| Independent integration review | PASS after removing redundant nested deployment-table wrappers in three locales; final `pnpm build` exits 0 and six localized desktop/mobile keyboard/Axe combinations pass. The full gate and preview matrix above passed before this markup-only cleanup. |
| Independent aggregate review | Round 1 PASS with no introduced blockers or notes; cross-slice contracts, 84 routes/mirrors and five captures verified. Additional accessibility findings were traced to unchanged baseline sections and are outside this patch, not a blanket site-wide accessibility certification. |
| Manual image/render review | All five final WebP assets opened at intrinsic resolution; Chinese profile prose/capture inspected in the real production preview at desktop and mobile widths. |

The existing browser suite covers 52 routes at 390×844 and 1440×900; production preview covers 50 routes at both sizes, plus search, language switching and generated resources. Added coverage includes all four locales of account, administration, authentication, production deployment, proposal, MCP and Pi pages, including generated Pi/MCP Markdown mirrors.

The full gate required environment-only compatibility settings on this machine:

```sh
mkdir -p "$HOME/.cache/chorus-docs-023-tmp"
TMPDIR="$HOME/.cache/chorus-docs-023-tmp" \
  NODE_OPTIONS='--dns-result-order=ipv4first --no-network-family-autoselection' \
  pnpm check
```

The temporary directory must be on the same filesystem as the checkout **and outside the repository**: `/tmp` is a different filesystem here, causing Astro's analytics probe to fail with `EXDEV`; placing it inside the checkout changes the intentionally invalid-build fixture's package discovery. IPv4 settings avoid intermittent Node.js website connection failures from network-family auto-selection. No link exceptions or test stages were bypassed or added to the allowlist.

Expanded checks found and fixed affected-page issues: two page families now place a cross-reference outside tinted callouts for sufficient contrast; production deployment tables use the existing focusable scroll-region pattern; screenshot contracts select the matching asset rather than the first caption; Japanese preview search uses the page title instead of relying on generic login-query ranking after the new authentication content was added.

Local evidence logs: `/tmp/docs023-check.log`, `/tmp/docs023-preview.log`, `/tmp/docs023-final-build.log`; raw images and rendered-page screenshots are in the Chorus checkout's `.playwright-mcp/docs023-*` files. These are local verification artifacts, not published site content.

## Publication boundary

On 2026-10-22, after independent review, the user explicitly authorized committing the documentation repository changes and pushing directly to `main`. This includes the coverage and screenshot-review records. The authorization does not include committing the product repository, bumping the application version, creating a release tag, or manually deploying the site. A successful push is not proof of a successful Cloudflare deployment.
