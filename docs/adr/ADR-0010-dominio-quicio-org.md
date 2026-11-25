---
title: "ADR 0010 — Dominio quicio.org y subdominios por proyecto"
date: 2026-11-24
estado: aceptada
---

# ADR 0010 — Dominio quicio.org y subdominios por proyecto

## Contexto

Rizoma se publicaba en `quicio.github.io/rizoma` y kndl en
`kndl.quicio.qzz.io`. La compra de `quicio.org` permite separar identidades por
proyecto con subdominios estables.

## Decisión

1. `kndl.quicio.org` es el sitio principal de KNDL.
2. `rizoma.quicio.org` es el sitio independiente de Rizoma, con raíz `/` y
   canonical propio.
3. `semina.quicio.org` es el dominio de Semina; su despliegue se configura en
   el repo/host de Semina, no acá.
4. El DNS vive en Cloudflare. Los registros de GitHub Pages deben ser CNAME en
   modo **DNS only** (sin proxy), para que la verificación y el certificado de
   GitHub funcionen.
5. Rizoma sigue embebido en kndl en `/rizoma/` durante la transición. La
   separación editorial del home de kndl es el paso siguiente del roadmap.
6. `quicio.qzz.io` se conserva como capa de redirects 301 hacia `quicio.org`.
   GitHub Pages no conserva dos custom domains a la vez; el dominio viejo se
   resuelve en Cloudflare con Redirect Rules, preservando path y query string.

## Orden de aplicación

1. Crear los registros DNS.
2. Verificar la propagación.
3. Configurar el custom domain en GitHub Pages y forzar HTTPS.
4. Desplegar y verificar rutas.

No se cambia el custom domain de Pages antes del DNS: el sitio actual dejaría de
responder.

## Consecuencias

- Rizoma standalone pasa de base `/rizoma` a base `/`.
- kndl conserva el embed con base `/rizoma` y canonical `kndl.quicio.org`.
- Los enlaces de Rizoma al corpus de KNDL pasan a `https://kndl.quicio.org`.
- ADR 0008 conserva las URLs de la migración anterior como registro histórico.
- Quedan pendientes los redirects de `quicio.qzz.io` y la configuración de
  Semina en su propio host.

## Referencias

- `docs/dominios.md` — runbook de DNS, Pages y redirects.
- `public/CNAME`
- `.github/workflows/deploy.yml`
- `quicio/rizoma`
- ADR 0008
