# Plugins & commands screenshot capture manifest

> **Status: PENDING human capture.** The **Plugins & commands** pages
> (`guides/plugin-commands`, `guides/plugin-automation`, `guides/openspec-mode`, each
> EN + `/zh`) plus the merged plugin section on the **Agent platforms** page
> (`reference/agents/` index) ship **text-only** — they carry **no** `<Screenshot>`
> components and reference **no** images yet. This module has only ~1–2 web-UI surfaces
> worth a screenshot (listed below); everything else it documents is terminal / config,
> not a screenshottable web UI, so those stay prose + fenced code
> blocks. The two captures below were **not** taken during the module's authoring run
> because it was headless — there was no authenticated browser session to drive. This
> document is the **reproduction recipe** so a human (or an attended run) can capture and
> wire each image later in one gate-safe edit.

This manifest records the intended web-UI screenshots for the **Plugins & commands**
module, so anyone can capture and wire each image **and** its `<Screenshot>` component in
one gate-safe edit.

> **Do not commit this to `dist/`-linked prose.** This is a working document under
> `public/images/plugins/`. It is never referenced by a page, so it does not affect the
> link check.

## Gate-safe rule (read first)

`packages/docs/scripts/check-links.mjs` extracts every `src` from the built HTML and
**fails the build** when a same-origin image URL has no file in `dist/`. `Screenshot.astro`
renders a plain `<img src=…>`. Therefore:

1. **A `<Screenshot>` component and its `.webp` file are added together, or neither is
   added.** Never leave a `<Screenshot>` pointing at a missing file. The four module pages
   currently carry **no** `<Screenshot>` and **no** image `src`, so the link check passes
   with zero images present — that is the intended state until a human captures the shots
   below.
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

The import path depth differs by the page's directory depth — this is the single most
common mistake. Count `../` from the page file up to `src/content/docs/`, then add
`components/Screenshot.astro`.

- **`guides/` English pages** (`src/content/docs/guides/*.mdx`) — three `../`:

  ```mdx
  import Screenshot from '../../../components/Screenshot.astro';
  ```

- **`guides/` Chinese pages** (`src/content/docs/zh/guides/*.mdx`) — four `../`:

  ```mdx
  import Screenshot from '../../../../components/Screenshot.astro';
  ```

- **Agent platforms page — shot 2 target** — this page is one level deeper than a guide.
  English `reference/agents/index.mdx` — four `../`:

  ```mdx
  import Screenshot from '../../../../components/Screenshot.astro';
  ```

  Chinese `zh/reference/agents/index.mdx` — five `../`:

  ```mdx
  import Screenshot from '../../../../../components/Screenshot.astro';
  ```

Add the import only once per page. (Each page below carries at most one screenshot, so add
it once next to that page's frontmatter.)

---

## The demo project (build this first)

Capture against one **obviously fictitious, sanitized** demo project in a Chorus
environment you control. Reuse the same **Skylark Notes** demo identities as the workflow
and workspace manifests (`public/images/workflow/CAPTURE_MANIFEST.md`,
`public/images/workspace/CAPTURE_MANIFEST.md`) so all image sets tell one coherent,
fictional story. Use only the fictitious values below — no real emails, hosts, keys, or
UUIDs.

**Fictitious identities (use consistently):**

| Role | Fictitious value | Notes |
| --- | --- | --- |
| Human operator (logged-in demo account) | display name **Demo Reviewer** | Set the demo account's display name to this so the top bar and assignee/@mention read as fiction. If you cannot rename the account, **mask** the real name/email/avatar in every capture. |
| Agent | display name **Skylark Agent** | The developer/PM agent whose submission the reviewer verdict lands on. |
| Project group | **Demo Workspace** | — |
| Project | **Skylark Notes** | A fictional note-taking web app. |

**What to populate (so both surfaces have content):**

1. **A reviewed proposal with a VERDICT comment.** Reuse the workflow demo's **Dark mode
   toggle** proposal. Submit it, then spawn the proposal reviewer sub-agent so it posts a
   single `VERDICT: PASS` (or `PASS WITH NOTES`) comment on the proposal, and open the
   proposal's Comments so the verdict comment is in frame. (Feeds `reviewer-verdict`.)
2. **The plugin install / userConfig screen.** Reach the Claude Code plugin install
   configuration where the `userConfig` toggles are shown — the reviewer switches
   (`enableProposalReviewer`, `enableTaskReviewer`, `enableCodeReviewer`) and the
   `enableOpenSpec` toggle. This is the plugin marketplace install configuration surface,
   not a Chorus web page. (Feeds `plugin-userconfig`.)

**Global masking (apply to every capture), per `AUTHORING.md`:**

- The top-bar account **avatar, display name, and email** (unless the account is already
  named the fictitious "Demo Reviewer").
- Any **working-directory host name and absolute path** that is not a fictional
  `demo-box:/home/demo/skylark-notes`.
- The browser (or terminal) **URL / title bar** — it exposes entity **UUIDs** and hosts;
  crop it out or mask it.
- Any **API key / `cho_…` token**, session ID, internal serial ID, or UUID visible in the
  verdict comment body, the proposal Details sidebar, tooltips, or install config.
- Real teammate names in the comment author line or @mentions — use only **Demo Reviewer**
  / **Skylark Agent**.

Timestamps and generic status text are fine to leave.

---

## Capture list (ordered)

Two intended captures for this module. The other two pages
(`guides/plugin-commands`, `guides/openspec-mode`) are intentionally **text-only** —
they document commands, config, and terminal flows that have no screenshottable web UI.
All paths are under `/images/plugins/`. Each page carries at most one screenshot, so add
the import line once per page. **No page currently references any of these images**; add a
`<Screenshot>` only when the matching `.webp` exists.

| # | Image (`/images/plugins/…`) | Surface | En page | Zh page |
| --- | --- | --- | --- | --- |
| 1 | `reviewer-verdict.webp` | A reviewer **VERDICT** comment on a proposal in the Chorus UI | `guides/plugin-automation.mdx` (§ Reviewer sub-agents) | `zh/guides/plugin-automation.mdx` |
| 2 | `plugin-userconfig.webp` | The plugin `userConfig` install screen: reviewer + OpenSpec toggles | `reference/agents/index.mdx` (§ What the plugin packages → Claude Code → Configuration toggles) | `zh/reference/agents/index.mdx` |

To place each image, add the import line once at the top of the page and insert the
`<Screenshot>` snippet at the section noted above.

---

### 1. `reviewer-verdict.webp`

- **Surface:** the **Dark mode toggle** proposal's detail page with its **Comments** open,
  showing a reviewer sub-agent's single verdict comment that begins with
  `VERDICT: PASS` (or `PASS WITH NOTES` / `FAIL`) and lists its findings. Keep enough of the
  proposal page behind the comment for context (the proposal title and Details sidebar).
- **Target page:** `guides/plugin-automation` (§ *Reviewer sub-agents*) — the page that
  explains that each reviewer ends by posting a single `PASS` / `PASS WITH NOTES` / `FAIL`
  verdict comment.
- **Masking:** top-bar account identity; the comment author line (should read **Skylark
  Agent** or the reviewer's fictitious name, not a real teammate); any `cho_…` token, UUID,
  host, or path inside the verdict body or the Details sidebar; the browser URL bar.
- **En** — add the import once, then insert under the *Reviewer sub-agents* section:

  ```mdx
  <Screenshot
    src="/images/plugins/reviewer-verdict.webp"
    alt="A reviewer sub-agent VERDICT comment on a Chorus proposal, beginning with PASS and listing its findings"
    width={1440}
    height={900}
    caption="Every reviewer ends by posting one verdict comment — PASS, PASS WITH NOTES, or FAIL — on the entity it reviewed."
  />
  ```

- **Zh** — add the import once, then insert under the same section:

  ```mdx
  <Screenshot
    src="/images/plugins/reviewer-verdict.webp"
    alt="审查子智能体在 Chorus 方案上发表的 VERDICT 评论，以 PASS 开头并列出其发现"
    width={1440}
    height={900}
    caption="每个审查者最后都会发表一条裁定评论——PASS、PASS WITH NOTES 或 FAIL——落在它所审查的实体上。"
  />
  ```

### 2. `plugin-userconfig.webp`

- **Surface:** the Claude Code plugin install / configuration screen where the plugin's
  `userConfig` toggles are shown — the three reviewer switches
  (`enableProposalReviewer`, `enableTaskReviewer`, `enableCodeReviewer`) and the
  `enableOpenSpec` toggle, all at their defaults (on). This is the plugin marketplace
  install-configuration surface (a Claude Code plugin UI), not a Chorus web page; frame it
  so the toggle labels are legible.
- **Target page:** `reference/agents/` index (§ *What the plugin packages* → *Claude Code*,
  at the **Configuration toggles** bullet) — the merged Agent platforms page that describes
  the `userConfig` options that enable or disable each reviewer, cap review rounds, and
  switch OpenSpec mode on or off.
- **Masking:** any account identity, host, path, `cho_…` token, or UUID visible in the
  install surface; the terminal/window title bar if it exposes a host or path.
- **En** — add the import once, then insert at the *Configuration toggles* bullet:

  ```mdx
  <Screenshot
    src="/images/plugins/plugin-userconfig.webp"
    alt="The Claude Code plugin install configuration screen showing the reviewer enable toggles and the enableOpenSpec toggle"
    width={1440}
    height={900}
    caption="The Claude Code plugin's userConfig toggles enable or disable each reviewer, cap review rounds, and switch OpenSpec mode on or off."
  />
  ```

- **Zh** — add the import once, then insert at the corresponding bullet:

  ```mdx
  <Screenshot
    src="/images/plugins/plugin-userconfig.webp"
    alt="Claude Code 插件安装配置界面，展示各审查者的启用开关以及 enableOpenSpec 开关"
    width={1440}
    height={900}
    caption="Claude Code 插件的 userConfig 开关用于启用或禁用各个审查者、限制审查轮次，并开启或关闭 OpenSpec 模式。"
  />
  ```

---

## Post-capture checklist (per image)

1. Captured from a **real browser** (or the real Claude Code plugin UI), English UI,
   ≥ 1440×900. No synthetic/redrawn UI.
2. All masking applied; **manual full-resolution review** done. No login, email, key,
   token, internal ID, UUID, or private host visible.
3. Exported compressed WebP to `public/images/plugins/<name>.webp`.
4. Added the locale-correct import line once per page and inserted the `<Screenshot>`
   snippet on **both** the en and zh page.
5. `width`/`height` match the file's actual intrinsic pixels.
6. Ran `pnpm docs:check` from the repo root — **green** — before committing.
