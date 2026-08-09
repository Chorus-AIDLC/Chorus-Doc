import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const read = (file) => readFile(path.join(repositoryRoot, file), "utf8");

const wrangler = await read("wrangler.jsonc");
assert.match(wrangler, /"pages_build_output_dir"\s*:\s*"\.\/dist"/);

const prWorkflow = await read(".github/workflows/docs-pr.yml");
assert.match(prWorkflow, /permissions:\s*\n\s+contents: read/);
assert.match(prWorkflow, /run: pnpm check/);
assert.doesNotMatch(prWorkflow, /CLOUDFLARE_API_TOKEN|secrets\./);

const deployWorkflow = await read(".github/workflows/docs-deploy.yml");
assert.match(deployWorkflow, /workflow_dispatch:/);
assert.match(deployWorkflow, /environment:\s*\n\s+name: docs-production/);
assert.match(deployWorkflow, /DOCS_SITE_URL: \$\{\{ vars\.DOCS_SITE_URL \}\}/);
assert.match(
  deployWorkflow,
  /CLOUDFLARE_ACCOUNT_ID: \$\{\{ vars\.CLOUDFLARE_ACCOUNT_ID \}\}/,
);
assert.match(
  deployWorkflow,
  /CLOUDFLARE_PROJECT_NAME: \$\{\{ vars\.CLOUDFLARE_PROJECT_NAME \}\}/,
);
assert.match(
  deployWorkflow,
  /CLOUDFLARE_API_TOKEN: \$\{\{ secrets\.CLOUDFLARE_API_TOKEN \}\}/,
);
assert.match(
  deployWorkflow,
  /PUBLIC_GA_MEASUREMENT_ID: \$\{\{ vars\.PUBLIC_GA_MEASUREMENT_ID \}\}/,
  "deploy workflow must forward the optional GA4 measurement id from environment vars",
);
// The GA4 variable is optional (unset = analytics off), so it must NOT join the
// required-variable validation loop, which would otherwise force analytics on.
assert.doesNotMatch(
  deployWorkflow,
  /for name in [^\n]*PUBLIC_GA_MEASUREMENT_ID/,
  "the GA4 measurement id must stay optional, not required",
);

const checkPosition = deployWorkflow.indexOf("run: pnpm check");
const deployPosition = deployWorkflow.indexOf(
  "pnpm exec wrangler pages deploy dist",
);
assert(checkPosition >= 0, "deployment workflow must run pnpm check");
assert(
  deployPosition > checkPosition,
  "deployment must happen after pnpm check",
);

console.log("Deployment configuration contract verified without publishing.");
