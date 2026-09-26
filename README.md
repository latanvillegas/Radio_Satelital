# 📻 Radio Satelital

![Version](https://img.shields.io/badge/version-1.0.1-10b981?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PWA](https://img.shields.io/badge/Web-PWA-5A0FC8?style=for-the-badge&logo=pwa)

**Radio Satelital** es un sintonizador web de emisoras en vivo, diseñado para escuchar radios de Perú y del mundo desde una interfaz rápida, adaptable y centrada en la reproducción continua.

🌐 **Web oficial:** [latanvillegas.online](https://latanvillegas.online/)

---

## ✨ Funciones principales

### 📡 Catálogo de emisoras

- Catálogo global de radios en vivo.
- Búsqueda por nombre, ciudad, país o género.
- Filtros y accesos rápidos por categorías.
- Emisoras favoritas.
- Historial de emisoras escuchadas recientemente.
- Logotipos, ubicación y metadatos disponibles de cada emisora.

### 🎧 Reproductor

- Reproducción y pausa.
- Emisora anterior y siguiente.
- Control de volumen.
- Reproductor persistente en la parte inferior.
- Reproductor expandido con portada centrada, información de la emisora y visualizador de audio.
- Compartir emisora.
- Temporizador de sueño.
- Reconexión y recuperación del streaming cuando corresponde.

### 🎛️ Herramientas de estudio

Radio Satelital incluye una **Cabina de Estudio Broadcast** para visualizar y controlar la señal con una interfaz inspirada en herramientas profesionales de radio:

- Estado **ON AIR**.
- Reloj local y UTC.
- Monitor principal de la emisora.
- Espectrograma de frecuencias.
- Vúmetros estéreo L/R.
- Información de códec, bitrate y buffer disponible.
- Re-sincronización de señal.
- Acceso al ecualizador.
- Controles de reproducción integrados.
- Panel de ayuda con atajos de teclado.

### ⌨️ Atajos de la Cabina de Estudio

| Tecla | Acción |
|---|---|
| `Espacio` | Reproducir / Pausar |
| `←` | Emisora anterior |
| `→` | Emisora siguiente |
| `E` | Abrir ecualizador |
| `R` | Grabar emisión, cuando la función esté disponible |
| `S` | Re-sincronizar señal |
| `F` | Pantalla completa |
| `?` | Mostrar ayuda de atajos |
| `Esc` | Cerrar panel/modal |

> Algunos atajos dependen de las capacidades disponibles en el navegador y de la función activa en ese momento.

### 🎚️ Ecualizador DSP

- Ecualizador paramétrico de 5 bandas.
- Presets de monitorización.
- Ajustes para voz/noticias, graves, pop, acústico/jazz y estudio.
- Control de pre-amplificación.
- Compresor broadcast.
- Interfaz adaptada a modo oscuro y modo exterior.

---

## ☀️ Apariencia y accesibilidad visual

El sistema de apariencia está separado del color de acento para que la interfaz completa pueda adaptarse al entorno.

### Modos de apariencia

- **Oscuro AMOLED:** negro puro y superficies oscuras para uso nocturno y pantallas OLED/AMOLED.
- **Claro / Exterior:** fondo blanco, superficies claras, texto oscuro y contraste elevado para mejorar la visibilidad con mucha iluminación o bajo el sol.
- **Automático:** sigue la preferencia clara/oscura del dispositivo.

El modo elegido se aplica a la interfaz principal, tarjetas, buscador, reproductores, panel de ajustes, Cabina de Estudio, ecualizador y demás superficies compatibles.

### Colores de acento

El color de acento es independiente del modo de apariencia. Actualmente se incluyen opciones como rojo, dorado, morado, plata, océano, naranja, azul, verde y rosa.

Los acentos se utilizan en botones, estados activos, indicadores y controles sin convertir el color de acento en el fondo general de la aplicación.

### Escala de interfaz

La interfaz puede ajustarse para diferentes tamaños de pantalla mediante escalas compacta, estándar y amplia, además del comportamiento adaptativo utilizado por la aplicación.

---

## 📱 Diseño responsive

Radio Satelital está preparada para:

- Teléfonos.
- Tablets.
- Laptops.
- Escritorio.
- Navegadores compatibles con instalación PWA.

El diseño reorganiza controles y contenido según el espacio disponible, manteniendo el reproductor accesible durante la navegación.

---

## 📲 PWA

El proyecto incluye soporte de aplicación web progresiva mediante manifiesto y service worker. La disponibilidad exacta de instalación, funcionamiento en segundo plano y controles multimedia depende del navegador y del sistema operativo.

### Instalación general

1. Abre [latanvillegas.online](https://latanvillegas.online/) en un navegador compatible.
2. Utiliza la opción **Instalar aplicación** o **Agregar a pantalla de inicio** disponible en el navegador.
3. Abre Radio Satelital desde el acceso instalado.

> La interfaz puede almacenarse para mejorar la experiencia PWA, pero escuchar una radio en vivo requiere conexión a Internet y que el servidor de la emisora esté disponible.

---

## 🛠️ Stack tecnológico

| Categoría | Tecnología | Uso |
|---|---|---|
| Framework | Next.js 15 | Aplicación web y App Router |
| UI | React 18 | Componentes interactivos |
| Lenguaje | TypeScript 5.2 | Tipado y mantenimiento |
| Estilos | Tailwind CSS 3.4 + CSS | Diseño responsive y temas |
| Animaciones | Framer Motion | Transiciones y modales |
| Iconos | Lucide React | Iconografía SVG |
| Audio | HTML5 Audio / APIs del navegador | Streaming y reproducción |
| Testing | Vitest | Pruebas automatizadas |
| PWA | Manifest + Service Worker | Experiencia instalable |

Las versiones anteriores se basan en las dependencias declaradas actualmente en `package.json`.

---

## 📂 Estructura principal

```text
Radio_Satelital/
├── app/                  # App Router, páginas y estilos globales
├── components/
│   ├── features/         # Cabina, ecualizador, visualizador, etc.
│   └── layout/           # Reproductor, ajustes y estructura visual
├── data/                 # Datos de emisoras
├── hooks/                # Estado y lógica reutilizable
├── lib/                  # Utilidades y sistema de temas
├── public/               # Recursos públicos y PWA
├── types/                # Tipos TypeScript
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## ⚡ Desarrollo local

### Requisitos

- Node.js 18.17 o superior; Node.js 20 LTS recomendado.
- npm.
- Git.
- Navegador moderno.

### Instalación

```bash
git clone https://github.com/latanvillegas/Radio_Satelital.git
cd Radio_Satelital
npm install
npm run dev
```

Después abre:

```text
http://localhost:3000
```

### Scripts disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Compilación de producción
npm start          # Servidor de producción
npm run lint       # Comprobación TypeScript sin emitir archivos
npm test           # Ejecutar pruebas con Vitest
npm run test:watch # Vitest en modo watch
```

Antes de publicar cambios importantes es recomendable ejecutar como mínimo:

```bash
npm run lint
npm test
npm run build
```

---

## 📻 Streaming y disponibilidad

Radio Satelital reproduce transmisiones proporcionadas por servidores externos de las propias emisoras o sus proveedores de streaming. Por ello:

- Una emisora puede quedar temporalmente fuera de línea.
- Un servidor puede cambiar su URL o formato.
- Algunas transmisiones pueden aplicar restricciones regionales, CORS u otras políticas externas.
- La calidad y latencia dependen de la emisora, la conexión del usuario y el servidor de origen.

Un fallo en una emisora individual no implica necesariamente un fallo de la aplicación.

---

## 🔒 Privacidad y seguridad

El proyecto procura mantener la experiencia principal sin exigir registro al usuario y utiliza almacenamiento local para preferencias como apariencia, escala de interfaz y otros estados compatibles.

Al contribuir al proyecto:

- No publiques claves, tokens ni credenciales en el frontend.
- No añadas secretos a archivos versionados.
- Valida datos y URLs externas antes de utilizarlas.
- Mantén las dependencias actualizadas de forma controlada.
- Revisa cualquier cambio que afecte reproducción, almacenamiento o conexiones externas.

---

## 🧭 Mantenimiento del README

Este archivo debe mantenerse sincronizado con el comportamiento real de la aplicación.

Al introducir cambios importantes:

- Actualiza las funciones descritas aquí si cambia la interfaz o el reproductor.
- Actualiza los atajos cuando cambien los controles de la Cabina de Estudio.
- Actualiza la sección de apariencia cuando se agreguen o eliminen modos/acentos.
- No publiques métricas, certificaciones o compatibilidades que no hayan sido verificadas.
- Mantén las versiones técnicas alineadas con `package.json`.
- Conserva la autoría, licencia, atribuciones y enlaces oficiales del proyecto.

---

## 🐛 Solución de problemas

**Una emisora no reproduce audio**

Comprueba primero otra emisora. El stream original puede estar temporalmente desconectado o bloqueado por el proveedor.

**La interfaz no refleja un cambio reciente**

Recarga la página. Si utilizas la versión PWA instalada, puede ser necesario cerrar y volver a abrir la aplicación para que el service worker actualice los recursos.

**El modo Claro / Exterior deja alguna superficie oscura**

Esto normalmente indica que un componente conserva estilos específicos del modo oscuro. Debe corregirse en el componente o en las reglas globales de apariencia, procurando mantener contraste suficiente en ambos modos.

**No aparece la opción de instalar**

La disponibilidad depende del navegador, sistema operativo y criterios PWA que el navegador aplique en ese momento.

---

## 🤝 Contribuciones

Las mejoras son bienvenidas. Para colaborar:

1. Crea un fork o una rama de trabajo.
2. Realiza cambios pequeños y claramente identificables.
3. Comprueba TypeScript, pruebas y build.
4. Documenta cualquier comportamiento nuevo.
5. Envía un Pull Request explicando el cambio.

También puedes utilizar Issues para reportar errores o proponer mejoras.

---

## 👤 Autor

Desarrollado por **Latán Villegas Avelino**.

**Estado del proyecto:** activo y en desarrollo continuo.

---

## ☕ Apoyo al desarrollador

Si Radio Satelital te resulta útil y deseas apoyar su desarrollo:

[![Donar con PayPal](https://img.shields.io/badge/Hacer%20Donaci%C3%B3n-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=alv.oficial123@gmail.com&currency_code=USD&source=url)

---

## 📜 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta [`LICENSE`](LICENSE) para el texto completo.

Copyright (c) 2026 **Latán Villegas Avelino**.

La licencia y los avisos de copyright deben conservarse en las copias o partes sustanciales del software conforme a los términos de MIT.

---

## 🙏 Atribuciones

- [Next.js](https://github.com/vercel/next.js) — MIT.
- [React](https://github.com/facebook/react) — MIT.
- [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) — MIT.
- [Lucide](https://github.com/lucide-icons/lucide) — ISC.
- [Framer Motion / Motion](https://github.com/motiondivision/motion) — MIT.

---

© 2026 **Radio Satelital** · Latán Villegas Avelino
