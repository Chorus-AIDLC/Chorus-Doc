// Google Analytics 4 head-tag builder for the documentation site.
//
// Mirrors the landing site's env-gated pattern (packages/landing/src/layouts/
// Layout.astro): analytics is injected only when a measurement id is present, so
// local development, previews, and internal/demo domains stay analytics-free with
// no runtime logic — they simply leave `PUBLIC_GA_MEASUREMENT_ID` unset.
//
// The docs site is Starlight, which owns the document <head>, so injection is via
// the `head[]` array in `astro.config.mjs` rather than a custom Layout. This pure
// function returns Starlight `head[]` entries ({ tag, attrs?, content? }) so it can
// be spread directly into that array and unit-tested without running Astro.

/**
 * Build the GA4 `head[]` entries for a measurement id.
 *
 * @param {string | undefined | null} measurementId - e.g. `G-XXXXXXXXXX`.
 * @returns {Array<{ tag: string, attrs?: Record<string, unknown>, content?: string }>}
 *   An empty array when the id is missing or blank; otherwise the async `gtag.js`
 *   loader followed by the inline initializer.
 */
export function gaHeadTags(measurementId) {
  const id = (measurementId ?? '').trim();
  if (!id) return [];
  return [
    {
      tag: 'script',
      attrs: {
        async: true,
        src: `https://www.googletagmanager.com/gtag/js?id=${id}`,
      },
    },
    {
      tag: 'script',
      content:
        'window.dataLayer = window.dataLayer || [];' +
        'function gtag(){dataLayer.push(arguments);}' +
        "gtag('js', new Date());" +
        `gtag('config', ${JSON.stringify(id)});`,
    },
  ];
}
