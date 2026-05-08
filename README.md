# 📻 Radio Satelital - Ultra Wave Player (v9.5)

![Version](https://img.shields.io/badge/version-v9.5-00e676?style=for-the-badge)
![PWA Score](https://img.shields.io/badge/PWABuilder-44%2F44-brightgreen?style=for-the-badge&logo=pwa)
![Platform](https://img.shields.io/badge/Web-PWA-4285F4?style=for-the-badge&logo=googlechrome)

**Radio Satelital** es una aplicación de radio progresiva (PWA) de última generación, certificada con **puntuación perfecta (44/44)** en estándares web. Diseñada para ofrecer streaming de alta calidad, modo offline real y una experiencia visual inmersiva.

🌐 **Web Oficial:** [latanvillegas.online](https://latanvillegas.online/)

---

## 🚀 Características Principales (v9.5)

### 🏆 Certificación Platino PWA
Esta versión ha alcanzado el máximo nivel de integración técnica:
* **✅ Soporte Offline Real:** Funciona sin conexión a internet.
* **✅ Instalable:** Se instala directamente desde el navegador sin tienda de aplicaciones.
* **✅ Media Session API:** Control completo desde pantalla de bloqueo y notificaciones.
* **✅ Multi-Dispositivo:** Compatible con escritorio, tablet y teléfono.

### 🎧 Experiencia de Audio Premium
* **Motor de Audio v9.5:** Optimizado para cero cortes en segundo plano.
* **Media Session API:** Control total desde la pantalla de bloqueo y reloj.
* **Multi-Formato:** Soporte nativo para `.mp3`, `.m3u` y streaming Shoutcast/Icecast.

### 🎨 Personalización Visual
* **Temas Premium:** Cyber Dark, AMOLED Real, Gold Luxury.
* **Modo Wear:** Estilos inspirados en Smartwatches (Blue Ocean, Sunset Orange).
* **Responsive:** Adaptación fluida a cualquier tamaño de pantalla.

---

## 📲 Instalación Web (PWA)

1. Ingresa a [latanvillegas.online](https://latanvillegas.online/) desde Chrome o Edge.
2. Presiona **"Instalar Aplicación"** en el menú del navegador.
3. ¡Listo! La radio se instala en tu dispositivo sin necesidad de tienda de aplicaciones.

---

## 🌍 Modo colaborativo global (Supabase)

Con esta versión puedes habilitar que **todas las personas vean las radios que otros agregan**.

1. Crea un proyecto en Supabase.
2. En SQL Editor ejecuta: [docs/supabase_global_stations.sql](docs/supabase_global_stations.sql).
3. Abre [supabase.config.js](supabase.config.js) y completa:
   - `url`: URL de tu proyecto Supabase.
   - `anonKey`: clave pública anon.
   - `table`: `global_stations` (por defecto).
4. Agrega una radio desde el formulario web.
5. Las radios nuevas entran como **pending** (cola de revisión).
6. Solo radios **approved** se muestran a todos en la app.

> Si `supabase.config.js` queda vacío, la app sigue funcionando en modo local (localStorage).

### 🛡️ Moderación básica anti-spam
- **Bloqueo de URL inválida** (solo `http/https`, sin `localhost` ni red privada).
- **Validación de señal** antes de publicar global (prueba rápida del stream).
- **Límite por minuto en cliente** (`limitPerMinute` en `supabase.config.js`).
- **Límite por minuto en tabla global** (trigger SQL) + constraints de longitud/URL.

### ✅ Moderación avanzada (cola de revisión)
La tabla global usa estados:
- `pending`: enviada por usuario, aún no visible globalmente.
- `approved`: visible para todos.
- `rejected`: descartada.

Para moderar, usa [docs/supabase_moderation_queries.sql](docs/supabase_moderation_queries.sql).

Puedes ajustar en [supabase.config.js](supabase.config.js):
- `limitPerMinute`
- `streamCheckTimeoutMs`
- `requireStreamValidation`

### ⚡ DNS público / mayor velocidad
Para máxima velocidad global:
- Usa dominio propio de Supabase (CNAME) con Cloudflare.
- Activa proxy/CDN y caché en rutas de lectura (`/rest/v1/global_stations?select=...`).
- Si usas endpoint REST personalizado, define `restUrl` en [supabase.config.js](supabase.config.js).

---

## 📂 Estructura del Proyecto

```text
/
├── satelital-radio/      # Aplicación Next.js PWA
│   ├── app/              # Lógica principal
│   ├── components/       # Componentes React
│   ├── hooks/            # Hooks personalizados
│   ├── lib/              # Utilidades y helpers
│   ├── public/           # Activos públicos
│   │   ├── manifest.json # Manifiesto PWA
│   │   ├── icon-*.png    # Iconos para instalación
│   │   └── robots.txt    # SEO
│   └── types/            # Tipos TypeScript
├── docs/                 # Documentación
├── scripts/              # Scripts útiles
├── stations.js           # Base de datos de emisoras
├── supabase.config.js    # Configuración de Supabase
└── manifest.json         # Manifiesto PWA raíz
```

## 🛠️ Requisitos

- Node.js 18+
- npm o yarn
- Navegador moderno (Chrome, Edge, Firefox)

## ⚡ Instalación Local

```bash
# 1. Instalar dependencias
npm install

# 2. Instalar dependencias de la app web
cd satelital-radio && npm install && cd ..

# 3. Ejecutar en desarrollo
npm run dev

# 4. Compilar para producción
npm run build
```

---

## 🤝 Colaboraciones

¡Este proyecto está abierto a la comunidad! Si eres desarrollador o tienes ideas para mejorar **Radio Satelital**, tu ayuda es bienvenida.

* 🐛 **Reportar Errores:** Si encuentras algún fallo, abre un [Issue](https://github.com/LatanVillegasAvelino/Radio-Satelital-Latan-Villegas/issues) detallando el problema.
* 💡 **Sugerir Funciones:** ¿Se te ocurre algo nuevo? Compártelo en la sección de Issues.
* 💻 **Pull Requests:** Si mejoras el código, envía tu solicitud para integrarla al proyecto.
* ⭐ **Deja una Estrella:** Si te gusta el proyecto, ¡apóyanos dando clic en la estrella (Star) arriba a la derecha!

---

## 👤 Autor y Contacto

Desarrollado con ❤️ por **Latán Villegas Avelino**.

* **Redes:** Integradas en la aplicación (Menú Lateral).
* **Estado:** Activo y en desarrollo constante.

---

## ☕ Apoyo al Desarrollador

¿Te gusta **Radio Satelital**? Si valoras este proyecto y quieres motivar futuras actualizaciones, ¡invítame un café!

[![Donar con PayPal](https://img.shields.io/badge/Hacer%20Donaci%C3%B3n-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=alv.oficial123@gmail.com&currency_code=USD&source=url)

---
© 2026 Radio Satelital. Todos los derechos reservados.
