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
| `quicio.org` | hub o redirect a `kndl.quicio.org` | a definir |

## DNS de `quicio.org`

En Cloudflare, **DNS only** (gris, sin proxy):

```text
CNAME kndl    hugomoraga.github.io
CNAME rizoma  quicio.github.io
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
```

Si GitHub pide verificación, agregar el TXT
`_github-pages-challenge-<owner>` que indique. Después:

```bash
gh api -X PUT repos/hugomoraga/kndl000/pages -F https_enforced=true
gh api -X PUT repos/quicio/rizoma/pages -F https_enforced=true
```

## Apex `quicio.org`

No hay registros todavía. Dos opciones:

- **Hub**: una página simple con enlaces a kndl, Rizoma y Semina.
- **Redirect**: `quicio.org` → `https://kndl.quicio.org/`.

Para GitHub Pages en el apex harían falta los A records
`185.199.108.153`, `.109.153`, `.110.153` y `.111.153`, más el custom domain
correspondiente. Si el apex solo redirige, alcanza con Cloudflare Redirect
Rules.

## Criterio SEO

- `quicio.org` es canónico.
- `quicio.qzz.io` responde 301, no 200.
- No mantener dos copias indexables del mismo contenido.
- Rizoma embebido en kndl sigue canonalizando a `kndl.quicio.org/rizoma/`
  mientras dure la transición. Cuando Rizoma tenga identidad propia, el embed
  se retira y el canonical pasa a `rizoma.quicio.org`.
