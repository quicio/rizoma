import { defineConfig } from 'astro/config';

// Build independiente en la raíz del dominio: RIZOMA_BASE=/.
// Una subruta (por ejemplo /rizoma) sigue siendo posible, pero kndl ya no
// copia este sitio: lee src/content y src/data/cartografias para su índice.
// RIZOMA_SITE define el origen canónico.
const rawBase = process.env.RIZOMA_BASE || '/';
const base = rawBase === '/' ? '/' : `/${rawBase.replace(/^\/+|\/+$/g, '')}`;
const site = (process.env.RIZOMA_SITE || 'https://kndl.quicio.org').replace(/\/$/, '');

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
