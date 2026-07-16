import { defineConfig } from 'astro/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  output: 'static',
  devToolbar: {
    enabled: false,
  },
  srcDir: path.join(root, 'tests/design-system-preview'),
  publicDir: path.join(root, 'public'),
  outDir: path.join(root, '.design-system-preview/dist'),
  cacheDir: path.join(root, '.design-system-preview/cache'),
  vite: {
    cacheDir: path.join(root, '.design-system-preview/vite-cache'),
  },
});
