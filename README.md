# Rizoma

Sitio independiente de **Rizoma**, la sección de exploraciones abiertas de
[KNDL 000](https://kndl.quicio.org). Construido con [Astro](https://astro.build)
y markdown. Se puede desplegar solo o embeber en kndl000 en `/rizoma/`.

Sitio: **https://rizoma.quicio.org/**
Repositorio: [`quicio/rizoma`](https://github.com/quicio/rizoma).

## Empezar

```bash
npm install
npm run dev
```

Build embebido en kndl (base `/rizoma`):

```bash
RIZOMA_BASE=/rizoma npm run build
```

Build independiente con enlaces absolutos al corpus de KNDL:

```bash
RIZOMA_BASE=/ RIZOMA_KNDL_ORIGIN=https://kndl.quicio.org npm run build
```

Verificación de enlaces internos:

```bash
RIZOMA_BASE=/ npm run links          # dominio propio
RIZOMA_BASE=/rizoma npm run links    # embed en kndl
```

## Modos de publicación

| Modo | `RIZOMA_BASE` | `RIZOMA_KNDL_ORIGIN` | Uso |
|---|---|---|---|
| Embebido en kndl | `/rizoma` | vacío | kndl copia `dist/` en `_site/rizoma/` |
| Independiente (dominio propio) | `/` | `https://kndl.quicio.org` | `rizoma.quicio.org` |
| Project page heredada | `/rizoma` | `https://kndl.quicio.org` | `quicio.github.io/rizoma` |

En modo embebido los enlaces a poemas, código, dispositivos y vestigios quedan
root-relative y los resuelve kndl. En modo independiente se vuelven absolutos
hacia KNDL.

## Estructura

```
src/
  content/
    exploraciones/   # una exploración por archivo .md
    nodos/           # vocabulario compartido
    anexos/<slug>/   # anexos y su index.md por exploración
  data/              # presentación, composiciones, trama, cartografías, materiales
  lib/               # markdown, datos, historial y resolución de enlaces
  components/        # corpus, mapa, diagrama, respiros, rail
  pages/             # rutas: /, /nodos/, /[slug]/, /[slug]/anexos/..., /trayectoria/[id]/
  styles/style.css   # copia vendorizada de kndl000 (deuda: recortar)
docs/                # sistema: ADR, protocolo, taxonomía, punto de entrada
trabajo/             # proceso editorial: banco, ciclos, adjuntos, lecturas, láminas
taller/              # backoffice local-first (npm run taller)
scripts/             # nueva-exploracion, build-lamina, check-links
public/              # JS de rizoma-apparatus y rail-progress
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

## Embeber en kndl000

Desde kndl000:

```bash
bash scripts/build-rizoma.sh          # RIZOMA_DIR=../rizoma por defecto
node scripts/check-links.mjs
```

El script construye este repo con `RIZOMA_BASE=/rizoma`, actualiza
`_data/rizoma_index.json`, construye Jekyll y copia `dist/` en `_site/rizoma/`.
En CI, kndl hace checkout de este repositorio antes de correr el script.

## Desplegar solo

El workflow `.github/workflows/deploy.yml` construye y publica en GitHub Pages.
Configurá las variables del repositorio:

- `RIZOMA_SITE`: origen canónico (por defecto `https://rizoma.quicio.org`). En el
  build embebido, kndl pasa `https://kndl.quicio.org`.
- `RIZOMA_BASE`: `/` para `rizoma.quicio.org`; `/rizoma` solo para el embed o una project page heredada.
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
