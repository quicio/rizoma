# Rizoma — instrucciones para agentes

Antes de tocar contenido, leé `docs/PUNTO-DE-ENTRADA.md`. Es el mapa de
contexto; los ADR son la fuente de las decisiones.

- No inventes fuentes: verificá y declarás qué no pudiste consultar.
- No corrijas en silencio: toda rectificación deja un anexo con fuente.
- No promuevas una idea al cuerpo sin la marca del autor.
- Abrí una deriva con `npm run nueva -- --title "..." --question "..."`.
- El taller local se inicia con `npm run taller` (http://127.0.0.1:4173).
- Antes de cerrar: `npm run build`, `npm run links` y, si tocaste láminas,
  `python3 scripts/build-lamina.py --verify --plate 01` y `--plate 02` con
  `KNDL_ROOT` apuntando a kndl000.

## Arquitectura

- El contenido es markdown en `src/content/`. No hay CMS.
- `src/lib/` resuelve frontmatter, markdown, presentación, trayectoria e
  historial en build time.
- `RIZOMA_BASE` define la subruta; `RIZOMA_KNDL_ORIGIN` define si los enlaces al
  corpus de KNDL son root-relative o absolutos.
- No agregues lógica de kndl a este repo. Rizoma es independiente; kndl lo
  embebe como artefacto.
