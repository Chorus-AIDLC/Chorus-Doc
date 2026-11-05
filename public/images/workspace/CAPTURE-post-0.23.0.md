# Chorus post-0.23.0 affected screenshot review

Captured 2026-11-05 from Chorus `develop` at source
`3d636687d34e4c3a6fe6856ce75e92be1553cc0c` (Quick Task ↔ Idea link, #651; includes the
Agent Team series #641/#644/#645/#646/#647). The author ran an isolated `pnpm dev` server on
`:8637` from a detached git worktree of that commit, against a throwaway Docker
`postgres:17-alpine` container on a private port with a newly migrated, empty database
(`prisma migrate deploy`). The installed runtime on `:18637` and its database were never
opened or captured. The worktree, server and database container were removed after capture.

Demo data was seeded directly into the fresh database and is entirely fictional:
**Demo Workspace** (`demo.example`), users **Morgan Lee**, **Riley Park**, **Sam Ortiz** and
**Dana Kim**, agents **Atlas**, **Quill**, **Forge**, **Ember**, **Sentinel** and
**Conductor**, the public project **Lumen Notes** (three Ideas, a Quick Task linked to the
Idea *Offline sync for mobile notes*), and the private project **Roadmap Experiments** in the
private group **Lumen Labs**. The Team templates **Core delivery team** (members in all four
roles) and **Docs sprint team** were created through the product API as the signed-in user,
and Core delivery team was applied to Lumen Notes with the Product role overridden (Quill
instead of Atlas).

All captures use the real English UI, light theme, an `en-US` browser locale, and a
1440×900 viewport (viewport capture, no address bar in frame). Each PNG was exported to WebP
quality 85 at its intrinsic 1440×900 size. Only the Next.js development indicator was hidden;
UUID text inside the rendered UI (the handoff preview's Idea identifiers) was masked in the
DOM before capture. No product screen, control or layout was generated or composited.

## New and replaced captures

| Asset | Real page / state | Intrinsic dimensions | Disposition |
| --- | --- | --- | --- |
| `workspace/settings-agent-teams.webp` | Settings → Agent teams with the Docs sprint team and Core delivery team template cards | 1440×900 | New. Embedded in `guides/agent-teams` (four locales), section on creating and editing a template. |
| `workspace/project-team-tab.webp` | Lumen Notes → Project settings → Team: Core delivery team selected, Product **Overridden**, Development / Review / Lead **Inherited**, member chips with status dots, Hand off…, Save team, Unbind | 1440×900 | New. Embedded in `guides/agent-teams` (four locales), after the role badge table. |
| `workspace/project-team-handoff.webp` | Explicit Idea handoff dialog with lead Conductor selected and a three-Idea preview, expiry time, Refresh preview and Confirm Idea handoff | 1440×900 | New. Embedded in `guides/agent-teams` (four locales), after the handoff steps. Idea UUIDs masked. |
| `workflow/quick-task-linked-idea.webp` | Lumen Notes → Tasks with the panel of the Quick Task *Show a retry banner when sync fails* open, showing its linked Idea under **Idea** | 1440×900 | New. Embedded in `guides/create-and-edit-entities` (four locales), after the paragraph about the task panel's Idea link. |
| `workspace/project-access-tab.webp` | Roadmap Experiments → Project settings → Access: Private visibility, members with direct, inherited and combined role sources | 1440×900 | Replaced in place. The previous capture showed only **General** and **Access** tabs; Project settings now also has a **Team** tab, so the old tab strip contradicted the Team guide. Same file name, dimensions and alt text, used by `guides/project-access`. |

## Existing captures inspected and retained

Every image used by a page edited in this cycle (the `guides/` and `reference/` pages
touched for Agent Teams and the Quick Task ↔ Idea link) was opened at full intrinsic
resolution and compared with the covered UI.

| Asset | Used by | Reason kept |
| --- | --- | --- |
| `agent-operations/conversational-idea-entry.webp` | capture-an-idea | New Idea → Describe to an agent is unchanged. |
| `workflow/idea-research.webp` | capture-an-idea | Idea Actions menu is unchanged by the covered commits. |
| `workflow/idea-elaboration.webp` | capture-an-idea | Elaboration tab is unchanged. |
| `workflow/idea-verify-elaborate.webp` | capture-an-idea | Verify Elaborate footer is unchanged. |
| `workflow/idea-lineage.webp` | capture-an-idea | Lineage view is unchanged. |
| `workspace/new-idea-dialog.webp` | create-and-edit-entities | New Idea form is unchanged; the Quick Task Idea field is shown by the new task capture instead. |
| `workspace/settings-agents.webp` | manage-agents | The Agents list on Settings is unchanged; Agent teams has its own new capture. |
| `agent-operations/presence-online-agents.webp` | online-agents-overview | Online agents popover is unchanged. |
| `agent-operations/remote-wake.webp` | remote-control | Shows a manual new conversation; Task/Review child sessions appear only under Idea conversations and do not change this surface. |
| `agent-operations/session-control.webp` | session-recovery | Shows a manual running conversation with Interrupt; unaffected by the child-session grouping. |
| `workspace/projects-private-badges.webp` | project-access | Projects list and private badges are unchanged. |
| `workspace/group-access-settings.webp` | project-access | Manage Group dialog is unchanged. |
| `workspace/group-visibility-impact.webp` | project-access | Group visibility impact confirmation is unchanged. |
| `workflow/proposal-review.webp` | review-a-proposal | Proposal detail is unchanged. |
| `workflow/proposal-approve.webp` | review-a-proposal | Proposal Actions menu is unchanged. |
| `workflow/tasks-kanban.webp` | run-tasks | Kanban board, scope selector and cards match the covered UI; the example tasks are proposal tasks. |
| `workflow/tasks-dag.webp` | run-tasks | DAG view is unchanged. |
| `workflow/task-acceptance-criteria.webp` | verify-and-complete | A proposal task panel; the Idea section appears only for linked Quick Tasks, so nothing shown is contradicted. |
| `workflow/idea-completion-report.webp` | verify-and-complete | Idea overview timeline and reports are unchanged; linked Quick Tasks would add rows to the same Tasks list. |

`guides/agent-teams` is new and uses only the three new Team captures. `guides/plugin-automation`,
`guides/plugin-commands`, `reference/glossary`, `reference/lifecycle`, `reference/mcp-tools`
and `reference/resource-graph` use no images. No whole-site refresh was performed.

## Privacy and visual inspection

The author opened all five final WebP files at full intrinsic resolution and checked
legibility, complete controls, and absence of real names, email addresses, credentials,
UUIDs and hostnames. Visible people are the fictional **Morgan Lee**, **Riley Park**,
**Sam Ortiz** and **Dana Kim**, with addresses on the reserved-style `demo.example` domain;
visible agents are the fictional **Atlas**, **Quill**, **Forge**, **Ember**, **Sentinel** and
**Conductor**. No API key, token, working directory, hostname, internal URL or UUID is
visible. Avatar artwork is the actual UI output. Independent review also inspects these files
before handoff.

Raw browser evidence is retained locally in the Chorus checkout under
`.playwright-mcp/post023-{settings-teams,project-team-tab,handoff-preview,task-linked-idea,project-access-tab}.png`;
these local artifacts are not published by the documentation site.
