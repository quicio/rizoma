# Rizoma

Sitio independiente de **Rizoma**, la sección de exploraciones abiertas de
[KNDL 000](https://kndl.quicio.org). Construido con [Astro](https://astro.build)
y markdown. kndl000 lee este repo para su índice y enlaza acá.

Sitio: **https://rizoma.quicio.org/**
Identidad: [`DESIGN.md`](DESIGN.md) · decisión: [ADR 0011](docs/adr/ADR-0011-identidad-cartografia-deriva.md)
Repositorio: [`quicio/rizoma`](https://github.com/quicio/rizoma).

## Empezar

```bash
npm install
npm run dev
```

Build independiente con enlaces absolutos al corpus de KNDL:

```bash
RIZOMA_BASE=/ RIZOMA_KNDL_ORIGIN=https://kndl.quicio.org npm run build
```

Verificación de enlaces internos:

```bash
npm run links
```

## Modos de publicación

| Modo | `RIZOMA_BASE` | `RIZOMA_KNDL_ORIGIN` | Uso |
|---|---|---|---|
| Dominio propio | `/` | `https://kndl.quicio.org` | `rizoma.quicio.org` |

Los enlaces a poemas, código, dispositivos y vestigios se vuelven absolutos
hacia `kndl.quicio.org`.

## Estructura

```
src/
  content/
    exploraciones/   # una exploración por archivo .md
    nodos/           # vocabulario compartido
    anexos/<slug>/   # anexos y su index.md por exploración
  data/              # presentación, composiciones, trama, cartografías, materiales
  lib/               # markdown, datos, historial y resolución de enlaces
  components/        # cabecera, pie, constelación, corpus, diagrama, respiros
  pages/             # rutas: /, /nodos/, /aparato/, /[slug]/, /[slug]/anexos/..., /trayectoria/[id]/
  styles/style.css   # copia vendorizada de kndl000 (deuda: recortar)
  styles/rizoma.css  # identidad visual y de interfaz de Rizoma
  lib/cartography.ts # posiciones curadas y reserva automática de nodos en el mapa
docs/                # sistema: ADR, protocolo, taxonomía, punto de entrada
trabajo/             # proceso editorial: banco, ciclos, adjuntos, lecturas, láminas
taller/              # backoffice local-first (npm run taller)
scripts/             # nueva-exploracion, build-lamina, check-links
public/              # JS de búsqueda, mapa, corpus y aparato
```

## Contenido

Abrir una exploración:

```bash
npm run nueva -- --title "Título de la deriva" --question "¿La pregunta?"
```

Crea `src/content/exploraciones/<slug>.md` y una nota en `trabajo/ciclos/`. No crea
nodos, corpus ni anexos: eso se agrega cuando existe.

Reglas editoriales: ver [`docs/PUNTO-DE-ENTRADA.md`](docs/PUNTO-DE-ENTRADA.md)
y la taxonomía de anexos. La decisión de extracción está en
[`docs/adr/ADR-0008-extraccion-de-rizoma.md`](docs/adr/ADR-0008-extraccion-de-rizoma.md).

## Índice en kndl000

kndl000 no copia el sitio. Un generator de Jekyll lee
`src/content/exploraciones`, `src/content/nodos` y `src/data/cartografias` de
este repo y genera:

- `/rizoma/` en kndl, con el índice de exploraciones.
- el bloque de últimas exploraciones del home.
- redirects de las URLs viejas del embed.

En CI, kndl hace checkout de `quicio/rizoma` en `rizoma-src`.

## Desplegar solo

El workflow `.github/workflows/deploy.yml` construye y publica en GitHub Pages.
Configurá las variables del repositorio:

- `RIZOMA_SITE`: origen canónico (por defecto `https://rizoma.quicio.org`).
- `RIZOMA_BASE`: `/` para `rizoma.quicio.org`; una subruta como `/rizoma` solo si el sitio se sirve bajo un prefijo. kndl ya no copia el build.
- `RIZOMA_KNDL_ORIGIN`: `https://kndl.quicio.org` para enlazar el corpus.
- `PUBLIC_GA4_ID`: opcional.

## Estado

- Las láminas siguen retiradas de la publicación. `scripts/build-lamina.py`
  verifica con `KNDL_ROOT` apuntando a un checkout de kndl000.
- El taller vive en `taller/` y se inicia con `npm run taller`
  (http://127.0.0.1:4173). Edita `src/content/` y `trabajo/`; `docs/` es
  read-only. Las obras de KNDL se referencian por URL desde
  `src/data/kndl-materiales.yml`.
- El CSS es una copia de kndl000. Hay que extraer solo los bloques de Rizoma.
