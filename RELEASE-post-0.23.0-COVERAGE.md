# Chorus post-0.23.0 documentation handoff

## Scope

- Previous release: `v0.23.0` (documentation commit `8f2a7de`).
- Final covered product commit: `Chorus` `develop` at `3d636687d34e4c3a6fe6856ce75e92be1553cc0c`
  (#651, Quick Task ↔ Idea link).
- Coverage follows `develop`. Before the pull request was opened on 2026-11-05, `git fetch`
  was run in the Chorus checkout and `git log 3d636687..develop` and
  `git log 3d636687..origin/develop` were both empty: local and remote `develop` still pointed
  at `3d636687`. No user-visible commit landed after the starting baseline, so no screen
  needed recapturing and no extra page was added.
- Delivery: one commit on the branch `docs/post-0-23-0-agent-teams` and a pull request
  for human review. The pull request is not merged and the site is not deployed. No Chorus
  product code, version bump, tag or release is part of this change.
- All page stems below apply to English (`src/content/docs/`) and its `zh/`, `ja/`, `ko/`
  counterparts. One route is new (`guides/agent-teams`, added to the "Use the workspace"
  sidebar group after `guides/manage-agents`). No existing route changes.

## Feature-to-page coverage

| Source change | Reader-visible contract | Four-locale page stems |
| --- | --- | --- |
| `4c02c4a8` #641 private Agent Teams | Personal Team templates in Settings, the four roles (product, development, review, lead), applying a template to a project, eligibility, template deletion leaving a frozen snapshot, lead handoff | `guides/agent-teams` (new), `guides/manage-agents`, `guides/project-access`, `reference/glossary`, `reference/mcp-tools` (`chorus_get_project_team`, check-in `projectTeams`) |
| `ea222006` #644 Team-managed Ideas | An Idea assigned to one of your agents on a Team project is orchestrated by that assignee; Team state (active, paused, unmanaged); product delegation; a Team grants no permissions | `guides/agent-teams`, `guides/plugin-automation`, `reference/glossary`, `reference/mcp-tools` (`chorus_get_idea_team_context`, `chorus_recommend_team_agent`, `chorus_delegate_team_product`) |
| `981995a1` #645 Team review routing | Proposal and task reviews go to the Team's Review role, fall back to the orchestrator's own reviewer, and the verdict is advice; approval and verification follow the normal workflow unless the Idea was started with Yolo | `guides/agent-teams`, `guides/review-a-proposal`, `guides/verify-and-complete`, `guides/plugin-automation`, `reference/mcp-tools` |
| `cf748b0c` #646 wake-purpose sessions and structured review requests | One conversation per Idea with Task and Review child conversations grouped under it; a structured review request wakes only the named reviewer | `guides/agent-teams`, `guides/online-agents-overview`, `guides/remote-control`, `guides/session-recovery`, `guides/plugin-automation`, `reference/mcp-tools` (`chorus_request_review`) |
| `597fcc6a` #647 Team configuration UI | Project settings → Team tab, compact role rows with Inherited / Overridden badges, clear and reset per role, Save / discard, Unbind confirmation, Hand off… dialog with preview; Settings → Agent teams cards and editor | `guides/agent-teams`, `guides/project-access` (Project settings now has a Team tab); screenshots below |
| `3d636687` #651 Quick Task ↔ Idea link | Pick, change or clear the Idea of a Quick Task; theme Ideas cannot take a direct task; linked tasks appear on the Idea panel, in the task view scope and in the resource graph; Idea progress is derived from approved-proposal tasks plus linked Quick Tasks; MCP task tools accept `ideaUuid` | `guides/create-and-edit-entities`, `guides/run-tasks`, `guides/verify-and-complete`, `guides/capture-an-idea`, `guides/plugin-commands`, `reference/lifecycle`, `reference/resource-graph`, `reference/mcp-tools` |

## Deliberate exclusions

| Commit | Reason no user guide change is needed |
| --- | --- |
| `4537d7df` #643 | CI patch for root high-severity dependency advisories; no command, setting or workflow changes for readers. |
| `85b3cfd2` #648 and `25a958ff` #649 | #648 changed project-group duplicate handling and discovery wording; #649 reverts it in full. The net change on `develop` is zero, so the documentation keeps describing the existing behavior. |

## Shared reference files

T1 (Agent Teams) and T2 (Quick Task link and sessions) both edited `reference/mcp-tools` and
`reference/glossary`. The integration pass checked all four locales:

- `reference/mcp-tools` has the same section order in every locale: the Quick Task link
  section under "High-frequency tools", then the "Agent Team tools" section with the same five
  tools and permission labels, then the gated-tool matrix. The matrix adds
  `chorus_delegate_team_product` to `idea:write`, matching the product's permission map. The
  read-gated Team tools stay out of the matrix, which lists only write and admin bits, as before.
- `reference/glossary` has one new "Agent Teams" table in every locale. Its three anchors
  point at headings that exist in the matching locale's `guides/agent-teams` page; the link
  checker validates them.

## Screenshots

See `public/images/workspace/CAPTURE-post-0.23.0.md` for capture provenance, privacy checks and
the dispositions of retained images. Four captures are new (Settings → Agent teams, Project
settings → Team tab, Hand off… dialog, Quick Task with its linked Idea), and
`workspace/project-access-tab.webp` is replaced in place because the old tab strip lacked the
Team tab. All are real English-UI, light-theme 1440×900 WebP captures from an isolated `:8637`
server running `3d636687` against a throwaway database with fictional data. The re-diff found
no later UI commit, so none needed recapturing.

## Verification

Completed 2026-11-05 for 68 MDX pages (64 edited, four new), five new or replaced captures
and two test route additions.

| Check | Result |
| --- | --- |
| `pnpm check` | PASS (exit 0): content and route metadata, all four locale counterparts, Astro diagnostics, production build of 229 pages, generated artifacts, table and emphasis rendering, Pagefind, locale fallback, analytics build contract, quality-gate negative contracts, links in 229 HTML files, and the responsive, keyboard and accessibility baseline. |
| `pnpm check:preview` | PASS against the production preview at `http://127.0.0.1:4322`: routes, search, language switching, visible focus, responsive layout and generated resources. The preview server was stopped afterwards. |
| `git diff --check` | PASS in the Chorus-Doc checkout. The Chorus checkout has no tracked changes. |
| Link check | Internal links and anchors in all 229 HTML files pass. External links use only the existing documented allowlist; no entry was added. Two intermediate full-gate runs failed only on `https://nodejs.org/ -> 5000ms timeout`. From this network the host answered in 3.5 to 5.0 s (`curl`, HTTP 200 after redirect), right at the checker's 5 s default. A standalone `node scripts/check-links.mjs --timeout-ms 15000` passed, and the final unmodified `pnpm check` above passed with the default timeout. |

Fixed during integration: the first `pnpm check` failed the accessibility baseline on
`/guides/review-a-proposal/` (`color-contrast`). Links inside the new Agent Team tip callouts
on `guides/review-a-proposal` and `guides/verify-and-complete` (all four locales) were below
4.5:1 on the tinted callout background. The cross-reference now sits directly after each
callout, following the fix pattern from the 0.23.0 cycle. `guides/agent-teams` was added to the
four-locale route matrices of `tests/browser-quality.mjs` and `tests/preview-integration.mjs`,
so the new page is covered at 390×844 and 1440×900.

Accessibility findings outside this patch: an axe scan of every edited route also reported
`color-contrast` on links inside existing note callouts (for example "agent platforms
reference" in `guides/capture-an-idea`, `guides/run-tasks`, `guides/verify-and-complete`,
`guides/create-and-edit-entities`, `reference/lifecycle` and `reference/resource-graph`) and
`scrollable-region-focusable` on existing, unmodified tables in `guides/plugin-automation`,
`guides/plugin-commands` and `reference/lifecycle`. All of these are in content unchanged by
this cycle, so this is not a site-wide accessibility certification. Those pages were not added
to the route matrices because that would gate this change on baseline issues.

The full gate needed the same environment-only settings on this machine as the 0.23.0 cycle:

```sh
mkdir -p "$HOME/.cache/chorus-docs-post023-tmp"
TMPDIR="$HOME/.cache/chorus-docs-post023-tmp" \
  NODE_OPTIONS='--dns-result-order=ipv4first --no-network-family-autoselection' \
  pnpm check
```

`/tmp` is a separate `tmpfs` here, so Astro's analytics probe fails with `EXDEV` unless
`TMPDIR` is on the checkout's filesystem and outside the repository. The IPv4 settings avoid
intermittent Node.js connection failures. `pnpm check:preview` ran with the same
`NODE_OPTIONS` against `pnpm preview --host 127.0.0.1 --port 4322`. No test stage was skipped.

Local evidence logs: `/tmp/docspost023-check.log`, `/tmp/docspost023-preview.log`,
`/tmp/docspost023-axe.log`, `/tmp/docspost023-links15s.log`. These are local verification artifacts, not published content.

## Publication boundary

In elaboration, the human chose delivery as a commit on a branch plus a pull request. That
authorizes pushing `docs/post-0-23-0-agent-teams` and opening the pull request. It does not
authorize merging, enabling auto-merge, deploying the site, or committing to the Chorus product
repository. A merged pull request is not proof that a Cloudflare deployment succeeded.
