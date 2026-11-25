# Dominios

## Zonas

| Zona | Rol |
|---|---|
| `quicio.org` | Dominio canónico nuevo |
| `quicio.qzz.io` | Dominio histórico; se conserva con redirects 301 |

## Mapa

| Host | Destino | Tipo |
|---|---|---|
| `kndl.quicio.org` | GitHub Pages `hugomoraga/kndl000` | CNAME DNS only |
| `rizoma.quicio.org` | GitHub Pages `quicio/rizoma` | CNAME DNS only |
| `semina.quicio.org` | Cloudflare Pages/Workers de Semina | custom domain proxied |
| `kndl.quicio.qzz.io` | 301 → `https://kndl.quicio.org` | Redirect Rule |
| `rizoma.quicio.qzz.io` | 301 → `https://rizoma.quicio.org` | Redirect Rule |
| `semina.quicio.qzz.io` | 301 → `https://semina.quicio.org` | Redirect Rule |
| `quicio.qzz.io` | 301 → `https://quicio.org` | Redirect Rule |
| `quicio.org` | sitio de Quicio (`quicio/quicio`) | GitHub Pages |

## DNS de `quicio.org`

En Cloudflare, **DNS only** (gris, sin proxy):

```text
CNAME kndl    hugomoraga.github.io
CNAME rizoma  quicio.github.io
A     @       185.199.108.153
A     @       185.199.109.153
A     @       185.199.110.153
A     @       185.199.111.153
```

`semina` no va a GitHub Pages: es una app Next.js/OpenNext detrás de
Cloudflare. Se agrega como custom domain en el proyecto de Cloudflare que sirve
Semina, no como CNAME a `quicio.github.io`.

## Redirects de `quicio.qzz.io`

Para que Cloudflare aplique Redirect Rules, el host viejo tiene que pasar por el
proxy. Si hoy está en DNS only, primero creá un registro proxied de relleno:

```text
A kndl    192.0.2.1  Proxied
A rizoma  192.0.2.1  Proxied
A semina  192.0.2.1  Proxied
```

Después, en **Rules → Redirect Rules**, una regla por host:

- Si el hostname es `kndl.quicio.qzz.io`
- Redirigir a `concat("https://kndl.quicio.org", http.request.uri.path)`
- Estado `301`
- Preservar query string

Repetir para `rizoma` y `semina`. Para el apex `quicio.qzz.io`, redirigir a
`https://quicio.org/` o al hub que se defina.

No uses un CNAME de `kndl.quicio.qzz.io` a `kndl.quicio.org` con proxy: el Host
header sigue siendo el viejo y GitHub Pages puede devolver 404. El redirect
explícito conserva el path y no depende del host de origen.

## Orden de activación

1. Crear los CNAME de `kndl` y `rizoma` en `quicio.org`.
2. Verificar propagación:
   ```bash
   dig +short kndl.quicio.org
   dig +short rizoma.quicio.org
   ```
3. Configurar el custom domain en GitHub Pages y esperar el certificado.
4. Verificar HTTPS en los dominios nuevos.
5. Activar los Redirect Rules de `quicio.qzz.io`.
6. Verificar que un path viejo redirija bien:
   ```bash
   curl -I https://kndl.quicio.qzz.io/rizoma/archivo/
   curl -IL https://kndl.quicio.qzz.io/rizoma/archivo/
   ```

No inviertas el orden: si cambiás el custom domain de Pages antes del DNS, el
sitio viejo deja de responder.

## GitHub Pages

Un repo solo puede tener un custom domain. Por eso el dominio viejo no se
configura como segundo custom domain: se resuelve con redirects en Cloudflare.

```bash
gh api -X PUT repos/hugomoraga/kndl000/pages -f cname=kndl.quicio.org
gh api -X PUT repos/quicio/rizoma/pages -f cname=rizoma.quicio.org
gh api -X PUT repos/quicio/quicio/pages -f cname=quicio.org
```

Si GitHub pide verificación, agregar el TXT
`_github-pages-challenge-<owner>` que indique. Después:

```bash
gh api -X PUT repos/hugomoraga/kndl000/pages -F https_enforced=true
gh api -X PUT repos/quicio/rizoma/pages -F https_enforced=true
```

## Apex `quicio.org`

Vive el sitio de Quicio desde el repo `quicio/quicio`, con A/AAAA de GitHub
Pages y custom domain propio. `quicio.github.io/quicio/` redirige al apex.

## Estado 2026-11-25

- `quicio.org`, `kndl.quicio.org`, `rizoma.quicio.org` y `semina.quicio.org`
  están publicados con HTTPS.
- `kndl.quicio.qzz.io` responde 404: falta la Redirect Rule 301.
- `semina.quicio.qzz.io` sigue sirviendo Semina; el 301 al dominio nuevo queda
  pendiente.
- `quicio.qzz.io` y `rizoma.quicio.qzz.io` no tienen registros.

## Criterio SEO

- `quicio.org` es canónico.
- `quicio.qzz.io` responde 301, no 200.
- No mantener dos copias indexables del mismo contenido.
- Rizoma canónico es `rizoma.quicio.org`.
- kndl publica un índice en `/rizoma/` y enlaza; no copia el sitio.
- Las URLs viejas de `kndl.quicio.org/rizoma/<slug>/` redirigen a Rizoma.
