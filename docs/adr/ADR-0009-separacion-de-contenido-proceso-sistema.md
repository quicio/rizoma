---
title: "ADR 0009 — Separación de contenido, proceso, sistema y datos"
date: 2026-11-24
estado: aceptada
---

# ADR 0009 — Separación de contenido, proceso, sistema y datos

## Contexto

Al extraer Rizoma, `docs/` quedó mezclando cuatro cosas con ciclos de vida
distintos: contenido público, proceso editorial, documentación de sistema y
datos que el build lee. El taller heredó esa ambigüedad y escribía el banco y
los adjuntos dentro de `docs/`, un directorio que también contiene ADR y
protocolos.

## Decisión

Se separan cuatro capas:

1. **Contenido público** — `src/content/`:
   exploraciones, nodos y anexos. Es lo único que el sitio publica.
2. **Proceso editorial** — `trabajo/`:
   `banco/`, `ciclos/`, `adjuntos/`, `lecturas/`, `experimentos/`, `pilotos/` y
   `laminas/`. No se publica; lo indexa y edita el taller.
3. **Sistema y decisiones** — `docs/`:
   `adr/`, `PUNTO-DE-ENTRADA.md`, `protocolo-cartografia.md`,
   `taxonomia-anexos.md`, `nota-diagram-design.md` y propuestas de diseño.
4. **Datos que el build lee** — `src/data/`:
   `presentaciones/`, `composiciones/`, `trama/`, `cartografias/`,
   `navigation.yml`, `anexos_tipos.yml` y `kndl-materiales.yml`.

El taller indexa `trabajo/` como editable, `docs/` como read-only y
`src/content/` como publicable. Los adjuntos viven en `trabajo/adjuntos/`.
Las láminas y sus artefactos viven en `trabajo/laminas/`; el generador es
`scripts/build-lamina.py`.

## Por qué no dentro de `content/`

`content/` significa “esto se publica”. Poner borradores ahí invita a que un
glob, una ruta o un cambio futuro los publique por accidente. `trabajo/`
mantiene el límite público/proceso explícito sin impedir que el taller lo lea.

## Consecuencias

- `docs/` deja de ser un cajón de sastre: solo sistema y decisiones.
- El taller cambia sus paths de banco, ciclos, adjuntos y notas.
- `src/data/` concentra todo lo que alimenta el build, incluida la trama.
- Revisa la consecuencia de ADR 0008 sobre el taller: ya no queda en kndl000.
- Mover archivos no cambia las URLs públicas.

## Referencias

- `docs/PUNTO-DE-ENTRADA.md`
- `taller/rizoma.config.mjs`
- `scripts/build-lamina.py`
- ADR 0008
