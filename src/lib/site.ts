const rawBase = import.meta.env.BASE_URL || '/';
export const BASE = rawBase === '/' ? '/' : `/${rawBase.replace(/^\/+|\/+$/g, '')}`;

export const SITE_URL = (process.env.RIZOMA_SITE || 'https://kndl.quicio.org').replace(/\/$/, '');

// Origen de KNDL para el corpus. Vacío en modo embebido: los enlaces quedan
// root-relative y los resuelve el sitio que hospeda a Rizoma.
export const KNDL_ORIGIN = (process.env.RIZOMA_KNDL_ORIGIN || '').replace(/\/$/, '');

export const SITE = {
  title: 'KNDL 000',
  author: 'KNDL',
  description:
    'Rizoma — KNDL 000. Exploraciones abiertas, nodos provisionales y un mapa que se construye al recorrerlo.',
  locale: 'es_ES',
  ga4: process.env.PUBLIC_GA4_ID || '',
};

/** Prefija una ruta interna con la base del build. */
export function withBase(path: string): string {
  if (!path.startsWith('/')) path = `/${path}`;
  if (BASE === '/') return path;
  return path === '/' ? `${BASE}/` : `${BASE}${path}`;
}

/** URL absoluta a partir de un pathname ya construido. */
export function absoluteUrl(pathname: string): string {
  return new URL(pathname, `${SITE_URL}/`).href;
}

/** Enlaces al resto de KNDL (poemas, código, dispositivos, inicio). */
export function kndlHref(path: string): string {
  if (!path.startsWith('/')) return path;
  return KNDL_ORIGIN ? `${KNDL_ORIGIN}${path}` : path;
}

/** Inicio de KNDL (no de Rizoma). */
export function kndlHome(): string {
  return KNDL_ORIGIN ? `${KNDL_ORIGIN}/` : '/';
}

/** Enlaces internos de Rizoma escritos como /rizoma/... en el markdown. */
export function rizomaHref(path: string): string {
  const rest = path.startsWith('/rizoma') ? path.slice('/rizoma'.length) || '/' : path;
  return withBase(rest);
}

/**
 * Reescribe los enlaces del HTML generado:
 * - /rizoma/... respeta la base del build
 * - el resto de rutas absolutas apunta a KNDL
 */
export function rewriteLinks(html: string): string {
  return html.replace(/\b(href|src)="(\/[^"]*)"/g, (_match, attr, url) => {
    if (url.startsWith('/rizoma')) return `${attr}="${rizomaHref(url)}"`;
    if (attr === 'src') return `${attr}="${kndlHref(url)}"`;
    return `${attr}="${kndlHref(url)}"`;
  });
}
