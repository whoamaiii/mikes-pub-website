import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

const root = fileURLToPath(new URL('../..', import.meta.url));

const approvedHashes = {
  'LICENSES/barlow-condensed-OFL-1.1.txt':
    '186d750eb496a4c17a76385f82be6aea2ac1cf2de074a811d63786cf374ea73f',
  'LICENSES/source-sans-3-OFL-1.1.md':
    '89ad2c4f66dd29127527493e729c31e731f111cf10faf5774c3db9275ed0c22c',
  'public/fonts/barlow-condensed/BarlowCondensed-Bold.woff2':
    'b8c0e6116eab19c30e2529326bc6a459e7c851a9881acc7215dab22ec8014176',
  'public/fonts/barlow-condensed/BarlowCondensed-Medium.woff2':
    '8b0b644245c0dcb466ef855f77ae775fe6b441a02ae9bc8d5b1740014682798b',
  'public/fonts/barlow-condensed/BarlowCondensed-SemiBold.woff2':
    '21a97c42410e968fbb5bd5d413ad1da01c21d1efce0eb51f03cdcbc899c51459',
  'public/fonts/source-sans-3/SourceSans3-Bold.ttf.woff2':
    '8d35c6d40e750a4ee23bbbba2bd604ad098d172907369b43281507e16b8e2e7a',
  'public/fonts/source-sans-3/SourceSans3-Regular.ttf.woff2':
    '53492fb3a0def77354f166a55d09b63a10855e91c206c7620a81cf56e97f8ec3',
  'public/fonts/source-sans-3/SourceSans3-Semibold.ttf.woff2':
    '47b9b661b9f395fe7f0d0e119637fba5c8dad97bde3df60066fd24229c0792f4',
} as const;

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
    }),
  );

  return files.flat();
}

describe('design-system policy', () => {
  test('pins the approved font and licence bytes by SHA-256', async () => {
    for (const [relativePath, expectedHash] of Object.entries(approvedHashes)) {
      const bytes = await readFile(path.join(root, relativePath));
      const actualHash = createHash('sha256').update(bytes).digest('hex');
      expect(actualHash, relativePath).toBe(expectedHash);
    }
  });

  test('keeps WHO-10 palette values and semantic aliases centralized', async () => {
    const tokens = await readFile(path.join(root, 'src/styles/tokens.css'), 'utf8');
    const expectedTokens = {
      '--color-facade': '#101310',
      '--color-green': '#003e2f',
      '--color-gold': '#d6a84b',
      '--color-cream': '#f1e9d8',
      '--color-lantern': '#d88a32',
      '--color-muted': '#c8c0b2',
      '--color-error': '#ff9b8f',
      '--color-info': '#8dc6ff',
    };

    for (const [token, value] of Object.entries(expectedTokens)) {
      expect(tokens).toContain(`${token}: ${value};`);
    }

    expect(tokens).toContain('--text-on-accent: var(--color-facade);');
    expect(tokens).toContain('--focus-ring: var(--color-cream);');
    expect(tokens.match(/font-display:\s*swap;/g)).toHaveLength(6);
    expect(tokens).toContain("--font-display: 'Barlow Condensed', 'Arial Narrow', sans-serif;");
    expect(tokens).toMatch(/--font-body:\s*'Source Sans 3',\s*system-ui/);
  });

  test('keeps component CSS on semantic colors and approved breakpoints', async () => {
    const stylesDirectory = path.join(root, 'src/styles');
    const styleFiles = await listFiles(stylesDirectory);
    const componentStyleFiles = styleFiles.filter((file) => !file.endsWith('tokens.css'));
    const componentStyles = (
      await Promise.all(componentStyleFiles.map((file) => readFile(file, 'utf8')))
    ).join('\n');

    expect(componentStyles.match(/#[0-9a-f]{3,8}\b/gi) ?? []).toEqual([]);

    const mediaBreakpoints = [...componentStyles.matchAll(/@media \(width >= ([^)]+)\)/g)].map(
      (match) => match[1],
    );
    expect(mediaBreakpoints.length).toBeGreaterThan(0);
    expect(
      mediaBreakpoints.every((value) => ['30rem', '48rem', '64rem', '80rem'].includes(value!)),
    ).toBe(true);
  });

  test('keeps production source free of references and third-party asset requests', async () => {
    const sourceFiles = (await listFiles(path.join(root, 'src'))).filter((file) =>
      /\.(?:astro|css|ts)$/.test(file),
    );
    const source = (await Promise.all(sourceFiles.map((file) => readFile(file, 'utf8')))).join(
      '\n',
    );

    expect(source).not.toMatch(/design-reference\//i);
    expect(source).not.toMatch(/https?:\/\//i);
  });

  test('isolates preview paths without modifying production Astro configuration', async () => {
    const productionConfig = await readFile(path.join(root, 'astro.config.mjs'), 'utf8');
    const previewConfig = await readFile(
      path.join(root, 'astro.design-system-preview.config.mjs'),
      'utf8',
    );

    expect(productionConfig).not.toMatch(/design-system|srcDir|outDir|cacheDir/i);
    expect(previewConfig).toContain("srcDir: path.join(root, 'tests/design-system-preview')");
    expect(previewConfig).toContain("outDir: path.join(root, '.design-system-preview/dist')");
    expect(previewConfig).toContain("cacheDir: path.join(root, '.design-system-preview/cache')");
  });
});
