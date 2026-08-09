# Workflow screenshot capture manifest

> **Status: captured.** All 11 screenshots below were captured on 2026-08-08 against a
> local Chorus dev instance (default-auth, `pnpm dev` + Docker Postgres) driven with the
> Playwright MCP, using the fictitious **Skylark Notes** demo project built through the
> full AI-DLC lifecycle. Each image was exported to `/images/workflow/<name>.webp`
> (1440×900, WebP), account identity was masked to **Demo Reviewer / reviewer@demo.example**
> and the demo agent to **Skylark Agent**, each was manually reviewed at full resolution,
> and its `<Screenshot>` component was wired into both the English and Chinese pages.
> `pnpm docs:check` passes with the images present. This document is retained as the
> reproduction recipe for future re-captures (e.g. after a UI redesign).

This manifest records the fictitious demo project to build and the ordered list of
screenshots, so anyone can re-capture and re-wire each image **and** its `<Screenshot>`
component in one gate-safe edit.

> **Do not commit this to `dist/`-linked prose.** This is a working document under
> `public/images/workflow/`. It is never referenced by a page, so it does not affect the
> link check.

## Gate-safe rule (read first)

`packages/docs/scripts/check-links.mjs` extracts every `src` from the built HTML and
**fails the build** when a same-origin image URL has no file in `dist/`. `Screenshot.astro`
renders a plain `<img src=…>`. Therefore:

1. **A `<Screenshot>` component and its `.webp` file are added together, or neither is
   added.** Never leave a `<Screenshot>` pointing at a missing file.
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

Add the import only once per page even if the page carries two screenshots.

---

## The demo project (build this first)

Create one **obviously fictitious, sanitized** demo project in a Chorus environment you
control, and drive it through the full AI-DLC lifecycle so every screenshot surface is
populated with the *same coherent story*. Use only the fictitious values below — no real
emails, hosts, keys, or UUIDs.

**Fictitious identities (use consistently):**

| Role | Fictitious value | Notes |
| --- | --- | --- |
| Human operator (logged-in demo account) | display name **Demo Reviewer** | Set the demo account's display name to this so the top bar and assignee/@mention read as fiction. If you cannot rename the account, **mask** the real name/email/avatar in every capture. |
| Agent | display name **Skylark Agent** | The developer/PM agent that elaborates, drafts, executes, and reports. |
| Project group | **Demo Workspace** | — |
| Project | **Skylark Notes** | A fictional note-taking web app. |
| Working directory (lock chip) | host label **demo-box**, path `/home/demo/skylark-notes` | Fictional host + path. If your real host name shows, mask it. |
| Resource link (reference artifact) | title **Dark mode design spec**, URL `https://example.com/skylark/dark-mode` | `example.com` is safe and non-routable; it lives inside a screenshot, not a doc link, so it needs no allowlist entry. |

**The story (one idea, full lifecycle):**

1. **Theme + lineage.** Create a **theme** idea **"Accessibility improvements"** with two
   derived child ideas: **"Add a dark mode toggle"** and **"Add keyboard shortcuts"**. The
   theme shows a "2 derived" rollup and a progress ring. (Feeds `idea-lineage`.)
2. **Idea + elaboration.** On the child idea **"Add a dark mode toggle"**, run one
   elaboration round with ~3 questions and answers, e.g.:
   - *Should dark mode follow the operating-system setting by default?* → "Yes, follow the
     OS and allow a manual override."
   - *Where should the toggle live?* → "In the top navigation bar."
   - *Should the choice persist across sessions?* → "Yes, remember it per device."

   Panel reads "3 of 3 answered". (Feeds `idea-elaboration`.)
3. **Comment + @mention + notification + resource link.** As **Skylark Agent**, post a
   comment mentioning **@Demo Reviewer** summarizing the requirement ("dark mode follows
   the OS with a manual override in the top nav, remembered per device — does that
   match?"). This produces a **notification** for Demo Reviewer. Attach the **Dark mode
   design spec** reference link to the idea (or proposal). These populate the collaboration
   surfaces used in the elaboration and proposal captures.
4. **Resolve elaboration.** Confirm and select **Verify Elaborate**; the idea advances past
   `elaborated`. (Feeds `idea-verify-elaborate`.)
5. **Proposal.** Have Skylark Agent draft a proposal with:
   - Documents: a **PRD "Dark mode toggle"** and a **Tech Design "Theme tokens and
     toggle"**.
   - Task drafts (with a real dependency chain):
     1. *Add theme color tokens* — no dependencies.
     2. *Add the dark-mode toggle control* — depends on (1).
     3. *Persist the theme preference* — depends on (2).
     4. *Update in-app help copy* — depends on (2).

   Each draft carries a few acceptance criteria. Submit for review. (Feeds
   `proposal-review`.)
6. **Approve.** Approve the proposal; the drafts materialize into 2 Documents and 4 **Open**
   tasks. (Feeds `proposal-approve`.)
7. **Run tasks.** Assign and drive the four tasks so all four Kanban columns are populated,
   e.g. task 1 **Done**, task 2 **To Verify**, task 3 **In Progress**, task 4 **To Do**.
   The DAG view shows the dependency arrows. (Feeds `tasks-kanban`, `tasks-dag`.)
8. **Verify.** On task 2 (in **To Verify**), show the Acceptance Criteria section with the
   Dev Self-Check track filled, the Pass/Fail controls, and the readiness banner. (Feeds
   `task-acceptance-criteria`.)
9. **Complete.** Verify all four tasks so the idea reaches **Done**; a completion report
   appears in the idea's Overview → Reports section. (Feeds `idea-completion-report`.)

**Global masking (apply to every capture), per `AUTHORING.md`:**

- The top-bar account **avatar, display name, and email** (unless the account is already
  named the fictitious "Demo Reviewer").
- Any **working-directory host name and absolute path** that is not the fictional
  `demo-box:/home/demo/skylark-notes`.
- The browser **URL bar** (it exposes entity **UUIDs**) — crop it out or mask it.
- Any **API key / `cho_…` token**, session ID, internal serial ID, or UUID visible in
  panels, tooltips, or activity entries.
- Real teammate names in assignee menus or activity — use only **Demo Reviewer** /
  **Skylark Agent**.

Timestamps and generic status text are fine to leave.

---

## Capture list (ordered)

Eleven required captures aligned 1:1 to the `{/* Screenshot: … */}` (en) and
`{/* 截图位置：… */}` (zh) markers already in the pages, plus one optional overview hero.
All paths are under `/images/workflow/`. Where a page carries two screenshots, add the
import line only once.

| # | Image (`/images/workflow/…`) | Surface | En page (marker) | Zh page (marker) |
| --- | --- | --- | --- | --- |
| 1 | `create-project.webp` | Projects page: a project-group card and its **New Project** button | `guides/create-a-project.mdx` (§ Fix a working directory) | `zh/guides/create-a-project.mdx` |
| 2 | `project-overview.webp` | Open project **Overview** with sidebar nav and the idea tracker | `guides/create-a-project.mdx` (§ Open the workspace) | `zh/guides/create-a-project.mdx` |
| 3 | `idea-elaboration.webp` | Idea detail panel **Elaboration** tab: one round of Q&A | `guides/capture-an-idea.mdx` (§ Run elaboration) | `zh/guides/capture-an-idea.mdx` |
| 4 | `idea-verify-elaborate.webp` | Idea panel footer with the **Verify Elaborate** action | `guides/capture-an-idea.mdx` (§ Resolve elaboration) | `zh/guides/capture-an-idea.mdx` |
| 5 | `idea-lineage.webp` | Idea tracker **Lineage** view: theme + derived children | `guides/capture-an-idea.mdx` (§ Theme vs. derived) | `zh/guides/capture-an-idea.mdx` |
| 6 | `proposal-review.webp` | Proposal detail: document drafts + task drafts under review | `guides/review-a-proposal.mdx` (§ Read the documents) | `zh/guides/review-a-proposal.mdx` |
| 7 | `proposal-approve.webp` | **Actions** menu with **Approve** + resulting Open tasks | `guides/review-a-proposal.mdx` (§ What approval creates) | `zh/guides/review-a-proposal.mdx` |
| 8 | `tasks-kanban.webp` | Tasks **Kanban** board: To Do / In Progress / To Verify / Done | `guides/run-tasks.mdx` (§ Open the Tasks board) | `zh/guides/run-tasks.mdx` |
| 9 | `tasks-dag.webp` | Task dependency **DAG** view: nodes + dependency arrows | `guides/run-tasks.mdx` (§ Read the dependency graph) | `zh/guides/run-tasks.mdx` |
| 10 | `task-acceptance-criteria.webp` | Task **Acceptance Criteria** section: Pass/Fail + readiness banner | `guides/verify-and-complete.mdx` (§ Mark the acceptance criteria) | `zh/guides/verify-and-complete.mdx` |
| 11 | `idea-completion-report.webp` | Idea **Overview** tab: Reports section with a completion report | `guides/verify-and-complete.mdx` (§ Complete the idea) | `zh/guides/verify-and-complete.mdx` |
| 12 *(optional)* | `ai-dlc-pipeline.webp` | Project overview showing one idea moving through the pipeline | `guides/ai-dlc-workflow.mdx` (soft surface note, no committed path) | `zh/guides/ai-dlc-workflow.mdx` |

To place each image, **replace the matching marker comment** on the page with the snippet
below (and add the import line once at the top). The marker text is unique per page, so
search for it rather than trusting a line number.

---

### 1. `create-project.webp`

- **Surface:** Projects page with a project-group card (**Demo Workspace**) and its
  **New Project** button; the New Project dialog may be open showing
  "Creating in: Demo Workspace".
- **Masking:** top-bar account identity; URL bar (UUIDs).
- **En** — replace `{/* Screenshot: Projects page with a group card and its New Project button → /images/workflow/create-project.webp */}` in `guides/create-a-project.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/create-project.webp"
    alt="Chorus Projects page with the Demo Workspace group card and its New Project button"
    width={1440}
    height={900}
    caption="Each project lives in a project group; create the group, then a project inside it."
  />
  ```

- **Zh** — replace `{/* 截图位置：项目页面，展示分组卡片及其 New Project 按钮 → /images/workflow/create-project.webp */}` in `zh/guides/create-a-project.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/create-project.webp"
    alt="Chorus 项目页面，展示 Demo Workspace 分组卡片及其 New Project 按钮"
    width={1440}
    height={900}
    caption="每个项目都归属于一个项目分组；先建分组，再在其中建项目。"
  />
  ```

### 2. `project-overview.webp`

- **Surface:** an open **Skylark Notes** project at its **Overview**, showing the left
  project navigation (Overview / Documents / Proposals / Tasks / Graph / Activity) and the
  idea tracker. If a working directory is fixed, the header lock chip reads
  `demo-box:/home/demo/skylark-notes`.
- **Masking:** top-bar account identity; any non-fictional host/path in the lock chip;
  URL bar.
- **En** — replace `{/* Screenshot: project Overview with sidebar navigation and the idea tracker → /images/workflow/project-overview.webp */}` in `guides/create-a-project.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/project-overview.webp"
    alt="Skylark Notes project Overview with the left navigation sidebar and the idea tracker"
    width={1440}
    height={900}
    caption="The project workspace opens at its Overview, where you capture and follow ideas."
  />
  ```

- **Zh** — replace `{/* 截图位置：项目 Overview，展示侧边栏导航和想法看板 → /images/workflow/project-overview.webp */}` in `zh/guides/create-a-project.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/project-overview.webp"
    alt="Skylark Notes 项目 Overview，展示左侧导航侧边栏和想法看板"
    width={1440}
    height={900}
    caption="项目工作区从 Overview 打开，你在这里记录并跟进想法。"
  />
  ```

### 3. `idea-elaboration.webp`

- **Surface:** the **Add a dark mode toggle** idea's detail panel, **Elaboration** tab,
  showing one round of questions with selected answers and the "3 of 3 answered" progress.
- **Masking:** top-bar account identity; the agent comment's @mention should read
  **@Demo Reviewer** (fiction) not a real name; URL bar.
- **En** — replace `{/* Screenshot: idea detail panel Elaboration tab with a round of questions and answers → /images/workflow/idea-elaboration.webp */}` in `guides/capture-an-idea.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/idea-elaboration.webp"
    alt="Idea Elaboration tab showing one round of requirement questions with selected answers"
    width={1440}
    height={900}
    caption="Elaboration runs in rounds; answer each question, then submit the round."
  />
  ```

- **Zh** — replace `{/* 截图位置：想法详情面板 Elaboration 标签页，展示一轮问题与回答 → /images/workflow/idea-elaboration.webp */}` in `zh/guides/capture-an-idea.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/idea-elaboration.webp"
    alt="想法 Elaboration 标签页，展示一轮需求问题及已选择的回答"
    width={1440}
    height={900}
    caption="需求梳理以轮次进行；逐题作答后提交本轮。"
  />
  ```

### 4. `idea-verify-elaborate.webp`

- **Surface:** the idea panel footer with the **Verify Elaborate** action, after the round
  is answered and confirmed.
- **Masking:** top-bar account identity; URL bar.
- **En** — replace `{/* Screenshot: idea panel footer with the Verify Elaborate action → /images/workflow/idea-verify-elaborate.webp */}` in `guides/capture-an-idea.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/idea-verify-elaborate.webp"
    alt="Idea panel footer with the Verify Elaborate action ready to resolve elaboration"
    width={1440}
    height={900}
    caption="Verify Elaborate confirms the shared understanding and moves the idea to elaborated."
  />
  ```

- **Zh** — replace `{/* 截图位置：想法面板底部的 Verify Elaborate 操作 → /images/workflow/idea-verify-elaborate.webp */}` in `zh/guides/capture-an-idea.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/idea-verify-elaborate.webp"
    alt="想法面板底部的 Verify Elaborate 操作，可用于结束需求梳理"
    width={1440}
    height={900}
    caption="Verify Elaborate 确认双方理解一致，并把想法推进到 elaborated。"
  />
  ```

### 5. `idea-lineage.webp`

- **Surface:** the idea tracker **Lineage** view showing the **Accessibility
  improvements** theme with its two derived children (**Add a dark mode toggle**, **Add
  keyboard shortcuts**) and the "2 derived" rollup.
- **Masking:** top-bar account identity; URL bar.
- **En** — replace `{/* Screenshot: idea tracker Lineage view showing a theme with derived child ideas → /images/workflow/idea-lineage.webp */}` in `guides/capture-an-idea.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/idea-lineage.webp"
    alt="Idea tracker Lineage view showing a theme idea with two derived child ideas"
    width={1440}
    height={900}
    caption="A theme groups related child ideas; Lineage visualizes the parent-child tree."
  />
  ```

- **Zh** — replace `{/* 截图位置：想法看板 Lineage 视图，展示带派生子想法的主题 → /images/workflow/idea-lineage.webp */}` in `zh/guides/capture-an-idea.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/idea-lineage.webp"
    alt="想法看板 Lineage 视图，展示一个主题想法及其两个派生子想法"
    width={1440}
    height={900}
    caption="主题用来归组相关子想法；Lineage 视图把父子树可视化。"
  />
  ```

### 6. `proposal-review.webp`

- **Surface:** the **Dark mode toggle** proposal's detail page under review — the PRD /
  Tech Design document drafts and the four task drafts with their acceptance-criteria and
  dependency counts, plus the Details sidebar.
- **Masking:** top-bar account identity; creator name in the Details sidebar (should be
  **Skylark Agent**); URL bar.
- **En** — replace `{/* Screenshot: proposal detail page showing document drafts and task drafts under review → /images/workflow/proposal-review.webp */}` in `guides/review-a-proposal.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/proposal-review.webp"
    alt="Proposal detail page with document drafts and task drafts awaiting review"
    width={1440}
    height={900}
    caption="Read the proposal's documents and task drafts before you approve or reject."
  />
  ```

- **Zh** — replace `{/* 截图位置：方案详情页，展示待审阅的文档草稿和任务草稿 → /images/workflow/proposal-review.webp */}` in `zh/guides/review-a-proposal.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/proposal-review.webp"
    alt="方案详情页，展示待审阅的文档草稿和任务草稿"
    width={1440}
    height={900}
    caption="在批准或拒绝之前，先阅读方案的文档草稿和任务草稿。"
  />
  ```

### 7. `proposal-approve.webp`

- **Surface:** the proposal **Actions** menu open with **Approve** (and Reject / Revoke
  Approval), or the moment just after approval showing the four materialized **Open** tasks.
- **Masking:** top-bar account identity; URL bar.
- **En** — replace `{/* Screenshot: Actions menu with Approve, and the resulting Open tasks → /images/workflow/proposal-approve.webp */}` in `guides/review-a-proposal.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/proposal-approve.webp"
    alt="Proposal Actions menu with Approve, alongside the tasks it will materialize as Open"
    width={1440}
    height={900}
    caption="Approving materializes the drafts into real Documents and Open Tasks."
  />
  ```

- **Zh** — replace `{/* 截图位置：Actions 菜单中的 Approve，以及随之产生的 Open 任务 → /images/workflow/proposal-approve.webp */}` in `zh/guides/review-a-proposal.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/proposal-approve.webp"
    alt="方案 Actions 菜单中的 Approve，以及随之产生的 Open 状态任务"
    width={1440}
    height={900}
    caption="批准会把草稿实体化为真正的文档和 Open 状态的任务。"
  />
  ```

### 8. `tasks-kanban.webp`

- **Surface:** the **Tasks** Kanban board with all four columns populated — e.g. task 1
  **Done**, task 2 **To Verify**, task 3 **In Progress**, task 4 **To Do** — each card
  showing status, estimate, assignee, and acceptance-criteria progress.
- **Masking:** top-bar account identity; assignee names on cards (**Demo Reviewer** /
  **Skylark Agent** only); URL bar.
- **En** — replace `{/* Screenshot: Tasks Kanban board with To Do / In Progress / To Verify / Done columns → /images/workflow/tasks-kanban.webp */}` in `guides/run-tasks.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/tasks-kanban.webp"
    alt="Tasks Kanban board with To Do, In Progress, To Verify, and Done columns populated"
    width={1440}
    height={900}
    caption="The Kanban board tracks each task across To Do, In Progress, To Verify, and Done."
  />
  ```

- **Zh** — replace `{/* 截图位置：任务 Kanban 看板，含 To Do / In Progress / To Verify / Done 四列 → /images/workflow/tasks-kanban.webp */}` in `zh/guides/run-tasks.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/tasks-kanban.webp"
    alt="任务 Kanban 看板，To Do、In Progress、To Verify、Done 四列均有卡片"
    width={1440}
    height={900}
    caption="Kanban 看板按 To Do、In Progress、To Verify、Done 跟踪每个任务。"
  />
  ```

### 9. `tasks-dag.webp`

- **Surface:** the **DAG** view showing the four tasks as nodes with dependency arrows
  (tokens → toggle → persist, and toggle → help copy).
- **Masking:** top-bar account identity; URL bar.
- **En** — replace `{/* Screenshot: task dependency DAG view with nodes and dependency arrows → /images/workflow/tasks-dag.webp */}` in `guides/run-tasks.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/tasks-dag.webp"
    alt="Task dependency DAG view showing task nodes connected by dependency arrows"
    width={1440}
    height={900}
    caption="The DAG view lays out dependencies so you can read the execution order."
  />
  ```

- **Zh** — replace `{/* 截图位置：任务依赖 DAG 视图，含节点和依赖箭头 → /images/workflow/tasks-dag.webp */}` in `zh/guides/run-tasks.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/tasks-dag.webp"
    alt="任务依赖 DAG 视图，展示任务节点及连接它们的依赖箭头"
    width={1440}
    height={900}
    caption="DAG 视图排布依赖关系，让你读出执行顺序。"
  />
  ```

### 10. `task-acceptance-criteria.webp`

- **Surface:** task 2's detail panel **Acceptance Criteria** section, showing the Dev
  Self-Check track (agent rating + evidence), the **Pass**/**Fail** verification controls,
  and the readiness banner.
- **Masking:** top-bar account identity; any evidence text containing UUIDs, hosts, or
  keys; URL bar.
- **En** — replace `{/* Screenshot: task Acceptance Criteria section with Pass/Fail controls and the readiness banner → /images/workflow/task-acceptance-criteria.webp */}` in `guides/verify-and-complete.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/task-acceptance-criteria.webp"
    alt="Task Acceptance Criteria section with Dev Self-Check, Pass and Fail controls, and the readiness banner"
    width={1440}
    height={900}
    caption="Verify each acceptance criterion; the banner shows when all required ones pass."
  />
  ```

- **Zh** — replace `{/* 截图位置：任务 Acceptance Criteria 一节，含 Pass/Fail 控件和就绪横幅 → /images/workflow/task-acceptance-criteria.webp */}` in `zh/guides/verify-and-complete.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/task-acceptance-criteria.webp"
    alt="任务 Acceptance Criteria 一节，含 Dev Self-Check、Pass/Fail 控件和就绪横幅"
    width={1440}
    height={900}
    caption="逐项验收每条标准；当所有必填项通过时横幅会提示可以验证。"
  />
  ```

### 11. `idea-completion-report.webp`

- **Surface:** the **Add a dark mode toggle** idea's **Overview** tab after all tasks are
  Done, showing the **Reports** section with the completion report entry.
- **Masking:** top-bar account identity; URL bar; any report text containing internal IDs.
- **En** — replace `{/* Screenshot: idea Overview tab showing the Reports section with a completion report → /images/workflow/idea-completion-report.webp */}` in `guides/verify-and-complete.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/idea-completion-report.webp"
    alt="Idea Overview tab with a Reports section listing the completion report for a done idea"
    width={1440}
    height={900}
    caption="When every task is verified, the idea completes and its completion report appears."
  />
  ```

- **Zh** — replace `{/* 截图位置：想法 Overview 标签页，展示含完成报告的 Reports 区域 → /images/workflow/idea-completion-report.webp */}` in `zh/guides/verify-and-complete.mdx`:

  ```mdx
  <Screenshot
    src="/images/workflow/idea-completion-report.webp"
    alt="想法 Overview 标签页，Reports 区域列出了已完成想法的完成报告"
    width={1440}
    height={900}
    caption="当每个任务都通过验证后，想法即完成，其完成报告随之出现。"
  />
  ```

### 12 *(optional)*. `ai-dlc-pipeline.webp`

The overview page `guides/ai-dlc-workflow.mdx` carries only a soft surface note
(`{/* Screenshot surface: project overview showing an idea moving through the pipeline. */}`
in en; `{/* 截图位置：项目总览，展示一个想法在流水线中推进。 */}` in zh) with **no
committed path**. A hero image here is optional. If you add it, use a project-overview /
idea-tracker capture where an idea's stage badge shows mid-pipeline progress, place the
file at `/images/workflow/ai-dlc-pipeline.webp`, and replace the surface note on **both**
pages with the snippet below (same masking as capture #2).

- **En** (`guides/ai-dlc-workflow.mdx`):

  ```mdx
  <Screenshot
    src="/images/workflow/ai-dlc-pipeline.webp"
    alt="Project overview with an idea whose status badge shows it moving through the AI-DLC pipeline"
    width={1440}
    height={900}
    caption="Every request travels the same Idea to Done pipeline; the idea's badge shows its stage."
  />
  ```

- **Zh** (`zh/guides/ai-dlc-workflow.mdx`):

  ```mdx
  <Screenshot
    src="/images/workflow/ai-dlc-pipeline.webp"
    alt="项目总览中一个想法的状态标记显示它正在 AI-DLC 流水线中推进"
    width={1440}
    height={900}
    caption="每个请求都沿着同一条从 Idea 到 Done 的流水线推进；想法的状态标记显示它所处的阶段。"
  />
  ```

---

## Post-capture checklist (per image)

1. Captured from a **real browser**, English UI, ≥ 1440×900. No synthetic/redrawn UI.
2. All masking applied; **manual full-resolution review** done. No login, email, key,
   token, internal ID, UUID, or private host visible.
3. Exported compressed WebP to `public/images/workflow/<name>.webp`.
4. Replaced the marker comment on **both** the en and zh page with the `<Screenshot>`
   snippet, and added the locale-correct import line once per page.
5. `width`/`height` match the file's actual intrinsic pixels.
6. Ran `pnpm docs:check` from the repo root — **green** — before committing.
