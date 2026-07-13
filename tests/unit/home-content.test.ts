import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

const root = fileURLToPath(new URL('../..', import.meta.url));

const approvedDerivativeHashes = {
  'src/assets/images/mikes-pub-exterior-desktop.webp':
    'cb218b6a662d9ba67ac912b2c24792684b8734d9e3560d403f046ab2f733ea16',
  'src/assets/images/mikes-pub-exterior-mobile.webp':
    '58456c4566d911822c43de4478c0383a822a9e4011c7284ca514c4c791c9eedc',
} as const;

describe('WHO-18 Home policy', () => {
  test('pins the approved exterior derivative bytes', async () => {
    for (const [relativePath, expectedHash] of Object.entries(approvedDerivativeHashes)) {
      const bytes = await readFile(path.join(root, relativePath));
      const actualHash = createHash('sha256').update(bytes).digest('hex');
      expect(actualHash, relativePath).toBe(expectedHash);
    }
  });

  test('keeps the TIFF master and local references outside Git', () => {
    const trackedFiles = execFileSync('git', ['ls-files'], {
      cwd: root,
      encoding: 'utf8',
    })
      .split('\n')
      .filter(Boolean);

    expect(trackedFiles.some((file) => /\.tiff?$/i.test(file))).toBe(false);
    expect(trackedFiles.some((file) => file.startsWith('design-reference/'))).toBe(false);
  });

  test('documents source integrity and non-generative transformation', async () => {
    const provenance = await readFile(path.join(root, 'docs/assets/home-assets.md'), 'utf8');

    expect(provenance).toContain(
      '4ce32467e449def948337339cf0eea83efff4154b5edcf86b7feac4d02800b26',
    );
    for (const hash of Object.values(approvedDerivativeHashes)) {
      expect(provenance).toContain(hash);
    }
    expect(provenance).toContain('No generative editing');
    expect(provenance).toContain('must not be committed');
  });
});
