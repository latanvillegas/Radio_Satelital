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
