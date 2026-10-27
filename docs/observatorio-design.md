# Radio Satelital / Observatorio de Señales

Propuesta de experiencia web propia, sin reemplazar ni duplicar el motor de audio.

## Concepto
Un observatorio editorial: el dial orbital es una visualización decorativa de exploración,
no una medición de intensidad, cobertura, bitrate ni ubicación GPS.

## Sistema visual
- Superficies: negro oceánico #06090d, verde satelital procedente de la variable --accent.
- Señal visual: trazos concéntricos y puntos estáticos, sin animación continua.
- Tipografía: Inter existente, titulares con jerarquía editorial y contraste reforzado.
- Estructura: presentación + observatorio + búsqueda + recientes + catálogo.
- Responsive: dial compacto en móvil y distribución editorial en pantallas amplias.

## Integración y compatibilidad
- Se conservan useStations, StationGrid, Player, SideMenu, favoritos y DSP.
- No se sustituyen emisoras ni rutas de streams ni se agregan servicios externos.
- El tema claro existente mantiene el área protagonista en modo oscuro para preservar identidad.
- prefers-reduced-motion detiene transiciones y desplazamientos animados.
- Los indicadores de catálogo proceden de datos reales de la aplicación.
- La emisora seleccionada no se representa falsamente como «reproduciendo».

## Validación mínima
1. npm install --no-audit --no-fund
2. npm run lint
3. npm run test
4. npm run build
5. Comprobar teclado, tema claro, móvil 360/390 px, tablet, escritorio.
6. Validar reproducción, favoritos y reconexión en navegadores antes de publicar.
