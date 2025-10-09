# 🚀 Shared Quick Actions - Guía de Implementación

## 📋 Resumen

Se ha implementado un sistema unificado de Quick Actions que funciona tanto para Tasks como para SafeRoom, manteniendo **separación completa de contextos**. Las entradas de Task van a Task y las de SafeRoom van a SafeRoom, sin confundirse.

## 🎯 Características Principales

### ✅ **Separación de Contextos**

- **Tasks**: Las notas de audio se guardan con `taskId` y `context: "task"`
- **SafeRoom**: Las notas de audio se guardan con `safeRoomId` y `context: "safe"`
- **Tipos fuertes**: TypeScript previene mezclar contextos accidentalmente

### ✅ **Componente Unificado**

- **Misma UI/UX** para ambos contextos
- **Botones específicos** según el modo (task/safe)
- **Modal compartido** para grabación de audio

### ✅ **Backend Robusto**

- **Validación de contexto** en upload
- **Queries separadas** por contexto
- **Storage paths diferentes** para cada contexto

## 🔧 Componentes Implementados

### **1. SharedQuickActions.tsx**

```typescript
// Uso en Tasks
<SharedQuickActions
  mode="task"
  familyId={familyId}
  userId={userId}
  taskId={currentTaskId}
  onAddNewTask={() => navigation.navigate("TaskCreate")}
  onAddPhotoTask={() => navigation.navigate("TaskCreatePhoto")}
  onAddVideoTask={() => navigation.navigate("TaskCreateVideo")}
/>

// Uso en SafeRoom
<SharedQuickActions
  mode="safe"
  familyId={familyId}
  userId={userId}
  safeRoomId={safeRoomId}
  onAddTextSafe={() => navigation.navigate("SafeRoomTextCreate")}
/>
```

### **2. AudioNoteModal.tsx**

- Modal completo para grabación de audio
- Controles play/pause/stop
- Indicador de duración
- Guardado con contexto automático

### **3. AudioNotePlayer.tsx**

- Reproductor compacto para mostrar notas
- Modo compacto y completo
- Barra de progreso en tiempo real

## 📊 Estructura de Datos

### **Tipos con Discriminated Union**

```typescript
type TaskCtx = {
  context: "task";
  taskId: string;
  safeRoomId?: never; // Prohibido
};

type SafeCtx = {
  context: "safe";
  safeRoomId: string;
  taskId?: never; // Prohibido
};
```

### **Documento de Audio**

```typescript
type AudioNoteDoc = {
  context: "task" | "safe";
  familyId: string;
  taskId: string | null;
  safeRoomId: string | null;
  userId: string;
  url: string;
  kind: "audio";
  createdAt: Timestamp;
};
```

## 🗂️ Storage Structure

### **Firebase Storage Paths**

```
audio/
  {familyId}/
    tasks/
      {taskId}/
        voice_1234567890_abc123.m4a
    safe/
      {safeRoomId}/
        voice_1234567890_def456.m4a
```

### **Firestore Collections**

```
audio_notes/
  - doc1: { context: "task", taskId: "task_123", safeRoomId: null, ... }
  - doc2: { context: "safe", taskId: null, safeRoomId: "safe_456", ... }
```

## 🔍 Queries Separadas

### **Para Tasks**

```typescript
import { getTaskAudioNotes } from "@/services/queries";

const taskAudioNotes = await getTaskAudioNotes(familyId, taskId);
```

### **Para SafeRoom**

```typescript
import { getSafeAudioNotes } from "@/services/queries";

const safeAudioNotes = await getSafeAudioNotes(familyId, safeRoomId);
```

## 🎨 Botones por Contexto

### **Task Mode**

- ✅ **Add New Task** (Verde)
- ✅ **Add Photo Task** (Azul)
- ✅ **Video Instructions** (Púrpura)
- ✅ **Audio Note** (Naranja)

### **Safe Mode**

- ✅ **Text** (Cian)
- ✅ **Voice** (Púrpura)

## 🚀 Integración en Pantallas

### **Tasks Screen**

```typescript
import { SharedQuickActions } from "@/components/quick";

export default function TasksScreen({ navigation, route }) {
  const { familyId, userId } = route.params;
  const currentTaskId = route.params.taskId; // Si estás en detalle de task

  return (
    <ScrollView>
      {/* Lista de tasks */}

      <SharedQuickActions
        mode="task"
        familyId={familyId}
        userId={userId}
        taskId={currentTaskId}
        onAddNewTask={() => navigation.navigate("TaskCreate", { familyId })}
        onAddPhotoTask={() =>
          navigation.navigate("TaskCreatePhoto", { familyId })
        }
        onAddVideoTask={() =>
          navigation.navigate("TaskCreateVideo", { familyId })
        }
      />
    </ScrollView>
  );
}
```

### **SafeRoom Screen**

```typescript
import { SharedQuickActions } from "@/components/quick";

export default function SafeRoomScreen({ navigation, route }) {
  const { familyId, safeRoomId, userId } = route.params;

  return (
    <ScrollView>
      {/* Contenido de SafeRoom */}

      <SharedQuickActions
        mode="safe"
        familyId={familyId}
        userId={userId}
        safeRoomId={safeRoomId}
        onAddTextSafe={() =>
          navigation.navigate("SafeRoomTextCreate", {
            familyId,
            safeRoomId,
          })
        }
      />
    </ScrollView>
  );
}
```

## 📱 Mostrar Notas de Audio

### **En Task Detail**

```typescript
import { AudioNotePlayer } from "@/components/audio";
import { getTaskAudioNotes } from "@/services/queries";

const [audioNotes, setAudioNotes] = useState([]);

useEffect(() => {
  const loadAudioNotes = async () => {
    const notes = await getTaskAudioNotes(familyId, taskId);
    setAudioNotes(notes);
  };
  loadAudioNotes();
}, [familyId, taskId]);

return (
  <View>
    {audioNotes.map((note) => (
      <AudioNotePlayer
        key={note.id}
        uri={note.url}
        label="Voice note"
        compact={true}
      />
    ))}
  </View>
);
```

### **En SafeRoom Feed**

```typescript
import { AudioNotePlayer } from "@/components/audio";
import { getSafeAudioNotes } from "@/services/queries";

const [audioNotes, setAudioNotes] = useState([]);

useEffect(() => {
  const loadAudioNotes = async () => {
    const notes = await getSafeAudioNotes(familyId, safeRoomId);
    setAudioNotes(notes);
  };
  loadAudioNotes();
}, [familyId, safeRoomId]);

return (
  <View>
    {audioNotes.map((note) => (
      <AudioNotePlayer
        key={note.id}
        uri={note.url}
        label="Voice message"
        compact={false}
      />
    ))}
  </View>
);
```

## 🔒 Reglas de Seguridad (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isFamilyMember(familyId) {
      return request.auth != null
        && exists(/databases/$(database)/documents/families/$(familyId)/members/$(request.auth.uid));
    }

    match /audio_notes/{docId} {
      allow read: if isFamilyMember(resource.data.familyId);

      allow create: if request.auth != null
        && isFamilyMember(request.resource.data.familyId)
        // Task context: requiere taskId y context == "task"
        && (
          (request.resource.data.context == "task"
            && request.resource.data.taskId is string
            && !(request.resource.data.safeRoomId exists))
          ||
          // Safe context: requiere safeRoomId y context == "safe"
          (request.resource.data.context == "safe"
            && request.resource.data.safeRoomId is string
            && !(request.resource.data.taskId exists))
        );
    }
  }
}
```

## 🎉 Beneficios de la Implementación

### **Consistencia**

- ✅ **Misma UI/UX** para Tasks y SafeRoom
- ✅ **Componentes reutilizables** y mantenibles
- ✅ **Experiencia unificada** para el usuario

### **Separación Garantizada**

- ✅ **Tipos fuertes** previenen mezclar contextos
- ✅ **Validación en runtime** en upload
- ✅ **Queries separadas** por contexto
- ✅ **Storage paths diferentes**

### **Escalabilidad**

- ✅ **Fácil agregar** nuevos tipos de entrada
- ✅ **Extensible** para otros contextos
- ✅ **Backend robusto** con validaciones

### **Seguridad**

- ✅ **Reglas de Firestore** que validan contexto
- ✅ **Validación de permisos** por familia
- ✅ **Separación de datos** garantizada

## 🚀 Resultado Final

Con esta implementación tienes:

1. **Un solo componente Quick Actions** que funciona para ambos contextos
2. **Separación completa** de datos (Tasks vs SafeRoom)
3. **Tipos fuertes** que previenen errores
4. **Backend robusto** con validaciones
5. **UX consistente** en toda la aplicación

¡Las entradas de Task van a Task y las de SafeRoom van a SafeRoom, sin confundirse! 🎯✨
