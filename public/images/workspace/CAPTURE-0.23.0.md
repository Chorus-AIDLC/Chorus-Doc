# Chorus 0.23.0 affected screenshot review

Captured 2026-10-22 from Chorus source `333ca14b7819cb317dcff0ae9a62a01b995fa434`.
The author used an isolated, newly initialized local PGlite database and real English
Chorus UI at a 1440×1000 viewport. No production or personal workspace was used.

## New and replaced captures

| Asset | Real page / state | Intrinsic dimensions | Disposition |
| --- | --- | --- | --- |
| `super-admin-oidc.webp` | Super Admin → Create Company, OIDC selected, fictional example fields | 1440×1021 | Replaces the older optional-OIDC detail form; authentication mode selection and required OIDC configuration now matter. |
| `local-workspace.webp` | Super Admin → Create Company, Local username and password selected, initial admin fields | 1440×1018 | Adds the new local-workspace setup surface. |
| `profile-settings.webp` | Settings with saved avatar preview and display name | 1440×1000 | Adds the newly available profile controls. |
| `workspace-users.webp` | Workspace users with one active fictional Workspace Admin | 1440×1000 | Adds the local user management surface. |
| `notification-preferences.webp` | Settings scrolled to the six notification event categories | 1440×900 | Replaces a capture with uncertain recent-project names and a masked-key suffix; the new isolated workspace has no agent keys or projects. |

All five images were exported to WebP quality 85. Full-page capture was
used for the two setup forms to preserve the complete form and navigation; viewport
capture was used for Settings, Workspace users and notification preferences. The
notification capture uses a 1440×900 viewport to preserve its existing dimensions.
Only the Next.js development
indicator was hidden; no product controls, layouts or screens were fabricated or
composited. No invitation/password/token screen was captured for publication.

## Privacy and visual inspection

The author opened all five final WebP files at full intrinsic resolution and checked
legibility, complete controls and absence of real names, email addresses, credentials,
UUIDs and hostnames. Visible names are the fictional **Demo Workspace**, **Demo Reviewer**
and **demo-reviewer**. Email/domain values use reserved `demo.example`; the fictional
OIDC client identifier is `chorus-demo-workspace`. The browser address bar is not in frame.
No real secret or invitation link appears. Avatar artwork and its attribution are the
actual UI output. Independent release review also inspects these files before handoff.

Raw browser evidence is retained locally in the Chorus checkout under
`.playwright-mcp/docs023-{oidc,local-workspace,profile,workspace-users,notifications}.png`.
The browser automation snapshots record the corresponding page states; these local
artifacts are not published by the documentation site.

## Existing captures retained

The affected-page inventory also includes `workspace/super-admin.webp`,
`workspace/onboarding-wizard.webp`,
`agent-operations/credential-permissions.webp`, `agent-operations/connection-online.webp`,
`workflow/proposal-review.webp`, `workflow/proposal-approve.webp`,
`workflow/tasks-kanban.webp`, `workflow/tasks-dag.webp`,
`workflow/task-acceptance-criteria.webp` and `workflow/idea-completion-report.webp`.
These remain illustrations of their named task surfaces: the dashboard, onboarding,
notification categories, API-key permission matrix, agent connectivity, proposal
review/approval, task boards, acceptance criteria and completion reports. The release
does not invalidate those illustrated controls. Incidental older sidebar/profile
appearance is not used to instruct the new account workflow. No whole-site refresh
was performed. The OIDC and notification captures above are the affected existing images replaced.
