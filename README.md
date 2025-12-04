# Radio Satelital | Ultra Interface v6.5

Interfaz de reproducción de audio en streaming basada en estándares web modernos (Vanilla JS). Diseñada para rendimiento, persistencia local y capacidad PWA (Progressive Web App).

## Arquitectura del Proyecto

El proyecto sigue una estructura estricta de separación de preocupaciones (SoC). No altere la ubicación de los archivos o romperá la aplicación.

```text
/ (Raíz del Repositorio)
│
├── index.html          # Estructura DOM y punto de entrada.
├── manifest.json       # Configuración de metadatos para instalación PWA.
├── sw.js               # Service Worker (Caché y funcionalidad Offline).
│
├── css/
│   └── style.css       # Estilos visuales (Glassmorphism, Layout, Theming).
│
└── js/
    ├── stations.js     # Base de datos estática de emisoras (JSON Array).
    ├── main.js         # Lógica de negocio, renderizado y manejo de eventos.
