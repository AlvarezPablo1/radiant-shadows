# Radiant Shadows

Sitio del equipo de Valorant: la web pública, el panel de contenido y el creador de publicaciones del staff.

```bash
npm install
npm run dev        # solo el front (http://localhost:5173)
npm run dev:full   # front + funciones de /api con vercel dev (usa .env.admin.local)
npm run staging    # deploy de prueba en Vercel (no toca producción)
npm run build
```

## Estructura

```
index.html            /           web pública
admin/index.html      /admin      panel para editar el contenido
mediakit/index.html   /mediakit   creador de publicaciones

src/
  home/       web pública: componentes por sección (nav, hero, news, roster…), layout, ui propia y datos del sitio
  admin/      panel /admin: formularios por sección (schemas.ts) y guardado
  mediakit/   creador de placas: editor (react-konva), diseños en data/layout/, paneles en components/
  shared/     lo que usan dos o más apps
    content/  modelo y contenido por defecto (noticias, jugadores, staff, logros, calendario…)
    ui/       piezas visuales comunes (Modal, Select, ActionButton, Background…)
    lib/      utilidades (cx, hooks)

api/          funciones de Vercel (contenido, login del admin, formulario de contacto)
server/       lógica del servidor compartida por las funciones (lectura/escritura en Vercel Blob)
public/brand/ logos, mascotas, fotos de jugadores e imágenes de noticias
```

Reglas: componentes en TSX + Tailwind, claros y de 250 líneas como máximo por archivo.

## Contenido

Lo que se edita desde /admin se guarda en Vercel Blob. Mientras no se guardó nada de una sección, se usa el contenido por defecto de `src/shared/content/`.

## Mediakit

- Plantillas por tipo (Matchday, Resultado, Torneo, Bienvenida, Despedida, Cumpleaños, MVP, Roster, Comunicado…) y diseños (Centrado, Impacto, Neón, Tipográfico, Póster, Marco).
- Regla de relevancia: los tipos no importantes no se exportan al Feed de IG; se configura en `src/mediakit/data/postTypes.ts` → `feed`.
- Logo automático según el roster (MAIN / GC): blanco sólo en las derrotas.
- Jugadores y cuerpo técnico salen de /admin (los mismos que la web). En el navegador de cada persona sólo quedan los titulares elegidos, fotos alternativas para las placas, fuentes y el borrador.
