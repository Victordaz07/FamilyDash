# 🗑️ Instrucciones para Eliminar Usuarios de Prueba

## 📋 Usuarios a Eliminar

- `viruizbc@gmail.com`
- `daz.graphic1306@gmail.com`

## 🔧 Pasos para Ejecutar el Script

### 1. Obtener Credenciales de Servicio

1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto: **familydash-15944**
3. Ve a **Project Settings** (icono de engranaje) → **Service Accounts**
4. Haz clic en **"Generate new private key"**
5. Descarga el archivo JSON
6. Renómbralo a: `firebase-service-account.json`
7. Colócalo en la raíz de tu proyecto (mismo nivel que package.json)

### 2. Verificar que el Archivo Esté en el Lugar Correcto

```
FamilyDash/
├── firebase-service-account.json  ← Aquí debe estar
├── delete-test-users.js
├── package.json
└── src/
```

### 3. Ejecutar el Script

```bash
node delete-test-users.js
```

## 📊 Qué Hace el Script

1. **Busca cada usuario** por email
2. **Elimina documentos relacionados** en Firestore:
   - Documento en colección `users`
   - Documento en colección `userGoals`
3. **Elimina el usuario** de Firebase Authentication
4. **Muestra un resumen** del proceso

## ✅ Resultado Esperado

```
🚀 Iniciando eliminación de usuarios de prueba...

🔍 Buscando usuario con email: viruizbc@gmail.com
✅ Usuario encontrado: abc123...
🗑️ Eliminando documentos de Firestore para abc123...
✅ Documento de usuario eliminado de Firestore
✅ Documentos de metas eliminados
✅ Usuario viruizbc@gmail.com eliminado exitosamente

🔍 Buscando usuario con email: daz.graphic1306@gmail.com
✅ Usuario encontrado: def456...
🗑️ Eliminando documentos de Firestore para def456...
✅ Documento de usuario eliminado de Firestore
✅ Documentos de metas eliminados
✅ Usuario daz.graphic1306@gmail.com eliminado exitosamente

📊 Resumen:
   ✅ Usuarios eliminados: 2/2
   📧 Emails procesados: viruizbc@gmail.com, daz.graphic1306@gmail.com

🎉 ¡Todos los usuarios de prueba han sido eliminados exitosamente!
```

## ⚠️ Si Hay Errores

### Error: "Cannot find module 'firebase-service-account.json'"

- **Solución**: Asegúrate de que el archivo esté en la raíz del proyecto

### Error: "Permission denied"

- **Solución**: Verifica que las credenciales de servicio tengan permisos de administrador

### Error: "User not found"

- **Solución**: El usuario ya fue eliminado o no existe

## 🧹 Limpieza Adicional (Opcional)

Si también quieres limpiar otros datos relacionados, ejecuta:

```bash
node clear-firestore-data.js
```

## 🎯 Después de la Eliminación

1. **Prueba el registro** con emails nuevos
2. **Verifica que no aparezcan** los usuarios eliminados en la consola
3. **Limpia el caché** de tu aplicación si es necesario

## 📞 Si Necesitas Ayuda

Si encuentras algún problema, comparte el mensaje de error completo y te ayudo a solucionarlo.
