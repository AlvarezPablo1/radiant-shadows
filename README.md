# Radiant Shadows · Creador de publicaciones

Editor de placas para Instagram (Historia 1080×1920, Feed 1080×1350) y X (1600×900), con la identidad de Radiant Shadows.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/ (sitio estático, se puede subir a cualquier hosting)
```

## Qué hace
- Plantillas por tipo: Matchday, Resultado, Posición de torneo, Bienvenida, Despedida, Cumpleaños, Tryouts, Roster oficial, Comunicado, Comunidad/Educativo, Stream ON.
- Regla de relevancia: los tipos no importantes (4° puesto o menos, comunicados no organizacionales, matchday, etc.) no se pueden exportar al Feed de IG. Se configura en `src/data/postTypes.ts` → `feed`.
- Logo automático según el roster (MAIN / GC) y el resultado: violeta en victoria, blanco en derrota.
- Imagen principal: jugadores, mascotas (Kael / Nyra) o sin fotos.
- Todo es editable: mover, escalar, rotar, capas, textos, colores, filtros, brillo, fundido.
- Fotos del roster precargadas en el navegador; al subir una pregunta si ya es PNG y si no le quita el fondo (IA en el navegador, el modelo se descarga la primera vez).
- Fondos de marca generados (humo, fuego, hex, escamas, partículas, siluetas) + fondos propios subidos.
- Generador de copy sin IA ni negritas, con [ROL] @cuenta por red y hashtags.
- Checklist antes de descargar. Descarga PNG/JPG de uno o todos los formatos.

## Tipografías
Cooper BT y Proxima Nova tienen licencia: se usan sustitutos (Fraunces / Montserrat) hasta que se suban los archivos reales en la pestaña **Marca**.

Los datos (roster, fotos, fuentes, borrador) se guardan en el navegador de cada persona.
