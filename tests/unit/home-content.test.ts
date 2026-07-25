import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

const root = fileURLToPath(new URL('../..', import.meta.url));

const approvedDerivativeHashes = {
  'src/assets/images/mikes-pub-exterior-desktop.webp':
    '1aceb4537abd7b75e6ae8581c7b05518fb4d7490593f818fe10133c9cc5a72d2',
  'src/assets/images/mikes-pub-exterior-mobile.webp':
    '4ecbb2654825a592ea25fe27b6bc277648a89e79d08b0233286b7bd66ddd96de',
} as const;

const demoGalleryDerivativeHashes = {
  'src/assets/images/mikes-pub-facebook-interior.webp':
    '0018667d28e731f5641b7be0c316e4946cdc67a7eda7b37aedd8e821d250f890',
  'src/assets/images/mikes-pub-facebook-quiz-night.webp':
    '89e31fcc8ff2babee148166195710541536cffb23c948e543aa14afb09b1ff7e',
  'src/assets/images/mikes-pub-facebook-screen-night.webp':
    '4cf405ce67b5e5f6faa0ee623ee2bbdcb498ca9cd740269ddf5a002ea62e63a7',
} as const;

describe('WHO-18 Home policy', () => {
  test('pins the approved exterior derivative bytes', async () => {
    for (const [relativePath, expectedHash] of Object.entries(approvedDerivativeHashes)) {
      const bytes = await readFile(path.join(root, relativePath));
      const actualHash = createHash('sha256').update(bytes).digest('hex');
      expect(actualHash, relativePath).toBe(expectedHash);
    }
  });

  test('pins the private-demo Facebook gallery derivative bytes', async () => {
    for (const [relativePath, expectedHash] of Object.entries(demoGalleryDerivativeHashes)) {
      const bytes = await readFile(path.join(root, relativePath));
      const actualHash = createHash('sha256').update(bytes).digest('hex');
      expect(actualHash, relativePath).toBe(expectedHash);
    }
  });

  test('keeps local source masters and references outside Git', () => {
    const trackedFiles = execFileSync('git', ['ls-files'], {
      cwd: root,
      encoding: 'utf8',
    })
      .split('\n')
      .filter(Boolean);

    expect(trackedFiles.some((file) => /\.tiff?$/i.test(file))).toBe(false);
    expect(trackedFiles).not.toContain('MIKESUTE');
    expect(trackedFiles).not.toContain('MIKESUTE.png');
    expect(trackedFiles.some((file) => file.startsWith('design-reference/'))).toBe(false);
  });

  test('documents source integrity, transformation and production approval', async () => {
    const provenance = await readFile(path.join(root, 'docs/assets/home-assets.md'), 'utf8');

    expect(provenance).toContain(
      '0df92268d913da3a165ff26d943133c5d213dc126d670101bae5124df05c95e3',
    );
    for (const hash of Object.values(approvedDerivativeHashes)) {
      expect(provenance).toContain(hash);
    }
    for (const hash of Object.values(demoGalleryDerivativeHashes)) {
      expect(provenance).toContain(hash);
    }
    expect(provenance).toContain('have not been independently audited');
    expect(provenance).toContain(
      'approved this exact image and its derivatives for production use',
    );
    expect(provenance).toContain('must not be committed');
    expect(provenance).toContain('demo-cleared');
    expect(provenance).toContain('must not be reused in an official');
  });
});
