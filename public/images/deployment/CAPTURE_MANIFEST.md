# Deployment screenshot capture manifest

> **Status: deferred — not yet captured.** The two screenshots below are a **human
> follow-up**. They were intentionally left out of the initial documentation change because
> capturing and redacting authentication surfaces safely requires a real browser and a
> manual full-resolution review that a headless authoring run cannot perform. Until a human
> captures them, the two target pages carry prose only — **no `<Screenshot>` component and
> no `.webp` file exist yet**, and none must be added except together (see the gate-safe
> rule below). This document is the recipe so the follow-up is deterministic and one
> gate-safe edit per image.

This manifest records the fictitious demo setup to reproduce and the two in-scope
screenshots, so a human can capture and wire each image **and** its `<Screenshot>`
component in one gate-safe edit.

> **Do not commit this to `dist/`-linked prose.** This is a working document under
> `public/images/deployment/`. It is never referenced by a page, so it does not affect the
> link check.

## Scope (per elaboration Q4 = B)

Only **two** screenshots are in scope for the deployment module — both are first-run
authentication surfaces that a self-hoster sees while bootstrapping access:

1. The **first-login sign-in page** (`/login`, built-in default login).
2. The **SuperAdmin panel / OIDC configuration page** (`/admin`, where per-company SSO is
   configured).

Everything else in the Deploy & self-host guides stays prose-only. Do not add further
screenshots under this scope.

## Gate-safe rule (read first)

`packages/docs/scripts/check-links.mjs` extracts every `src` from the built HTML and
**fails the build** when a same-origin image URL has no file in `dist/`. `Screenshot.astro`
renders a plain `<img src=…>`. Therefore:

1. **A `<Screenshot>` component and its `.webp` file are added together, or neither is
   added.** Never leave a `<Screenshot>` pointing at a missing file. Because both images are
   currently deferred, the correct state right now is **neither present** — the pages hold
   prose only.
2. Each image belongs on **both** the English page and its Chinese counterpart (identical
   `src` path, locale-appropriate `alt`/`caption`). Add the file once; reference it from
   both pages.
3. After adding image(s) + component(s), re-run `pnpm docs:check` from the repo root and
   confirm it is green **before** committing.
4. No synthetic, redrawn, or composited UI. Capture the real running Chorus login and admin
   pages in a browser; text-only redaction inside the real rendered UI is allowed, synthetic
   UI is not. Do **not** reuse `public/images/chorus-workflow-demo.webp` (it predates the
   screenshot rule; see `AUTHORING.md`).

## Capture format (from `AUTHORING.md`)

- Real browser render of the **English** Chorus UI. (Capture the English UI even for the
  Chinese pages — the `zh` pages reuse the same English-UI image with Chinese alt text.)
- Desktop viewport **1440×900 or larger**; labels must stay legible after responsive
  scaling.
- Frame at page / primary-workspace scale so the page context is visible; a full form or
  panel may be the boundary when it is the task surface, but keep enough of the page for
  context. Never crop to one or two isolated controls.
- Export **compressed WebP** (target well under ~60 KB, matching the sibling
  `public/images/agent-operations/*.webp` files, which are 36–47 KB).
- Pass the image's **exact intrinsic pixel width/height** to the component. If you capture
  at 1440×900 use `width={1440} height={900}`. If you capture at 2× (e.g. 2880×1800) pass
  those actual numbers instead — the component throws on non-integer/zero and the numbers
  keep layout stable while the image loads.
- Perform a **manual full-resolution redaction review** after masking. Automated checks do
  not prove an image is safe to publish. These are **authentication** surfaces, so redaction
  is the whole point — treat any real value as a leak.

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

Both in-scope screenshots land on the **same page** (`guides/deploy-operations.mdx` and its
zh counterpart), so add the import line **only once per page** even though the page carries
two screenshots.

---

## The demo setup (reproduce this first)

Both captures come from a **public demo Chorus instance you control** — never a real
workspace, customer, or production deployment. Use only the fictitious, obviously-fake
values below. No real emails, hosts, keys, issuer URLs, client IDs, or UUIDs may appear in
the final image, masked or otherwise.

**Fictitious identities (use consistently):**

| Role | Fictitious value | Notes |
| --- | --- | --- |
| Deployment hostname (browser URL, page copy) | **`chorus.demo.example`** | `example`/`.example` is reserved and non-routable. If the real host shows in the URL bar or anywhere on the page, mask or crop it. |
| Built-in first-login account (`DEFAULT_USER`) | **`admin@demo.example`** | The bootstrap email/password account on `/login`. Type this fake email into the form; never a real address. |
| SuperAdmin account (`SUPER_ADMIN_EMAIL`) | **`superadmin@demo.example`** | The account signed in on `/admin`. Mask the real one everywhere it appears (top bar, form field, any header). |
| Demo company / tenant | **Demo Company** | The company whose OIDC config is shown on the admin panel. |
| OIDC issuer URL (admin config field) | **`https://id.demo.example/`** | Fictional issuer. Mask any real issuer URL (it names your IdP tenant). |
| OIDC client ID (admin config field) | **`demo-client-id`** | Obviously fake. Mask any real client ID. |

**Setup:**

1. Stand up a throwaway Chorus with the built-in login enabled (`DEFAULT_USER` /
   `DEFAULT_PASSWORD`) and the SuperAdmin bootstrap set (`SUPER_ADMIN_EMAIL` /
   `SUPER_ADMIN_PASSWORD_HASH`), so both `/login` and `/admin` render with the demo values
   above. See the target page, `guides/deploy-operations.mdx`, for exactly which env vars
   drive each surface.
2. Capture the **English** UI (set the locale to English before capturing).
3. Redact per the per-screenshot masking below, then do a manual full-resolution review.

**Global masking (apply to both captures), per `AUTHORING.md`:**

- Any **real email address** — replace with the fictitious `…@demo.example` values above.
- The browser **URL bar** and any on-page hostname that is not `chorus.demo.example` (the
  URL bar can expose the real host and, on `/admin`, entity UUIDs) — crop it out or mask it.
- Any **OIDC issuer URL, client ID**, discovery URL, or IdP tenant name.
- Any **API key / `cho_…` token**, session ID, internal serial ID, UUID, or password hash.
- Any real teammate names or company names — use **Demo Company** and the fictitious
  accounts only.

Generic labels, field prompts, and empty-state text are fine to leave.

---

## Capture list (both deferred)

Two required captures, both embedded on the **operations** guide. All paths are under
`/images/deployment/`. Add the import line only once per page.

| # | Image (`/images/deployment/…`) | Surface | En page (section) | Zh page (section) |
| --- | --- | --- | --- | --- |
| 1 | `first-login.webp` | `/login` built-in email/password sign-in form | `guides/deploy-operations.mdx` (§ Bootstrap first access) | `zh/guides/deploy-operations.mdx` (§ 引导首次访问) |
| 2 | `superadmin-oidc-config.webp` | `/admin` SuperAdmin panel: per-company OIDC/SSO configuration | `guides/deploy-operations.mdx` (§ Configure deployment-side authentication → Single sign-on (OIDC)) | `zh/guides/deploy-operations.mdx` (§ 配置部署侧的认证 → 单点登录（OIDC）) |

To place each image, add the import line once at the top of the page (if not already
present), then insert the matching `<Screenshot>` snippet below into the named section on
**both** the en and zh page — creating the `.webp` file in the same edit.

---

### 1. `first-login.webp`

- **Surface:** the `/login` page showing the built-in **email/password** sign-in form that
  appears when `DEFAULT_USER` and `DEFAULT_PASSWORD` are set. Frame the whole form (email
  field, password field, submit button) at page scale. If the email field is pre-filled or
  typed, it must read `admin@demo.example`.
- **Target page:** `guides/deploy-operations.mdx`, **§ Bootstrap first access** (zh:
  `zh/guides/deploy-operations.mdx`, **§ 引导首次访问**).
- **Masking:** any real email in the field or page → `admin@demo.example`; the browser URL
  bar / any real hostname → `chorus.demo.example` or cropped; no tokens, IDs, or hashes
  visible.
- **En** — add the import once, then place in **§ Bootstrap first access**:

  ```mdx
  <Screenshot
    src="/images/deployment/first-login.webp"
    alt="Chorus /login page showing the built-in email and password sign-in form for first access"
    width={1440}
    height={900}
    caption="With DEFAULT_USER and DEFAULT_PASSWORD set, the login page shows a built-in email/password form for the first sign-in."
  />
  ```

- **Zh** — add the import once, then place in **§ 引导首次访问**:

  ```mdx
  <Screenshot
    src="/images/deployment/first-login.webp"
    alt="Chorus /login 页面，展示用于首次访问的内置邮箱/密码登录表单"
    width={1440}
    height={900}
    caption="设置 DEFAULT_USER 与 DEFAULT_PASSWORD 后，登录页会显示用于首次登录的内置邮箱/密码表单。"
  />
  ```

### 2. `superadmin-oidc-config.webp`

- **Surface:** the `/admin` SuperAdmin panel on the screen where **per-company OIDC / SSO**
  is configured — the issuer, client ID, and enable toggle for **Demo Company**. Frame the
  panel with enough chrome to show it is the admin panel, not a company-side setting.
- **Target page:** `guides/deploy-operations.mdx`, **§ Configure deployment-side
  authentication → Single sign-on (OIDC)** (zh: `zh/guides/deploy-operations.mdx`,
  **§ 配置部署侧的认证 → 单点登录（OIDC）**).
- **Masking:** the SuperAdmin email in the top bar / header → `superadmin@demo.example`;
  the OIDC **issuer URL** → `https://id.demo.example/`; the **client ID** → `demo-client-id`;
  the company → **Demo Company**; the URL bar (it can expose the host and UUIDs) → masked or
  cropped; no session IDs, internal identifiers, or password hashes visible.
- **En** — add the import once (if not already present from #1), then place in
  **§ Configure deployment-side authentication → Single sign-on (OIDC)**:

  ```mdx
  <Screenshot
    src="/images/deployment/superadmin-oidc-config.webp"
    alt="Chorus /admin SuperAdmin panel configuring per-company OIDC single sign-on with an issuer, client ID, and enable toggle"
    width={1440}
    height={900}
    caption="The SuperAdmin configures OIDC per company from the /admin panel — issuer, client ID, and an enable toggle; PKCE means no client secret."
  />
  ```

- **Zh** — add the import once (if not already present from #1), then place in
  **§ 配置部署侧的认证 → 单点登录（OIDC）**:

  ```mdx
  <Screenshot
    src="/images/deployment/superadmin-oidc-config.webp"
    alt="Chorus /admin 超级管理员面板，按公司配置 OIDC 单点登录，包含 issuer、client ID 和启用开关"
    width={1440}
    height={900}
    caption="超级管理员在 /admin 面板按公司配置 OIDC——issuer、client ID 和启用开关；采用 PKCE，无需 client secret。"
  />
  ```

---

## Post-capture checklist (per image)

1. Captured from a **real browser**, English UI, ≥ 1440×900. No synthetic/redrawn UI.
2. All masking applied; **manual full-resolution review** done. No real email, hostname,
   issuer URL, client ID, key, token, password hash, internal ID, or UUID visible. These
   are auth surfaces — any real value is a leak.
3. Exported compressed WebP to `public/images/deployment/<name>.webp`.
4. Added the `<Screenshot>` snippet into the named section on **both** the en and zh page,
   and added the locale-correct import line once per page (only once even though both images
   share the page).
5. `width`/`height` match the file's actual intrinsic pixels.
6. Ran `pnpm docs:check` from the repo root — **green** — before committing.
