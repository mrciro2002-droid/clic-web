# CLIC — Sitio web

Sitio web de **CLIC, Cámara Universitaria de Libre Competencia de Chile**.
Rediseño del sitio original alojado en Google Sites.

Construido con HTML, CSS y JavaScript puro: sin frameworks y sin dependencias
de npm. El contenido que cambia seguido se edita desde un panel web y se
escribe en las páginas con un script de Node sin librerías.

---

## Estructura

```
.
├── index.html            Página de inicio
├── equipo.html           Página del equipo
├── data/                 Contenido editable desde el panel
│   ├── novedades/        Una novedad por archivo
│   ├── equipo.json       Integrantes de la directiva
│   └── contacto.json     Correo, teléfono y redes
├── scripts/
│   └── construir.mjs     Escribe data/ dentro del HTML
├── .pages.yml            Qué se puede editar en el panel, y con qué límites
├── assets/
│   ├── css/styles.css    Estilos (variables CSS, layout, componentes)
│   ├── js/main.js        Menú móvil, header sticky, animaciones
│   └── img/
│       └── subidas/      Imágenes cargadas desde el panel
├── .github/workflows/    Despliegue automático a GitHub Pages
├── GUIA-PANEL.md         Cómo usar el panel (para el equipo)
├── .gitignore
├── LICENSE
└── README.md
```

## El panel de administración

El contenido que cambia seguido —novedades, integrantes del equipo, contacto y
redes— se edita desde [Pages CMS](https://pagescms.org) en
**[app.pagescms.org](https://app.pagescms.org)**, sin tocar código.

Cómo funciona: alguien guarda un cambio en el panel → se escribe en `data/` →
GitHub Actions ejecuta `scripts/construir.mjs`, que vuelca ese contenido dentro
de `index.html` y `equipo.html` → se publica el sitio. Tarda uno o dos minutos.

El script solo reemplaza lo que está entre marcas como estas:

```html
<!-- clic:inicio novedades -->
   ...generado automáticamente...
<!-- clic:fin novedades -->
```

Todo lo que esté fuera de esas marcas no se toca nunca. Por eso el diseño, las
animaciones y la estructura de las páginas siguen escritos a mano.

Si el script fallara, el sitio no se rompe: las páginas ya contienen el último
contenido generado y se publican tal cual.

Para probarlo localmente, sin instalar nada (requiere Node 18 o superior):

```bash
node scripts/construir.mjs
```

**Instrucciones para el equipo:** ver [`GUIA-PANEL.md`](GUIA-PANEL.md).

## Cómo trabajar en el sitio

### 1. Ver el sitio en el navegador

La forma más simple: abre `index.html` con doble clic.

Para una vista con recarga automática, instala la extensión
**Live Server** (`ritwickdey.LiveServer`) en VS Code, haz clic derecho sobre
`index.html` y elige *Open with Live Server*.

O bien, con Python instalado:

```bash
python -m http.server 8000
# luego abre http://localhost:8000
```

### 2. Editar

- **Novedades, equipo, contacto y redes** → desde el panel, no a mano
- **Títulos de sección y textos del hero** → `index.html` y `equipo.html`
  (pendiente de pasar al panel en la etapa 2)
- **Colores, tipografía, espaciado** → bloque `:root` al inicio de `assets/css/styles.css`
- **Comportamiento** → `assets/js/main.js`

Si editas a mano algo que está entre marcas `clic:inicio` / `clic:fin`, el
cambio se perderá en la siguiente publicación. Edítalo en el panel o en
`data/`.

### La paleta

El sitio usa tres colores oficiales:

| Color | Hex | Uso |
|---|---|---|
| Azul CLIC | `#2596BE` | Acentos, bandas, botones, iconos |
| Tinta | `#1C1C1C` | Texto y pie de página |
| Blanco | `#FFFFFF` | Fondo de todo el sitio |

Todo lo demás en `:root` son derivados de esos tres (aclarados u oscurecidos)
para hovers, bordes y fondos suaves.

**Por qué hay dos azules.** Blanco sobre `#2596BE` puro da un contraste de
3.4:1, bajo el mínimo de 4.5:1 que exige WCAG AA para texto pequeño. Por eso:

```css
--accent:         #2596BE;  /* acentos, bordes, títulos grandes */
--accent-dark:    #196580;  /* texto pequeño sobre fondo claro   (6.5:1) */
--accent-surface: #1E7D9F;  /* superficies sólidas con texto blanco (4.7:1) */
```

Son el mismo azul a distinta profundidad: se lee como un solo color, pero el
texto queda legible. Si cambias `--accent`, ajusta también los otros dos.

### 3. Los archivos del logo

Todos derivan del logotipo original de CLIC y viven en `assets/img/`:

| Archivo | Dónde se usa |
|---|---|
| `logo-oscuro.png` | Header, sobre fondo blanco |
| `logo-blanco.png` | Pie de página, sobre fondo azul oscuro |
| `og-image.png` | Vista previa al compartir el link (WhatsApp, LinkedIn, X) |
| `favicon.ico` / `favicon.png` | Icono de la pestaña del navegador |
| `apple-touch-icon.png` | Icono al guardar el sitio en la pantalla de inicio |
| `icono-512.png` | Icono grande de reserva |

Si el logo cambia, hay que regenerar las seis versiones para mantenerlas
coherentes.

---

## Pendientes

1. **Enlace del formulario de postulación** (`index.html`, sección `#unete`).
   Falta poner el enlace definitivo del formulario de Microsoft Forms.
2. **Dominio.** `clic-chile.cl` figura en `<link rel="canonical">` y `og:url`,
   pero está sin confirmar. Si el dominio final es otro, hay que actualizarlo
   en ambas páginas.
3. **Etapa 2 del panel.** Llevar al panel los títulos de sección, las bajadas,
   las cifras del hero y los pilares.
4. **Imágenes en las novedades.** Hoy las tarjetas son solo texto. Añadir foto
   requiere una decisión de diseño (proporción, recorte, comportamiento en
   móvil) antes de tocar el CSS.

Las novedades y las fotos del equipo ya no son pendientes: se administran
desde el panel.

---

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub y sube el proyecto:

   ```bash
   git remote add origin https://github.com/USUARIO/clic-web.git
   git push -u origin main
   ```

2. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

El workflow en `.github/workflows/deploy.yml` publica el sitio en cada push a
`main`. No requiere tokens ni secretos: usa el `GITHUB_TOKEN` temporal de la
propia ejecución, con permisos mínimos de solo lectura sobre el repo.

---

## Notas de seguridad y privacidad

- El sitio es 100% estático: no hay backend, base de datos ni formularios que
  procesen datos personales. El formulario de postulación vive en Microsoft
  Forms.
- El generador escapa todo el texto que viene del panel y descarta cualquier
  enlace que no sea `https://`, `http://`, `mailto:` o `tel:`. Nadie puede
  inyectar código en el sitio escribiendo en el panel.
- Las personas invitadas al panel por correo no tienen acceso al repositorio
  ni pueden modificar `.pages.yml`. Sus cambios se firman con la identidad de
  la aplicación, así que no exponen su correo personal en el historial.
- Todos los enlaces externos usan `rel="noopener noreferrer"`.
- No se incluyen claves, tokens ni credenciales en el repositorio, y `.gitignore`
  bloquea archivos `.env` por si acaso.
- No hay analítica ni cookies de terceros. Las únicas peticiones externas son a
  Google Fonts; si prefieres cero dependencias externas, descarga las fuentes a
  `assets/fonts/` y reemplaza el `<link>` por un `@font-face` local.

---

## Accesibilidad

- HTML semántico con landmarks (`header`, `nav`, `main`, `footer`).
- Enlace "saltar al contenido", foco visible y menú móvil operable por teclado.
- Respeta `prefers-reduced-motion`.
- Contraste de texto conforme a WCAG AA.

---

## Licencia

El código está bajo licencia MIT (ver `LICENSE`).
Los textos, la marca CLIC y los logos son propiedad de CLIC.
