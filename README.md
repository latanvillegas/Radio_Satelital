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
* **Motor de Audio Nativo:** Optimizado con HTML5 Audio API + Media Session.
* **Formatos Soportados:** `.mp3`, `.m3u`, streaming Shoutcast/Icecast en vivo.
* **Control Avanzado:** Manejo desde pantalla de bloqueo, notificaciones y smartwatch.

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

## 📖 Guía de Uso

### Agregar una Emisora
1. Abre la app y ve al **Panel Rápido** (⚙️ Ajustes)
2. Completa **Nombre** y **URL del stream** (m3u, mp3, o stream en vivo)
3. Presiona **"+"** o buscador para agregar
4. La emisora aparecerá en tu lista local

### Buscar y Filtrar
- **Búsqueda rápida:** Usa el campo "Buscar emisora"
- **Por país:** Selecciona desde dropdown "Todos los países"
- **Por región:** Filtra dentro del país seleccionado
- **Solo favoritos:** Presiona ⭐ para mostrar solo tus favoritos

### Personalización Visual
1. Abre **Ajustes** (⚙️)
2. Selecciona tema: AMOLED, Gold, Purple, White, Ocean, Sunset, Galaxy, Mint, Cherry
3. Ajusta tamaño de interfaz: Auto, Pequeño, Medio, Grande, Muy Grande
4. Los cambios se guardan automáticamente

### Reproducción y Controles
- **Play/Pausa:** Presiona el botón grande en el centro
- **Siguiente/Anterior:** Flechas < >
- **Volumen:** Deslizador en la barra del reproductor
- **Pantalla de bloqueo:** Controla desde ahí en modo instalado

### Modo Offline
- La app guarda emisoras en tu dispositivo
- Puedes buscar entre tus emisoras sin internet
- Para escuchar necesitas conexión

---

## 🛠️ Stack Tecnológico

| Categor​ía | Tecnología | Función |
|-----------|-----------|---------|
| **Framework** | [Next.js 15](https://nextjs.org) | Server-side rendering + SSG |
| **UI** | [React 19](https://react.dev) | Componentes dinámicos |
| **Estilos** | [Tailwind CSS](https://tailwindcss.com) | Utilidades + CSS personalizado |
| **Tipos** | [TypeScript](https://www.typescriptlang.org) | Type-safety |
| **Iconos** | [Lucide React](https://lucide.dev) | Icons SVG |
| **Animación** | [Framer Motion](https://www.framer.com/motion) | Transiciones suaves |
| **Audio** | HTML5 Audio API | Reproducción nativa |
| **PWA** | Web Manifest + Service Worker | Instalable offline |
| **Base de datos** | LocalStorage + Firebase/Supabase (opcional) | Persistencia local y nube |

---

## 🌐 Compatibilidad de Navegadores

| Navegador | Versión | PWA | Instalable | Offline |
|-----------|---------|-----|-----------|---------|
| **Chrome** | 88+ | ✅ | ✅ | ✅ |
| **Edge** | 88+ | ✅ | ✅ | ✅ |
| **Firefox** | 64+ | ✅ | ✅ | ✅ |
| **Safari** | 15.4+ | ⚠️ Parcial | ⚠️ Manual | ✅ |
| **Samsung Internet** | 14+ | ✅ | ✅ | ✅ |

**Nota:** Safari requiere agregar manualmente (Home > Añadir a inicio)

---

## 🔒 Seguridad

Esta aplicación implementa múltiples capas de protección:

### Validación
- ✅ URLs validadas (solo `http://` y `https://`)
- ✅ Bloqueo de `localhost` y redes privadas
- ✅ Validación de longitud de campos

### Privacidad
- ✅ **Sin registro requerido** - funciona 100% anónimo
- ✅ **Sin rastreo** - los datos se guardan SÓ​LO en tu dispositivo
- ✅ **Datos locales** - localStorage no se envía a servidores
- ✅ **CORS protegido** - proxy inteligente para requests seguras

### Arquitectura
- ✅ Sin exposición de credenciales en frontend
- ✅ Mensajes de error genéricos (sin detalles técnicos)
- ✅ CSP (Content Security Policy) configurada

---

---

## 🔧 Troubleshooting

Para problemas comunes, consulta la documentación específica:

- **Problemas de audio:** [docs/features/AUDIO_PLAYBACK_TROUBLESHOOTING.md](docs/features/AUDIO_PLAYBACK_TROUBLESHOOTING.md)
- **Configuración privada en la nube:** [docs/admin/ADMIN_SETUP.md](docs/admin/ADMIN_SETUP.md)
- **Notificaciones en tiempo real:** [docs/features/REALTIME_NOTIFICATIONS.md](docs/features/REALTIME_NOTIFICATIONS.md)

### Problemas Frecuentes

**P: ¿Por qué no suena una emisora?**
- Verifica que la URL sea válida (http:// o https://)
- Intenta en otro navegador para descartar problemas de caché
- Algunos streams pueden estar offline
- Consulta [docs/features/AUDIO_PLAYBACK_TROUBLESHOOTING.md](docs/features/AUDIO_PLAYBACK_TROUBLESHOOTING.md)

**P: ¿Cómo instalo en iOS?**
- Abre en Safari
- Menú (↑) → Agregar a pantalla de inicio
- Se instalará como app web

**P: ¿Funciona sin internet?**
- Sí, pero limitado. Necesitas internet para escuchar streams en vivo.
- Puedes buscar entre emisoras agregadas sin conexión.

**P: ¿Dónde se guardan mis datos?**
- Todo en tu dispositivo (localStorage)
- Nada se envía a servidores externos (excepto Supabase si lo activas)
- Ver [docs/policies/PRIVACY.md](docs/policies/PRIVACY.md) para detalles

---

## 📂 Estructura del Proyecto

```text
/
├── app/                          # App Router (Next.js)
├── components/                   # Componentes React
├── hooks/                        # Hooks personalizados
├── lib/                          # Utilidades
├── data/                         # Datos de emisoras
├── public/                       # Activos estáticos
├── types/                        # Tipos TypeScript
├── next.config.ts                # Configuración Next.js
├── tsconfig.json                 # Configuración TypeScript
├── tailwind.config.js            # Configuración Tailwind
├── postcss.config.js             # Configuración PostCSS

├── docs/                         # Documentación
│   ├── README.md                 # Índice de documentación
│   ├── admin/                    # Administración y setup
│   ├── features/                 # Audio, notificaciones y guías de uso
│   ├── policies/                 # Privacidad y seguridad
│   ├── history/                  # Changelog
│   └── database/                 # Scripts SQL
│
├── scripts/
│   └── test-streams.sh          # Helper para testear streams
│
├── widgets/                      # Widgets para Android
│   ├── mini.json                 # Config de widget pequeño
│   └── data.json                 # Datos de widget
│
├── config/
│   ├── stations.js              # Base de datos de emisoras
│   └── supabase.config.js       # Configuración Supabase (opcional)
├── manifest.json                # Manifiesto raíz
└── package.json                 # Dependencias raíz
```

### Archivos Importantes Explicados

- **`config/stations.js`** - Array de emisoras disponibles al inicio. Se puede extender dinámicamente.
- **`config/supabase.config.js`** - (Opcional) Para sincronizar emisoras globalmente entre usuarios. Dejar vacío para modo local.
- **Manifest.json** - Define cómo se instala la app (nombre, icono, colores, etc.)
- **globals.css** - Estilos responsive que funcionan en cualquier dispositivo (320px - 2560px)

---

## 🛠️ Requisitos

Para ejecutar localmente:

- **Node.js** 18.17+ (recomendado: 20 LTS)
- **npm** 9+ o **yarn** 3+
- **Navegador moderno** para testing (Chrome, Edge, Firefox)
- **Git** (para clonar repositorio)

### Requisitos opcionales (para características avanzadas)

- Firebase o Supabase (para sincronización en la nube)
- Servidor web para producción

---

## ⚡ Instalación Local

### Desarrollo

```bash
# 1. Clonar repositorio
git clone https://github.com/<owner>/<repo>.git
cd Radio_Satelital

# 2. Instalar dependencias raíz
npm install

# 3. Crear archivo .env.local (si usas Firebase/Supabase)
# cp .env.example .env.local
# (Agrega tus credenciales si quieres sincronización en la nube)

# 4. Ejecutar en desarrollo (hot reload)
npm run dev

# Abre http://localhost:3000
```

### Compilación para Producción

```bash
# Compilar versión optimizada
npm run build

# Servir localmente para testing
npm start
```

### Testing de PWA

```bash
# Validar que sea instalable (PWA Builder)
npm run build && npm start

# Luego abre http://localhost:3000 en Chrome
# Verás el prompt "Instalar app" o podrás instalar desde menú
```

### Testing de Streams

```bash
# Script para validar si un stream funciona
./scripts/test-streams.sh "https://stream.example.com/radio.mp3"
```

---

## 📦 Producción

### Desplegar en Vercel (Recomendado)

```bash
# 1. Hacer push a GitHub
git push origin main

# 2. Conectar repositorio a Vercel
# https://vercel.com/new

# 3. Vercel automáticamente compila y despliega
# Acceso en: https://tu-proyecto.vercel.app
```

### Desplegar en tu servidor

```bash
# 1. Compilar
npm run build

# 2. Subir artefactos compilados a tu servidor
# 3. Instalar dependencias en servidor
npm ci --production

# 4. Iniciar con un gestor de procesos
npm start
```

---

## 🤝 Colaboraciones

¡Este proyecto está abierto a la comunidad! Si eres desarrollador o tienes ideas para mejorar **Radio Satelital**, tu ayuda es bienvenida.

* 🐛 **Reportar Errores:** Si encuentras algún fallo, abre un Issue en el repositorio detallando el problema.
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

## 📜 Licencia

Este proyecto está bajo la licencia **MIT**.

### MIT License
Copyright (c) 2026 Latán Villegas Avelino

Se concede permiso, sin cargo, a cualquier persona que obtenga una copia de este software y archivos de documentación asociados (el "Software"), para utilizar el Software sin restricción, incluyendo sin limitación los derechos para usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar, y/o vender copias del Software, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso deberán ser incluidos en todas las copias o partes sustanciales del Software.

**EL SOFTWARE SE PROPORCIONA "TAL CUAL", SIN GARANTÍA DE NINGÚN TIPO**, expresa o implícita, incluyendo pero no limitado a garantías de comerciabilidad, idoneidad para un propósito particular y no infracción.

En ningún caso los autores o propietarios de derechos de autor serán responsables por cualquier reclamación, daño u otra responsabilidad, ya sea en acción de contrato, agravio o de otra manera, que surja de, fuera de o en conexión con el software o el uso u otras transacciones en el Software.

Para más información, ver [LICENSE](LICENSE)

---

### Atribuciones

- **Lucide React** - Iconos SVG ([MIT License](https://github.com/lucide-icons/lucide))
- **Framer Motion** - Animaciones ([MIT License](https://github.com/framer/motion))
- **Next.js** - Framework web ([MIT License](https://github.com/vercel/next.js))
- **Tailwind CSS** - Framework CSS ([MIT License](https://github.com/tailwindlabs/tailwindcss))

---

© 2026 **Radio Satelital**. Todos los derechos reservados.
