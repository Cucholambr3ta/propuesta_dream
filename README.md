# Dreamlike Electricidad — Prototipo web (tienda + cuenta + admin)

Prototipo estatico (HTML/CSS/JS puro, sin build) para revision visual del proyecto
ecommerce B2B de Dreamlike. Ver contexto completo en `acuerdos/idea/INDEX.md` y
`acuerdos/design/paleta.md`.

Sin dependencias externas — HTML/CSS/JS puro. (GSAP se uso hasta 2026-08 para animar la
entrada de las tarjetas de "Compra por categoria"; se removio junto con el patron
"expanding cards" — ver mas abajo.)

Las tarjetas de "Compra por categoria" (`.dl-cats`/`.dl-cat` en
`assets/css/main.css`) son un **grid estatico simple**: nombre de cada categoria siempre
visible, sin depender de hover para revelar informacion. Cambiado (2026-08) desde el
patron original "expanding cards" (fila angosta que se expandia al hover, nombre oculto
hasta entonces) por pedido explicito del cliente — su publico objetivo incluye adultos
mayores, y un patron que exige hover para ver que es cada categoria no es utilizable para
ese perfil. La animacion de entrada por scroll (GSAP/ScrollTrigger) se elimino junto con
el patron — sin GSAP, el sitio queda sin dependencias externas.

## Navegacion: mega-menu + menu hamburguesa

Rediseño completo del header/nav (2026-08-02), presente en las 9 paginas:

- **Desktop (>=1024px)**: mega-menu tipo `ct-ferrelectrica.bsalemarket.com` (referencia
  funcional del proyecto) — 10 categorias en la barra, cada una abre al hover/focus un
  panel de hasta 4 columnas con subcategorias. Teclado: `Tab` navega, `Enter`/`Espacio`
  abre, `Escape` cierra.
- **Mobile (<1024px)**: el boton hamburguesa (antes un placeholder que solo hacia scroll)
  ahora abre un panel deslizante lateral real, con acordeon de categorias/subcategorias,
  overlay y boton "Cerrar Menu". Un panel a la vez, cierra con overlay/boton/`Escape`.
- **Fuente unica**: `assets/data/categorias.json` (10 categorias × subcategorias) alimenta
  ambos (desktop y mobile) desde `assets/js/mega-menu.js` — sin HTML duplicado a mano.
  Mismo patron fetch-con-fallback que `productos.json`: `assets/js/categorias-fallback.js`
  cubre `file://` sin servidor.
- Las **subcategorias son taxonomia de navegacion**, generadas para el rubro electrico
  chileno — el catalogo demo (12 SKUs en `productos.json`) no tiene producto cargado para
  cada una. No es un bug si una subcategoria no muestra resultados; es esperable en un
  prototipo con catalogo de demostracion.

Reemplaza el carrusel de pills anterior (`assets/js/nav.js`, eliminado) que no tenia
jerarquia ni mega-menu, y cuyo boton mobile no abria ningun panel real.

## Drawer de carrito

Click en el icono de carrito (`index.html`, `producto.html`) abre un panel lateral desde
la derecha con los items agregados — no navega a `carrito.html`. Permite sumar/restar
cantidad y quitar items sin salir de la pagina. Debajo de la lista, si hay items, una
seccion **"Tambien te puede interesar"** sugiere hasta 3 productos de la(s) misma(s)
categoria(s) de lo que ya esta en el carrito (excluyendo lo ya agregado) — mismo criterio
de "relacionados" que ya usa la PDP (`assets/js/producto.js`), sin inventar un segundo
criterio de recomendacion. Tres acciones en el pie: "Ver carrito completo" (lleva a
`carrito.html`, que se mantiene igual), **"Solicitar cotizacion"** (mismo flujo que en
`carrito.html` — exige sesion, ver seccion siguiente) y "Cotizar por WhatsApp". Cierra con
el boton ×, click en el overlay, o `Escape`. Ver `assets/js/carrito-drawer.js`.

En `carrito.html` el icono no abre el drawer (ya estas en esa vista); en `mi-cuenta.html`
y `admin/*` no hay icono de carrito en el header (no aplica).

## Modal de mapa (footer)

Click en la direccion del footer (`index.html`, `producto.html`) abre un modal centrado
con **Google Maps real embebido** (iframe publico `google.com/maps?...&output=embed`, sin
API key), mostrando Av. El Ventisquero 1225 Bod. 49, Renca. Anima una expansion desde el
punto exacto donde se hizo click (`transform-origin` dinamico). El mapa lleva un filtro
CSS sutil (`saturate(.85) hue-rotate(-6deg)`) para acercar sus colores al celeste de marca
sin sacrificar legibilidad de calles/etiquetas. Boton "Abrir en Google Maps" para verlo
completo fuera del modal. Cierra con X, click en overlay, o `Escape`. Ver
`assets/js/mapa-modal.js`.

## Solicitar cotizacion (carrito)

`carrito.html` tiene un boton **"Solicitar cotizacion"**, distinto de "Cotizar por
WhatsApp" (ese sigue siendo un link externo). Este boton exige sesion:

- **Sin sesion**: redirige a `login.html?redirect=carrito.html&accion=cotizar`. Tras el
  login (simulado, cualquier credencial), vuelve automaticamente al carrito y **envia la
  cotizacion solo, sin pedir un segundo click** — el flujo se retoma donde se dejo.
- **Con sesion activa**: envia de inmediato.

Al enviar: se crea un pedido nuevo (`window.dlAuth.agregarPedido()`, estado "Cotizacion
enviada", numero `DL-XXXXX` generado) al tope del historial del cliente logueado, el
carrito se vacia, y redirige a `mi-cuenta.html#pedidos` donde la cotizacion queda visible
de inmediato en la tabla. Ver `assets/js/carrito-pagina.js` (`initSolicitarCotizacion`) y
`assets/js/login.js` (soporte de `?redirect=` generico, reusable por cualquier flujo
futuro que necesite forzar login y volver).

El **drawer de carrito** (ver siguiente sección) tiene el mismo botón. Al hacer click ahí
se navega a `carrito.html?accion=cotizar` — si hay sesión, esa página detecta el parámetro
y dispara el envío sola (mismo mecanismo que el retorno post-login); si no hay sesión, pasa
primero por `login.html?redirect=carrito.html&accion=cotizar`. Ningún flujo duplica la
lógica de envío — vive en un solo lugar (`carrito-pagina.js`).

## Navegacion real de productos (categoria -> producto)

Antes de esto, `producto.html` mostraba siempre el mismo SKU fijo sin importar de donde
se venia, y **todos** los links de categoria (mega-menu, footer, sección "Compra por
categoría") apuntaban a `index.html#slug`, un ancla que no existe en ningún lado — cero
funcionaban. Arreglado de raíz:

- **`producto.html?sku=XXX`**: la PDP ahora es dinámica — `assets/js/producto.js` lee el
  SKU de la URL, busca el producto real en `productos.json`/fallback y puebla titulo,
  precio, stock, breadcrumb, tabs (descripción + specs generadas desde `specs{}`), botón
  de WhatsApp y galería. Sin `?sku=` o SKU inválido, cae al primer producto del catálogo
  (nunca queda en blanco — es un prototipo, no un 404 real).
- **`categoria.html?slug=X`** (pagina nueva): lista todos los productos reales de esa
  categoría (`assets/js/categoria.js`, filtra `productos.json` por `categoriaSlug`),
  mismo componente de card que la home. Si la categoría no tiene productos demo cargados,
  muestra un estado vacío honesto en vez de una grilla rota. Cabecera con **banner de
  imagen por categoría** (campo `banner` en `assets/data/categorias.json`, editable ahí
  mismo — pedido del cliente, ver `reunion.odt`), no solo título de texto plano.
- **Relacionados en la PDP**: ahora priorizan productos de la **misma categoría** del
  producto actual, no un listado genérico.
- **Todos los links corregidos**: mega-menu (desktop + acordeón mobile), cards de
  "Productos destacados", grid de categoría, carrito (tabla y drawer), footer de
  `index.html`/`producto.html` (ahora lista las 10 categorías reales, antes solo 7), y el
  botón "Ver en tienda" del admin de productos (antes `href="#"` sin destino).

Cadena completa verificada con Puppeteer: home → card de producto → PDP real → breadcrumb
→ categoría filtrada → producto de esa categoría → agregar al carro → drawer con link de
vuelta al producto. 0 errores de consola en todo el recorrido.

### Catálogo ampliado (52 productos)

El catálogo demo creció de 12 a **52 productos**, 4-7 por cada una de las 10 categorías
(antes varias categorías tenían solo 1 SKU, lo que hacía la navegación por categoría poco
creíble para una demo). Mismo schema, mismo patrón fetch-con-fallback — al editar
`assets/data/productos.json`, regenerar `assets/js/productos-fallback.js` con el script
documentado más abajo.

### Hero: slides de categoría son clickeables

Los slides 3 y 4 del hero ("Automatización y Control", "CCTV y Seguridad") representan
categorías reales pero no llevaban a ningún lado. Ahora el slide completo es un link
(`.dl-hero__slide-link`, capa cobertora `position:absolute` dentro del slide) hacia
`categoria.html?slug=X` — sin romper el selector que usa `hero.js` para el carrusel ni
tapar las flechas prev/next (viven fuera del slide, en otro nivel del DOM). Los slides 1 y
2 son genéricos (sin categoría específica): el 1 mantiene sus botones "Ver catálogo" /
"Cotizar por WhatsApp", el 2 queda sin acción — sería forzar una categoría donde no hay
una real.

**Hero como card contenida (2026-08)**: pedido del cliente (`reunion.odt`) — el hero pasó
de franja full-bleed (ocupaba todo el ancho del viewport) a una card contenida dentro de
`.dl-wrap` (mismo `max-width` que el resto de las secciones), con `border-radius` y espacio
blanco alrededor, para mantener consistencia visual con el resto de las superficies del
sitio. `hero.js` no se tocó — depende de selectores (`#heroPista`, `.dl-hero__slide`), no
de layout.

### Buscador con autocompletar

El input de búsqueda del header (`.dl-buscador`, presente en `index.html`, `categoria.html`,
`producto.html`, `carrito.html`, `marca.html`) sugiere productos en vivo a partir de **2
caracteres** escritos — por nombre, SKU o marca. Ver `assets/js/buscador.js`: mismo patrón
fetch-con-fallback que el resto del catálogo, dropdown de hasta 6 resultados con imagen +
nombre + marca + precio, cada uno linkeando a `producto.html?sku=X`. Sin resultados muestra
un mensaje explícito en vez de dejar el dropdown vacío. Cierra con click afuera o `Escape`.

### Mega-menu: items = productos reales, no taxonomía inventada

`assets/data/categorias.json` originalmente tenía subcategorías redactadas a mano ("Cable
THHN", "Alambre NYA", etc.) que no correspondían a ningún SKU real — cada click, sin
importar el ítem, caía siempre a `categoria.html?slug=X` (la categoría completa, nunca el
producto específico). Reescrito para que **cada ítem del mega-menu sea un producto real**:
`categorias.json` se generó agrupando los 52 productos de `productos.json` por
tipo/columna dentro de su categoría — 1:1, sin inventar nombres. `assets/js/mega-menu.js`
ahora linkea cada ítem a `producto.html?sku=X` (antes `categoria.html?slug=X` para todos);
el botón "Ver todo {categoría}" es la única excepción, sigue yendo al listado completo de
la categoría (su función correcta). Verificado con Puppeteer en desktop y mobile: el texto
del ítem clickeado coincide con el producto que carga la PDP.

Si se edita `productos.json` (agregar/quitar SKUs), `categorias.json` debe regenerarse a
mano para mantener la correspondencia 1:1 — no hay generación automática desde el catálogo,
las columnas/orden son curados.

## Marcas: carrusel clickeable → listado por marca

"Marcas que trabajamos" en `index.html` era una grilla estática de 10 nombres hardcodeados
(uno con typo: "Schneider" en vez de "Schneider Electric", el nombre real en el catálogo —
no habría coincidido con ningún filtro). Reescrito:

- **`assets/js/marcas-home.js`**: pinta el carrusel leyendo las marcas reales de
  `productos.json`/fallback (19 marcas, dedupe automático, mismo orden del catálogo) —
  ningún nombre vive hardcodeado en el HTML, así que no puede desincronizarse.
- **`.dl-marcas`** pasó de grid estático a fila con scroll horizontal (`overflow-x: auto`,
  `scroll-snap`), mismo patrón que el nav de categorías.
- **`marca.html?nombre=X`** (página nueva) + **`assets/js/marca.js`**: filtra
  `productos.json` por `p.marca`, mismo patrón que `categoria.html`/`categoria.js` —
  mismo componente `.dl-card`, mismo estado vacío honesto si una marca no tiene productos
  cargados. Nombre inválido en la URL cae a la primera marca real del catálogo.

Verificado con Puppeteer: 19 tiles en el carrusel, click en cualquiera lleva a
`marca.html?nombre=X`, y las cards mostradas ahí son 100% de esa marca (sin falsos
positivos por coincidencia parcial de texto).

## Que incluye

### Tienda (publica)

- `index.html` — landing: topbar, header, nav de categorias, hero slider, categorias
  destacadas, grid de productos, franja de confianza, marcas, CTA de cotizacion, footer.
- `producto.html` — pagina de producto: galeria, precio, stock, selector de cantidad,
  agregar al carro, cotizar por WhatsApp, tabs (descripcion/specs/despacho), relacionados.
- `carrito.html` — carrito de compras: lista items guardados, permite cambiar cantidad
  o quitar, calcula subtotal/total, boton de cotizar por WhatsApp con el detalle.
- `assets/data/productos.json` — catalogo de demostracion (12 productos, rubro electrico).

### Cuenta de cliente (requiere "sesion")

- `login.html` — formulario de acceso. **Simulado**: cualquier email/password entra.
- `mi-cuenta.html` — perfil editable, historial de pedidos (demo), direcciones guardadas.

### Panel de administracion (`admin/`, sesion independiente de la de cliente)

- `admin/login.html` — acceso al panel. **Real**: valida contra la tabla `admin_usuarios`
  (sesion PHP de servidor, no simulada — ver seccion "Backend del panel admin").
- `admin/index.html` — dashboard: metricas (ventas, pedidos activos, stock bajo),
  ultimos pedidos, productos con menor stock. Pedidos siguen siendo datos de ejemplo
  (`localStorage`, ver mas abajo); las metricas de productos usan el catalogo estatico,
  no la BD en vivo — presionar "Publicar catalogo" en Productos las mantiene al dia.
- `admin/productos.html` — **CRUD real** contra la base de datos: crear producto, editar,
  actualizar stock inline, eliminar, importar por lote (CSV/XML), y publicar el catalogo
  hacia la tienda. Ver detalle completo en "Backend del panel admin" mas abajo.
- `admin/pedidos.html` — tabla de pedidos de todos los clientes, con filtro por estado
  (todavia simulado, ver abajo).

## Que es simulado (y por que)

La tienda publica y la cuenta de cliente siguen siendo **prototipo visual sin backend**.
El panel admin de productos, en cambio, **ya tiene backend real** (PHP + BD — SQLite para
demo sin instalar nada, MySQL para produccion) — ver "Backend del panel admin". Lo que
sigue simulado:

- **Login de cliente** (`login.html`, tienda publica): cualquier email/password valido
  "inicia sesion". Sesion en `localStorage` (`dl_sesion`).
- **Login de admin**: ya NO es simulado — sesion PHP real contra `admin_usuarios`
  (`dl_sesion_admin` de `localStorage` quedo reemplazado por la cookie de sesion de PHP).
- **Carrito**: se guarda en `localStorage` del navegador. No hay checkout ni pago real
  (el boton "Ir a pagar" esta deshabilitado a proposito); el camino real hoy es cotizar
  por WhatsApp o mail, igual que el negocio actual.
- **Pedidos y direcciones** (cliente y admin): datos de ejemplo generados una vez y
  guardados en `localStorage`, no vienen de ningun pedido real. Fuera de alcance de este
  trabajo — se resuelve con backend real de pedidos en una entrega futura, mismo criterio
  que se uso para productos.

Esto sirve para **aprobar diseno y flujo** con el cliente antes de invertir en el backend
completo (checkout, pedidos reales, permisos y roles de admin mas alla de login).

## Que NO incluye (fuera de alcance de esta entrega)

Checkout, pasarela de pago (Webpay/Transbank), base de datos/backend de **pedidos**
(solo productos tiene backend real por ahora), permisos y roles finos de admin (hoy es
un solo tipo de usuario admin, sin niveles). Se decide y construye despues de aprobar
este prototipo.

## Subir a cPanel

El sitio ahora tiene dos partes: **frontend estatico** (igual que antes) + **backend PHP**
(nuevo, solo para el panel admin de productos). Pasos actualizados:

1. Comprimir **el contenido** de esta carpeta en un `.zip` (no la carpeta contenedora
   completa — el `.zip` debe tener `index.html` en su raiz).
2. Entrar a cPanel → **Administrador de archivos (File Manager)**.
3. Recomendado para revision sin afectar el sitio actual: crear una subcarpeta dentro de
   `public_html/`, por ejemplo `public_html/prototipo/`, y subir ahi el `.zip`.
   - Se vera en `https://dreamlike.cl/prototipo/`
   - El WordPress actual (pagina "en mantenimiento") sigue intacto en la raiz.
4. Seleccionar el `.zip` subido → boton **Extract** (Extraer).
5. **Nuevo — configurar el backend antes de usar el panel admin** (ver seccion siguiente
   para el detalle paso a paso). Dos caminos: dejar el driver en `sqlite` (default, cero
   configuracion, solo correr `db/seed.php`) para una demo rapida, o cambiar a `mysql` y
   seguir los pasos de "Produccion real en cPanel" para el despliegue definitivo.
6. Verificar que la URL cargue con estilos e imagenes correctamente, y que
   `admin/login.html` permita entrar con el usuario creado por `seed.php`.
7. Cuando el cliente apruebe, mover el contenido a `public_html/` (raiz) para reemplazar
   el sitio actual — coordinar antes con el cliente, ya que esto reemplaza el WordPress
   existente en produccion.

La tienda publica (`index.html`, `producto.html`, etc.) sigue siendo estatica y no requiere
el backend para funcionar — solo `admin/productos.html` lo necesita. Si el backend no esta
configurado, el resto del sitio funciona igual que antes.

## Backend del panel admin (PHP + BD) — en pausa (2026-08)

**Actualizacion de alcance**: el cliente definio que el sitio se montara sobre WordPress,
con la administracion de productos/stock resuelta por un plugin de ecommerce ya adquirido
(WooCommerce u otro, a confirmar) — no por un panel propio. El backend descrito en esta
seccion **sigue en el repo, funcional y probado**, pero no se sigue extendiendo por ahora.
Si el plugin elegido no cubre algo especifico (ej. la sincronizacion con el ERP Defontana,
ver mas abajo), este trabajo queda disponible para adaptarlo — por ejemplo, conectando los
importadores/sync existentes a la REST API del plugin en vez de a esta BD propia.

Antes el sitio completo era estatico. El panel de productos (`admin/productos.html`) tiene
un backend real en `api/` (PHP) + una base de datos, para poder crear productos, actualizar
stock y cargar catalogos por lote de verdad — no solo en el navegador.

Soporta dos motores de BD segun `"driver"` en `api/config.php`:

- **`sqlite`** (default) — para demo/mostrar al cliente **sin instalar nada**: un solo
  archivo `db/dreamlike.sqlite`, PHP ya trae el soporte incluido, cero servicio corriendo.
- **`mysql`** — para produccion real en cPanel (mas robusto para uso concurrente real).

### Demo rapida (sin instalar nada — driver sqlite, el default)

1. Requiere PHP con extension `pdo_sqlite` (ya viene con PHP en cualquier instalacion
   estandar, nada que instalar).
2. Correr una vez: `php db/seed.php` — crea `db/dreamlike.sqlite`, las tablas, siembra el
   catalogo actual y el usuario admin (`admin@dreamlike.cl` / `Dreamlike2026`).
3. Levantar un servidor PHP local (el server de Python normal NO sirve, no ejecuta
   `.php`): `php -S localhost:8000` desde la carpeta del proyecto.
4. Abrir `http://localhost:8000/admin/login.html` — entrar con las credenciales del
   paso 2.

Nada de esto requiere MySQL, cPanel, ni configurar credenciales — sirve para mostrarle el
panel al cliente desde una laptop sin depender de infraestructura externa. `db/dreamlike.sqlite`
queda protegido de acceso web directo por `db/.htaccess` (efectivo en Apache/cPanel; el
server de PHP local no lo necesita porque no expone la carpeta `db/` como sitio).

### Produccion real en cPanel (driver mysql)

1. **Crear la base de datos**: cPanel → **MySQL® Databases** → crear una BD (ej.
   `dreamlike`, cPanel la nombrara `usuario_dreamlike`) → crear un usuario de BD con
   password → asignar ese usuario a la BD con todos los privilegios.
2. **Importar el schema**: cPanel → **phpMyAdmin** → seleccionar la BD creada → pestaña
   **Importar** → subir `db/schema.sql` (crea las tablas `productos` y `admin_usuarios`;
   NO usar `db/schema-sqlite.sql`, ese es solo para el driver sqlite).
3. **Completar credenciales**: editar `api/config.php` (via File Manager o FTP), cambiar
   `"driver" => "sqlite"` a `"driver" => "mysql"`, y completar `host` (normalmente
   `localhost`), `nombre` (el nombre completo con prefijo, ej. `usuario_dreamlike`),
   `usuario` y `password` del usuario de BD del paso 1.
4. **Sembrar datos**: abrir `https://tudominio.cl/ruta/db/seed.php` una vez en el
   navegador (o por SSH: `php db/seed.php`). Importa el catalogo actual y crea el admin
   con las mismas credenciales fijas (`admin@dreamlike.cl` / `Dreamlike2026`) — **cambiar
   esta password** antes de dejar el sitio expuesto como produccion real, no dejarla fija
   indefinidamente en un dominio publico.
5. **Borrar o proteger `db/seed.php`** despues de usarlo — dejarlo accesible permite
   recrear el admin con la password conocida sin autenticacion.
6. Entrar a `admin/login.html` con las credenciales del paso 4.

### Como funciona

- `admin/productos.html` lee y escribe directo contra la BD via `api/productos/*.php`
  (crear, editar, stock, eliminar, importar, imagenes).
- La **tienda publica sigue leyendo `assets/data/productos.json`**, no la BD directamente
  — mismo patron fetch-con-fallback de siempre. El boton **"Publicar catalogo"** en
  `admin/productos.html` sincroniza: exporta la BD completa a `productos.json` +
  regenera `assets/js/productos-fallback.js`. Los cambios en el panel no se ven en la
  tienda hasta presionar ese boton — es deliberado, para controlar cuando se publica.
- **Imagenes de producto**: nunca se guardan en la base de datos. Se suben desde el
  formulario del panel, un endpoint PHP (`api/productos/imagen.php`) valida el archivo y
  lo copia a `assets/img/productos/` (mismo lugar de siempre) con un nombre basado en el
  SKU. La BD solo guarda esa ruta como texto en la columna `imagen`.

### Importar productos por lote (CSV o XML)

Boton **"Importar CSV/XML"** en `admin/productos.html`. Crea o actualiza por SKU
(upsert) — una fila/nodo con error no detiene el resto del archivo, se reporta un
resumen al final.

**CSV** (primera fila = encabezado, cualquier orden de columnas):

```csv
sku,nombre,marca,categoria,precio,stock,categoriaSlug,imagen,descripcion
CBL-NUEVO-01,Cable nuevo 4mm,Covisa,Conductores,45000,100,conductores,,Descripcion opcional
```

`categoriaSlug`, `imagen` y `descripcion` son opcionales.

**XML**:
```xml
<productos>
  <producto>
    <sku>CBL-NUEVO-01</sku>
    <nombre>Cable nuevo 4mm</nombre>
    <marca>Covisa</marca>
    <categoria>Conductores</categoria>
    <precio>45000</precio>
    <stock>100</stock>
  </producto>
</productos>
```

### Sincronizacion de stock con Defontana (ERP)

Dreamlike usa Defontana como ERP. Hay dos formas de mantener el stock del sitio
sincronizado con Defontana — el codigo soporta ambas, se activa la que el plan/API de
Defontana del cliente permita:

- **Polling programado (recomendado para empezar)**: `api/productos/sync-defontana.php`
  se conecta a la API REST de Defontana, trae el stock actual por SKU y actualiza la BD.
  Se programa como **Cron Job en cPanel** (cPanel → Cron Jobs), ej. cada 15 minutos:

  ```bash
  php /home/USUARIO/public_html/api/productos/sync-defontana.php
  ```

  Requiere completar `defontana_api` (base_url, usuario, password de integracion) en
  `api/config.php` — pedir estas credenciales al equipo de Defontana/TI de Dreamlike.
- **Webhook en tiempo real** (si el plan de Defontana lo soporta): configurar en
  Defontana que notifique cambios de stock a
  `https://tudominio.cl/api/productos/webhook-defontana.php`, incluyendo el secreto
  configurado en `defontana_webhook_secreto` (`api/config.php`) en el body de la
  notificacion. Mas inmediato que el polling, pero depende de que Defontana pueda emitir
  ese webhook.

En ambos casos, `sync-defontana.php`/`webhook-defontana.php` **solo actualizan stock**
de productos que ya existen en la BD (por SKU) — no crean productos nuevos desde
Defontana. El endpoint exacto de la API de Defontana usado en
`api/lib/defontana.php::dlDefontanaObtenerStocks()` es un ejemplo — ajustar con la
documentacion real de la cuenta Defontana del cliente antes de activarlo en produccion.

## Editar el catalogo de productos

El catalogo vive en `assets/data/productos.json`. `assets/js/productos-fallback.js` es una
copia generada de esos mismos datos, usada solo cuando el sitio se abre con doble clic
(sin servidor HTTP, donde `fetch()` de un JSON local falla por CORS). Al editar el
catalogo, regenerar el respaldo con:

```bash
python3 -c "
import json
with open('assets/data/productos.json', encoding='utf-8') as f:
    data = json.load(f)
js = 'window.DL_PRODUCTOS_FALLBACK = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n'
header = open('assets/js/productos-fallback.js').read().split('window.DL_PRODUCTOS_FALLBACK')[0]
with open('assets/js/productos-fallback.js', 'w', encoding='utf-8') as f:
    f.write(header + js)
"
```

Si se edita a mano y ambos archivos quedan desincronizados, la home y la PDP mostraran
datos distintos segun si el navegador logro usar `fetch()` o cayo al respaldo.

## Probar en local

Dos formas, ambas funcionan (hay un respaldo para cuando no hay servidor):

```bash
# Opcion A — abrir directo
xdg-open index.html      # o doble clic en el archivo

# Opcion B — servido por HTTP (recomendado, mas fiel a produccion)
python3 -m http.server 8000
# luego abrir http://localhost:8000/
```

## Paleta y sistema de diseno

Paleta: ver `acuerdos/design/paleta.md`. Azul `#0EA5E9` rescatado del sitio anterior de
Dreamlike, segun instruccion del cliente — se mantuvo intacto en el rediseño de
navegacion/estructura (2026-08-02), que ataco tipografia, espaciado y jerarquia, no color.

Tokens nuevos en `assets/css/base.css`: escala tipografica modular (`--dl-fs-*`, 12px a
44px), escala de espaciado consistente (`--dl-space-1` a `--dl-space-8`, 4px a 64px), y
radio/sombra diferenciados por tipo de superficie (`--dl-radio-sm/--dl-radio/--dl-radio-lg`,
`--dl-sombra-sm/--dl-sombra/--dl-sombra-md/--dl-sombra-alta` — superficies flotantes como
el mega-menu o el panel mobile usan radio y sombra mas grandes que cards en reposo).

## Pendiente de decision del cliente

- Politica de precios: neto + IVA vs. IVA incluido (hoy: IVA incluido por defecto).
- Precios por volumen / lista B2B.
- Si el precio debe verse solo con sesion iniciada.

Ver `acuerdos/idea/INDEX.md` → atomo A6.
