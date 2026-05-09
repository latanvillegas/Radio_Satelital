# 🛠️ Instalación Rápida - Sistema de Aprobación de Radios

## Resumen

Este documento proporciona instrucciones paso a paso para instalar el sistema de administración y aprobación de radios en Radio Satelital.

## ¿Qué incluye?

✅ Panel de administración web  
✅ Gestión de permisos (admins, revisores)  
✅ Invitaciones para nuevos administradores  
✅ Historial de aprobaciones  
✅ Seguridad con RLS (Row Level Security)

## 📋 Requisitos

- Proyecto Supabase activo
- Acceso a SQL Editor de Supabase
- Dominio/URL para el panel de admin

## ⚡ Instalación (5 minutos)

### Paso 1: Ejecutar SQL en Supabase

1. **Abre Supabase Dashboard**
   - https://app.supabase.com

2. **Navega a SQL Editor** (lado izquierdo)

3. **Crea nueva query y copia/pega este contenido:**
  - Archivo: `/docs/database/supabase_admin_system.sql`
   - O copia desde el markdown de abajo

4. **Haz clic en "Run"** (botón azul)

```sql
-- [Aquí va contenido del archivo supabase_admin_system.sql]
```

### Paso 2: Crear Primer Admin

En SQL Editor, ejecuta:

```sql
INSERT INTO public.admin_users (email, full_name, role, status)
VALUES ('tucorreo@email.com', 'Tu Nombre', 'admin', 'active');
```

Reemplaza `tucorreo@email.com` con el email del administrador principal.

### Paso 3: Verificar Archivos en el Proyecto

Checkea que existan estos archivos:

```
✓ admin.html                    (interfaz del panel)
✓ admin.js                      (lógica del panel)
✓ admin-login.html              (página de login)
✓ admin-accept-invitation.html  (página de invitaciones)
✓ docs/database/supabase_admin_system.sql (tablas y funciones)
✓ docs/admin/ADMIN_GUIDE.md           (guía completa)
```

### Paso 4: Configurar config/supabase.config.js

Asegúrate de que esté completo:

```javascript
window.SUPABASE_CONFIG = {
  url: "https://tuproject.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  table: "global_stations",
  restUrl: "https://tuproject.supabase.co/rest/v1",
  limitPerMinute: 3,
  streamCheckTimeoutMs: 12000,
  requireStreamValidation: true
};
```

### Paso 5: Acceder al Panel

**URLs disponibles:**

- **Admin Login**: `https://tudominio.com/admin-login.html`
- **Panel Admin**: `https://tudominio.com/admin.html`

**Credenciales de demostración** (cambiar después):
- Email: `admin@latanvillegas.online`
- Contraseña: `Demo123!Admin`

## 📱 URLs Nuevas

| Página | URL | Descripción |
|--------|-----|-------------|
| Login Admin | `/admin-login.html` | Acceso al panel |
| Panel Admin | `/admin.html` | Gestión de radios |
| Aceptar Invitación | `/admin-accept-invitation.html?token=XXX` | Registro de nuevos admins |

## 🔐 Seguridad Inicial

### Cambiar credenciales de ejemplo

En `admin-login.html`, busca esto y cámbialo:

```javascript
const adminEmail = localStorage.getItem('admin_master_email') || 'admin@latanvillegas.online';
const adminPassword = localStorage.getItem('admin_master_pass') || 'Demo123!Admin';
```

### Producción: Integrar Supabase Auth

Reemplaza el sistema de localStorage con Supabase Auth:

```javascript
// Usar en lugar del código actual:
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, anonKey)

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

## ✨ Funcionalidades

### Para Revisores (role: 'reviewer')
- ✅ Ver radios pendientes
- ✅ Aprobar radios
- ✅ Rechazar radios
- ✅ Ver historial de aprobadas/rechazadas

### Para Administradores (role: 'admin')
- ✅ Todas las del revisor +
- ✅ Invitar nuevos administradores
- ✅ Ver lista de administradores
- ✅ Ver historial completo
- ✅ Gestionar roles y permisos

## 🧪 Pruebas

### Probar aprobación de una radio:

1. Entra a `/admin.html`
2. Verás radios pendientes en el tab "Pendientes"
3. Haz clic en "✓ Aprobar" en cualquier radio
4. Verifica que aparezca en tab "Aprobadas"

### Probar invitación de admin:

1. Entra a `/admin.html`
2. Abre tab "Invitar Admin"
3. Ingresa email y rol
4. Copia el link del token generado
5. Abre en otra ventana/navegador
6. Completa el registro

## 📊 Estructura de Datos

### Tabla: admin_users
```
id (uuid) | email (text) | full_name (text) | role (text) | status (text) | created_at
```

### Tabla: admin_invitations
```
id (uuid) | email (text) | role (text) | token (text) | status (text) | expires_at | invited_by
```

### Tabla: approval_history
```
id (uuid) | station_id (bigint) | admin_id (uuid) | action (text) | comments (text) | created_at
```

## 🐛 Debugging

### Ver logs en consola
```javascript
// En el navegador, abre la consola (F12)
localStorage.getItem('admin_email')  // Debe mostrar el email
adminState  // Debe mostrar el estado completo del panel
```

### Verificar en Supabase
```sql
-- Ver admins
SELECT * FROM admin_users;

-- Ver invitaciones pendientes
SELECT * FROM admin_invitations WHERE status = 'pending';

-- Ver historial
SELECT * FROM approval_history ORDER BY created_at DESC;

-- Ver radios pendientes
SELECT id, name, country, status, created_at FROM global_stations WHERE status = 'pending';
```

## 🚀 Próximos Pasos

1. **Cambiar credenciales** de demostración por las reales
2. **Integrar Supabase Auth** para autenticación segura
3. **Configurar emails** para invitaciones automáticas
4. **Establecer políticas** de aprobación
5. **Entrenar** a los administradores

## 📚 Documentación Completa

Para más detalles, lee: [`docs/admin/ADMIN_GUIDE.md`](./ADMIN_GUIDE.md)

## 💬 Soporte

- **Documentación**: `/docs/admin/ADMIN_GUIDE.md`
- **Código fuente**: `/admin.js`, `/admin.html`
- **SQL**: `/docs/database/supabase_admin_system.sql`

---

**Versión**: 1.0  
**Última actualización**: Febrero 2026
