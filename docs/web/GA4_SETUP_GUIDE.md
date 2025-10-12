# 📊 Google Analytics 4 - Guía de Configuración para FamilyDash

## 🎯 Objetivo

Implementar Google Analytics 4 en la plataforma web de FamilyDash para medir el rendimiento, conversiones y comportamiento de usuarios.

---

## 📋 Paso 1: Crear Cuenta y Propiedad de GA4

### 1.1 Acceder a Google Analytics

1. Ve a [Google Analytics](https://analytics.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Si es tu primera vez, haz clic en **"Empezar a medir"**

### 1.2 Crear Cuenta

1. Nombre de la cuenta: `FamilyDash`
2. Configura opciones de compartir datos (recomendado: todas marcadas)
3. Haz clic en **"Siguiente"**

### 1.3 Crear Propiedad

1. Nombre de la propiedad: `FamilyDash Web`
2. Zona horaria: Selecciona tu zona horaria
3. Moneda: Selecciona tu moneda
4. Haz clic en **"Siguiente"**

### 1.4 Información del Negocio

1. Categoría: `Technology/Internet`
2. Tamaño del negocio: Selecciona apropiadamente
3. Uso previsto: Marca `Examine user behavior` y `Measure ad effectiveness`
4. Haz clic en **"Crear"**

### 1.5 Acepta los Términos de Servicio

---

## 📋 Paso 2: Configurar Stream de Datos Web

### 2.1 Agregar Stream Web

1. En "Configuración de recopilación de datos", selecciona **"Web"**
2. URL del sitio web: `https://family-dash-15944.web.app`
3. Nombre del stream: `FamilyDash Web Platform`
4. Habilita **"Enhanced measurement"** (medición mejorada)
5. Haz clic en **"Crear stream"**

### 2.2 Obtener ID de Medición

Después de crear el stream, verás tu **ID de medición** en formato:

```
G-XXXXXXXXXX
```

**⚠️ IMPORTANTE:** Guarda este ID, lo necesitarás para el paso 3.

---

## 📋 Paso 3: Implementar GA4 en el Sitio Web

### 3.1 Ubicar el Archivo de Analytics

Abre el archivo: `web/public/js/analytics.js`

### 3.2 Reemplazar el ID de Medición

En la línea que dice:

```javascript
const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // ⚠️ REEMPLAZAR
```

Reemplaza `G-XXXXXXXXXX` con tu ID real.

### 3.3 Verificar Implementación

1. Guarda el archivo
2. Haz deploy: `firebase deploy --only hosting`
3. Abre tu sitio web
4. En Google Analytics, ve a **"Informes" → "Tiempo real"**
5. Deberías ver tu visita en tiempo real

---

## 📋 Paso 4: Configurar Eventos Personalizados

Los siguientes eventos ya están configurados en `analytics.js`:

### Eventos de Email Verification

- **Event Name:** `verification_landing_view`
- **Parameters:**
  - `page_path`: Ruta de la página
  - `utm_source`, `utm_medium`, `utm_campaign`: Parámetros UTM

### Eventos de CTA

- **Event Name:** `cta_click_open_app`
- **Parameters:**
  - `button_text`: Texto del botón
  - `page_location`: URL actual

### Eventos de Registro

- **Event Name:** `signup_start`
- **Parameters:**
  - `method`: 'email' / 'google' / 'apple'
- **Event Name:** `signup_complete`
- **Parameters:**
  - `method`: 'email' / 'google' / 'apple'
  - `email_verified`: true / false

### Eventos de Descarga de App

- **Event Name:** `app_download_intent`
- **Parameters:**
  - `platform`: 'ios' / 'android'
  - `page_location`: URL actual

---

## 📋 Paso 5: Crear Conversiones Personalizadas

### 5.1 Marcar Eventos como Conversiones

1. En GA4, ve a **"Configurar" → "Eventos"**
2. Espera a que aparezcan los eventos (puede tardar 24-48 horas)
3. Para cada evento importante, marca **"Marcar como conversión"**:
   - `signup_complete` ✅
   - `app_download_intent` ✅
   - `cta_click_open_app` ✅

---

## 📋 Paso 6: Configurar Audiencias

### 6.1 Crear Audiencia de Usuarios Interesados

1. Ve a **"Configurar" → "Audiencias"**
2. Haz clic en **"Nueva audiencia"**
3. Nombre: `Usuarios Interesados`
4. Condiciones:
   - Usuario visitó `/features` O
   - Usuario visitó `/parents` O
   - Usuario hizo clic en CTA

### 6.2 Crear Audiencia de Usuarios Registrados

1. Nombre: `Usuarios Registrados`
2. Condiciones:
   - Evento `signup_complete` ocurrió al menos 1 vez

---

## 📋 Paso 7: Configurar Informes Personalizados

### 7.1 Informe de Embudo de Conversión

1. Ve a **"Explorar" → "Análisis de embudo"**
2. Crea embudo:
   - Paso 1: Visita a Landing (`page_view`)
   - Paso 2: Vista de Features (`page_view` + `page_path` contiene `/features`)
   - Paso 3: Inicio de Registro (`signup_start`)
   - Paso 4: Registro Completo (`signup_complete`)

### 7.2 Informe de Rutas de Usuario

1. Ve a **"Explorar" → "Exploración de rutas"**
2. Configura punto de inicio: `page_view` en `/`
3. Revisa las rutas más comunes de usuarios

---

## 📋 Paso 8: Integrar con Google Search Console

### 8.1 Vincular Search Console

1. En GA4, ve a **"Configurar" → "Enlaces de productos"**
2. Selecciona **"Search Console"**
3. Haz clic en **"Vincular"**
4. Selecciona tu propiedad de Search Console
5. Confirma vinculación

---

## 📋 Paso 9: Configurar Alertas

### 9.1 Crear Alertas Personalizadas

1. Ve a **"Configurar" → "Alertas personalizadas"**
2. Crea alertas para:
   - Caída del 50% en `signup_complete` (día a día)
   - Aumento del 100% en errores de página
   - Caída del 30% en sesiones totales

---

## 📋 Paso 10: Verificación Final

### ✅ Checklist de Verificación

- [ ] GA4 property creada correctamente
- [ ] ID de medición implementado en `analytics.js`
- [ ] Eventos personalizados aparecen en "Tiempo real"
- [ ] Conversiones configuradas
- [ ] Audiencias creadas
- [ ] Informes personalizados configurados
- [ ] Search Console vinculado
- [ ] Alertas configuradas

---

## 🔧 Solución de Problemas

### Problema: No veo datos en Tiempo Real

**Soluciones:**

1. Verifica que el ID de medición sea correcto
2. Asegúrate de que `analytics.js` esté cargando
3. Revisa la consola del navegador para errores
4. Desactiva bloqueadores de anuncios
5. Espera 5-10 minutos para propagación

### Problema: Eventos personalizados no aparecen

**Soluciones:**

1. Verifica que los eventos se estén enviando (consola del navegador)
2. Espera 24-48 horas para que aparezcan en la interfaz
3. Revisa que el nombre del evento sea exacto (case-sensitive)

### Problema: Datos incorrectos o duplicados

**Soluciones:**

1. Asegúrate de tener solo un tag de GA4 por página
2. Verifica que no haya múltiples inicializaciones
3. Revisa que los eventos no se disparen múltiples veces

---

## 📊 KPIs Recomendados para FamilyDash

### Métricas de Adquisición

- **Usuarios nuevos**: Objetivo: +20% mensual
- **Fuentes de tráfico**: Directo, Orgánico, Social, Referral
- **Landing pages más efectivas**: Tasa de conversión > 5%

### Métricas de Engagement

- **Tiempo promedio en página**: Objetivo: > 2 minutos
- **Páginas por sesión**: Objetivo: > 3 páginas
- **Tasa de rebote**: Objetivo: < 60%

### Métricas de Conversión

- **Tasa de registro**: Objetivo: > 3% de visitantes
- **Embudo de conversión**: Identifica dónde abandonan usuarios
- **Verificación de email**: % de usuarios que verifican

### Métricas de Retención

- **Usuarios recurrentes**: % de usuarios que regresan
- **Frecuencia de visita**: Cuántas veces visitan por mes
- **Usuarios activos**: DAU, WAU, MAU

---

## 📚 Recursos Adicionales

- [Documentación oficial de GA4](https://support.google.com/analytics/answer/9304153)
- [GA4 para desarrolladores](https://developers.google.com/analytics/devguides/collection/ga4)
- [Mejores prácticas de GA4](https://support.google.com/analytics/topic/9303474)

---

## ✅ Próximos Pasos

Una vez configurado GA4:

1. **Monitorear durante 7 días** para recopilar datos iniciales
2. **Crear dashboard personalizado** con métricas clave
3. **Configurar reportes automáticos** por email (semanal/mensual)
4. **A/B testing** basado en datos recopilados
5. **Optimización continua** de páginas con bajo rendimiento

---

**🎉 ¡Felicidades! Ahora tienes GA4 completamente configurado para FamilyDash.**
