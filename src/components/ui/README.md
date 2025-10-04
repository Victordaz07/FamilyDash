# Advanced UI Components Library

Una librería completa de componentes UI modernos para FamilyDash, con sistema de temas consistente y diseño responsive.

## 🎨 Sistema de Temas

### Configuración Básica

```tsx
import { ThemeProvider, useTheme } from '@/components/ui';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}

function Component() {
  const theme = useTheme();
  
  return (
    <View style={{ 
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.md 
    }}>
      <Text style={theme.typography.textStyles.h1}>
        Título principal
      </Text>
    </View>
  );
}
```

### Estructura del Tema

- **Colors**: Sistema completo de colores con variaciones
- **Typography**: Tipografías predefinidas con pesos y tamaños
- **Spacing**: Spacing consistente (xs, sm, md, lg, xl)
- **Shadows**: Sombras predefinidas con elevación
- **Borders**: Radios de borde consistentes
- **Layout**: Configuraciones de layout y padding

## 🎯 Componentes Disponibles

### 1. AdvancedButton

Botón moderno con múltiples variantes y tamaños.

```tsx
import { AdvancedButton } from '@/components/ui';

// Variantes disponibles
<AdvancedButton variant="primary" size="md">
  Primary Button
</AdvancedButton>

<AdvancedButton variant="outline" size="lg">
  Outline Button
</AdvancedButton>

<AdvancedButton 
  variant="secondary" 
  size="md"
  icon="add-circle"
  gradient={true}
  loading={isLoading}
>
  Button with Icon
</AdvancedButton>

// Props principales:
// variant: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'outline' | 'ghost' | 'link'
// size: 'sm' | 'md' | 'lg'
// icon: Ionicons icon name
// iconPosition: 'left' | 'right'
// gradient: boolean
// loading: boolean
// disabled: boolean
// fullWidth: boolean
```

### 2. AdvancedCard

Tarjeta moderna con múltiples variantes.

```tsx
import { AdvancedCard, CardHeader, CardBody, CardFooter } from '@/components/ui';

// Variantes disponibles
<AdvancedCard variant="elevated" size="md">
  <CardHeader>
    <Text>Título de la tarjeta</Text>
  </CardHeader>
  <CardBody>
    <Text>Contenido de la tarjeta</Text>
  </CardBody>
  <CardFooter>
    <AdvancedButton variant="primary">Acción</AdvancedButton>
  </CardFooter>
</AdvancedCard>

// Card con gradiente
<AdvancedCard 
  variant="gradient"
  gradientColors={['#8B5CF6', '#3B82F6']}
  gradientDirection="diagonal"
>
  Contenido con gradiente
</AdvancedCard>

// Props principales:
// variant: 'default' | 'elevated' | 'outlined' | 'gradient' | 'glass'
// size: 'sm' | 'md' | 'lg'
// gradientColors: string[]
// gradientDirection: 'vertical' | 'horizontal' | 'diagonal'
// pressable: boolean
```

### 3. AdvancedInput

Campo de entrada moderno con múltiples variantes.

```tsx
import { AdvancedInput } from '@/components/ui';

// Variantes disponibles
<AdvancedInput
  variant="outlined"
  size="md"
  label="Email"
  placeholder="Ingresa tu email"
  keyboardType="email-address"
/>

// Input con íconos
<AdvancedInput
  variant="filled"
  icon="lock-closed"
  iconPosition="left"
  rightIcon="eye"
  onRightIconPress={() => togglePassword()}
  label="Contraseña"
  secureTextEntry={true}
/>

// Input con error
<AdvancedInput
  variant="default"
  label="Nombre"
  error="Este campo es requerido"
  helperText="Mínimo 3 caracteres"
/>

// Props principales:
// variant: 'default' | 'outlined' | 'filled' | 'ghost'
// size: 'sm' | 'md' | 'lg'
// icon: Ionicons icon name
// iconPosition: 'left' | 'right'
// rightIcon: Ionicons icon name
// label: string
// error: string
// helperText: string
// disabled: boolean
// multiline: boolean
```

## 🎨 Utilidades de Tema

### Acceso Rápido a Colores

```tsx
import { themeUtils } from '@/components/ui';

// Gradientes predefinidos
const primaryGradient = themeUtils.gradients.primary;
const successGradient = themeUtils.gradients.success;

// Componentes con tamaños específicos
const buttonSizes = themeUtils.componentSizes.button;
const inputSizes = themeUtils.componentSizes.input;
const cardSizes = themeUtils.componentSizes.card;

// Acceso directo a valores de tema
const spacing = themeUtils.spacing;
const borderRadius = themeUtils.borderRadius;
const shadows = themeUtils.shadows;
```

## 📱 Responsiveness y Adaptabilidad

Los componentes se adaptan automáticamente a diferentes tamaños de pantalla usando:

- **Sizes**: sm, md, lg para diferentes niveles de detalle
- **Spacing**: Sistema de espaciado adaptativo
- **Typography**: Escalas de texto responsivas
- **Shadows**: Elevaciones apropiadas para la plataforma

## 🔧 Personalización Avanzada

### Crear Tema Personalizado

```tsx
import { AdvancedTheme } from '@/components/ui';

const customTheme: AdvancedTheme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: '#FF6B6B', // Tu color primario personalizado
    secondary: '#4ECDC4', // Tu color secundario personalizado
  },
};

function App() {
  return (
    <ThemeProvider theme={customTheme}>
      <YourApp />
    </ThemeProvider>
  );
}
```

### Componentes Personalizados

```tsx
import { useTheme } from '@/components/ui';

function CustomCard(props) {
  const theme = useTheme();
  
  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.borders.radius.xl,
      ...theme.shadows.lg,
    }}>
      {props.children}
    </View>
  );
}
```

## 📦 Estructura de Archivos

```
src/components/ui/
├── AdvancedTheme.ts     # Definiciones de tema
├── ThemeProvider.tsx    # Provider y hooks de tema
├── AdvancedButton.tsx   # Componente botón
├── AdvancedCard.tsx     # Componente tarjeta
├── AdvancedInput.tsx    # Componente input
├── index.ts            # Exportaciones principales
└── README.md           # Esta documentación
```

## 🚀 Próximos Componentes

- **AdvancedModal**: Sistema de modales modernos
- **AdvancedList**: Listas y elementos de lista
- **AdvancedToggle**: Switches y toggles avanzados
- **AdvancedBadge**: Badges y etiquetas
- **AdvancedNavigation**: Navegación personalizada
- **AdvancedLoader**: Indicadores de carga animados

## 💡 Mejores Prácticas

1. **Consistencia**: Siempre usa los componentes de la librería para mantener consistencia
2. **Tema**: Usa el sistema de temas para colores, spacing y tipografía
3. **Responsive**: Elige los tamaños apropiados (sm, md, lg) según el contexto
4. **Accesibilidad**: Los componentes incluyen soporte básico de accesibilidad
5. **Performance**: Los componentes están optimizados para React Native

---

**Versión**: 1.0.0  
**Compatibilidad**: React Native 0.81+, Expo SDK 54  
**Última actualización**: Diciembre 2024
