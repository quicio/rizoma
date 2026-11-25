---
title: "ADR 0013 — Vista de lectura del corpus sin salir de la exploración"
date: 2026-11-25
estado: aceptada
---

# ADR 0013 — Vista de lectura del corpus sin salir de la exploración

## Contexto

Las exploraciones citan obras del corpus de KNDL: poemas, código, dispositivos,
vestigios y el archivo de Rastros. Hasta ahora, hacer click en una pieza del
corpus abría la página de KNDL y el lector perdía el contexto de la deriva.

El autor pidió una mecánica que permita entender el recurso sin abandonar la
exploración. Se descartó abrir una pestaña nueva por ser la opción menos
elegante y se descartó un iframe porque muestra una página completa dentro de
otra. La pieza debía ser el recurso exacto, no una ficha ni una captura.

## Decisión

1. Cada enlace de corpus conserva su `href` a KNDL y suma una vista de lectura
   en un `<dialog>` lateral.
2. La vista hace `fetch` del recurso canónico de KNDL, parsea el HTML y extrae
   el contenido principal: título, metadatos, cuerpo, imágenes y bloques de
   código. No incrusta la página completa.
3. El contenido se limpia de navegación, cabecera, sidebar, footer, scripts,
   formularios, SVG decorativos y atributos peligrosos. Se reescriben las URLs
   relativas a absolutas y los enlaces internos abren KNDL en una pestaña nueva.
4. El recurso se presenta con la tipografía y el ritmo de Rizoma, no con los
   estilos de KNDL. El panel conserva el contexto de la exploración detrás.
5. El panel incluye siempre **Abrir en KNDL ↗** y un estado de error con el
   mismo enlace. Sin JavaScript, el enlace original sigue funcionando.
6. La carga se precarga al enfocar o pasar el cursor por el enlace. Los
   recursos ya leídos se cachean en memoria durante la sesión.
7. La vista cubre también los enlaces de respiros y del diagrama, no solo las
   listas de corpus.

## Implementación

- `src/components/RizomaResource.astro` — marcado del diálogo.
- `public/rizoma-corpus.js` — fetch, extracción, sanitización, caché y control
  del diálogo.
- `src/components/Corpus.astro`, `Respiro.astro` y `Diagrama.astro` — atributos
  `data-corpus-preview`, URL canónica, tipo y título.
- `src/lib/site.ts` — `kndlPreviewHref()` para resolver la URL canónica.
- `src/styles/rizoma.css` — panel lateral, estados de carga/error, contenido,
  código y adaptación móvil.

## Consecuencias

- Rizoma mantiene una dependencia de lectura con la estructura HTML pública de
  KNDL (`main`, `reading-body`, `codigo-detail__body`, etc.). Si KNDL cambia
  esas clases, la extracción puede degradarse; el enlace directo sigue siendo
  la salida.
- No se ejecuta el código interactivo ni se reproducen animaciones de KNDL. El
  código se muestra completo y la versión interactiva queda a un click.
- El fetch es cross-origin y depende de que KNDL permita CORS. GitHub Pages lo
  permite hoy (`access-control-allow-origin: *`).
- El HTML remoto se sanitiza antes de insertarse: no se ejecutan scripts ni se
  conservan handlers, estilos ni iframes.
- No se duplica contenido en el build ni se agrega lógica de índice de KNDL.
  Es una affordance de lectura en el cliente, con fallback explícito.

## Referencias

- `src/components/RizomaResource.astro`
- `public/rizoma-corpus.js`
- `src/components/Corpus.astro`
- `src/lib/site.ts`
- `DESIGN.md`
