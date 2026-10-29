# Auditoría de calidad, memoria, batería y rendimiento — 29 oct 2026

## Alcance y línea base
Repositorio Next.js 15/React 18, salida estática GitHub Pages, 124 streams únicos.
Auditoría del código de componentes montados y sistemas secundarios (cabina, recorder,
caché, búsqueda, tema, DSP). CI anterior: TypeScript, Vitest y build satisfactorios.
Los hallazgos siguientes son **verificados por inspección de código**; no son
mediciones de consumo de CPU, RAM o batería en un teléfono físico.

## Hallazgos y correcciones de este PR

| Riesgo en producción | Evidencia | Mitigación |
|---|---|---|
| Visualizador usa rAF continuo a ~60 Hz incluso sin datos de analizador | \`AudioVisualizer.tsx\` | Límite 10 Hz si Save-Data, 20 Hz móvil, ~29 Hz desktop. Detiene rAF fuera de viewport, pestaña oculta o reduced-motion; sin afectar audio |
| Vúmetros de cabina actualizan React en cada frame | \`StudioDisplayModal.tsx\`, \`MasterConsoleRack.tsx\` | <=20 actualizaciones/s, solo cuando hay reproducción, visibilidad y sección abierta |
| Reloj de cabina despierta cada segundo aunque la cabina está cerrada | \`StudioDisplayModal.tsx\` | Timer solo mientras modal abierto y página visible |
| Rehidratación duplicada de JSON local | \`useStations.ts\`: \`getLocalStations\` y \`getMergedStations\` vuelven a leer los mismos JSON | Una sola carga inicial, sin red ni recarga artificial |
| Filtros y favoritos recalculados en cualquier render | \`useStations.ts\` | \`useMemo\` dependiente de catálogo/filtros |
| Listener de preferencia de sistema acumulable en StrictMode | \`initializeThemeSettings()\` | Función cleanup y desmontaje en ThemeInitializer |
| Grabación finalizada antes del último evento \`dataavailable\` | \`recorder.ts\` | Ensambla Blob en \`onstop\`; bloquea inicio hasta finalización |
| Chunks y blob URL mantenidos sin control | \`recorder.ts\` | Limpia chunks al finalizar, elimina URL persistente y limita a 128 MiB cada grabación |
| CacheStorage sin límite explícito y shell v2 tras rediseños | \`public/sw.js\` | Shell v3, poda a 96 entradas; la reproducción de audio/streams sigue excluida |

## Criterios y riesgos
- **No se modifica** \`player.ts\`, la lógica DSP, MediaSession, endpoints, favoritos,
  estaciones, pantalla completa ni el PR independiente #31 de metadatos ICY.
- La grabación sigue requiriendo memoria hasta el tamaño del fichero final.
  La PWA estática no cuenta con File System Access uniforme en todos los Android.
  Un límite de 128 MiB evita crecimiento sin tope; no garantiza RAM bajo toda carga.
- No se eliminan estilos heredados sin cobertura visual regresiva.
- \`reduce-motion\` detiene la animación decorativa, **no detiene el audio**.
- CacheStorage puede ser expulsado por el navegador; se trata como optimización,
  nunca como fuente de datos crítica.
- El dashboard DSP, la cabina y los efectos React existentes permanecen disponibles.

## Verificación
1. CI obligatorio: \`npm run lint\`, \`npm test\`, \`npm run build\`.
2. En Chrome Android: Performance (grabación 60 s con reproductor abierto y con
   pestaña oculta), Memory (5 min sin navegación, luego cambio de emisora),
   modo ahorro de batería y Save-Data si existe.
3. Grabadora: iniciar/parar, descargar, comprobar duración del último tramo,
   iniciar otra grabación; impedir dos sesiones superpuestas.
4. PWA: instalación, actualización, navegación offline, no almacenar audio en
   CacheStorage, y conservar favoritos.
5. Sin telemetría real de dispositivos, los ahorros de batería/RAM son
   **esperados**, no cifras verificadas ni garantía de duración de batería.

## Próximas mediciones de producto
- Chrome DevTools: INP, LCP, CLS, JS main-thread time, heap, CPU while playing.
- Usar dispositivo Android real, navegadores Chrome/PWA, 4G y Wi-Fi;
  registrar p50/p95 en sesiones de 10 min y consumo de batería en escenarios
  comparables. No atribuir valores de Lighthouse a batería física.
