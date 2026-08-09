# Workspace screenshot capture manifest

> **Status: captured and wired (2026-08-08).** Eight screenshots were captured against a
> **local dev instance** (`pnpm dev` + Docker Postgres) driven with the Playwright MCP,
> using the fictitious **Skylark Notes** demo project and a fictitious **Demo Workspace**
> for the Super Admin surfaces. Each was captured from the real **English** UI at
> 1440×900, the signed-in account identity was masked to **Demo Reviewer /
> reviewer@demo.example** (and the Super Admin email to **admin@demo.example**), agent-key
> names were replaced with fictitious **Skylark/Demo** names and every `cho_` prefix
> masked, no browser URL bar was in frame, each was exported to a compressed WebP under
> `/images/workspace/`, and its `<Screenshot>` was wired into **both** the English and
> Chinese pages. `pnpm docs:check` passes with the images present.
>
> **⚠️ Human redaction review still recommended before public release.** `AUTHORING.md`
> asks for a human full-resolution redaction sign-off that an unattended run cannot itself
> provide. These were captured on a local dev box with fictitious data and masked in-DOM,
> but a reviewer should eyeball all eight at full size before the docs site is published.
>
> This document is retained as the **reproduction recipe** for future re-captures (e.g.
> after a UI redesign).

This manifest records the fictitious demo project to build and the ordered list of
screenshots, so anyone can re-capture and re-wire each image **and** its `<Screenshot>`
component in one gate-safe edit.

> **Do not commit this to `dist/`-linked prose.** This is a working document under
> `public/images/workspace/`. It is never referenced by a page, so it does not affect the
> link check.

## Gate-safe rule (read first)

`packages/docs/scripts/check-links.mjs` extracts every `src` from the built HTML and
**fails the build** when a same-origin image URL has no file in `dist/`. `Screenshot.astro`
renders a plain `<img src=…>`. The marker comments (`{/* Screenshot: … */}` /
`{/* 截图位置：… */}`) are MDX/JSX comments — they emit **no** `<img>`, so they never
trip the link check. Therefore:

1. **A `<Screenshot>` component and its `.webp` file are added together, or neither is
   added.** Never leave a `<Screenshot>` pointing at a missing file. While the file does
   not exist, keep the marker comment in place — it is intentionally inert.
2. Each image belongs on **both** the English page and its Chinese counterpart (identical
   `src` path, locale-appropriate `alt`/`caption`). Add the file once; reference it from
   both pages.
3. After adding image(s) + component(s), re-run `pnpm docs:check` from the repo root and
   confirm it is green **before** committing.
4. No synthetic, redrawn, or composited UI. Do **not** reuse
   `public/images/chorus-workflow-demo.webp` (it predates the screenshot rule; see
   `AUTHORING.md`).

## Capture format (from `AUTHORING.md`)

- Real browser render of the **English** Chorus UI. (Capture the English UI even for the
  Chinese pages — the `zh` pages reuse the same English-UI image with Chinese alt text.)
- Desktop viewport **1440×900 or larger**; labels must stay legible after responsive
  scaling.
- Frame at page / primary-workspace scale so navigation and page context are visible;
  a full modal or side panel may be the boundary when it is the task surface, but keep
  enough of the page behind it for context. Never crop to one or two isolated controls.
- Export **compressed WebP** (target well under ~60 KB, matching the sibling
  `public/images/agent-operations/*.webp` files, which are 36–47 KB).
- Pass the image's **exact intrinsic pixel width/height** to the component. If you capture
  at 1440×900 use `width={1440} height={900}`. If you capture at 2× (e.g. 2880×1800) pass
  those actual numbers instead — the component throws on non-integer/zero and the numbers
  keep layout stable while the image loads.
- Perform a **manual full-resolution redaction review** after masking. Automated checks do
  not prove an image is safe to publish.

## Import line (add once per page, after the frontmatter, before the first prose)

The import path depth differs by locale — this is the single most common mistake.

- **English pages** (`src/content/docs/**/*.mdx`) — three `../`:

  ```mdx
  import Screenshot from '../../../components/Screenshot.astro';
  ```

- **Chinese pages** (`src/content/docs/zh/**/*.mdx`) — four `../`:

  ```mdx
  import Screenshot from '../../../../components/Screenshot.astro';
  ```

Add the import only once per page even if the page carries two screenshots. (Each workspace
page below carries exactly one, so add it once next to that page's frontmatter.)

---

## The demo project (build this first)

Create one **obviously fictitious, sanitized** demo project in a Chorus environment you
control. Reuse the same **Skylark Notes** demo identities as the workflow manifest
(`public/images/workflow/CAPTURE_MANIFEST.md`) so both image sets tell one coherent,
fictional story. Use only the fictitious values below — no real emails, hosts, keys, or
UUIDs.

**Fictitious identities (use consistently):**

| Role | Fictitious value | Notes |
| --- | --- | --- |
| Human operator (logged-in demo account) | display name **Demo Reviewer** | Set the demo account's display name to this so the top bar and assignee/@mention read as fiction. If you cannot rename the account, **mask** the real name/email/avatar in every capture. |
| Agent | display name **Skylark Agent** | The developer/PM agent identity that appears in the Agents section and API-key card. |
| Project group | **Demo Workspace** | — |
| Project | **Skylark Notes** | A fictional note-taking web app. |
| Working directory (lock chip) | host label **demo-box**, path `/home/demo/skylark-notes` | Fictional host + path. If your real host name shows, mask it. |

**What to populate (so every workspace surface has content):**

1. **Onboarding.** Reach the first-run onboarding wizard at its **Welcome** step (a fresh
   demo account, or re-open the wizard) so the Idea → Proposal → Task → Execute → Verify →
   Done pipeline diagram and the **Get Started** button are visible.
2. **Notification preferences.** Open **Settings → Notification Preferences** with the full
   set of toggles (Task / Proposal / Idea / Elaboration / Comment / Mention groups) all
   **on** (the default).
3. **Agents.** In **Settings → Agents**, have at least one API-key card for **Skylark
   Agent** showing its **Edit Agent / Delete** actions and the expandable **Sessions**
   sub-panel. The visible `keyPrefix` must be a fictitious `cho_…` prefix — never a real key.
4. **Global search.** Open the global search dialog (⌘K / Ctrl-K) with the **scope** select
   and the **All / Tasks / Ideas / Proposals / Documents / Projects** type-filter tabs
   visible; a query with a few fictitious results is fine.
5. **New Idea dialog.** On the **Skylark Notes** project **Overview**, open the **New Idea**
   dialog on its **Fill a form** tab.
6. **Documents list.** Open the project **Documents** list with the type-filter tabs (PRD /
   Spec / Design / Note / Report / Other) and a few fictitious document cards. Reuse the
   workflow demo's docs (a PRD **"Dark mode toggle"** and a Tech Design **"Theme tokens and
   toggle"**) so the list is coherent with the workflow captures.

**Global masking (apply to every capture), per `AUTHORING.md`:**

- The top-bar account **avatar, display name, and email** (unless the account is already
  named the fictitious "Demo Reviewer").
- Any **working-directory host name and absolute path** that is not the fictional
  `demo-box:/home/demo/skylark-notes`.
- The browser **URL bar** (it exposes entity **UUIDs**) — crop it out or mask it.
- Any **API key / `cho_…` token**, session ID, internal serial ID, or UUID visible in
  panels, tooltips, cards, or activity entries. The Agents-card `keyPrefix` must read as a
  fictitious value.
- Real teammate names in assignee menus, activity, or session lists — use only **Demo
  Reviewer** / **Skylark Agent**.

Timestamps and generic status text are fine to leave.

---

## Capture list (ordered)

Six required captures aligned 1:1 to the `{/* Screenshot: … */}` (en) and
`{/* 截图位置：… */}` (zh) markers already in the pages. The **Glossary** reference page
(`reference/glossary.mdx` / `zh/reference/glossary.mdx`) is intentionally **text-only** and
carries no screenshot. All paths are under `/images/workspace/`. Each page carries exactly
one screenshot, so add the import line once per page.

| # | Image (`/images/workspace/…`) | Surface | En page (marker) | Zh page (marker) |
| --- | --- | --- | --- | --- |
| 1 | `onboarding-wizard.webp` | First-run onboarding wizard **Welcome** step: the AI-DLC pipeline diagram + **Get Started** | `guides/account-and-workspace.mdx` (§ First-run onboarding) | `zh/guides/account-and-workspace.mdx` |
| 2 | `notification-preferences.webp` | **Settings → Notification Preferences** card: 12 toggles in 6 groups, all on | `guides/notifications.mdx` (§ Notification preferences) | `zh/guides/notifications.mdx` |
| 3 | `settings-agents.webp` | **Settings → Agents** section: one API-key card (Edit Agent / Delete / Sessions) | `guides/manage-agents.mdx` (§ The Agents section) | `zh/guides/manage-agents.mdx` |
| 4 | `global-search.webp` | **Global search** dialog: scope select + type-filter tabs | `guides/find-your-way-around.mdx` (§ Jump to anything with global search) | `zh/guides/find-your-way-around.mdx` |
| 5 | `new-idea-dialog.webp` | **New Idea** dialog on the project Overview, **Fill a form** tab | `guides/create-and-edit-entities.mdx` (§ Create an idea by hand) | `zh/guides/create-and-edit-entities.mdx` |
| 6 | `documents-list.webp` | **Documents** list: type-filter tabs + document cards | `guides/documents.mdx` (§ Browse the Documents list) | `zh/guides/documents.mdx` |

To place each image, **replace the matching marker comment** on the page with the snippet
below (and add the import line once at the top). The marker text is unique per page, so
search for it rather than trusting a line number.

---

### 1. `onboarding-wizard.webp`

- **Surface:** the first-run onboarding wizard on its **Welcome** step, showing the
  Idea → Proposal → Task → Execute → Verify → Done pipeline diagram and the **Get Started**
  button. A fresh demo account reaches this automatically; otherwise re-open the wizard.
- **Masking:** top-bar account identity; URL bar (UUIDs).
- **En** — replace `{/* Screenshot: Onboarding wizard on the Welcome step showing the Idea → Proposal → Task → Execute → Verify → Done pipeline and the Get Started button → /images/workspace/onboarding-wizard.webp */}` in `guides/account-and-workspace.mdx`:

  ```mdx
  <Screenshot
    src="/images/workspace/onboarding-wizard.webp"
    alt="Chorus first-run onboarding wizard on the Welcome step, showing the Idea to Done pipeline diagram and the Get Started button"
    width={1440}
    height={900}
    caption="The first-run wizard introduces the AI-DLC pipeline before you set up your first agent."
  />
  ```

- **Zh** — replace `{/* 截图位置：上手向导的 Welcome 步骤，展示 Idea → Proposal → Task → Execute → Verify → Done 流水线与 Get Started 按钮 → /images/workspace/onboarding-wizard.webp */}` in `zh/guides/account-and-workspace.mdx`:

  ```mdx
  <Screenshot
    src="/images/workspace/onboarding-wizard.webp"
    alt="Chorus 首次上手向导的 Welcome 步骤，展示从 Idea 到 Done 的流水线示意图和 Get Started 按钮"
    width={1440}
    height={900}
    caption="首次上手向导会先介绍 AI-DLC 流水线，然后再引导你配置第一个智能体。"
  />
  ```

### 2. `notification-preferences.webp`

- **Surface:** the **Settings** page **Notification Preferences** card, showing the 12
  toggles grouped into **Task / Proposal / Idea / Elaboration / Comment / Mention** events,
  all enabled (the default).
- **Masking:** top-bar account identity; URL bar.
- **En** — replace `{/* Screenshot: Settings page Notification Preferences card showing the 12 toggles grouped into Task / Proposal / Idea / Elaboration / Comment / Mention events, all enabled → /images/workspace/notification-preferences.webp */}` in `guides/notifications.mdx`:

  ```mdx
  <Screenshot
    src="/images/workspace/notification-preferences.webp"
    alt="Settings Notification Preferences card with 12 toggles grouped into Task, Proposal, Idea, Elaboration, Comment, and Mention events, all enabled"
    width={1440}
    height={900}
    caption="Notification preferences group every event type; toggles default to on and auto-save."
  />
  ```

- **Zh** — replace `{/* 截图位置：设置页的 Notification Preferences 卡片，展示分为 Task / Proposal / Idea / Elaboration / Comment / Mention 六组的 12 个开关，均为开启状态 → /images/workspace/notification-preferences.webp */}` in `zh/guides/notifications.mdx`:

  ```mdx
  <Screenshot
    src="/images/workspace/notification-preferences.webp"
    alt="设置页的 Notification Preferences 卡片，12 个开关分为 Task、Proposal、Idea、Elaboration、Comment、Mention 六组，均为开启状态"
    width={1440}
    height={900}
    caption="通知偏好按事件类型分组；开关默认全部开启并自动保存。"
  />
  ```

### 3. `settings-agents.webp`

- **Surface:** the **Settings → Agents** section with one API-key card for **Skylark
  Agent**, showing its **Edit Agent / Delete** actions and the expandable **Sessions**
  sub-panel; the card's `keyPrefix … · Created {date}` line reads as a fictitious `cho_…`
  prefix.
- **Masking:** top-bar account identity; the API-key `keyPrefix` / any `cho_…` token; any
  session IDs or UUIDs in the Sessions sub-panel; URL bar.
- **En** — replace `{/* Screenshot: Settings → Agents section with one API key card (Edit Agent / Delete / Sessions) → /images/workspace/settings-agents.webp */}` in `guides/manage-agents.mdx`:

  ```mdx
  <Screenshot
    src="/images/workspace/settings-agents.webp"
    alt="Settings Agents section with an API key card showing Edit Agent, Delete, and an expandable Sessions sub-panel"
    width={1440}
    height={900}
    caption="Each agent has an API-key card with Edit Agent, Delete, and a Sessions sub-panel."
  />
  ```

- **Zh** — replace `{/* 截图位置：设置页 Agents 区域，含一张 API 密钥卡片（Edit Agent / Delete / Sessions） → /images/workspace/settings-agents.webp */}` in `zh/guides/manage-agents.mdx`:

  ```mdx
  <Screenshot
    src="/images/workspace/settings-agents.webp"
    alt="设置页 Agents 区域，一张 API 密钥卡片展示 Edit Agent、Delete 以及可展开的 Sessions 子面板"
    width={1440}
    height={900}
    caption="每个智能体都有一张 API 密钥卡片，含 Edit Agent、Delete 和 Sessions 子面板。"
  />
  ```

### 4. `global-search.webp`

- **Surface:** the **global search** dialog (opened with ⌘K / Ctrl-K), showing the
  **scope** select (Global / Group / This Project) and the type-filter tabs (**All /
  Tasks / Ideas / Proposals / Documents / Projects**), with a fictitious query and a few
  results.
- **Masking:** top-bar account identity; any UUIDs or internal IDs in result rows; URL bar.
- **En** — replace `{/* Screenshot: Global search dialog with scope select and type filter tabs → /images/workspace/global-search.webp */}` in `guides/find-your-way-around.mdx`:

  ```mdx
  <Screenshot
    src="/images/workspace/global-search.webp"
    alt="Chorus global search dialog with a scope select and All, Tasks, Ideas, Proposals, Documents, and Projects type-filter tabs"
    width={1440}
    height={900}
    caption="Global search spans every entity type; use the scope select and type tabs to narrow results."
  />
  ```

- **Zh** — replace `{/* 截图位置：全局搜索对话框，含范围选择器和类型筛选标签 → /images/workspace/global-search.webp */}` in `zh/guides/find-your-way-around.mdx`:

  ```mdx
  <Screenshot
    src="/images/workspace/global-search.webp"
    alt="Chorus 全局搜索对话框，含范围选择器以及 All、Tasks、Ideas、Proposals、Documents、Projects 类型筛选标签"
    width={1440}
    height={900}
    caption="全局搜索覆盖所有实体类型；用范围选择器和类型标签来缩小结果。"
  />
  ```

### 5. `new-idea-dialog.webp`

- **Surface:** the **New Idea** dialog opened from the **Skylark Notes** project
  **Overview**, on its **Fill a form** tab (title, description, and the "Help me break this
  into child ideas" checkbox visible).
- **Masking:** top-bar account identity; URL bar.
- **En** — replace `{/* Screenshot: New Idea dialog on the project Overview, Fill a form tab → /images/workspace/new-idea-dialog.webp */}` in `guides/create-and-edit-entities.mdx`:

  ```mdx
  <Screenshot
    src="/images/workspace/new-idea-dialog.webp"
    alt="New Idea dialog on the project Overview showing the Fill a form tab with title, description, and the break-into-child-ideas checkbox"
    width={1440}
    height={900}
    caption="Create an idea by hand from the project Overview; the Fill a form tab captures a title and description."
  />
  ```

- **Zh** — replace `{/* 截图位置：项目概览上的 New Idea 对话框（Fill a form 标签页）→ /images/workspace/new-idea-dialog.webp */}` in `zh/guides/create-and-edit-entities.mdx`:

  ```mdx
  <Screenshot
    src="/images/workspace/new-idea-dialog.webp"
    alt="项目概览上的 New Idea 对话框，展示 Fill a form 标签页的标题、描述以及拆分为子想法的复选框"
    width={1440}
    height={900}
    caption="在项目概览手动创建想法；Fill a form 标签页用于填写标题和描述。"
  />
  ```

### 6. `documents-list.webp`

- **Surface:** the project **Documents** list, showing the type-filter tabs (PRD / Spec /
  Design / Note / Report / Other) and a few document cards (each with type icon, title,
  version, updated timestamp, type badge, and export dropdown). Reuse the workflow demo's
  docs so the list stays coherent.
- **Masking:** top-bar account identity; any UUIDs in card metadata; URL bar.
- **En** — replace `{/* Screenshot: Documents list with type filter tabs and document cards → /images/workspace/documents-list.webp */}` in `guides/documents.mdx`:

  ```mdx
  <Screenshot
    src="/images/workspace/documents-list.webp"
    alt="Project Documents list with PRD, Spec, Design, Note, Report, and Other type-filter tabs and document cards"
    width={1440}
    height={900}
    caption="The Documents list groups documents by type; each card shows its version, updated date, and export menu."
  />
  ```

- **Zh** — replace `{/* 截图位置：带类型筛选标签和文档卡片的文档列表 → /images/workspace/documents-list.webp */}` in `zh/guides/documents.mdx`:

  ```mdx
  <Screenshot
    src="/images/workspace/documents-list.webp"
    alt="项目文档列表，含 PRD、Spec、Design、Note、Report、Other 类型筛选标签和文档卡片"
    width={1440}
    height={900}
    caption="文档列表按类型分组；每张卡片显示版本、更新日期和导出菜单。"
  />
  ```

---

## Post-capture checklist (per image)

1. Captured from a **real browser**, English UI, ≥ 1440×900. No synthetic/redrawn UI.
2. All masking applied; **manual full-resolution review** done. No login, email, key,
   token, internal ID, UUID, or private host visible.
3. Exported compressed WebP to `public/images/workspace/<name>.webp`.
4. Replaced the marker comment on **both** the en and zh page with the `<Screenshot>`
   snippet, and added the locale-correct import line once per page.
5. `width`/`height` match the file's actual intrinsic pixels.
6. Ran `pnpm docs:check` from the repo root — **green** — before committing.
