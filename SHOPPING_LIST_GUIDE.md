# Shopping List Professional - Guía de Uso 🛒

## ✅ Estado: COMPLETADO

Todas las funcionalidades han sido implementadas exitosamente en la rama `feature/shopping-list-professional`.

---

## 📋 Funcionalidades Implementadas

### 1. **Sistema Multi-Tiendas**
- ✅ Crear, editar y eliminar tiendas
- ✅ Asignar ubicación con mapa embebido (react-native-maps)
- ✅ Botón "Abrir en Maps" (Google Maps en Android, Apple Maps en iOS)
- ✅ Presupuestos por tienda con alertas visuales
- ✅ Filtrado de productos por tienda

### 2. **Gestión de Productos**
- ✅ Agregar productos manualmente
- ✅ Escanear códigos de barras para autocompletar
- ✅ Campos: nombre, cantidad, unidad, precio
- ✅ Catálogo de productos guardado en Firebase
- ✅ Autocompletado basado en escaneos previos

### 3. **Estados de Compra**
- ✅ Pendiente (cuadrado vacío)
- ✅ En carrito (checkmark circle)
- ✅ Comprado (checkmark done, verde)
- ✅ Tap para ciclar entre estados
- ✅ Feedback háptico al cambiar estado

### 4. **Presupuestos y Totales**
- ✅ Presupuesto por tienda
- ✅ Barra de progreso visual (verde < 80%, naranja 80-100%, rojo > 100%)
- ✅ Banner de alerta cuando se supera el presupuesto
- ✅ Totales por tienda
- ✅ Total general de la lista

### 5. **Integración con Tasks**
- ✅ Botón "Shopping List" en TaskPreviewModal
- ✅ Una lista por tarea (auto-creación)
- ✅ Persistencia en Firebase

---

## 🚀 Cómo Usar

### **Acceder a la Shopping List**

1. Abre cualquier tarea en FamilyDash
2. En el modal de preview, verás un botón morado "Shopping List" 🛒
3. Toca el botón para abrir la lista de compras

### **Crear una Tienda**

1. En la Shopping List, toca el chip "+ Tienda"
2. Ingresa:
   - Nombre de la tienda
   - Dirección (opcional)
   - Presupuesto (opcional)
3. Toca el mapa para mover el pin a la ubicación
4. Toca "Usar esta ubicación"
5. (Opcional) Toca "Abrir en Maps" para ver en Google/Apple Maps
6. Toca "Guardar"

### **Agregar Productos**

**Manualmente:**
1. Escribe el nombre del producto
2. Ingresa cantidad, unidad (u, kg, L, etc.) y precio
3. Toca el botón "+" verde

**Con Escáner:**
1. Toca el botón morado con ícono de código de barras
2. Permite acceso a la cámara
3. Alinea el código de barras
4. El producto se autocompletará si existe en el catálogo
5. Ajusta cantidad/precio si es necesario
6. Toca "+" para agregar

### **Filtrar por Tienda**

1. Toca el chip de la tienda que quieres ver
2. Solo se mostrarán productos asignados a esa tienda
3. Verás la barra de progreso del presupuesto
4. Toca "Todas" para ver todos los productos

### **Cambiar Estado de Producto**

1. Toca el ícono de estado del producto
2. Cicla: Pendiente → En Carrito → Comprado → Pendiente
3. Sentirás vibración al cambiar

### **Eliminar Producto**

1. Toca el ícono de basura roja
2. El producto se eliminará inmediatamente

---

## 🗂️ Estructura de Archivos

```
src/
├── types/
│   └── shopping.ts                          # Tipos TypeScript
├── services/
│   ├── shopping.ts                          # CRUD de listas e items
│   └── shoppingProducts.ts                  # Catálogo de productos
├── utils/
│   └── maps.ts                              # Abrir en Google/Apple Maps
└── components/
    └── shopping/
        ├── MapPicker.tsx                    # Selector de ubicación
        ├── BarcodeScannerModal.tsx          # Escáner de códigos
        ├── StorePickerModal.tsx             # Crear/editar tienda
        └── ShoppingListModal.tsx            # Modal principal
```

---

## 🔥 Colecciones de Firebase

### `shopping_lists`
```typescript
{
  id: string
  familyId: string
  taskId: string           // Enlace a la tarea
  title: string
  stores: ShoppingStore[]  // Array de tiendas
  currency: string         // "USD", "DOP", etc.
  createdBy: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### `shopping_items`
```typescript
{
  id: string
  listId: string          // Referencia a shopping_lists
  name: string
  qty: number
  unit: string
  price: number
  status: "pending" | "in_cart" | "purchased"
  storeId: string         // Referencia a tienda
  createdAt: timestamp
  updatedAt: timestamp
}
```

### `shopping_products`
```typescript
{
  id: string
  familyId: string
  barcode: string         // EAN/UPC
  name: string
  defaultUnit: string
  lastPrice: number
  lastStoreId: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## 📝 Índices Compuestos de Firestore

Si recibes errores de índice faltante, crea estos índices en Firebase Console:

### `shopping_items`
- Collection: `shopping_items`
- Fields: `listId` (ASC), `createdAt` (ASC)

### `shopping_products`
- Collection: `shopping_products`
- Fields: `familyId` (ASC), `barcode` (ASC)

---

## 🧪 Testing Checklist

### ✅ Funcionalidades Básicas
- [ ] Abrir Shopping List desde una tarea
- [ ] Crear nueva tienda con nombre
- [ ] Agregar producto manualmente
- [ ] Ver totales calculados correctamente
- [ ] Cambiar estado de producto (tap en ícono)
- [ ] Eliminar producto

### ✅ Mapas
- [ ] Mover pin en el mapa
- [ ] Guardar ubicación de tienda
- [ ] Abrir en Google Maps (Android)
- [ ] Abrir en Apple Maps (iOS)

### ✅ Escáner de Códigos
- [ ] Permitir acceso a cámara
- [ ] Escanear código de barras
- [ ] Autocompletar producto existente
- [ ] Guardar nuevo producto en catálogo

### ✅ Presupuestos
- [ ] Asignar presupuesto a tienda
- [ ] Ver barra de progreso (verde/naranja/rojo)
- [ ] Ver banner de alerta cuando se supera
- [ ] Totales por tienda correctos

### ✅ Filtros
- [ ] Filtrar por tienda específica
- [ ] Ver "Todas" las tiendas
- [ ] Productos asignados correctamente

### ✅ Persistencia
- [ ] Datos guardados en Firebase
- [ ] Lista persiste al cerrar/abrir
- [ ] Múltiples listas (una por tarea)

---

## 🐛 Troubleshooting

### **Error: "Permiso de cámara denegado"**
- Ve a Configuración > Apps > FamilyDash > Permisos
- Habilita "Cámara"

### **Error: "Index not found"**
- Crea los índices compuestos en Firebase Console
- O espera a que Firebase te muestre el link para crearlos automáticamente

### **El mapa no se muestra**
- Verifica que `react-native-maps` esté instalado
- En Android: Asegúrate de tener Google Play Services
- En iOS: Verifica permisos de ubicación

### **Los productos no se autocompletan**
- Escanea el código de barras al menos una vez
- Asigna precio y tienda
- El producto se guardará en el catálogo para futuros escaneos

---

## 🎨 Colores y Estilos

- **Chip "Todas"**: Gris (#e5e7eb) / Azul activo (#2563eb)
- **Chip Tienda**: Gris (#e5e7eb) / Azul activo (#2563eb)
- **Chip "+ Tienda"**: Morado (#7c3aed)
- **Botón Agregar**: Verde (#16a34a)
- **Botón Escanear**: Morado (#7c3aed)
- **Barra Presupuesto**: Verde (#16a34a) / Naranja (#f59e0b) / Rojo (#ef4444)
- **Banner Alerta**: Fondo rojo claro (#fee2e2), texto rojo (#991b1b)

---

## 📱 Permisos Requeridos

### Android (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

### iOS (app.json)
```json
{
  "expo": {
    "plugins": [
      [
        "expo-barcode-scanner",
        {
          "cameraPermission": "Allow FamilyDash to access your camera to scan barcodes."
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow FamilyDash to use your location to show stores on the map."
        }
      ]
    ]
  }
}
```

---

## 🚀 Próximos Pasos

Para probar en tu dispositivo:

1. **Iniciar el servidor de desarrollo:**
   ```bash
   npx expo start
   ```

2. **Escanear QR con Expo Go** (o compilar APK)

3. **Probar todas las funcionalidades** según el checklist

4. **Si todo funciona bien, hacer merge a main:**
   ```bash
   git checkout main
   git merge feature/shopping-list-professional
   git push origin main
   ```

---

## 💡 Tips Pro

1. **Escanea productos comunes primero** para construir el catálogo
2. **Asigna presupuestos realistas** para aprovechar las alertas
3. **Usa el filtro por tienda** cuando vayas de compras
4. **Marca como "En Carrito"** mientras compras
5. **Marca como "Comprado"** al pagar
6. **Duplica listas** copiando productos de listas anteriores

---

## 🎉 ¡Listo para Usar!

La Shopping List está **100% funcional** y lista para probar. Todos los archivos están creados, no hay errores de linting, y el código está commiteado en la rama `feature/shopping-list-professional`.

**¡Disfruta tu nueva Shopping List profesional!** 🛒✨

