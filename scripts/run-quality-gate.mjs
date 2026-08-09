import { spawn } from 'node:child_process';
import process from 'node:process';

const stages = [
  ['content and route metadata', 'pnpm', ['content:check']],
  ['Astro types', 'pnpm', ['exec', 'astro', 'check']],
  ['production build and generated artifacts', 'pnpm', ['build']],
  ['quality-gate failure contracts', 'pnpm', ['test:quality-gate']],
  ['internal and controlled external links', 'pnpm', ['check:links']],
  ['responsive, keyboard, and accessibility baseline', 'pnpm', ['check:browser']],
];

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      env: process.env,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('exit', (code, signal) => resolve(code ?? (signal ? 1 : 0)));
    child.on('error', () => resolve(1));
  });
}

for (const [name, command, args] of stages) {
  console.log(`\n[docs:check] ${name}`);
  if (process.env.DOCS_CHECK_TEST_FAIL_STAGE === name) {
    console.error(`[docs:check] injected failure: ${name}`);
    process.exit(1);
  }
  const code = await run(command, args);
  if (code !== 0) {
    console.error(`[docs:check] failed: ${name}`);
    process.exit(code);
  }
}

console.log('\n[docs:check] all quality gates passed');
