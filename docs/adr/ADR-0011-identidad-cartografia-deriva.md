---
title: "ADR 0011 — Identidad visual y experiencia de cartografía de deriva"
date: 2026-11-25
status: aceptado
---

# ADR 0011 — Identidad visual y experiencia de cartografía de deriva

## Contexto

Rizoma conservaba la copia vendorizada de la hoja de estilos de KNDL y una
identidad heredada: fondo nocturno, acento verde-agua y una página de índice
casi sin jerarquía visual. La sección ya tenía contenido, rutas, nodos, anexos,
historial y un mapa de lectura, pero la superficie no expresaba la idea de
cartografía abierta que el proyecto declara.

El autor pidió un rediseño de identidad y experiencia: cartografía abstracta,
editorial experimental, archivo científico, textura material y una relación de
gramática con Quicio sin convertirse en una copia de su portada. El mockup de
referencia fijó la familia visual: carbón, marfil, ocre, serif de alto
contraste, mono de medición y una constelación de nodos.

## Decisión

1. **Una capa de identidad propia.** Se agrega `src/styles/rizoma.css` después
   de la hoja heredada. La hoja vendorizada se conserva para no romper el
   contenido ni los componentes existentes; la capa nueva toma el control de
   las superficies de Rizoma mediante `body.rizoma` y clases propias.
2. **Paleta fijada.** Carbón `#171614`, marfil `#E9E0D1`, ocre `#A87832` y gris
   mineral `#77736B`, con variaciones tonales legibles. El ocre es una señal
   puntual; el gris mineral se reserva para reglas y decoración.
3. **Tipografía.** Bodoni Moda para la voz editorial, Archivo para lectura e
   interfaz y JetBrains Mono para coordenadas, estados y metadatos. Se mantiene
   la carga por Google Fonts que ya usaba el sitio.
4. **Portada como lámina.** La home abre con una placa de terreno a sangre, una
   constelación SVG de nodos reales y la apertura editorial sobre el tercio
   izquierdo. Debajo: apertura, índice de exploraciones, mapa y aparato.
5. **Mapa como herramienta.** `/nodos/` usa la misma constelación con filtros
   por exploración y por nodos compartidos, vistas Red/Constelación/Archivo y
   un panel de detalle. La lista textual inferior es la alternativa accesible.
6. **Nodo como página de lectura.** La exploración conserva su cuerpo y su
   aparato; se reorganiza la cabecera, se agrega ficha, mini-mapa, rail sticky
   y un aparato colapsable.
7. **Aparato global.** Se agrega `/aparato/` como índice de todos los anexos,
   agrupados por exploración y tipo. Las rutas existentes no cambian.
8. **Buscador estático.** El icono de la cabecera abre un diálogo que filtra
   `rizoma-index.json` (exploraciones, nodos y anexos). Sin JavaScript, el
   icono lleva al mapa. No hay backend ni dependencia nueva.
9. **Textura con procedencia.** La placa de terreno es un raster generado y su
   prompt queda embebido en el archivo. Se usa oscurecida y con velo; no
   reemplaza texto ni controles.
10. **Accesibilidad y movimiento.** Un solo `h1` por página, foco visible,
    contraste AA para texto, navegación por teclado, alternativa textual del
    mapa y respeto de `prefers-reduced-motion`.

## Consecuencias

- La hoja de estilos heredada sigue presente. La deuda de recorte continúa,
  pero la capa nueva es la autoridad visual de Rizoma.
- El contenido y las rutas se preservan. `/aparato/` es una ruta nueva y
  aditiva; no reemplaza `/[slug]/anexos/`.
- El mapa depende de posiciones deterministas en `src/lib/cartography.ts`. Si
  se agrega un nodo sin posición, no aparece en el mapa hasta que se le asigne
  una; la lista textual sigue mostrándolo.
- La textura es un activo generado. Cualquier reemplazo debe conservar su
  prompt o su origen embebido.
- El rediseño no modifica el protocolo editorial ni la taxonomía de anexos.

## Archivos

- `DESIGN.md` — sistema visual.
- `src/styles/rizoma.css` — implementación.
- `src/components/RizomaHeader.astro`, `RizomaFooter.astro`,
  `RizomaBrand.astro`, `Cartography.astro`.
- `src/lib/cartography.ts`.
- `src/pages/index.astro`, `nodos.astro`, `aparato.astro`, `[slug].astro` y
  las páginas de anexos, historial y trayectoria.
- `public/rizoma-search.js`, `public/rizoma-map.js`,
  `public/rizoma-map-page.js`.
