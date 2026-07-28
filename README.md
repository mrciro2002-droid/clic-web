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
│   └── img/favicon.svg   Favicon
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

Los colores principales están centralizados como variables CSS:

```css
--navy-900: #06111f;   /* fondo oscuro */
--blue-500: #2f6fe4;   /* acento principal */
--cyan-400: #35d6c8;   /* acento secundario */
--sand-100: #f6f4ef;   /* fondo claro alternativo */
```

Cambiar esas cuatro líneas cambia toda la paleta del sitio.

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
