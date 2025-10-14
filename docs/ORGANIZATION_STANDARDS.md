# 📁 Estándares de Organización de Archivos - FamilyDash

## 🎯 **Reglas de Organización**

### 📄 **Documentación (.md)**

- **Ubicación:** `docs/` (carpeta raíz del proyecto)
- **Regla:** TODOS los archivos .md deben ir en la carpeta `docs/`
- **Excepción:** Solo `README.md` puede permanecer en la raíz
- **Subcarpetas en docs:**
  - `docs/bugs/` - Documentación de bugs y soluciones
  - `docs/features/` - Documentación de características
  - `docs/setup/` - Guías de configuración
  - `docs/maintenance/` - Documentación de mantenimiento
  - `docs/reports/` - Reportes y análisis
  - `docs/sessions/` - Documentación de sesiones
  - `docs/security/` - Documentación de seguridad
  - `docs/build/` - Documentación de builds
  - `docs/media/` - Documentación de medios
  - `docs/mobile/` - Documentación específica de móvil

### 🔧 **Scripts (.bat, .sh, .js)**

- **Ubicación:** `scripts/` (carpeta raíz del proyecto)
- **Regla:** TODOS los archivos de script deben ir en la carpeta `scripts/`
- **Tipos incluidos:**
  - `.bat` - Scripts de Windows
  - `.sh` - Scripts de Linux/Mac
  - `.js` - Scripts de Node.js (utilitarios, tests, etc.)

### 🏗️ **Archivos de Configuración**

- **Ubicación:** Raíz del proyecto
- **Archivos permitidos en raíz:**
  - `package.json` - Configuración de Node.js
  - `firebase.json` - Configuración de Firebase
  - `firestore.rules` - Reglas de Firestore
  - `firestore.indexes.json` - Índices de Firestore
  - `app.json` - Configuración de Expo
  - `eas.json` - Configuración de EAS Build
  - `tsconfig.json` - Configuración de TypeScript
  - `metro.config.js` - Configuración de Metro
  - `jest.config.js` - Configuración de Jest
  - `env.example` - Ejemplo de variables de entorno
  - `README.md` - Documentación principal

## 📋 **Checklist de Organización**

### ✅ **Al crear un archivo .md:**

- [ ] ¿Está en la carpeta `docs/`?
- [ ] ¿Está en la subcarpeta correcta según su propósito?
- [ ] ¿Sigue las convenciones de nomenclatura?

### ✅ **Al crear un script:**

- [ ] ¿Está en la carpeta `scripts/`?
- [ ] ¿Tiene un nombre descriptivo?
- [ ] ¿Está documentado si es complejo?

### ✅ **Al crear un archivo de configuración:**

- [ ] ¿Es necesario en la raíz?
- [ ] ¿Sigue las convenciones del proyecto?
- [ ] ¿Está documentado si es específico?

## 🚫 **Archivos NO Permitidos en la Raíz**

- ❌ Archivos .md (excepto README.md)
- ❌ Scripts .bat, .sh, .js
- ❌ Archivos temporales
- ❌ Archivos de configuración específicos de IDE
- ❌ Archivos de backup sin organización

## 📝 **Convenciones de Nomenclatura**

### Documentación (.md):

- `FEATURE_NAME_IMPLEMENTATION.md`
- `BUG_DESCRIPTION_SOLUTION.md`
- `SETUP_GUIDE_NAME.md`

### Scripts:

- `action-description.bat`
- `action-description.sh`
- `utility-name.js`

## 🔄 **Mantenimiento**

- Revisar mensualmente la organización
- Mover archivos que no cumplan los estándares
- Actualizar este documento cuando sea necesario
- Mantener la raíz limpia y organizada

---

**Última actualización:** 13 de octubre de 2025  
**Responsable:** AI Assistant  
**Estado:** ✅ Implementado
