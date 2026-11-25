---
title: "ADR 0014 — Apariciones de obras de KNDL en Rizoma"
date: 2026-11-25
estado: aceptada
---

# ADR 0014 — Apariciones en Rizoma

## Contexto

Rizoma cita obras de KNDL en el `corpus` de las exploraciones, en
`corpus_secciones` y en las `fuentes` de los anexos. KNDL no sabía que sus obras
estaban siendo leídas: la relación era de ida.

La identidad de KNDL no debe cambiar por esto. El archivo sigue siendo el
archivo; Rizoma sigue siendo la deriva. Lo que falta es que el archivo sepa
dónde está siendo leído.

## Decisión

1. kndl construye un índice invertido en build time desde el checkout de
   Rizoma.
2. Fuentes del índice:
   - `corpus` de cada exploración;
   - `corpus_secciones` para asociar la obra a una sección y su ancla;
   - `fuentes` de los anexos, para registrar las obras citadas en el aparato.
3. Las URLs se normalizan:
   - root-relative (`/poemas/medusa/`);
   - absolutas a `kndl.quicio.org` o al dominio viejo;
   - se ignoran las URLs de Rizoma y las externas.
4. El generator expone `site.data.rizoma_apariciones`, indexado por URL de obra.
5. Las fichas de obras de KNDL muestran un bloque **“En Rizoma”** con:
   - exploración, sección y ancla;
   - nota del corpus, si existe;
   - anexos que citan la obra, como “Anexo · título”.
6. El bloque es un aparato al margen: no reemplaza la ficha, no cambia la
   navegación y no copia el sitio de Rizoma.

## Implementación

- kndl: `_plugins/rizoma_index.rb` (índice invertido).
- kndl: `_includes/rizoma-apariciones.html`.
- kndl: layouts `default`, `poems`, `codigo`, `dispositivo`, `imagen` y
  `melange-report`.
- kndl: estilos `.rizoma-apariciones` en `assets/css/style.css`.

## Consecuencias

- Una cita nueva en Rizoma aparece en KNDL en el siguiente build.
- Las obras sin citas no muestran el bloque.
- Si Rizoma cambia el esquema de `corpus`, `corpus_secciones` o `fuentes`, hay
  que actualizar el generator de kndl.
- No hay API en runtime: todo se resuelve en build time.
- La relación queda bidireccional sin homogeneizar las identidades.

## Referencias

- kndl: `_plugins/rizoma_index.rb`
- kndl: `_includes/rizoma-apariciones.html`
- ADR 0012
