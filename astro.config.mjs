import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkGfm from 'remark-gfm';
import chorusIcon from './src/assets/chorus-icon.png';
import { gaHeadTags } from './src/lib/analytics.mjs';

const site = process.env.DOCS_SITE_URL ?? 'https://doc.chorus-ai.dev';

// Env-gated GA4 (matches the landing site). Unset/blank => no analytics anywhere,
// so local dev, previews, and internal/demo domains stay analytics-free. Read from
// process.env because astro.config.mjs runs in Node at build time (not import.meta.env).
const gaId = process.env.PUBLIC_GA_MEASUREMENT_ID;

export default defineConfig({
  site,
  output: 'static',
  // All docs content is .mdx. Astro's built-in GitHub-Flavored Markdown (tables,
  // strikethrough, etc.) is NOT applied to the MDX pipeline unless a remark plugin is
  // wired in explicitly — without this, GFM tables render as literal `| … |` text on
  // every page (all four locales). We mount remark-gfm here; MDX inherits it via
  // extendMarkdownConfig (default true), so this one entry fixes the whole site.
  //
  // Note: `markdown.remarkPlugins` is technically deprecated in Astro 6 in favour of
  // `markdown.processor: unified({...})`, but the processor route requires pinning
  // @astrojs/markdown-remark to Astro's exact internal version (a version skew makes
  // its brand-check silently drop the processor → tables break again), so it is more
  // fragile than this. The build already emits the same remarkPlugins-deprecation
  // notice from Starlight's own plugins regardless of this line, so we add no new
  // warning. Revisit when Astro removes the option in a future major.
  markdown: { remarkPlugins: [remarkGfm] },
  integrations: [
    starlight({
      title: 'Chorus',
      description: 'Guides and reference for building with Chorus.',
      favicon: '/favicon.ico',
      logo: {
        src: chorusIcon,
        alt: 'Chorus',
      },
      head: [
        {
          tag: 'link',
          attrs: { rel: 'icon', type: 'image/png', href: '/images/chorus-icon.png' },
        },
        {
          tag: 'link',
          attrs: { rel: 'apple-touch-icon', href: '/images/chorus-icon.png' },
        },
        // Default the site language to the visitor's system locale on first visit and remember
        // an explicit switch (shared `chorus-lang` key with the landing site). Scoped to the
        // locale-home entry points only (/, /zh, /ja, /ko) — deep pages already encode the
        // locale in the URL, and non-English coverage rolls out per section, so a blind deep
        // redirect could 404. Inlined in <head> to run before paint and avoid a flash of the
        // wrong language.
        {
          tag: 'script',
          content: `(function(){try{
  var homes={en:'/',zh:'/zh/',ja:'/ja/',ko:'/ko/'};
  var path=location.pathname.replace(/\\/$/,'')||'/';
  var current=path==='/'?'en':(path==='/zh'?'zh':(path==='/ja'?'ja':(path==='/ko'?'ko':null)));
  if(current===null)return;
  var stored=localStorage.getItem('chorus-lang');
  if(stored&&homes[stored]&&stored!==current){location.replace(homes[stored]);return;}
  if(!stored){
    var lang=(navigator.language||'').toLowerCase();
    var detected=lang.indexOf('zh')===0?'zh':(lang.indexOf('ja')===0?'ja':(lang.indexOf('ko')===0?'ko':'en'));
    if(detected!==current){location.replace(homes[detected]);return;}
  }
}catch(e){}})();`,
        },
        // Google Analytics 4 — injected only when PUBLIC_GA_MEASUREMENT_ID is set.
        // Starlight applies head[] globally, so every locale (/, /zh, /ja, /ko) is covered.
        ...gaHeadTags(gaId),
      ],
      defaultLocale: 'root',
      locales: {
        root: {
          label: 'English',
          lang: 'en',
        },
        zh: {
          label: '简体中文',
          lang: 'zh-CN',
        },
        ja: {
          label: '日本語',
          lang: 'ja',
        },
        ko: {
          label: '한국어',
          lang: 'ko-KR',
        },
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/Chorus-AIDLC/Chorus',
        },
      ],
      customCss: ['./src/styles/custom.css'],
      components: {
        Header: './src/components/Header.astro',
        LanguageSelect: './src/components/LanguageSelect.astro',
      },
      sidebar: [
        {
          label: 'Get started',
          translations: { 'zh-CN': '开始使用', ja: 'はじめに', 'ko-KR': '시작하기' },
          items: [
            {
              slug: 'index',
              label: 'Overview',
              translations: { 'zh-CN': '总览', ja: '概要', 'ko-KR': '개요' },
            },
            { slug: 'guides/getting-started' },
          ],
        },
        {
          label: 'Set up agents',
          translations: { 'zh-CN': '配置智能体', ja: 'エージェントを設定', 'ko-KR': '에이전트 설정' },
          items: [
            { slug: 'guides/administrator-setup' },
            { slug: 'guides/authentication-setup' },
            { slug: 'guides/operator-onboarding' },
            { slug: 'guides/daemon-operations' },
            { slug: 'guides/remote-control' },
            { slug: 'guides/session-recovery' },
            {
              slug: 'guides/online-agents-overview',
              label: 'Online agents overview',
              translations: {
                'zh-CN': '在线智能体总览',
                ja: 'オンラインエージェント概要',
                'ko-KR': '온라인 에이전트 개요',
              },
            },
            { slug: 'guides/troubleshooting' },
            {
              label: 'Agent platforms',
              translations: { 'zh-CN': '智能体平台', ja: 'エージェントプラットフォーム', 'ko-KR': '에이전트 플랫폼' },
              collapsed: true,
              items: [
                { slug: 'reference/agents' },
                { slug: 'reference/agents/claude-code' },
                { slug: 'reference/agents/codex' },
                { slug: 'reference/agents/kiro' },
                { slug: 'reference/agents/openclaw' },
                { slug: 'reference/agents/dsh' },
                { slug: 'reference/agents/opencode' },
                { slug: 'reference/agents/pi' },
                { slug: 'reference/agents/generic-mcp' },
              ],
            },
          ],
        },
        {
          label: 'Use the workspace',
          translations: { 'zh-CN': '使用工作区', ja: 'ワークスペースを使う', 'ko-KR': '워크스페이스 사용' },
          items: [
            { slug: 'guides/account-and-workspace' },
            { slug: 'guides/notifications' },
            { slug: 'guides/activity-stream' },
            { slug: 'guides/manage-agents' },
            { slug: 'guides/find-your-way-around' },
          ],
        },
        {
          label: 'The AI-DLC workflow',
          translations: { 'zh-CN': 'AI-DLC 工作流', ja: 'AI-DLC ワークフロー', 'ko-KR': 'AI-DLC 워크플로' },
          items: [
            { slug: 'guides/ai-dlc-workflow' },
            { slug: 'guides/create-a-project' },
            { slug: 'guides/capture-an-idea' },
            { slug: 'guides/review-a-proposal' },
            { slug: 'guides/run-tasks' },
            { slug: 'guides/verify-and-complete' },
            { slug: 'guides/create-and-edit-entities' },
            { slug: 'guides/documents' },
            { slug: 'guides/references' },
          ],
        },
        {
          label: 'Plugins & commands',
          translations: { 'zh-CN': '插件与命令', ja: 'プラグインとコマンド', 'ko-KR': '플러그인과 명령' },
          items: [
            { slug: 'guides/plugin-commands' },
            { slug: 'guides/plugin-automation' },
            { slug: 'guides/openspec-mode' },
          ],
        },
        {
          label: 'Reference',
          translations: { 'zh-CN': '参考', ja: '参考', 'ko-KR': '참고' },
          items: [
            { slug: 'reference/workflow' },
            { slug: 'reference/lifecycle' },
            { slug: 'reference/collaboration' },
            { slug: 'reference/search' },
            { slug: 'reference/resource-graph' },
            { slug: 'reference/authentication' },
            { slug: 'reference/mcp-tools' },
            { slug: 'reference/realtime' },
            { slug: 'reference/glossary' },
          ],
        },
        {
          label: 'Deploy & self-host',
          translations: { 'zh-CN': '部署与自托管', ja: 'デプロイとセルフホスト', 'ko-KR': '배포와 셀프 호스팅' },
          items: [
            { slug: 'guides/deployment-overview' },
            { slug: 'guides/deploy-docker' },
            { slug: 'guides/deploy-production' },
            { slug: 'guides/deploy-operations' },
          ],
        },
      ],
    }),
  ],
});
