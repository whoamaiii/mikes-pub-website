import { spawn } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const password = process.env.MIKES_HOSTING_TEST_PASSWORD;
if (!password || !/^[a-f0-9]{64}$/.test(password)) {
  throw new Error('Start the hosting server through playwright.hosting.config.ts.');
}

const directory = mkdtempSync(path.join(tmpdir(), 'mikes-hosting-test-'));
let stopping = false;

try {
  // Keep the project's .dev.vars and developer state out of the test server.
  for (const source of ['dist', 'functions', 'wrangler.jsonc']) {
    cpSync(path.join(root, source), path.join(directory, source), { recursive: true });
  }
  writeFileSync(path.join(directory, '.dev.vars'), `PREVIEW_PASSWORD=${password}\n`, {
    mode: 0o600,
  });

  const server = spawn(
    process.execPath,
    [
      path.join(root, 'node_modules/wrangler/bin/wrangler.js'),
      'pages',
      'dev',
      'dist',
      '--ip',
      '127.0.0.1',
      '--port',
      '8791',
      '--local-protocol',
      'https',
      '--log-level',
      'error',
    ],
    {
      cwd: directory,
      stdio: 'inherit',
      env: {
        ...process.env,
        CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false',
        WRANGLER_SEND_METRICS: 'false',
      },
    },
  );

  const stop = () => {
    stopping = true;
    server.kill('SIGTERM');
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  server.on('error', (error) => {
    rmSync(directory, { recursive: true, force: true });
    throw error;
  });
  server.on('exit', (code) => {
    rmSync(directory, { recursive: true, force: true });
    process.exitCode = stopping ? 0 : (code ?? 1);
  });
} catch (error) {
  rmSync(directory, { recursive: true, force: true });
  throw error;
}
