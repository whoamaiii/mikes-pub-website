import { execFileSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

const root = fileURLToPath(new URL('../..', import.meta.url));

describe('repository policy', () => {
  test('is private to npm and pinned to the approved Node major', async () => {
    const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')) as {
      private?: boolean;
      license?: string;
      engines?: { node?: string };
      packageManager?: string;
    };

    expect(manifest.private).toBe(true);
    expect(manifest.license).toBe('UNLICENSED');
    expect(manifest.engines?.node).toBe('>=24.18.0 <25');
    expect(manifest.packageManager).toBe('npm@11.16.0');
  });

  test('tracks no environment or Finder metadata files', () => {
    const trackedFiles = execFileSync('git', ['ls-files', '-z'], {
      cwd: root,
      encoding: 'utf8',
    })
      .split('\0')
      .filter(Boolean);
    const forbidden = trackedFiles.filter((file) => {
      const basename = file.split('/').at(-1) ?? file;
      return (
        basename === '.DS_Store' ||
        file.split('/').includes('.direnv') ||
        (basename.startsWith('.env') && basename !== '.env.example')
      );
    });

    expect(forbidden).toEqual([]);
  });

  test('pins remote GitHub Actions to immutable commit SHAs', async () => {
    const workflowDirectory = path.join(root, '.github/workflows');
    const workflowFiles = (await readdir(workflowDirectory)).filter(
      (file) => file.endsWith('.yml') || file.endsWith('.yaml'),
    );
    const actionReferences = (
      await Promise.all(
        workflowFiles.map(async (file) => {
          const workflow = await readFile(path.join(workflowDirectory, file), 'utf8');
          return [...workflow.matchAll(/^\s*(?:-\s*)?uses:\s*(\S+)/gm)].map((match) => match[1]);
        }),
      )
    )
      .flat()
      .filter((reference): reference is string => reference !== undefined)
      .filter((reference) => !reference.startsWith('./') && !reference.startsWith('docker://'));

    expect(actionReferences.length).toBeGreaterThan(0);
    expect(actionReferences.every((reference) => /@[0-9a-f]{40}$/.test(reference))).toBe(true);
  });

  test('keeps product pages empty until their dedicated implementation issues', async () => {
    const pageFiles = await readdir(path.join(root, 'src/pages'));
    expect(pageFiles).toEqual(['.gitkeep']);
  });
});
