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
