# Taller de Rizoma

Backoffice local-first para el banco de Rizoma. Lee y escribe los mismos archivos
que el sitio Astro: exploraciones y nodos en `src/content/`, anexos en
`src/content/anexos/`, y notas, ciclos, ADR y adjuntos en `docs/`. No hay base de
datos, backend remoto ni estado fuera de git. La decisión está en
[`ADR-0006`](../docs/adr/ADR-0006-taller-de-rizoma.md).

## Comandos

```bash
npm run taller          # servidor en http://127.0.0.1:4173
npm run test:taller     # tests puros con node --test
TALLER_PORT=4174 npm run taller
```

- El servidor solo escucha en `127.0.0.1`.
- Requiere Node 20+ y git. Para el preview y los chequeos de commit: `npm install`
  y `npm run build` deben funcionar.
- Python 3 + PyYAML es opcional: solo si definís `KNDL_ROOT` para verificar las
  láminas contra un checkout de kndl000.
- El catálogo de materiales externos de KNDL vive en
  `src/data/kndl-materiales.yml`. Si agregás una obra nueva al corpus, regenerá
  ese archivo.

## Qué hace

- **Banco**: indexa notas (`docs/*.md`, `docs/banco/`, `docs/ciclos/`),
  exploraciones (`src/content/exploraciones/`), nodos (`src/content/nodos/`) y
  anexos (`src/content/anexos/<exploración>/`). Los ADR, el protocolo, la
  taxonomía y el punto de entrada se listan read-only. Los poemas, códigos,
  dispositivos y demás obras de KNDL no se editan acá; se referencian por URL.
- **Edición con diff**: guardado explícito, sin autosave. El editor Markdown
  tiene toolbar de iconos, vista dividida redimensionable con preview en vivo,
  metadatos plegables y conteo de palabras. Protege cambios sin guardar al
  cambiar de pieza o cerrar la pestaña. El pegado convierte HTML a Markdown. El
  frontmatter conserva claves desconocidas, orden y comentarios; el cuerpo no
  editado queda byte-idéntico. Cada lectura devuelve un hash y una escritura con
  hash viejo termina en conflicto de tres vías.
- **Temas**: cámara oscura y modo claro arena. El toggle del topbar (`Alt+T`)
  recuerda la elección en `localStorage`.
- **Apply transaccional**: snapshots de los paths afectados; si un cambio falla,
  se restauran los anteriores y se eliminan los archivos nuevos.
- **Adjuntos**: se guardan en `docs/adjuntos/<slug>/` con límite de 25 MB,
  nombre sanitizado y deduplicado. Se sirven read-only.
- **Vínculos**: lista `{destino, motivo, fecha}` en el frontmatter de la nota.
  Los destinos se autocompletan por título, path o URL. Los backlinks se calculan
  al leer.
- **Publicación**: promueve a exploración, nodo, anexo o hito con las reglas del
  protocolo como validaciones. Un override pide motivo y queda en el mensaje de
  commit.
- **Commit**: corre la auditoría de fuente, `npm run build`,
  `npm run links` y, si existe `KNDL_ROOT`, las láminas 01 y 02. Commitea solo
  los paths del plan. El push es una acción aparte y explícita.
- **Búsqueda y margen**: `/` enfoca la búsqueda; filtros `estado:`, `tipo:`,
  `path:`, `titulo:`, `publico:`, `readonly:`, `vinculo:roto`, `adjunto:`.
  El margen muestra corpus, relacionadas, anexos, nodos, hitos y fuentes.
- **Descartar**: `git restore` sobre un path; si es untracked, lo elimina.
- **Borrar nota**: solo notas de banco, con confirmación explícita y backlinks.

Fuera de v1: IA, deploy, base de datos, autenticación multiusuario, grafo,
kanban, dashboard, métricas, renombrar/mover archivos y promoción automática de
adjuntos a assets públicos.

## Arquitectura

```text
taller/
  server.mjs              # HTTP + API + static UI; built-ins de Node
  rizoma.config.mjs       # registro de tipos y operaciones
  lib/
    frontmatter.mjs       # parser/escritor YAML con comentarios y orden
    paths.mjs             # resolución segura, hashes, slugs, nombres
    git.mjs               # git sin shell, estado, diff, restore, commit, push
    plan.mjs              # plan de cambios, diff con git, apply transaccional
    conflict.mjs          # preview y merge de conflicto a 3 vías
    audit.mjs             # auditoría de fuente antes del commit
    indexer.mjs           # banco, URLs, warnings, backlinks, fuentes
    links.mjs             # vínculos, backlinks, URLs del sitio
    validations.mjs       # reglas del protocolo
    checks.mjs            # build, links y láminas
    registry.mjs          # carga y valida el registro
  ops/                    # una operación por archivo
  ui/                     # HTML/CSS/JS sin framework ni build
  tests/                  # node --test
  vendor-yaml/            # parser YAML vendorizado (yaml 2.9.1, ISC)
```

- La UI habla con la API por `fetch`; no hay scripts de terceros.
- El servidor responde con CSP `default-src 'self'`, valida `Host` y `Origin`
  de loopback y rechaza requests cross-site.
- Los paths se resuelven contra la raíz del repo; se rechazan `..`, rutas
  absolutas y symlinks que escapan.
- El parser YAML está vendorizado en `taller/vendor-yaml/` para no depender de
  `npm install`.

## Contrato de extensión

Todo tipo y operación vive en `rizoma.config.mjs`. El router HTTP y el núcleo de
la UI no saben qué tipos existen.
