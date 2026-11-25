# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro 7 en modo estático, contenido Markdown en `src/content/`, resolución de datos en build time (`src/lib/`) y CSS propio sin framework de UI. El JavaScript del sitio solo mejora navegación y movimiento. Se publica en `rizoma.quicio.org` y también puede embeberse como artefacto estático en KNDL bajo `/rizoma/`.

## Users

Lectores, investigadores, diseñadores y curiosos que llegan desde Quicio, KNDL, una referencia compartida o una búsqueda. Entran por el índice, por un nodo del mapa, por el corpus o por una exploración concreta. Su trabajo es orientarse en una investigación abierta, seguir una idea y entender de dónde viene y con qué se relaciona, sin sentirse dentro de un blog ni de un catálogo comercial.

## Product Purpose

Rizoma reúne exploraciones intelectuales abiertas: cada una parte de una pregunta y se desplaza por lecturas, obras, fragmentos, conceptos y anexos. El sitio hace visible ese movimiento —índice, mapa de nodos y páginas de exploración— y conserva la procedencia y el aparato de cada deriva. El éxito es que un lector entienda qué se está pensando, encuentre una conexión inesperada y sepa cómo seguir leyendo.

## Positioning

No es un blog, una tesis ni una colección de publicaciones. Es una cartografía de deriva: un territorio intelectual en construcción donde las ideas se desplazan, se fragmentan, conectan y reaparecen. La unidad no es el post ni la categoría, sino la relación entre una pregunta, sus materiales y las palabras que cambian de sentido al atravesarla.

## Operating Context

- El contenido público vive en `src/content/`: exploraciones, nodos y anexos por exploración.
- El proceso editorial vive en `trabajo/` y el backoffice local en `taller/`; no se publica.
- El sistema y las decisiones viven en `docs/`, con ADR como fuente.
- Las exploraciones actuales son **01 — ¿Qué se conserva cuando algo se repite?** y **02 — Lo que el archivo no conserva**.
- Los nodos son vocabulario compartido: una palabra llega a nodo cuando aparece en dos cuerpos con sentido distinto. Hay doce nodos y cinco compartidos entre 01 y 02.
- El aparato agrupa anexos por operación: corrección, fuente, concepto, objeción y derivación.
- Las láminas están retiradas de la publicación; sus artefactos quedan en `trabajo/laminas/`.
- El lector puede entrar por índice, mapa, nodo, corpus o búsqueda. La búsqueda es estática, sin backend ni tracking, y filtra exploraciones, nodos y anexos.

## Capabilities and Constraints

- Rutas actuales que deben preservarse: `/`, `/[slug]/`, `/nodos/`, `/[slug]/anexos/`, `/[slug]/anexos/[anexo]/`, `/[slug]/historial/` y `/trayectoria/[id]/`. Se agrega `/aparato/` como índice global de anexos.
- Builds con `RIZOMA_BASE=/` (dominio propio) y `RIZOMA_BASE=/rizoma` (embebido en KNDL); los enlaces al corpus de KNDL se resuelven con `RIZOMA_KNDL_ORIGIN`.
- No hay CMS, base de datos, login, newsletter ni backend de búsqueda.
- El contenido y las rutas no se reescriben para el rediseño. La prosa, los títulos, las preguntas y las fuentes son del autor.
- No introducir dependencias de runtime innecesarias. Preferir HTML, CSS y SVG; el sitio funciona sin JavaScript.
- No inventar fuentes, fechas, métricas, testimonios ni relaciones. Si un dato no está en el contenido o en el archivo, no se publica.
- El sitio debe poder crecer con nuevas exploraciones y nodos sin rediseñar el sistema.

## Brand Commitments

- Nombre: **Rizoma**. Pertenece al ecosistema creativo e intelectual de Quicio.
- Concepto rector: **Cartografía de deriva**. No representar literalmente raíces, plantas ni árboles.
- Paleta fijada por el brief: carbón profundo `#171614`, marfil cálido `#E9E0D1`, ocre `#A87832`, gris mineral `#77736B`. Carbón y marfil como fondos principales; ocre como acento puntual. Sin colores saturados.
- Tipografía: serif editorial expresiva para títulos; sans serif sobria para interfaz; monoespaciada para coordenadas, etiquetas, referencias, fechas y metadatos.
- Textura: granularidad fina y consistente, inspirada en papel fibroso, impresión analógica, mapas topográficos, superficies minerales, nubes de tinta y cartografía astronómica. Sutil, nunca en contra de la lectura.
- Recursos gráficos: nodos de distintos tamaños, líneas finas y curvas, bifurcaciones, arcos y círculos incompletos, coordenadas, marcas de registro, retículas cartográficas, fragmentos de imagen, zonas de densidad y vacío. Deben parecer mapas de relaciones en evolución, no visualizaciones genéricas de redes.
- Glyph propio basado en bifurcación, conexión y deriva; simple, reconocible, funcional en tamaños pequeños. No copia del logo de Quicio ni planta literal.
- Relación con Quicio: misma gramática (paleta, criterio tipográfico, granularidad, retículas, tratamiento editorial), identidad propia. Quicio es el marco; Rizoma es la exploración.
- Evitar estética tecnológica genérica, dashboards convencionales, redes neuronales cliché e interfaces futuristas.

## Evidence on Hand

- Dos exploraciones completas con cuerpo, pregunta, resumen, corpus, nodos, anexos, hitos y procedencia en `src/content/`.
- Doce nodos con definición y orden en `src/content/nodos/`.
- Seis anexos con tipo, estado, fuentes y procedencia en `src/content/anexos/`.
- Datos de presentación, composiciones, trama y cartografías en `src/data/`.
- Mockup de referencia aportado por el autor: `/home/hugo/Descargas/Rizoma_ mapa de ideas conectadas.png`.
- Glyph propio en `public/media/rizoma/glyph.svg` y placa de terreno en `public/assets/plates/terrain.webp`.
- No hay equipo, clientes, testimonios, métricas públicas ni fotografía de prensa que puedan citarse.

## Product Principles

1. **El mapa es una herramienta, no una ilustración.** Cada nodo y conexión debe corresponder a contenido real o a una relación declarada.
2. **La lectura manda.** La experimentación visual no puede competir con el texto; el cuerpo se lee en medida y contraste cómodos.
3. **La procedencia se conserva.** Fuentes, anexos, estados y ausencias se nombran; no se maquilla lo que falta.
4. **La interfaz se retira.** El lector debe sentir que pasa de una página a un territorio y de allí a otra idea, no que opera un dashboard.
5. **El sistema queda abierto.** Nuevas exploraciones y nodos deben entrar sin rediseñar la identidad.

## Accessibility & Inclusion

- Objetivo WCAG 2.2 AA: contraste suficiente, foco visible, navegación por teclado, jerarquía semántica y textos alternativos.
- Respeto de `prefers-reduced-motion`; ninguna información depende de una animación o de JavaScript.
- Diseño responsive real en 360, 390, 768, 1024 y 1440 px, sin scroll horizontal.
- El mapa debe tener una alternativa textual navegable: la lista de nodos y relaciones siempre está disponible.
