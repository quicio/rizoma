---
title: "ADR 0008 — Extracción de Rizoma a un proyecto Astro independiente"
date: 2026-11-24
estado: aceptada
---

# ADR 0008 — Extracción de Rizoma

## Contexto

Rizoma vivía dentro de kndl000 como una sección de Jekyll: contenido en
`content/collections/_exploraciones`, `_nodos` y `rizoma/`; render en layouts
Liquid; páginas generadas por plugins Ruby (historial, presentación,
trayectoria); estilos dentro de `assets/css/style.css`.

Eso impedía desarrollarlo como proyecto autónomo y ataba su evolución al motor
del sitio completo. Al mismo tiempo, Rizoma sigue siendo una sección del sitio
público de KNDL y sus exploraciones citan obras de kndl000 (poemas, código,
dispositivos, vestigios).

## Decisión

1. Rizoma pasa a ser un repositorio propio con **Astro** y contenido markdown.
2. El repositorio de Rizoma es la **fuente de verdad** del contenido, los datos
   de presentación, la trama, las cartografías, el taller y las láminas.
3. kndl000 **no migra todavía** a Astro. Sigue en Jekyll para el resto del
   sitio.
4. La integración es por **artefacto estático**: kndl construye Jekyll y luego
   Rizoma con `RIZOMA_BASE=/rizoma`, y copia `dist/` en `_site/rizoma/`. Se
   conservan las URLs públicas (`/rizoma/`, `/rizoma/<slug>/`,
   `/rizoma/<slug>/anexos/<anexo>/`, `/rizoma/<slug>/historial/`,
   `/rizoma/trayectoria/<id>/`).
5. El corpus de KNDL se resuelve con un mapa versionado
   (`src/data/kndl-materiales.yml`) y enlaces root-relative en modo embebido o
   absolutos a KNDL en modo independiente (`RIZOMA_KNDL_ORIGIN`).
6. El historial de versiones se conservó importando desde kndl000 solo los
   caminos de Rizoma, con renombres a la estructura nueva (`git filter-repo`).
7. El CSS se conserva como copia vendorizada de kndl000 para no perder
   fidelidad visual. Es deuda técnica: debe recortarse a los estilos de Rizoma.

## Modos de build

| Modo | `RIZOMA_BASE` | `RIZOMA_KNDL_ORIGIN` | Resultado |
|---|---|---|---|
| Embebido en kndl | `/rizoma` | vacío | enlaces al corpus root-relative |
| Independiente | `/` o `/rizoma` | `https://kndl.quicio.qzz.io` | enlaces al corpus absolutos |

## Consecuencias

- Rizoma se despliega y versiona por separado; kndl lo consume como artefacto.
- El contenido de Rizoma ya no se edita en kndl. El taller de kndl000 queda
  pendiente de adaptación: indexa todas las colecciones de kndl, no solo
  Rizoma.
- `build-lamina.py` lee las obras de kndl vía `KNDL_ROOT` (por defecto
  `../kndl000`), porque las láminas describen el corpus del sitio completo.
- Los ADR 0001–0007 conservan las rutas históricas de cuando Rizoma vivía en
  kndl000. No se reescriben: este ADR registra el cambio de soporte.
- Si kndl migra a Astro, Rizoma puede montarse como subproyecto sin cambiar su
  contenido.

## Referencias

- `astro.config.mjs`
- `src/lib/content.ts`, `src/lib/data.ts`, `src/lib/history.ts`
- `src/pages/`
- `scripts/build-rizoma.sh` (en kndl000)
- `docs/PUNTO-DE-ENTRADA.md`
