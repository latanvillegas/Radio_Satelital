# Modernización Broadcast — primera iteración

Base 8a58fbc4591827a5f6257e96e6086cfafb251479. Rama aislada; sin despliegue.

- UI: superficies opacas, negro real AMOLED, contraste exterior, foco y objetivos táctiles ampliados. Conserva los temas existentes.
- Visualizador: objetivo máximo 24 FPS, gradiente reutilizado, pausa en segundo plano, estado estático con movimiento reducido.
- Catálogo: estado de reproducción sólo en tarjeta activa.
- HLS: buffers acotados, una recuperación fatal de medios por instancia, guardia contra reintentos duplicados y watchdog de inicio.
- PWA: actualización explícita sin recarga automática de otras pestañas; tolerancia a fallos de escritura en caché.

## Metodología y límites
Impeccable (audit, optimize, craft-floor), Matt Pocock (diagnosing-bugs, TDD y revisión) y Claude-BugHunter (Next.js, DOM): revisión estática y cambios acotados. No se ha realizado el ciclo red/green local ni renderizado del sitio: el entorno no resuelve GitHub por git. No se modifican tecnologías, datos ni APIs públicas. El proxy servidor no está en el árbol principal; no se ha auditado su implementación.

## Validación pendiente
Workflow Web quality: npm run lint, npm run test, npm run build. Verificar catálogo, búsqueda, filtros, favoritos, recientes, compartir, reproducción, volumen, EQ, grabación, temporizador, estudio, Media Session, proxy, reconexión, PWA, temas y teclado en 320–1920px. Medir CPU, RAM y batería antes/después, auditar dependencias resueltas y headers de hosting, validar WCAG 2.2 AA manualmente. No fusionar sin verificación.

## CI — diagnóstico de la primera iteración
Ejecuciones 45433781486 y 45433781841: instalación y TypeScript correctos; 28 tests pasaron en 9 archivos, el décimo (integración DOM) no pudo iniciar. Vitest terminó con TypeError en undici/lib/interceptor/decompress.js (reading 'bind'). Los logs de npm identifican Node 20.20.2 fuera del rango de jsdom 31.0.1 y de undici 8.13.1. El build fue omitido. Se alinea CI web y despliegue con Node 24 LTS mediante .nvmrc y se declara engines. No se omite ninguna prueba. Las credenciales de checkout no se persisten en los workflows de PR. Pendiente confirmar nueva ejecución.

## Fase 2 — diseño y cabina
Paleta única para inicialización previa a hidratación y cambios en tiempo real. Se endurece la lectura de claves de tema persistidas y se añaden 20 casos de prueba de contraste e inicialización. Las pruebas de contraste cubren pares específicos, no certifican WCAG. Los indicadores L/R de Studio son estimaciones de un solo analizador espectral: se conserva su visualización, pero se elimina la etiqueta técnicamente incorrecta dBFS; muestran porcentaje orientativo. Muestreo de cabina a 10 Hz (1 Hz con movimiento reducido), suspendido cuando la página no es visible o no reproduce. Pantalla completa refleja fullscreenchange y espacio no intercepta activación de botones. Se conservan grabación, EQ y exportación diagnóstica. Pendiente validación en CI y navegador.

## Fase 3 — transporte y captura
Se invalida cada generación del transporte antes de desconectar HLS/audio, incluyendo pausa, pérdida de red, reconexión y temporizador. Se conserva la intención de reproducir offline y se puede cancelar desde el control principal. Se detecta HLS a partir de la URL original si el proxy oculta la extensión. Se suspende el AudioContext en pausa y se cierra al reemplazar el elemento por fallback sin CORS; se evita recablear un grafo ya conectado. Se corrige la finalización de MediaRecorder: el Blob se construye tras el evento stop, incluyendo el último dataavailable; se impide iniciar otra captura durante la finalización, se revoca la URL anterior y se respeta la extensión del MIME. stopRecording ahora devuelve Promise<Blob | null>; el consumidor interno ya se adapta. Se conserva la grabación en memoria sin introducir límites de duración. Las pruebas de navegador y medición de CPU/batería siguen pendientes. No se realizó un ciclo red/green local; los tests de regresión se ejecutan en CI.

### Evidencia y nuevas regresiones
Fase 2 validada por run 45434750004: 51/51 tests, 11/11 archivos, lint y build correctos, 127/127 páginas estáticas. Se añaden seis pruebas de comportamiento (cuatro de transporte, dos de grabación), con dobles de navegador sin acceso a radio real. Los tests no sustituyen validación de HLS, Web Audio o MediaRecorder en dispositivos físicos. 

## Fase 4 — medición y seguridad
Fase 3 validada en runs 45435381151 y 45435381072: 57/57 tests, 13/13 archivos y 127/127 páginas estáticas, lint y build correctos. Se incorpora medidor de pico de muestras dBFS L/R con ChannelSplitterNode y dos AnalyserNode de 2048 muestras. No es true peak, LUFS ni vúmetro calibrado; en ausencia de Web Audio muestra N/D. Se libera la rama al cerrar cabina, pausar u ocultar la página. Se añade validación de URLs antes de reproducción, rechazo de credenciales y destinos literales privados/locales, y limpieza de timeout en sondeo HEAD. Los nombres DNS pueden resolver a IP privadas y el navegador puede seguir redirecciones en audio/HLS: esto no garantiza protección SSRF; el proxy externo debe aplicar allowlist y validar DNS, conexión y cada redirección. Se añade workflow independiente de npm audit que falla ante severidad alta/crítica y conserva resolución npm y resultado JSON. No existe lockfile npm versionado; el informe describe la resolución del momento, no garantiza reproducibilidad. Se añaden 30 casos de regresión de seguridad y medición. Pendiente validación CI y prueba física.

### Accesibilidad de diálogos
El hook compartido conserva foco y bloqueo de scroll aunque cambie la identidad de callbacks React. Se arbitra Escape y Tab por pila de diálogos, y se restaura el foco al cerrar. Se filtran elementos ocultos, deshabilitados o con tabindex negativo. Cuatro pruebas DOM verifican ciclo Tab, callback actualizado, diálogo superior y Escape delegado. El EQ deja de suscribirse cuando está cerrado; se reducen desenfoques y se usa viewport dinámico donde corresponde. No es una auditoría WCAG completa ni una prueba de lector de pantalla real.

### Primera ejecución de seguridad
Run 45436139600: resolución npm correcta, npm audit exit 1 y artefacto JSON+lock generado (14941256597). El contenido del ZIP no se ha inspeccionado; todavía no se atribuye el fallo a paquetes ni CVEs concretos. Se añade resumen de severidades, dependencias, advisories y corrección disponible a los logs sin modificar el umbral de seguridad.

## Fase 5 — remediación de dependencias
Run 45436376715: 91/91 tests, 16 archivos y 127 páginas. Audit 45436376653: 2 críticos (vitest/tinypool), 1 alto (postcss), 2 moderados (@vitest/mocker y next por dependencia postcss). Se actualiza Vitest a 5.1.1, versión recomendada por npm audit; se solicita PostCSS >=8.5.23 y override de PostCSS coherente con dependencia directa, para intentar conservar Next 15. No se cambia React ni HLS. Se mueve jsdom a devDependencies (solo utilizado por pruebas), se añaden Playwright/axe como dependencias de desarrollo. Se genera lock npm en CI y se emite temporalmente su JSON público para versionar la resolución exacta; este paso se retirará al fijar el lock. Pendiente validar resolución, auditoría, pruebas y compatibilidad; no se asume que el override sea suficiente.
