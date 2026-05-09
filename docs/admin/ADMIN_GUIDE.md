# 📋 Guía de Administración - Sistema de Aprobación de Radios

## Introducción

Este documento describe cómo usar el **Panel de Administración** de Radio Satelital para aprobar o rechazar nuevas estaciones de radio.

## 🚀 Instalación en Supabase

### 1. Crear las tablas y funciones

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Copia el contenido del archivo `/docs/database/supabase_admin_system.sql`
3. Pégalo en el editor SQL
4. Haz clic en **"Run"** para ejecutar

Esto creará:
- `admin_users` - tabla de administradores
- `admin_invitations` - tabla de invitaciones
- `approval_history` - tabla de historial
- Funciones RPC para aprobar/rechazar
- Políticas RLS de seguridad

### 2. Crear primer administrador (Manual)

En **Supabase SQL Editor**, ejecuta:

```sql
INSERT INTO public.admin_users (email, full_name, role, status)
VALUES ('tuadmin@email.com', 'Tu Nombre', 'admin', 'active');
```

Reemplaza `tuadmin@email.com` con el email del primer admin.

## 🔑 Acceso al Panel

### URL
```
https://tudominio.com/admin.html
```

### Login
1. Ve a `https://tudominio.com/admin-login.html`
2. Ingresa tus credenciales
3. Se guardarán en `localStorage` para esta sesión

**Nota**: Por ahora usa:
- Email: `admin@latanvillegas.online`
- Contraseña: `Demo123!Admin`

(En producción, integra con Supabase Auth)

## 👥 Gestionar Administradores

### Solo para Admins con rol "admin"

#### Invitar nuevo administrador:
1. Entra al panel → Tab **"Invitar Admin"**
2. Ingresa el email del nuevo admin
3. Selecciona su rol:
   - **Revisor**: Puede aprobar/rechazar radios
   - **Administrador**: Control total (invitar otros admins, ver historial)
4. Haz clic en **"Enviar Invitación"**

El sistema generará un **token de invitación** y un link que debe enviarse por email:
```
https://tudominio.com/admin-accept-invitation.html?token=XXXXX
```

#### El invitado debe:
1. Ir al link de invitación
2. Completar su información (nombre, contraseña)
3. Hacer clic en **"Aceptar Invitación"**
4. Se redirigirá automáticamente al panel

### Ver administradores activos:
- Tab **"Administradores"** (solo para super-admins)
- Muestra lista de todos los admins y sus roles

## ✅ Aprobar Radios

### Workflow:
1. Entra a **Tab "Pendientes"**
2. Verás todas las radios que usuarios han enviado
3. Revisa la información:
   - Nombre de la radio
   - URL del stream
   - País y región
   - Fecha de envío

### Para aprobar:
1. Haz clic en botón **"✓ Aprobar"** (verde)
2. La radio será:
   - Marcada como `approved`
   - Visible para otros usuarios
   - Incluida en el listado global

### Para rechazar:
1. Haz clic en botón **"✕ Rechazar"** (rojo)
2. Se abrirá un campo para escribir motivo (opcional)
3. La radio será:
   - Marcada como `rejected`
   - NO visible para usuarios
   - El remitente verá que fue rechazada

## 📊 Tabs disponibles

| Tab | Descripción | Acceso |
|-----|-------------|--------|
| **Pendientes** | Radios esperando aprobación | Todos |
| **Aprobadas** | Historial de aprobadas | Todos |
| **Rechazadas** | Historial de rechazadas | Todos |
| **Invitar Admin** | Invitar nuevos administradores | Solo admin |
| **Administradores** | Ver lista de admins activos | Solo admin |
| **Historial** | Log completo de aprobaciones | Solo admin |

## 🔒 Seguridad

### Políticas RLS (Row Level Security)

- Solo **authenticated users** con rol admin/reviewer pueden ver datos
- Cada admin solo ve lo que le corresponde
- Las funciones RPC verifican permisos antes de ejecutar
- Las invitaciones expiran en **7 días**
- Los tokens son únicos y seguros (32 bytes generados al azar)

### Roles y Permisos

```
┌─────────────────────────────────────────────────┐
│           ROLES Y PERMISOS                       │
├──────────┬───────────────┬──────────────────────┤
│ Rol      │ Aprueba       │ Invita Admins        │
├──────────┼───────────────┼──────────────────────┤
│ reviewer │ ✓             │ ✗                    │
│ admin    │ ✓             │ ✓                    │
└──────────┴───────────────┴──────────────────────┘
```

## 📝 Funciones Disponibles

### `approve_station(id, email)`
Aprueba una estación pendiente
```sql
SELECT approve_station(123, 'admin@example.com');
```

### `reject_station(id, email, comments)`
Rechaza una estación con motivo opcional
```sql
SELECT reject_station(123, 'admin@example.com', 'Mala calidad de audio');
```

### `create_admin_invitation(email, role, invited_by_email)`
Crea invitación para nuevo admin
```sql
SELECT create_admin_invitation('new@example.com', 'reviewer', 'admin@example.com');
```

### `accept_admin_invitation(token, email)`
Acepta invitación y crea cuenta
```sql
SELECT accept_admin_invitation('token_hex_string', 'new@example.com');
```

## 🐛 Troubleshooting

### "No puedo ver el panel"
- Verifica que estés logueado: `localStorage.getItem('admin_email')`
- Revisa que tu email esté en tabla `admin_users` con `status = 'active'`

### "Las invitaciones no funcionan"
- Verifica que el token sea válido: busca en tabla `admin_invitations`
- Revisa que la invitación no haya expirado
- Asegúrate de ser admin (rol = 'admin')

### "No veo las radios pendientes"
- Chequea el estado de las radios en tabla `global_stations`
- Verifica que `status = 'pending'`

### "Error de CORS"
- Configura los headers CORS en Supabase si es necesario
- Verifica que la `apikey` sea correcta en `config/supabase.config.js`

## 📈 Estadísticas

El panel muestra automáticamente contadores de:
- Radios pendientes
- Radios aprobadas
- Radios rechazadas

Los números se actualizan en tiempo real

## 🎯 Próximas mejoras

- [ ] Integración com Supabase Auth para login seguro
- [ ] Envío automático de emails de invitación
- [ ] Búsqueda y filtros avanzados
- [ ] Export de datos (CSV/JSON)
- [ ] Notificaciones en tiempo real
- [ ] 2FA (autenticación de dos factores)

---

**Versión**: 1.0  
**Última actualización**: Febrero 2026  
**Desarrollado para**: Radio Satelital Ultra v9.5
