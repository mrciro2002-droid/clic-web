/**
 * CLIC — Generador de contenido editable
 * =====================================================================
 *
 * Toma lo que está en `data/` y lo escribe dentro de `index.html` y
 * `equipo.html`, en las zonas marcadas con comentarios así:
 *
 *     <!-- clic:inicio novedades -->
 *     ...aquí escribe este script...
 *     <!-- clic:fin novedades -->
 *
 * Todo lo que esté FUERA de esas marcas no se toca nunca. El diseño, las
 * animaciones y la estructura de las páginas quedan intactos.
 *
 * Se ejecuta solo, en GitHub, cada vez que alguien guarda algo en el panel.
 * También se puede correr a mano:  node scripts/construir.mjs
 *
 * No usa ninguna librería externa: solo Node.js (versión 18 o superior).
 * Por eso el proyecto sigue sin `package.json` y sin `npm install`.
 *
 * Si este script fallara, el sitio NO se rompe: las páginas ya contienen el
 * último contenido generado y se publican tal cual.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const ruta = (...partes) => join(raiz, ...partes);

/* =======================================================================
   Utilidades de seguridad
   ======================================================================= */

/**
 * Convierte texto en algo seguro para insertar en HTML.
 * Sin esto, alguien podría pegar `<script>` en el panel y romper el sitio.
 */
function escapar(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Acepta solo enlaces que sabemos inofensivos. Cualquier otra cosa
 * (por ejemplo `javascript:`) se descarta y devuelve cadena vacía.
 */
function enlaceSeguro(valor) {
  const limpio = String(valor ?? "").trim();
  if (!limpio) return "";
  if (/^(https?:|mailto:|tel:)/i.test(limpio)) return limpio;
  if (/^[\w./-]+$/.test(limpio) && !limpio.startsWith("//")) return limpio;
  console.warn(`  ! Enlace descartado por inseguro: ${limpio}`);
  return "";
}

/** Recorta un texto si se pasó del límite, avisando en el registro. */
function limitar(valor, maximo, etiqueta) {
  const texto = String(valor ?? "").trim();
  if (texto.length <= maximo) return texto;
  console.warn(`  ! "${etiqueta}" excede ${maximo} caracteres; se recorta.`);
  return texto.slice(0, maximo).trimEnd() + "…";
}

/* =======================================================================
   Lectura de los datos
   ======================================================================= */

function leerJson(rutaRelativa, porDefecto) {
  const completa = ruta(rutaRelativa);
  if (!existsSync(completa)) {
    console.warn(`  ! Falta ${rutaRelativa}; se usa el contenido por defecto.`);
    return porDefecto;
  }
  try {
    return JSON.parse(readFileSync(completa, "utf8"));
  } catch (error) {
    console.error(`  ! ${rutaRelativa} tiene un error de formato: ${error.message}`);
    console.error("    Se conserva el contenido anterior de la página.");
    return null;
  }
}

function leerNovedades() {
  const carpeta = ruta("data", "novedades");
  if (!existsSync(carpeta)) return [];

  return readdirSync(carpeta)
    .filter((archivo) => archivo.endsWith(".json"))
    .map((archivo) => {
      try {
        return JSON.parse(readFileSync(join(carpeta, archivo), "utf8"));
      } catch (error) {
        console.error(`  ! data/novedades/${archivo}: ${error.message}. Se omite.`);
        return null;
      }
    })
    .filter((item) => item && item.visible !== false)
    // Más recientes primero. Sin fecha van al final.
    .sort((a, b) => String(b.fecha ?? "").localeCompare(String(a.fecha ?? "")));
}

/* =======================================================================
   Plantillas — generan exactamente el mismo HTML que había escrito a mano
   ======================================================================= */

const ICONOS = {
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
                   stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.6 4.78 5.98V21h-4v-5.5c0-1.31-.02-3-1.85-3-1.86 0-2.14 1.42-2.14 2.9V21h-4V9Z" />
              </svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.9.5 3.68 1.38 5.22L2 22l5.06-1.52a9.8 9.8 0 0 0 4.98 1.34h.01c5.43 0 9.84-4.4 9.84-9.84 0-2.63-1.02-5.1-2.88-6.96A9.76 9.76 0 0 0 12.04 2Zm0 1.9c2.12 0 4.1.83 5.6 2.33a7.86 7.86 0 0 1 2.32 5.6c0 4.38-3.55 7.94-7.93 7.94a7.9 7.9 0 0 1-4.04-1.11l-.29-.17-2.99.9.9-2.92-.19-.3a7.86 7.86 0 0 1-1.21-4.2c0-4.38 3.56-7.94 7.94-7.94Zm-3 3.9c-.15 0-.4.06-.6.28-.21.22-.8.78-.8 1.9s.82 2.2.93 2.36c.12.15 1.6 2.44 3.87 3.42.54.24.96.38 1.29.48.54.18 1.03.15 1.42.09.44-.06 1.34-.55 1.53-1.08.19-.53.19-.98.13-1.08-.06-.09-.21-.15-.44-.27-.23-.11-1.34-.66-1.55-.74-.21-.07-.36-.11-.51.12-.15.22-.58.73-.71.88-.13.15-.26.17-.49.06-.23-.12-.96-.36-1.83-1.13-.68-.6-1.13-1.35-1.27-1.57-.13-.23-.01-.35.1-.46.11-.1.23-.27.35-.4.11-.14.15-.23.23-.39.08-.15.04-.28-.02-.4-.06-.11-.5-1.23-.7-1.68-.18-.44-.36-.38-.5-.39h-.43Z" />
              </svg>`,
};

function tarjetaNovedad(item) {
  const enlace = enlaceSeguro(item.enlace);
  const titulo = escapar(limitar(item.titulo, 60, "Título de novedad"));
  const resumen = escapar(limitar(item.resumen, 180, `Resumen de "${item.titulo}"`));
  const etiqueta = escapar(limitar(item.etiqueta, 22, "Etiqueta"));

  const abre = enlace
    ? `<a class="news-card reveal reveal--card" href="${escapar(enlace)}" target="_blank" rel="noopener noreferrer">`
    : `<article class="news-card reveal reveal--card">`;
  const cierra = enlace ? "</a>" : "</article>";
  const masInfo = enlace
    ? `\n            <span class="news-card__more">Ver más &rarr;</span>`
    : "";

  return `          ${abre}
            <span class="news-card__tag">${etiqueta}</span>
            <h3 class="news-card__title">${titulo}</h3>
            <p>${resumen}</p>${masInfo}
          ${cierra}`;
}

function tarjetaMiembro(persona) {
  const nombre = escapar(limitar(persona.nombre, 40, "Nombre del miembro"));
  const cargo = escapar(limitar(persona.cargo, 45, `Cargo de ${persona.nombre}`));
  const foto = enlaceSeguro(persona.foto);

  const avatar = foto
    ? `<img class="member__avatar" src="${escapar(foto)}" alt="" width="74" height="74" loading="lazy" />`
    : `<span class="member__avatar" aria-hidden="true">${escapar(
        limitar(persona.iniciales, 2, "Iniciales")
      )}</span>`;

  const linkedin = enlaceSeguro(persona.linkedin);
  const bloqueLinkedin = linkedin
    ? `
            <a class="member__link"
               href="${escapar(linkedin)}"
               target="_blank" rel="noopener noreferrer">
              ${ICONOS.linkedin}
              LinkedIn
            </a>`
    : "";

  return `          <article class="member reveal reveal--card">
            ${avatar}
            <h3 class="member__name">${nombre}</h3>
            <p class="member__role">${cargo}</p>${bloqueLinkedin}
          </article>`;
}

function listaContacto(contacto) {
  const filas = [];
  const correo = String(contacto.correo ?? "").trim();
  const telefono = String(contacto.telefono ?? "").trim();
  const whatsapp = String(contacto.whatsapp ?? "").replace(/\D/g, "");
  const ubicacion = String(contacto.ubicacion ?? "").trim();

  if (correo) {
    filas.push(
      `            <li><a href="mailto:${escapar(correo)}">${escapar(correo)}</a></li>`
    );
  }
  if (telefono) {
    const marcable = telefono.replace(/[^\d+]/g, "");
    filas.push(
      `            <li><a href="tel:${escapar(marcable)}">${escapar(telefono)}</a></li>`
    );
  }
  if (whatsapp) {
    filas.push(
      `            <li><a href="https://wa.me/${escapar(
        whatsapp
      )}" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>`
    );
  }
  if (ubicacion) {
    filas.push(`            <li>${escapar(ubicacion)}</li>`);
  }

  return filas.join("\n");
}

function redesSociales(contacto) {
  const redes = [
    { clave: "instagram", url: contacto.instagram, etiqueta: "Instagram de CLIC" },
    { clave: "linkedin", url: contacto.linkedin, etiqueta: "LinkedIn de CLIC" },
    {
      clave: "whatsapp",
      url: String(contacto.whatsapp ?? "").replace(/\D/g, "")
        ? `https://wa.me/${String(contacto.whatsapp).replace(/\D/g, "")}`
        : "",
      etiqueta: "WhatsApp de CLIC",
    },
  ];

  return redes
    .map(({ clave, url, etiqueta }) => {
      const destino = enlaceSeguro(url);
      if (!destino) return null;
      return `            <a href="${escapar(
        destino
      )}" target="_blank" rel="noopener noreferrer" aria-label="${escapar(etiqueta)}">
              ${ICONOS[clave]}
            </a>`;
    })
    .filter(Boolean)
    .join("\n");
}

function datosOrganizacion(contacto) {
  const sameAs = [contacto.instagram, contacto.linkedin]
    .map(enlaceSeguro)
    .filter(Boolean);

  const datos = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CLIC — Cámara Universitaria de Libre Competencia",
    alternateName: "CLIC Chile",
    description:
      "Organización autónoma, apolítica, sin fines de lucro, multidisciplinaria e interuniversitaria que forma estudiantes en libre competencia y buenas prácticas corporativas.",
    email: String(contacto.correo ?? "").trim(),
    telephone: String(contacto.telefono ?? "").replace(/[^\d+]/g, ""),
    areaServed: "CL",
    sameAs,
  };

  // `</script>` dentro de un <script> cerraría la etiqueta antes de tiempo.
  const json = JSON.stringify(datos, null, 2).replace(/<\//g, "<\\/");

  // Las marcas van FUERA del <script>: un comentario HTML dentro de un bloque
  // JSON-LD lo dejaría inválido para Google.
  return `  <script type="application/ld+json">
${json
  .split("\n")
  .map((linea) => "  " + linea)
  .join("\n")}
  </script>`;
}

/* =======================================================================
   Reemplazo dentro de las marcas
   ======================================================================= */

function reemplazar(html, nombre, contenido, archivo) {
  const inicio = `<!-- clic:inicio ${nombre} -->`;
  const fin = `<!-- clic:fin ${nombre} -->`;
  const desde = html.indexOf(inicio);
  const hasta = html.indexOf(fin);

  if (desde === -1 || hasta === -1 || hasta < desde) {
    console.warn(`  ! ${archivo}: no encontré la marca "${nombre}". Se deja como estaba.`);
    return html;
  }

  // La marca de cierre se re-sangra igual que la de apertura. Así el HTML
  // generado queda tan ordenado como el escrito a mano, y se corrige solo si
  // alguna vez quedó desalineado.
  const inicioLinea = html.lastIndexOf("\n", desde) + 1;
  const anterior = html.slice(inicioLinea, desde);
  const sangria = /^[ \t]*$/.test(anterior) ? anterior : "";

  return (
    html.slice(0, desde + inicio.length) +
    "\n" +
    contenido +
    "\n" +
    sangria +
    html.slice(hasta)
  );
}

/* =======================================================================
   Ejecución
   ======================================================================= */

console.log("CLIC — generando el contenido editable\n");

const contacto = leerJson("data/contacto.json", null);
const equipo = leerJson("data/equipo.json", null);
const novedades = leerNovedades();

if (!contacto || !equipo) {
  console.error("\nHay un archivo de datos con formato inválido. No se modificó nada.");
  console.error("El sitio se publicará con el contenido anterior, que sigue siendo válido.");
  process.exit(0); // Salida limpia: preferimos publicar lo anterior a fallar el despliegue.
}

const bloques = {
  novedades: novedades.length
    ? novedades.map(tarjetaNovedad).join("\n\n")
    : `          <article class="news-card reveal reveal--card">
            <span class="news-card__tag">Novedades</span>
            <h3 class="news-card__title">Pronto habrá novedades</h3>
            <p>Estamos preparando las próximas actividades. Síguenos en redes para enterarte primero.</p>
          </article>`,
  equipo: (equipo.miembros ?? []).map(tarjetaMiembro).join("\n\n"),
  "contacto-lista": listaContacto(contacto),
  redes: redesSociales(contacto),
  "datos-organizacion": datosOrganizacion(contacto),
};

const paginas = {
  "index.html": ["novedades", "contacto-lista", "redes", "datos-organizacion"],
  "equipo.html": ["equipo", "contacto-lista", "redes"],
};

let cambios = 0;

for (const [archivo, marcas] of Object.entries(paginas)) {
  const completa = ruta(archivo);
  const original = readFileSync(completa, "utf8");
  let html = original;

  for (const marca of marcas) {
    html = reemplazar(html, marca, bloques[marca], archivo);
  }

  if (html !== original) {
    writeFileSync(completa, html, "utf8");
    console.log(`  ✓ ${archivo} actualizado`);
    cambios++;
  } else {
    console.log(`  · ${archivo} ya estaba al día`);
  }
}

console.log(
  `\nListo. ${novedades.length} novedad(es), ${
    (equipo.miembros ?? []).length
  } miembro(s). ${cambios} archivo(s) modificado(s).`
);
