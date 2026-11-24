# Protocolo de aceptación física — Radio Satelital Broadcast

## Alcance y criterio de salida

El resultado automatizado Linux/Chromium, Firefox y WebKit no certifica Android/iOS físico. Este protocolo debe ejecutarse sobre ambos builds (original 8a58fbc4591827a5f6257e96e6086cfafb251479 y candidato de la rama Broadcast), publicados temporalmente en orígenes HTTPS de prueba independientes y con los mismos ajustes. No usar el dominio de producción ni desplegar main para estas pruebas.

Registrar SHA, fecha, modelo, versión SO/navegador, capacidad y salud de batería, condiciones de red, brillo, volumen, temperatura ambiente, estado de instalación PWA y método de medición. Usar equipo físico propio autorizado. No incluir credenciales, URL firmadas ni datos personales en capturas o informes.

## Matriz funcional

| ID | Escenario | Criterio verificable | Evidencia |
|---|---|---|---|
| D01 | Instalar PWA desde Chrome Android / Safari iOS | Icono, nombre, launch standalone y navegación sin barra del navegador | Captura + versión |
| D02 | Arranque offline después de instalar shell | Catálogo y ajustes interactivos; indicador offline; sin prometer audio offline | Grabación de pantalla |
| D03 | Reproducción directa y HLS | Seleccionar dos emisoras disponibles, escuchar 2 min cada una sin interrupción atribuible a la app | TTFA, codec y log |
| D04 | Cambio de red Wi-Fi/datos y modo avión | Recuperación si la intención continúa; pausa cancela reconexión; sin reproducción duplicada | Log y vídeo |
| D05 | Pantalla bloqueada / segundo plano | Reproducir, bloquear 5 min, regresar; verificar controles de sistema y comportamiento real de plataforma | Cronología |
| D06 | Interrupción de audio | Llamada de prueba o cambio de salida Bluetooth; registrar pausa/reanudación conforme al sistema | Cronología |
| D07 | DSP y grabación | EQ, bypass, presets, preamp, compresor; grabar 60 s y reproducir archivo descargado; anotar formato y duración | Archivo no sensible |
| D08 | Apariencia | AMOLED negro, exterior blanco, nueve acentos, escalas y rotación | Capturas |
| D09 | Accesibilidad | TalkBack / VoiceOver, navegación por elementos, búsqueda, cambios de estado, cierre de modales, zoom/reflow y reducción de movimiento | Lista de hallazgos |
| D10 | Actualización PWA | Instalar versión anterior, reproducir, publicar candidato en origen de prueba, posponer/aceptar actualización y comprobar flujo | Vídeo y versión de SW |
| D11 | Controles | Favoritos, recientes, compartir, filtros, navegación, volumen, temporizador, atajos y exportar diagnóstico | Lista de resultados |

Cada escenario se marca PASS, FAIL, BLOCKED o N/A con motivo. Los fallos de red/CDN se distinguen de los de aplicación. Si una API no existe en un navegador, comprobar degradación explícita y ausencia de errores, no dar por implementada esa capacidad.

## Medición comparativa CPU, memoria y batería

1. Fijar mismo dispositivo, navegador, red, señal PCM controlada para ambos builds, nivel de brillo manual y volumen. Desactivar tareas no relacionadas, cargar ambos builds y precalentar durante 2 min. Mantener configuración térmica y de carga comparable.
2. Ejecutar tres pares alternados A/B, B/A, A/B. Separar estados: reposo, reproducción con pantalla encendida, reproducción con pantalla bloqueada y cabina abierta. Capturar al menos 10 min por estado; para batería, usar 30 min o más y repetir si el indicador tiene baja resolución.
3. Android: usar herramientas de perfilado Android Studio/Perfetto o ADB para identificar procesos del navegador, tiempo CPU, PSS y eventos de energía. Registrar método y granularidad. No confundir consumo del paquete con energía de todo el equipo. En iOS, utilizar Instruments y medición energética compatible con el dispositivo; documentar limitaciones de acceso a procesos WebKit.
4. Si se usa un medidor eléctrico externo, registrar Wh o mWh y duración en horas; reportar potencia media Wh/h. Si solo hay indicador de porcentaje de batería, reportar puntos porcentuales por hora, no mAh/Wh ficticios. No comparar directamente dispositivos diferentes.
5. Reportar mediana, rango y número de repeticiones por estado. Calcular cambio % = (candidato - original) / original × 100 cuando el denominador sea positivo. Si faltan datos, dejar N/D; no interpolar. Anotar variabilidad y temperatura.
6. Registrar TTFA como tiempo desde acción de reproducción hasta inicio efectivo; registrar errores y reconexiones. Para continuidad en vivo utilizar mismos intervalos, estaciones, condiciones y, cuando sea posible, fuentes controladas.

## Registro por repetición

| Build/SHA | Dispositivo/SO | Estado | Duración s | CPU (método/unidad) | Memoria PSS MiB | Batería (unidad/método) | TTFA ms | Observaciones |
|---|---|---|---:|---|---:|---|---:|---|
| Pendiente | Pendiente | Pendiente | N/D | N/D | N/D | N/D | N/D | No ejecutado |

## Cierre

No declarar certificación WCAG 2.2 AA solo con axe; añadir revisión manual de todos los criterios aplicables. No afirmar reducción energética sin evidencia física. Mantener PR en borrador mientras existan fallos funcionales, de seguridad o accesibilidad que bloqueen aceptación. Revisar la resolución npm del baseline no reproducible junto con la evidencia de benchmark. La publicación de una versión final requiere revisión y decisión separadas.
