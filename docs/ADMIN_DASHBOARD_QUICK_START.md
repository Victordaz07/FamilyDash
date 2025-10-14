# 🚀 Admin Dashboard - Quick Start

**¿Quieres acceder al Admin Dashboard? Sigue estos pasos:**

---

## ⚡ En 5 Minutos

### 1️⃣ **Deploy Todo**

```bash
DEPLOY_FINAL.bat
```

Esto desplegará:

- ✅ Web Platform (con registro y login)
- ✅ Admin Dashboard (7 páginas)
- ⏳ Cloud Functions (manual después)

### 2️⃣ **Registrarte**

1. Ve a: https://family-dash-15944.web.app/signup
2. Registrate con tu email y contraseña
3. Recibirás un email de verificación
4. Click en el link del email

### 3️⃣ **Convertirte en Super Admin**

1. Ve a [Firebase Console](https://console.firebase.google.com/project/family-dash-15944/firestore)
2. Busca tu usuario en la colección `users`
3. Edita y cambia: `role: "superadmin"`
4. Guarda

### 4️⃣ **Acceder al Dashboard**

1. Ve a: https://family-dash-15944.web.app/login
2. Haz login
3. Serás redirigido automáticamente a: `/admin/dashboard`
4. 🎉 **¡Listo!**

---

## 📍 URLs del Dashboard

Una vez que seas super admin, puedes acceder a:

| URL                | Descripción                                      |
| ------------------ | ------------------------------------------------ |
| `/admin/dashboard` | 📊 **Overview** - Vista general y stats          |
| `/admin/users`     | 👥 **Usuarios** - Ver, editar, eliminar usuarios |
| `/admin/families`  | 👨‍👩‍👧‍👦 **Familias** - Gestionar todas las familias   |
| `/admin/analytics` | 📈 **Analytics** - Gráficas y métricas           |
| `/admin/content`   | 📝 **Contenido** - Blog y anuncios               |
| `/admin/system`    | ⚙️ **Sistema** - Configuración global            |

---

## 🔧 Deploy Cloud Functions (Opcional)

Para funcionalidad avanzada (eliminar usuarios de Auth, etc.):

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

Funciones disponibles:

- `deleteUserAccount` - Eliminar usuario completo
- `promoteToSuperAdmin` - Promover a super admin
- `getAllFamiliesStats` - Stats globales
- `sendGlobalNotification` - Notificación a todos
- `exportUserData` - Export GDPR
- `bulkUserOperation` - Operaciones en lote
- `moderateContent` - Moderación

---

## 🎯 Lo Que Puedes Hacer

### Como Super Admin

✅ **Gestión de Usuarios**

- Ver todos los usuarios
- Cambiar roles
- Eliminar usuarios
- Buscar y filtrar

✅ **Gestión de Familias**

- Ver todas las familias
- Ver stats por familia
- Eliminar familias

✅ **Analytics**

- Ver gráficas de crecimiento
- Stats de uso de features
- Distribución de plataforma

✅ **Contenido**

- Crear anuncios globales
- Gestionar blog posts

✅ **Sistema**

- Ver configuración
- Links a Firebase Console
- Monitorear estado

---

## 🆘 Troubleshooting

### "Site Not Found" al abrir admin dashboard

**Solución:** Asegúrate de haber deployado primero:

```bash
DEPLOY_FINAL.bat
```

### No puedo acceder a `/admin/dashboard`

**Causa:** Tu usuario no es super admin  
**Solución:** Ve a Firestore y cambia tu rol a `"superadmin"`

### Me redirige a `/` en vez del dashboard

**Causa:** Tu email no está verificado  
**Solución:** Revisa tu email y click en el link de verificación

### Las Cloud Functions no funcionan

**Causa:** No las has deployado  
**Solución:**

```bash
cd functions
firebase deploy --only functions
```

---

## 📚 Documentación Completa

Para más detalles, consulta:

- `docs/ADMIN_DASHBOARD_IMPLEMENTATION.md` - Implementación completa
- `docs/MOBILE_WEB_SYNC.md` - Sincronización App ↔ Web
- `docs/web/WEB_PLATFORM_FINAL_REPORT.md` - Reporte Web v2.0

---

## 🎉 ¡Eso es Todo!

Ahora tienes:

- ✅ Registro unificado (Web + App)
- ✅ Admin Dashboard completo
- ✅ 7 páginas de administración
- ✅ 7 Cloud Functions
- ✅ Analytics con gráficas
- ✅ Sistema de roles con super admin

**¡Disfruta tu Admin Dashboard!** 🚀
