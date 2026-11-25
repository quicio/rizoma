---
name: Rizoma
description: Cartografía de deriva. Sistema visual y de interfaz para las exploraciones abiertas de KNDL.
colors:
  carbon: "#171614"
  carbon-soft: "#1D1C19"
  carbon-raised: "#22211D"
  ivory: "#E9E0D1"
  ivory-soft: "#D8CFC0"
  muted: "#A49C8E"
  mineral: "#77736B"
  ochre: "#A87832"
  ochre-bright: "#C08B3E"
typography:
  display:
    fontFamily: "Bodoni Moda, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontWeight: 400
    letterSpacing: "-0.025em"
    lineHeight: 0.98
  body:
    fontFamily: "Archivo, Helvetica Neue, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "JetBrains Mono, Fira Code, Consolas, monospace"
    fontWeight: 400
    letterSpacing: "0.14em"
    textTransform: uppercase
rounded:
  none: "0px"
spacing:
  "2xs": "0.5rem"
  xs: "0.75rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2.25rem"
  xl: "3.5rem"
  "2xl": "5rem"
  "3xl": "8rem"
components:
  header:
    backgroundColor: "transparente en portada; carbón en interiores"
    textColor: "{colors.ivory}"
    border: "1px solid rgba(233,224,209,.08)"
  button:
    backgroundColor: "transparente"
    textColor: "{colors.ivory}"
    border: "0 0 1px 0 solid {colors.ochre}"
    rounded: "{rounded.none}"
  map-node:
    backgroundColor: "{colors.ochre}"
    textColor: "{colors.carbon}"
    rounded: "50%"
  plate:
    backgroundColor: "{colors.carbon-soft}"
    border: "1px solid rgba(233,224,209,.08)"
---

# Design System: Rizoma

## Overview

**North Star: «Cartografía de deriva».**

Rizoma no es un blog ni una revista: es un territorio intelectual en construcción. La identidad traduce la idea de rizoma —conexiones múltiples, sin centro fijo— a una gramática cartográfica y editorial: una lámina de terreno, una constelación de nodos, coordenadas y marcas de registro, y una tipografía que se lee como una publicación de investigación.

La relación con Quicio es de gramática compartida, no de copia: carbón y marfil, ocre como única señal, serif editorial, sans de trabajo, mono de medición, líneas capilares y grano. Rizoma se distingue por el mapa: el resto del ecosistema ordena; Rizoma desplaza.

**Rasgos clave**

- Carbón profundo como campo; marfil como tinta; ocre solo en nodos activos, acciones y pivotes.
- Serif de alto contraste para la voz; sans sobria para leer; mono para coordenadas, estados y metadatos.
- Composición asimétrica, márgenes generosos y retícula cartográfica.
- Textura mineral sutil, líneas capilares, arcos incompletos y marcas de registro.
- Sin radios, sin sombras difusas, sin glassmorphism, sin gradientes tecnológicos.

## Logo y glyph

El glyph es una bifurcación de cuatro trazos que se encuentran en un nodo: no es un árbol, no es una raíz y no reproduce el isotipo de Quicio. Funciona a 16 px como favicon y a 28 px en la cabecera. El wordmark «Rizoma» se compone en Bodoni Moda con tracking negativo.

El lockup horizontal es glyph + wordmark. En el pie se repite sin descriptor. El glyph vive en `public/media/rizoma/glyph.svg` y se inlinea en `RizomaBrand.astro` para heredar `currentColor`.

## Color

| Token | Valor | Uso |
|---|---|---|
| `--rz-carbon` | `#171614` | Fondo principal |
| `--rz-carbon-soft` | `#1D1C19` | Bandas, paneles, buscador |
| `--rz-carbon-raised` | `#22211D` | Superficies excepcionales |
| `--rz-ivory` | `#E9E0D1` | Texto principal y líneas |
| `--rz-ivory-soft` | `#D8CFC0` | Texto secundario y lectura |
| `--rz-muted` | `#A49C8E` | Metadatos y texto auxiliar (AA) |
| `--rz-mineral` | `#77736B` | Gris de referencia; reglas y decoración |
| `--rz-mineral-text` | `#A29C91` | Variación legible para microtexto |
| `--rz-ochre` | `#A87832` | Señal, nodo activo, filete |
| `--rz-ochre-bright` | `#C08B3E` | Ocre accesible sobre carbón |

**Reglas**

1. El carbón es el campo. El marfil es la tinta. El ocre no llena bloques grandes: señala un nodo, una acción o un pivote.
2. El gris mineral `#77736B` se reserva para reglas, retículas y decoración. El texto pequeño usa `--rz-mineral-text` o `--rz-muted`.
3. No se usan gradientes como decoración. Los degradados existen solo para fundir la placa de terreno con el campo y garantizar contraste.
4. El ocre no se usa para texto pequeño sin pasar a `--rz-ochre-bright`.

## Tipografía

| Rol | Familia | Uso | Pesos |
|---|---|---|---|
| Display y voz | **Bodoni Moda** | Titulares, preguntas, citas, cierre | 400, 400 italic |
| Lectura e interfaz | **Archivo** | Cuerpo, navegación, controles | 300–600 |
| Medición | **JetBrains Mono** | Coordenadas, estados, fechas, etiquetas | 300–500 |

**Escala**

```
--fs-1  clamp(2.8rem, 5.4vw, 5.8rem)   títulos de nodo
--fs-2  clamp(2.2rem, 4.2vw, 4.4rem)   títulos de sección
--fs-3  clamp(1.9rem, 3.2vw, 2.7rem)   h2 de lectura
--fs-4  clamp(1.25rem, 2vw, 1.55rem)   h3 de lectura
--fs-body clamp(1rem, 1.1vw, 1.08rem)  cuerpo
--fs-meta 0.7rem                  metadatos
```

El cuerpo de lectura se limita a 68 caracteres y 1.78 de interlínea. Los metadatos funcionales no bajan de 11 px; las etiquetas decorativas pueden ser menores solo si no son necesarias para orientarse.

## Retícula y espacio

- Contenedor: `min(1560px, 100%)`; gutter `clamp(1.25rem, 4.2vw, 4.5rem)`.
- Portada: mapa a sangre y texto sobre el tercio izquierdo; el resto de la página alterna bandas de 1, 2 y 3 columnas.
- Nodo: rail de 230 px + cuerpo de 820 px, centrados; el rail es sticky en escritorio y se apila en móvil.
- Mapa: panel de 300 px + escenario; en móvil el escenario va primero y los controles después.
- Todos los bordes son de 1 px. No hay radios, sombras de tarjeta ni contenedores flotantes.
- La asimetría es deliberada: 0.22 / 1 / 0.4 en cabeceras; 1.45 / 0.55 en el mapa.

## Componentes

### Cabecera

Barra fina de 76 px. En la portada es absoluta y transparente sobre el mapa; en interiores es sticky y sólida. Contiene glyph, wordmark, navegación mono (Exploraciones, Mapa, Aparato, Archivo) y búsqueda. En móvil la navegación pasa a una segunda fila con scroll horizontal.

### Portada

Una lámina a sangre: placa de terreno, arco orbital ocre, constelación de nodos reales y apertura editorial sobre el tercio izquierdo. El titular es «Un territorio de ideas en conexión.». Las acciones son dos líneas de texto con filete, no botones rellenos. Al pie, una escala de registro con los conteos reales y la fecha de actualización.

### Mapa

El mapa es una herramienta, no una ilustración. Cada nodo es un enlace; las líneas marfil corresponden a una relación declarada en el archivo y las ocre indican co-presencia entre nodos compartidos. Los nodos compartidos son ocre; los de una sola deriva, marfil. La vista «Constelación» oculta las relaciones únicas; «Archivo» lleva a la lista textual. El panel de detalle se actualiza al enfocar un nodo y la lista inferior es la alternativa accesible.

### Nodo / exploración

Cabecera con número, título, pregunta, resumen y ficha (tipo, conexiones, corpus, estado, actualización). Rail sticky con mapa de lectura y nodos. Cuerpo de lectura con medida de 68 caracteres, corpus por sección, diagramas y respiros. Aparato colapsable con corpus, nodos, relacionadas, anexos, trayectoria e historial.

### Aparato

Índice global en `/aparato/`, agrupado por exploración, con tipo, estado y fecha. Cada anexo conserva su ficha y sus fuentes. Las operaciones son corrección, fuente, concepto, objeción y derivación.

### Buscador

Diálogo nativo sobre `rizoma-index.json`. Filtra exploraciones, nodos y anexos. Sin JavaScript, el icono lleva al mapa; el sitio sigue siendo navegable.

## Textura y material

La placa de terreno vive en `public/assets/plates/terrain.webp` (el PNG fuente y la referencia de la comp quedan en `assets/plates/terrain.png`). Se genera con un prompt registrado en el propio archivo mediante `impeccable embed-prompt`: superficie mineral oscura, curvas topográficas tenues, grano analógico, sin texto ni símbolos. Se usa a sangre en la portada y en el escenario del mapa, y como muestra en el mini-mapa del nodo. Siempre va oscurecida y con un velo de carbón; nunca compite con el texto.

El grano global es un `feTurbulence` en `body.rizoma::before`, a opacidad 0.035. No se usa una imagen de ruido adicional.

## Movimiento

- Aparición progresiva de líneas y nodos al cargar, con duración larga y `ease-out`.
- Pulso lento del nodo activo (4.8 s).
- Hover/foco: el nodo y sus aristas se encienden; el resto baja a 0.1 de opacidad.
- Transiciones de color y filete de 250 ms; el subrayado de los títulos crece de 0 a 100 % en 400 ms.
- `prefers-reduced-motion` desactiva animaciones y transiciones; la información nunca depende de ellas.

## Reglas de interfaz

1. El texto manda. Ninguna textura, línea o nodo puede reducir el contraste del cuerpo.
2. El ocre es una señal, no un tema. Si todo es ocre, nada es señal.
3. Un nodo siempre lleva a una entrada real; una línea corresponde a una relación declarada o a co-presencia entre nodos compartidos, y la leyenda lo distingue.
4. La lista textual es la alternativa del mapa; no se oculta en móvil.
5. Sin JavaScript, el índice, el mapa, los nodos, el aparato y el historial se leen igual; el buscador degrada a un enlace.
6. No se inventan conteos, coordenadas, fechas ni relaciones. Los números de la interfaz salen del contenido.

## Archivos

- `src/styles/rizoma.css` — sistema visual y de interfaz.
- `src/components/RizomaHeader.astro`, `RizomaFooter.astro`, `RizomaBrand.astro`.
- `src/components/Cartography.astro` — constelación SVG.
- `src/lib/cartography.ts` — posiciones y relaciones reales.
- `public/rizoma-search.js`, `public/rizoma-map.js`, `public/rizoma-map-page.js`.
- `public/media/rizoma/glyph.svg`, `public/assets/plates/terrain.webp`.

## Accesibilidad

- Objetivo WCAG 2.2 AA: texto principal y secundario por encima de 4.5:1; el ocre pequeño usa `--rz-ochre-bright`.
- El mapa tiene título accesible, cada nodo es un enlace y la lista textual inferior conserva todas las entradas y relaciones.
- Los nodos filtrados u ocultos por la vista «Constelación» salen del orden de tabulación y del árbol de accesibilidad.
- El mini-mapa del nodo es decorativo: `tabindex="-1"` y `pointer-events: none`.
- Foco visible en enlaces, botones y nodos SVG; el nodo enfocado cambia el trazo y la etiqueta.
- La búsqueda usa un `<dialog>` nativo; sin JavaScript el icono lleva al mapa.
- `prefers-reduced-motion` desactiva el dibujo de aristas, el pulso y las transiciones.
