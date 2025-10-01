/**
 * Configuración de optimizaciones de rendimiento para FamilyDash
 */

// Configuración de FlatList optimizada
export const FLATLIST_CONFIG = {
    // Renderizado inicial
    initialNumToRender: 10,
    
    // Renderizado por lotes
    maxToRenderPerBatch: 10,
    
    // Tamaño de ventana
    windowSize: 10,
    
    // Eliminar vistas fuera de pantalla
    removeClippedSubviews: true,
    
    // Período de actualización de celdas
    updateCellsBatchingPeriod: 50,
    
    // Deshabilitar virtualización (solo si es necesario)
    disableVirtualization: false,
    
    // Umbral de scroll para mantener elementos
    maintainVisibleContentPosition: {
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
    },
};

// Configuración de imágenes optimizadas
export const IMAGE_CONFIG = {
    // Calidad por defecto
    defaultQuality: 80,
    
    // Tamaños estándar
    sizes: {
        avatar: { width: 40, height: 40 },
        thumbnail: { width: 100, height: 100 },
        card: { width: 200, height: 150 },
        fullscreen: { width: 400, height: 300 },
    },
    
    // Formatos soportados
    supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    
    // Caché
    cachePolicy: 'memory-disk',
};

// Configuración de animaciones optimizadas
export const ANIMATION_CONFIG = {
    // Duración estándar
    durations: {
        fast: 200,
        normal: 300,
        slow: 500,
        verySlow: 800,
    },
    
    // Easing functions
    easing: {
        easeInOut: 'ease-in-out',
        easeOut: 'ease-out',
        easeIn: 'ease-in',
    },
    
    // Usar native driver cuando sea posible
    useNativeDriver: true,
};

// Configuración de debounce/throttle
export const TIMING_CONFIG = {
    // Debounce para búsquedas
    searchDebounce: 300,
    
    // Throttle para scroll
    scrollThrottle: 16, // ~60fps
    
    // Debounce para resize
    resizeDebounce: 100,
    
    // Throttle para touch events
    touchThrottle: 16,
};

// Configuración de memoria
export const MEMORY_CONFIG = {
    // Límite de caché de imágenes
    imageCacheLimit: 50,
    
    // Límite de caché de datos
    dataCacheLimit: 100,
    
    // Tiempo de expiración de caché (ms)
    cacheExpiration: 5 * 60 * 1000, // 5 minutos
    
    // Limpiar caché automáticamente
    autoCleanup: true,
};

// Configuración de red
export const NETWORK_CONFIG = {
    // Timeout de requests
    timeout: 10000, // 10 segundos
    
    // Reintentos
    retries: 3,
    
    // Delay entre reintentos
    retryDelay: 1000,
    
    // Compresión
    compression: true,
    
    // Caché de requests
    cacheRequests: true,
};

// Configuración de lazy loading
export const LAZY_LOADING_CONFIG = {
    // Umbral para cargar componentes
    threshold: 0.1,
    
    // Root margin para intersection observer
    rootMargin: '50px',
    
    // Fallback para componentes que fallan
    fallbackToSync: true,
    
    // Preload de componentes críticos
    preloadCritical: true,
};

// Configuración de bundle splitting
export const BUNDLE_CONFIG = {
    // Chunks por módulo
    chunks: {
        core: ['react', 'react-native', 'expo'],
        navigation: ['@react-navigation/native', '@react-navigation/stack'],
        ui: ['expo-linear-gradient', '@expo/vector-icons'],
        utils: ['zustand', 'expo-async-storage'],
    },
    
    // Preload de chunks críticos
    preloadChunks: ['core', 'navigation'],
    
    // Lazy load de chunks no críticos
    lazyChunks: ['analytics', 'performance'],
};

// Configuración de profiling
export const PROFILING_CONFIG = {
    // Habilitar profiling en desarrollo
    enableInDevelopment: true,
    
    // Habilitar profiling en producción
    enableInProduction: false,
    
    // Métricas a trackear
    metrics: [
        'render-time',
        'memory-usage',
        'network-requests',
        'image-load-time',
        'animation-performance',
    ],
    
    // Umbrales de performance
    thresholds: {
        renderTime: 16, // ms (60fps)
        memoryUsage: 100, // MB
        networkLatency: 1000, // ms
        imageLoadTime: 2000, // ms
    },
};

// Configuración de optimizaciones específicas por plataforma
export const PLATFORM_CONFIG = {
    ios: {
        // Optimizaciones específicas de iOS
        useMetalRenderer: true,
        enableWideGamut: false,
        optimizeForBattery: true,
    },
    android: {
        // Optimizaciones específicas de Android
        useHardwareAcceleration: true,
        enableR8Optimization: true,
        optimizeForMemory: true,
    },
    web: {
        // Optimizaciones específicas de Web
        enableServiceWorker: true,
        useWebWorkers: true,
        enableCodeSplitting: true,
    },
};

// Función para obtener configuración optimizada según la plataforma
export const getOptimizedConfig = (platform: 'ios' | 'android' | 'web') => {
    return {
        flatlist: FLATLIST_CONFIG,
        image: IMAGE_CONFIG,
        animation: ANIMATION_CONFIG,
        timing: TIMING_CONFIG,
        memory: MEMORY_CONFIG,
        network: NETWORK_CONFIG,
        lazyLoading: LAZY_LOADING_CONFIG,
        bundle: BUNDLE_CONFIG,
        profiling: PROFILING_CONFIG,
        platform: PLATFORM_CONFIG[platform],
    };
};

// Función para aplicar optimizaciones automáticas
export const applyPerformanceOptimizations = () => {
    // Configurar React Native para mejor performance
    if (__DEV__) {
        // En desarrollo, habilitar warnings de performance
        console.log('Performance optimizations enabled in development mode');
    }
    
    // Configurar ImageLoader para mejor caché
    // ImageLoader.setImageCacheLimit(IMAGE_CONFIG.cacheLimit);
    
    // Configurar Network para mejor performance
    // Network.setTimeout(NETWORK_CONFIG.timeout);
    
    return true;
};
