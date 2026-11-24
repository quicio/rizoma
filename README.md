# Rizoma

Sitio independiente de **Rizoma**, la sección de exploraciones abiertas de
[KNDL 000](https://kndl.quicio.qzz.io). Construido con [Astro](https://astro.build)
y markdown. Se puede desplegar solo o embeber en kndl000 en `/rizoma/`.

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
RIZOMA_BASE=/ RIZOMA_KNDL_ORIGIN=https://kndl.quicio.qzz.io npm run build
```

Verificación de enlaces internos:

```bash
RIZOMA_BASE=/rizoma npm run links
```

## Modos de publicación

| Modo | `RIZOMA_BASE` | `RIZOMA_KNDL_ORIGIN` | Uso |
|---|---|---|---|
| Embebido en kndl | `/rizoma` | vacío | kndl copia `dist/` en `_site/rizoma/` |
| Independiente | `/` o `/rizoma` | `https://kndl.quicio.qzz.io` | GitHub Pages propio |

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
  data/              # presentación, composiciones, navegación, materiales de KNDL
  lib/               # markdown, datos, historial y resolución de enlaces
  components/        # corpus, mapa, diagrama, respiros, rail
  pages/             # rutas: /, /nodos/, /[slug]/, /[slug]/anexos/..., /trayectoria/[id]/
  styles/style.css   # copia vendorizada de kndl000 (deuda: recortar)
docs/                # ADR, ciclos, trama, cartografías, láminas, protocolo
scripts/             # nueva-exploracion, check-links
public/              # JS de rizoma-apparatus y rail-progress
```

## Contenido

Abrir una exploración:

```bash
npm run nueva -- --title "Título de la deriva" --question "¿La pregunta?"
```

Crea `src/content/exploraciones/<slug>.md` y una nota en `docs/ciclos/`. No crea
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

- `RIZOMA_SITE`: origen canónico (por defecto `https://kndl.quicio.qzz.io`).
- `RIZOMA_BASE`: `/rizoma` para project page; `/` para dominio propio.
- `RIZOMA_KNDL_ORIGIN`: `https://kndl.quicio.qzz.io` para enlazar el corpus.
- `PUBLIC_GA4_ID`: opcional.

## Estado

- Las láminas siguen retiradas de la publicación. `docs/build-lamina.py`
  verifica con `KNDL_ROOT` apuntando a un checkout de kndl000.
- El taller (`taller/`) quedó en kndl000: indexa todas las colecciones del
  sitio, no solo Rizoma. Adaptarlo es trabajo pendiente.
- El CSS es una copia de kndl000. Hay que extraer solo los bloques de Rizoma.
