# Radio Satelital — Live Universe (web)

## Alcance

Tercera iteración visual, creada sobre el sitio Next.js + GitHub Pages existente.
No altera los enlaces de stream, el motor de audio, DSP, favoritos, PWA ni la lista JSON de emisoras.
Conserva la navegación por teclado y las rutas ya publicadas.

## Diseño

1. `LiveStage`: portada compacta, emisora real seleccionada o de inicio, carátula determinista,
   botón contextual reproducir/pausar y control de aleatoria.
2. `DiscoveryRails`: recomendaciones útiles y verificables basadas exclusivamente en favoritos,
   recientes y catálogo local. Una sola zona para alternar Cajamarca / Mundo.
3. `StationArtwork`: carátulas reutilizables. Usa `logoUrl` real si existe; si no, una identidad
   geométrica local, determinista por nombre, sin descargar fotografías aleatorias.
4. `StationGrid` y `StationCard`: se preservan la paginación y los botones accesibles.
5. `live-universe.css`: tokens, carátulas, secciones, estados, responsive y movimiento reducido.

## Contenido honesto

- Los contadores son derivados del catálogo. No hay cifras ficticias de oyentes.
- La portada no declara una emisora en vivo si no está realmente reproduciéndose.
- No hay anuncios, contadores de tiempo manipulativos ni gamificación compulsiva.
- Recomendaciones calculadas localmente, sin recopilar datos del usuario.

## Pruebas

```sh
npm install --no-audit --no-fund
npm run lint
npm run test
npm run build
```

Inspeccionar la web visualmente a 360, 390, 768 y 1440px. Probar reproducción de streams de varias emisoras,
pausar, favoritos, recientes, tema claro y oscuro, foco de teclado, búsqueda y reconexión.
La exportación estática de Next.js se revisa antes de integrar a `main`.

## Código

- `components/features/LiveStage.tsx`
- `components/features/DiscoveryRails.tsx`
- `components/features/StationArtwork.tsx`
- `lib/services/discovery.ts`
- `app/live-universe.css`

El componente `SignalObservatory` anterior se conserva sin uso para simplificar reversión.
