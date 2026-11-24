import { defineConfig } from 'astro/config';

// Dos modos de build:
//   - Embebido en kndl: RIZOMA_BASE=/rizoma
//   - Independiente en la raíz de un dominio: RIZOMA_BASE=/
// RIZOMA_SITE define el origen canónico (kndl o el dominio propio).
const rawBase = process.env.RIZOMA_BASE || '/';
const base = rawBase === '/' ? '/' : `/${rawBase.replace(/^\/+|\/+$/g, '')}`;
const site = (process.env.RIZOMA_SITE || 'https://kndl.quicio.qzz.io').replace(/\/$/, '');

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
