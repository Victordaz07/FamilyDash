# Voice Module - Stable Audio Recording & Playback

Este módulo proporciona grabación y reproducción de audio estable para FamilyDash, compatible con iOS y Android.

## Componentes

### 1. VoiceComposer

Componente para grabar notas de voz con controles de grabación/pausa.

```tsx
import { VoiceComposer } from "@/modules/voice";

<VoiceComposer
  familyId="family-id"
  context="task" // o "safe"
  parentId="task-id" // o "room-id"
  userId="user-id"
  onSaved={() => console.log("Saved")}
  onCancel={() => console.log("Cancelled")}
/>;
```

### 2. VoiceMessageCard

Componente para reproducir notas de voz con barra de progreso.

```tsx
import { VoiceMessageCard } from "@/modules/voice";

<VoiceMessageCard
  note={voiceNote}
  showActions={true}
  onEdit={() => console.log("Edit")}
  onDelete={() => console.log("Delete")}
/>;
```

### 3. useAudioPlayer Hook

Hook para manejar la reproducción de audio.

```tsx
import { useAudioPlayer } from "@/modules/voice";

const { isLoaded, isPlaying, durationMs, positionMs, play, pause, seek } =
  useAudioPlayer(audioUrl);
```

## Servicios

### voice.service.ts

- `saveVoiceNote()` - Guardar nota de voz en Firebase
- `listenVoiceNotes()` - Escuchar notas de voz en tiempo real
- `deleteVoiceNote()` - Eliminar nota de voz

## Integración en SafeRoom

El módulo ya está integrado en `EmotionalSafeRoom.tsx` con:

- Lista de notas de voz
- Composer para grabar nuevas notas
- Reproductor con controles completos

## Integración en Tasks

Para integrar en tareas, agregar:

```tsx
import {
  VoiceComposer,
  VoiceMessageCard,
  listenVoiceNotes,
} from "@/modules/voice";

// En el componente de tarea
const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);

useEffect(() => {
  const unsubscribe = listenVoiceNotes(familyId, "task", taskId, setVoiceNotes);
  return () => unsubscribe();
}, [familyId, taskId]);

// En el render
{
  voiceNotes.map((note) => <VoiceMessageCard key={note.id} note={note} />);
}
```

## Características

✅ Grabación estable con Expo AV
✅ Formato AAC (.m4a) compatible
✅ Barra de progreso en tiempo real
✅ Controles de play/pause/seek
✅ Subida automática a Firebase Storage
✅ Sincronización en tiempo real con Firestore
✅ Manejo de errores robusto
✅ Compatible con iOS y Android
✅ Limpieza automática de recursos

## Dependencias

- expo-av
- expo-file-system
- @expo/vector-icons
- firebase/firestore
- firebase/storage
