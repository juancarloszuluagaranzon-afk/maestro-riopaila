# Maestro de Suertes — Riopaila / Castilla

PWA estática **offline-first** que consultan los ingenieros y supervisores en campo.
Muestra el maestro de suertes (caña) y el histórico de cortes ZQM101, y enlaza cada
suerte a su ubicación en **Rio Map** por coordenadas.

- **Producción:** https://juancarloszuluagaranzon-afk.github.io/maestro-riopaila/
- **Repo:** https://github.com/juancarloszuluagaranzon-afk/maestro-riopaila (rama `main`)
- **Despliegue:** GitHub Pages sirve `main` directamente. **Push a `main` = publicar.**
  No hay workflow de CI (se eliminó en `4604fe9`); no hay paso de build.

## Arquitectura

Sin build, sin dependencias, sin `package.json`. Todo es HTML/CSS/JS plano servido tal cual,
**incluidos Tailwind y las fuentes**, que viven en `vendor/` (ver la regla 1 abajo).

| Archivo | Rol |
|---|---|
| `index.html` | Portada. Selección de empresa, registro del SW, prompt de instalación PWA. |
| `maestro.html` | **La aplicación completa** (~3.300 líneas: HTML + CSS + JS inline). |
| `service-worker.js` | Caché offline. Network-first general, stale-while-revalidate para CSV. |
| `manifest.json` | Manifiesto PWA. |
| `maestro.csv` | Datos del maestro de suertes. |
| `zqm.csv` | Datos del histórico de cortes (ZQM101). |
| `icon-192/512.png`, `logo-riopaila.png`, `logo-castilla.png` | Assets. |
| `vendor/` | Tailwind y las fuentes, servidos desde el propio origen. |

Los CSV se actualizan subiéndolos al repo (históricamente vía "Add files via upload"
desde la web de GitHub). No hay backend ni base de datos.

### Dos vistas en una sola UI

`maestro.html` define `VIEWS = { maestro, zqm }`. Cada vista tiene su propio objeto de
estado (`makeViewState()`: filas, filtros, orden, página). `STATE` es un **alias** a la
vista activa; `switchView(key)` cambia el alias y reconstruye la UI desde el estado
guardado de la vista destino. Cada vista declara su CSV, columnas fijas (`stickyCols`),
filtros, procesador de filas y renderizador del modal.

Solo `maestro` tiene `totalsConfig` (fila de totales declarativa: `sum`, `weightedAvg`,
`ratio`). ZQM no muestra totales.

### Alcance por empresa

`index.html` abre la app con `?empresa=RIOP` (Riopaila) o `?empresa=CAST,CAUC` (Castilla,
que incluye las suertes CAUC). La vista Maestro queda restringida a esos códigos de la
columna `EMPRESA`. **Sin el parámetro, Maestro no muestra filas** y pide elegir empresa.
ZQM no tiene columna `EMPRESA` y nunca se filtra por empresa.

### Enlace a Rio Map

La columna `COORDENADAS` (`"lat,lon"`) se convierte en un enlace 📍 en la tabla y en un
botón en el modal de detalle:

```
https://riomap.vercel.app/mapa?p={planta}&lat={lat}&lon={lon}&n=Suerte {suerte}
```

`p` = `riopaila` si `EMPRESA` es `RIOP`, si no `castilla`. Coordenadas mal formadas o
vacías muestran "Sin coordenada" en vez de un enlace roto.

### Lectura de CSV

`parseCsvText` es deliberadamente tolerante porque los archivos vienen de exportaciones
de SAP/Excel/Sheets con formatos inconsistentes: autodetecta separador (`;`, tabulador,
coma), maneja ANSI y UTF-8, normaliza encabezados (`normalizeHeader`) y neutraliza
sentinelas de error (`#N/D`, `#REF!`, `#DIV/0!`, …) vía `ERROR_VALUES`.

Los `match:` de los filtros toleran variantes de codificación a propósito
(p. ej. `AÑO` / `ANO` / `AÃO`, `Ubic Técnica` / `Ubic Tecnica`). **No los "simplifiques".**

## Reglas del proyecto

### 1. Nada de recursos externos

**Ningún `<script src="http...">`, `<link href="http...">`, CDN, webfont ni API externa.**
Todo lo que la app necesita para pintar tiene que estar en el repo y en `CRITICAL_URLS`.

Esto no es purismo: hasta v2.3.x, Tailwind y las fuentes venían de CDN. El service worker
no las veía siquiera (ignora todo lo que no sea del propio origen), así que sin señal la
app se quedaba sin CSS. Y sin Tailwind la clase `.hidden` deja de existir, o sea que el
spinner, el mensaje de error, el banner de offline, el drawer y los modales aparecen
**todos a la vez, encimados**. No se veía "sin estilos": se veía rota.

Peor aún, el CSS de Google Fonts se sirve con `Cache-Control: max-age=86400`. Caducaba
cada 24 h, y por eso fallaba justo *la primera apertura del día* sin señal.

### 2. Caché primero, siempre

La app abre desde caché; la red solo refresca en segundo plano (`staleWhileRevalidate`).
Nunca al revés.

En campo la conexión rara vez está limpiamente ausente: es una barra que no enruta. Ahí
`fetch()` **no rechaza rápido**, se queda esperando el timeout del sistema. Una estrategia
"red primero" deja la pantalla en blanco decenas de segundos aunque la respuesta esté en
caché — que era exactamente el síntoma en v2.3.x. Además `navigator.onLine` devuelve
`true` en ese estado, así que no te fíes de él para decidir nada importante.

Por el mismo motivo `install` es **todo o nada**: si algún recurso crítico falla, la
instalación se aborta y se sigue sirviendo la versión anterior. Antes cacheaba lo que
podía, y como `activate` borra la caché previa, una instalación a medias con señal
intermitente dejaba al usuario sin app.

### 3. La versión vive en CINCO lugares — súbelos juntos

Un release desincronizado deja a los usuarios con caché vieja y sin forma de actualizar:

| Archivo | Símbolo |
|---|---|
| `service-worker.js` | `CACHE_VERSION` |
| `index.html` | `APP_VERSION` |
| `index.html` | texto visible `v2.4.0 • 2026 Edition` al pie |
| `maestro.html` | `CONFIG.version` |
| `maestro.html` | `<span id="appVersion">` en el encabezado |

Versión actual: **v2.4.0**. Comprobación rápida — deben salir 5 coincidencias iguales:

```bash
grep -oh "v2\.[0-9]*\.[0-9]*" index.html maestro.html service-worker.js | sort | uniq -c
```

### 4. Un solo archivo, sin framework

`maestro.html` es intencionalmente monolítico para que funcione offline sin build. Mantén
el estilo existente: funciones planas, `STATE` compartido, sin dependencias nuevas.

## Desarrollo local

El SW y el `fetch` de los CSV **no funcionan con `file://`**. Sirve la carpeta por HTTP:

```bash
python -m http.server 3600 --directory "C:/Users/Agr349/maestro-riopaila"
```

Luego abre http://localhost:3600 .

No hay tests ni linter. La verificación es manual: cargar ambas vistas, filtrar, ordenar,
abrir un detalle, exportar CSV y probar en modo avión.

### Probar el service worker en la subruta real

En local la app corre en la raíz (`/`), pero en producción vive bajo `/maestro-riopaila/`.
Un SW que asuma la raíz **parece funcionar en local y falla publicado** (así se coló el bug
corregido en v2.3.3). **Prueba siempre así antes de publicar un cambio en el SW.**
Para reproducir la ruta real, sirve desde el directorio *padre*:

```bash
python -m http.server 3601 --directory "C:/Users/Agr349"
```

y abre http://localhost:3601/maestro-riopaila/ . Comprobación de que el precache entró:

```js
caches.open('riopaila-maestro-v2.4.0').then(c => c.keys()).then(k => console.log(k.length, k.map(r => r.url)))
```

Deben aparecer **16** entradas, todas bajo `/maestro-riopaila/`. Y cero peticiones a otro
origen:

```js
performance.getEntriesByType('resource').filter(e => !e.name.startsWith(location.origin))
```

Luego **apaga el servidor** y navega a una página que no hayas abierto. Debe cargar completa
y con estilos. Medido así en v2.4.0: 277 ms hasta `load`, HTML y CSV a 4 y 3 ms desde caché.

## Fuentes e íconos

`vendor/fonts.css` está escrito a mano y apunta a los `.woff2` locales. Manrope es variable
(un solo archivo cubre 300–800). Material Symbols va **subseteada a los íconos que usa la
app** — 24 KB en vez de ~200 KB.

Si agregas un ícono nuevo, hay que regenerar ese subset o saldrá en blanco. La lista sale de:

```bash
grep -oh 'material-symbols-outlined[^>]*>[[:space:]]*[a-z0-9_]*' index.html maestro.html | grep -o '[a-z0-9_]*$' | sort -u
```

Con esa lista, pide el `.woff2` a Google conservando los ejes variables (de ellos depende el
`font-variation-settings: 'FILL' 1` de la app) y guárdalo como `vendor/material-symbols.woff2`:

```
https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=<lista,separada,por,comas>
```

Ese CSS devuelve la URL del binario; hay que descargarla con un User-Agent moderno o Google
responde con TTF en vez de WOFF2.

## Contexto de negocio

- **Suerte**: unidad mínima de manejo del cultivo de caña (lote).
- **Corte**: cada cosecha de una suerte; `EDAD HOY MESES` se calcula desde la fecha del
  último corte.
- **TCH**: toneladas de caña por hectárea. En la fila de totales, el TCH se calcula como
  Σtoneladas / Σárea, **no** como promedio de los TCH por fila.
- **Empresas**: `RIOP` (Riopaila Agrícola), `CAST` / `CAUC` (Castilla Agrícola).
