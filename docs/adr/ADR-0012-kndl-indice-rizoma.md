---
title: "ADR 0012 — kndl deja de embeber Rizoma y pasa a un índice"
date: 2026-11-25
estado: aceptada
---

# ADR 0012 — Índice de Rizoma en kndl

## Contexto

Rizoma ya tiene identidad y dominio propios (`rizoma.quicio.org`). kndl seguía
construyendo Rizoma y copiando su `dist/` en `_site/rizoma/`, lo que duplicaba
contenido, acoplaba dos builds y dejaba dos canonical distintos para las mismas
páginas.

kndl necesita una sección propia: un índice de exploraciones y un bloque en el
home que sepa qué mostrar sin convertirse en otra copia del sitio.

## Decisión

1. kndl deja de construir y copiar el sitio de Rizoma.
2. Un generator de Jekyll lee el checkout de Rizoma en build time
   (`RIZOMA_DIR`, por defecto `../rizoma`; en CI `rizoma-src`).
3. El generator expone `site.data["rizoma_index"]` con:
   - `site`: `https://rizoma.quicio.org`;
   - `nodos`: cantidad de nodos;
   - `exploraciones`: orden editorial, título, pregunta, resumen, estado,
     actualización, nodos y piezas;
   - `ultimas`: las mismas exploraciones ordenadas por actualización.
4. kndl publica `/rizoma/` como índice propio: introducción, enlaces a Rizoma y
   listado de exploraciones.
5. El home muestra las últimas exploraciones y enlaza a Rizoma.
6. Las URLs viejas del embed (`/rizoma/<slug>/`, anexos, historial, nodos y
   trayectoria) generan páginas de redirect a `rizoma.quicio.org`.
7. El canonical de Rizoma es `rizoma.quicio.org`. kndl ya no canonicaliza
   páginas de Rizoma.

## Implementación

- kndl: `_plugins/rizoma_index.rb`, `rizoma/index.md`,
  `_includes/home-featured.html`, `_layouts/rizoma-redirect.html`.
- kndl CI: checkout de `quicio/rizoma` en `rizoma-src`, luego
  `RIZOMA_DIR=${{ github.workspace }}/rizoma-src bundle exec jekyll build`.
- Rizoma: no necesita cambios de build; su `rizoma-index.json` sigue disponible
  para otros consumidores.

## Consecuencias

- kndl ya no depende del build de Astro; depende de las rutas de contenido de
  Rizoma (`src/content/exploraciones`, `src/content/nodos`,
  `src/content/anexos`, `src/data/cartografias`).
- Agregar campos al índice exige actualizar el generator de kndl.
- Los redirects de Jekyll son `meta refresh` + canonical, no 301. Para SEO
  estricto conviene complementarlos con Redirect Rules en Cloudflare.
- Se elimina el contenido duplicado y el canonical ambiguo.
- El home muestra las últimas exploraciones por fecha de actualización.

## Referencias

- kndl: `_plugins/rizoma_index.rb`
- kndl: `rizoma/index.md`
- kndl: `_includes/home-featured.html`
- `docs/dominios.md`
- ADR 0008, ADR 0010
