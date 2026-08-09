export const SUPPORT_LEVELS = Object.freeze({
  FIRST_PARTY: 'first-party',
  COMMUNITY: 'community',
  LIMITED: 'limited',
});

const capability = (supported, evidence, note = null) =>
  Object.freeze({ supported, evidence: Object.freeze(evidence), note });

export const AGENT_SUPPORT_MATRIX = Object.freeze([
  Object.freeze({
    id: 'claude-code',
    name: 'Claude Code',
    support: SUPPORT_LEVELS.FIRST_PARTY,
    capabilities: Object.freeze({
      mcpTools: capability(true, ['public/chorus-plugin/.mcp.json']),
      chorusSkills: capability(true, ['public/chorus-plugin/skills/chorus/SKILL.md']),
      lifecycleHooks: capability(true, ['public/chorus-plugin/hooks/hooks.json']),
      daemonWake: capability(true, ['cli/daemon-agent.mjs', 'cli/__tests__/daemon-agent.test.mjs']),
      remoteControl: capability(true, ['cli/waker.mjs', 'cli/__tests__/control-handler.test.mjs']),
      sessionRecovery: capability(true, ['cli/claude-spawner.mjs']),
    }),
  }),
  Object.freeze({
    id: 'codex',
    name: 'Codex',
    support: SUPPORT_LEVELS.FIRST_PARTY,
    capabilities: Object.freeze({
      mcpTools: capability(true, ['public/install-codex.sh', 'docs/CONNECT_CODEX.md']),
      chorusSkills: capability(true, ['plugins/chorus/skills/chorus/SKILL.md']),
      lifecycleHooks: capability(
        true,
        ['plugins/chorus/hooks.json'],
        'Stateless hooks only; sub-agent session lifecycle remains manual.',
      ),
      daemonWake: capability(true, ['cli/codex-spawner.mjs', 'cli/__tests__/codex-backend-integration.test.mjs']),
      remoteControl: capability(true, ['cli/waker.mjs', 'cli/__tests__/control-handler.test.mjs']),
      sessionRecovery: capability(true, ['cli/codex-spawner.mjs']),
    }),
  }),
  Object.freeze({
    id: 'kiro',
    name: 'Kiro',
    support: SUPPORT_LEVELS.FIRST_PARTY,
    capabilities: Object.freeze({
      mcpTools: capability(true, ['public/kiro-plugin/.kiro/settings/mcp.json']),
      chorusSkills: capability(true, ['public/kiro-plugin/.kiro/skills/chorus-develop/SKILL.md']),
      lifecycleHooks: capability(true, ['public/kiro-plugin/.kiro/agents/chorus.json']),
      daemonWake: capability(true, ['cli/kiro-spawner.mjs', 'cli/__tests__/kiro-backend-integration.test.mjs']),
      remoteControl: capability(true, ['cli/waker.mjs', 'cli/__tests__/control-handler.test.mjs']),
      sessionRecovery: capability(true, ['cli/kiro-spawner.mjs']),
    }),
  }),
  Object.freeze({
    id: 'pi',
    name: 'Pi',
    support: SUPPORT_LEVELS.FIRST_PARTY,
    capabilities: Object.freeze({
      mcpTools: capability(true, ['packages/chorus-pi/README.md']),
      chorusSkills: capability(true, ['packages/chorus-pi/skills/chorus/SKILL.md']),
      lifecycleHooks: capability(true, ['packages/chorus-pi/extensions/chorus.ts']),
      daemonWake: capability(false, ['cli/daemon-agent.mjs'], 'Pi is not a Chorus CLI daemon backend.'),
      remoteControl: capability(false, ['cli/daemon-agent.mjs']),
      sessionRecovery: capability(false, ['cli/daemon-agent.mjs']),
    }),
  }),
  Object.freeze({
    id: 'openclaw',
    name: 'OpenClaw',
    support: SUPPORT_LEVELS.FIRST_PARTY,
    capabilities: Object.freeze({
      mcpTools: capability(true, ['packages/openclaw-plugin/src/mcp-registration.ts']),
      chorusSkills: capability(true, ['packages/openclaw-plugin/skills/chorus/SKILL.md']),
      lifecycleHooks: capability(
        false,
        ['packages/openclaw-plugin/skills/chorus/SKILL.md'],
        'Workflow sub-agent sessions are manual; the plugin still runs a native background service.',
      ),
      daemonWake: capability(true, ['packages/openclaw-plugin/src/wake.ts']),
      remoteControl: capability(true, ['packages/openclaw-plugin/src/control-handler.ts']),
      sessionRecovery: capability(true, ['packages/openclaw-plugin/src/__tests__/daemon-loop.e2e.test.ts']),
    }),
  }),
  Object.freeze({
    id: 'opencode',
    name: 'OpenCode',
    support: SUPPORT_LEVELS.COMMUNITY,
    implementationUrl: 'https://github.com/etnperlong/opencode-chorus',
    capabilities: Object.freeze({
      mcpTools: capability(true, ['docs/CONNECT_OPENCODE.md']),
      chorusSkills: capability(true, ['docs/CONNECT_OPENCODE.md']),
      lifecycleHooks: capability(true, ['docs/CONNECT_OPENCODE.md'], 'Provided by the community package.'),
      daemonWake: capability(false, ['cli/daemon-agent.mjs']),
      remoteControl: capability(false, ['cli/daemon-agent.mjs']),
      sessionRecovery: capability(false, ['cli/daemon-agent.mjs']),
    }),
  }),
  Object.freeze({
    id: 'generic-mcp',
    name: 'Generic MCP client',
    support: SUPPORT_LEVELS.LIMITED,
    capabilities: Object.freeze({
      mcpTools: capability(true, ['docs/CONNECT_OTHER_AGENTS.md']),
      chorusSkills: capability(false, ['docs/CONNECT_OTHER_AGENTS.md'], 'Clients may read the public skill, but no package installs it.'),
      lifecycleHooks: capability(false, ['docs/CONNECT_OTHER_AGENTS.md']),
      daemonWake: capability(false, ['cli/daemon-agent.mjs']),
      remoteControl: capability(false, ['cli/daemon-agent.mjs']),
      sessionRecovery: capability(false, ['cli/daemon-agent.mjs']),
    }),
  }),
]);

const routePair = (slug) => Object.freeze({ en: `/${slug}/`, zh: `/zh/${slug}/` });

export const AGENT_DOC_ROUTES = Object.freeze({
  roleEntrypoints: Object.freeze({
    administrator: routePair('guides/administrator-setup'),
    operator: routePair('guides/operator-onboarding'),
  }),
  sharedGuides: Object.freeze({
    daemonOperations: routePair('guides/daemon-operations'),
    remoteControl: routePair('guides/remote-control'),
    recovery: routePair('guides/session-recovery'),
    troubleshooting: routePair('guides/troubleshooting'),
  }),
  platforms: Object.freeze(
    Object.fromEntries(
      AGENT_SUPPORT_MATRIX.map(({ id }) => [id, routePair(`reference/agents/${id}`)]),
    ),
  ),
});

export const PLATFORM_CHAPTER_SECTIONS = Object.freeze([
  'support-status',
  'prerequisites',
  'credentials-and-permissions',
  'install-and-configure',
  'verify-connection',
  'runtime-controls',
  'recovery',
  'troubleshooting',
]);

export const SHARED_CONTENT_LINKS = Object.freeze({
  credentialCreation: AGENT_DOC_ROUTES.roleEntrypoints.administrator,
  daemonOperations: AGENT_DOC_ROUTES.sharedGuides.daemonOperations,
  remoteControl: AGENT_DOC_ROUTES.sharedGuides.remoteControl,
  recovery: AGENT_DOC_ROUTES.sharedGuides.recovery,
  troubleshooting: AGENT_DOC_ROUTES.sharedGuides.troubleshooting,
});

export const SAFE_EXAMPLE_VALUES = Object.freeze({
  chorusUrl: 'https://chorus.example.com',
  apiKey: 'cho_REDACTED',
  login: 'demo-operator',
  email: 'operator@example.com',
  agentUuid: '00000000-0000-4000-8000-000000000001',
  projectUuid: '00000000-0000-4000-8000-000000000002',
  cwd: '/home/demo/workspace',
  host: 'agent-host.example.com',
});

export const SAFETY_WARNING_TOPICS = Object.freeze([
  'one-time-secret-visibility',
  'least-privilege-permissions',
  'credential-file-mode-0600',
  'shell-history-and-environment-exposure',
  'allowed-cwd-roots',
  'log-redaction',
  'credential-rotation-and-revocation',
]);
