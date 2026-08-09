# Reference (API / MCP) screenshot capture manifest

> **Status: PENDING human capture.** The **API / MCP technical reference** pages
> (`reference/authentication`, `reference/mcp-tools`, `reference/realtime`, each EN + `/zh`)
> ship **text-only** — they carry **no** `<Screenshot>` components and reference **no**
> images yet. That is the intended state. Almost everything these pages document is a
> protocol contract (auth cascade, MCP transport, permission matrix, SSE event shape,
> notification REST API) with no screenshottable web UI, so those stay prose + fenced code
> blocks. This module has at most **two** web-UI surfaces worth a screenshot (listed below),
> both on the **Authentication & permissions** page. Neither was captured during the
> module's authoring run because it was **headless** — there was no authenticated browser
> session to drive. This document is the **reproduction recipe** so a human (or an attended
> run) can capture and wire each image later in one gate-safe edit.

This manifest records the intended web-UI screenshots for the **Reference (API / MCP)**
module, so anyone can capture and wire each image **and** its `<Screenshot>` component in
one gate-safe edit.

> **Do not commit this to `dist/`-linked prose.** This is a working document under
> `public/images/reference/`. It is never referenced by a page, so it does not affect the
> link check.

## Gate-safe rule (read first)

`packages/docs/scripts/check-links.mjs` extracts every `src` from the built HTML and
**fails the build** when a same-origin image URL has no file in `dist/`. `Screenshot.astro`
renders a plain `<img src=…>`. Therefore:

1. **A `<Screenshot>` component and its `.webp` file are added together, or neither is
   added.** Never leave a `<Screenshot>` pointing at a missing file. The three module pages
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
common mistake. Count `../` from the page file up to `src/`, then add
`components/Screenshot.astro`. Both target surfaces below live on **the same page**
(`reference/authentication`), so the import is added **once** per locale.

- **`reference/` English page** (`src/content/docs/reference/authentication.mdx`) —
  three `../`:

  ```mdx
  import Screenshot from '../../../components/Screenshot.astro';
  ```

- **`reference/` Chinese page** (`src/content/docs/zh/reference/authentication.mdx`) —
  four `../`:

  ```mdx
  import Screenshot from '../../../../components/Screenshot.astro';
  ```

Add the import only once per page even though this page carries **two** screenshots.

---

## The demo project (build this first)

Capture against one **obviously fictitious, sanitized** demo project in a Chorus
environment you control. Reuse the same **Skylark Notes** demo identities as the workflow,
workspace, and plugins manifests (`public/images/workflow/CAPTURE_MANIFEST.md`,
`public/images/workspace/CAPTURE_MANIFEST.md`, `public/images/plugins/CAPTURE_MANIFEST.md`)
so all image sets tell one coherent, fictional story. Use only the fictitious values
below — no real emails, hosts, keys, or UUIDs.

**Fictitious identities (use consistently):**

| Role | Fictitious value | Notes |
| --- | --- | --- |
| Human operator (logged-in demo account) | display name **Demo Reviewer** | Set the demo account's display name to this so the top bar and owner column read as fiction. If you cannot rename the account, **mask** the real name/email/avatar in every capture. |
| Agent | display name **Skylark Agent** | The agent whose API key and permissions are on screen. Give it a `developer_agent` (or `pm_agent`) preset so the permission grid has a realistic, non-empty selection. |
| Project group | **Demo Workspace** | — |
| Project | **Skylark Notes** | A fictional note-taking web app. |

**What to populate (so both surfaces have content):**

1. **At least one agent with an API key.** Create the **Skylark Agent** in Settings so the
   Agents / API-keys list has a row, and its detail/create flow shows the key surface and
   the permission grid. Do **not** display a live, unmasked key value — even the fictitious
   agent's `cho_…` token must be masked (see masking below). (Feeds `agent-api-keys` and
   `permission-picker`.)
2. **A non-trivial permission selection.** Choose a preset (e.g. `developer_agent`) and, if
   the UI supports it, toggle one or two custom bits, so the 5×3 `{resource}:{action}` grid
   shows a realistic mix of on/off cells rather than an all-empty or all-full grid.

**Global masking (apply to every capture), per `AUTHORING.md`:**

- The top-bar account **avatar, display name, and email** (unless the account is already
  named the fictitious "Demo Reviewer").
- Any **API key / `cho_…` token** value — including the one-time reveal shown at creation
  and any masked/last-4 display in the list.
- Any **UUID** (agent UUID, owner UUID, key UUID, company UUID) visible in a row, a detail
  panel, a tooltip, or the browser URL bar.
- Any **host name and absolute path** that is not a fictional
  `demo-box:/home/demo/skylark-notes`.
- The browser **URL / title bar** — it exposes entity UUIDs and hosts; crop it out or mask
  it.
- Real teammate names in the **Owner** column or anywhere on the screen — use only
  **Demo Reviewer** / **Skylark Agent**.

Timestamps (created / last used) and generic status text are fine to leave.

---

## Capture list (ordered)

Two intended captures for this module, **both on the Authentication & permissions page**.
The `mcp-tools` and `realtime` pages are intentionally **text-only** — they document a
transport contract, a permission-gated tool catalog, an SSE event shape, and a notification
REST API, none of which is a screenshottable web UI. All paths are under
`/images/reference/`. **No page currently references any of these images**; add a
`<Screenshot>` only when the matching `.webp` exists.

| # | Image (`/images/reference/…`) | Surface | En page | Zh page |
| --- | --- | --- | --- | --- |
| 1 | `agent-api-keys.webp` | The agent **API key** create / list screen (Settings → Agents / API keys) | `reference/authentication.mdx` (§ Agent API key) | `zh/reference/authentication.mdx` |
| 2 | `permission-picker.webp` | The **permission-picker grid** in the agent create / edit flow (the 5×3 resource × action matrix) | `reference/authentication.mdx` (§ Permission model → The 5×3 matrix) | `zh/reference/authentication.mdx` |

To place each image, add the import line once at the top of the page and insert each
`<Screenshot>` snippet at the section noted above.

---

### 1. `agent-api-keys.webp`

- **Surface:** the Settings **Agents / API keys** screen — the list of agents with their
  API-key state (created / last used / masked key), framed with enough of the Settings page
  and left navigation for context. If the create/rotate dialog is the clearer surface for
  the key contract, a full dialog over the list is acceptable as the boundary; keep the list
  behind it for context. Never crop to a single field.
- **Target page:** `reference/authentication` (§ *Agent API key*) — the section explaining
  that keys are created, rotated, and revoked in Settings (not via an API call), carry the
  `cho_` prefix, are shown once at creation, and store only a SHA-256 hash.
- **Masking:** the one-time revealed key and any masked/last-4 `cho_…` value; every UUID
  (agent, owner, key); the top-bar account identity; the browser URL bar; any real teammate
  name in the Owner column. Use **Demo Reviewer** / **Skylark Agent** only.
- **En** — add the import once, then insert under the *Agent API key* section:

  ```mdx
  <Screenshot
    src="/images/reference/agent-api-keys.webp"
    alt="The Chorus Settings screen listing agents and their API keys, with create and rotate actions"
    width={1440}
    height={900}
    caption="Agent API keys are created, rotated, and revoked in Settings — the raw cho_ key is shown once at creation and stored only as a hash."
  />
  ```

- **Zh** — add the import once, then insert under the same section:

  ```mdx
  <Screenshot
    src="/images/reference/agent-api-keys.webp"
    alt="Chorus 设置界面，列出智能体及其 API 密钥，并提供创建和轮换操作"
    width={1440}
    height={900}
    caption="智能体 API 密钥在设置中创建、轮换和吊销——原始的 cho_ 密钥仅在创建时显示一次，且仅以哈希形式存储。"
  />
  ```

### 2. `permission-picker.webp`

- **Surface:** the **permission-picker grid** in the agent create / edit flow — the
  5 resources (`idea`, `proposal`, `document`, `project`, `task`) × 3 actions
  (`read`, `write`, `admin`) matrix of `{resource}:{action}` toggles, showing a realistic
  preset-plus-custom selection (some cells on, some off). Frame the whole grid plus the
  preset selector above it so the effective-set relationship is visible; keep enough of the
  agent form for context.
- **Target page:** `reference/authentication` (§ *Permission model* → *The 5×3 matrix*) —
  the section documenting the 15 permission bits, the presets, and the effective set that
  drives MCP tool visibility and REST gating.
- **Masking:** the agent name (use **Skylark Agent**); any agent/owner UUID in the form or
  URL; the top-bar account identity; the browser URL bar. The permission labels themselves
  are non-sensitive and should stay legible.
- **En** — add the import once, then insert at the *The 5×3 matrix* section:

  ```mdx
  <Screenshot
    src="/images/reference/permission-picker.webp"
    alt="The agent permission-picker grid in Chorus, a 5 resource by 3 action matrix of permission toggles with a preset selector"
    width={1440}
    height={900}
    caption="An agent's effective permissions are chosen in the create/edit form — a preset plus optional custom bits across the 5×3 resource × action matrix."
  />
  ```

- **Zh** — add the import once, then insert at the corresponding section:

  ```mdx
  <Screenshot
    src="/images/reference/permission-picker.webp"
    alt="Chorus 中的智能体权限选择网格：一个 5 类资源 × 3 种操作的权限开关矩阵，并带有预设选择器"
    width={1440}
    height={900}
    caption="智能体的有效权限在创建/编辑表单中选择——一个预设，加上 5×3 资源 × 操作矩阵中可选的自定义权限位。"
  />
  ```

---

## Post-capture checklist (per image)

1. Captured from a **real browser**, English UI, ≥ 1440×900. No synthetic/redrawn UI.
2. All masking applied; **manual full-resolution review** done. No login, email, key,
   token, internal ID, UUID, or private host visible.
3. Exported compressed WebP to `public/images/reference/<name>.webp`.
4. Added the locale-correct import line once per page and inserted the `<Screenshot>`
   snippet on **both** the en and zh page.
5. `width`/`height` match the file's actual intrinsic pixels.
6. Ran `pnpm docs:check` from the repo root — **green** — before committing.
