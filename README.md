# CLIC — Sitio web

Sitio web de **CLIC, Cámara Universitaria de Libre Competencia de Chile**.
Rediseño del sitio original alojado en Google Sites.

Construido con HTML, CSS y JavaScript puro: sin frameworks, sin dependencias,
sin proceso de build.

---

## Estructura

```
.
├── index.html            Página de inicio
├── equipo.html           Página del equipo
├── assets/
│   ├── css/styles.css    Estilos (variables CSS, layout, componentes)
│   ├── js/main.js        Menú móvil, header sticky, animaciones
│   └── img/              Logo e iconos (ver más abajo)
├── .github/workflows/    Despliegue automático a GitHub Pages
├── .gitignore
├── LICENSE
└── README.md
```

## Cómo trabajar en el sitio

### 1. Abrir en VS Code

```bash
code "CLIC WEB"
```

### 2. Ver el sitio en el navegador

La forma más simple: abre `index.html` con doble clic.

Para una vista con recarga automática, instala la extensión
**Live Server** (`ritwickdey.LiveServer`) en VS Code, haz clic derecho sobre
`index.html` y elige *Open with Live Server*.

O bien, con Python instalado:

```bash
python -m http.server 8000
# luego abre http://localhost:8000
```

### 3. Editar

- **Textos y secciones** → `index.html` y `equipo.html`
- **Colores, tipografía, espaciado** → bloque `:root` al inicio de `assets/css/styles.css`
- **Comportamiento** → `assets/js/main.js`

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

### 4. Los archivos del logo

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

## Pendientes antes de publicar

Busca `TODO` en el código. Actualmente hay tres:

1. **Enlace del formulario de postulación** (`index.html`, sección `#unete`).
   El enlace heredado del Google Sites apunta al *editor* del formulario de
   Microsoft Forms, no al formulario público. Reemplázalo por el enlace de
   compartir (`https://forms.office.com/r/...`).
2. **Novedades** (`index.html`, sección `#novedades`): las tres tarjetas son
   contenido de ejemplo.
3. **Fotos del equipo** (`equipo.html`): actualmente se usan iniciales. Para
   usar fotos, reemplaza cada `<span class="member__avatar">XX</span>` por
   `<img class="member__avatar" src="assets/img/nombre.jpg" alt="" width="74" height="74">`.

También conviene reemplazar el dominio de ejemplo `clic-chile.cl` en las
etiquetas `<link rel="canonical">` y `og:url` por el dominio real.

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
