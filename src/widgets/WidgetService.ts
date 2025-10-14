import { Platform } from 'react-native';

// Widget configuration for Android
export interface WidgetConfig {
    id: string;
    name: string;
    description: string;
    module: string;
    color: string;
    icon: string;
}

// Available widgets for each module
export const WIDGET_CONFIGS: WidgetConfig[] = [
    {
        id: 'tasks_today',
        name: "Today's Tasks",
        description: 'Checklist de tareas del día',
        module: 'tasks',
        color: '#10B981',
        icon: 'checkmark-circle'
    },
    {
        id: 'penalty_active',
        name: 'Active Penalty',
        description: 'Timer de penalización activa',
        module: 'penalties',
        color: '#EF4444',
        icon: 'warning'
    },
    {
        id: 'activities_weekly',
        name: 'Weekly Activities',
        description: 'Actividades de la semana',
        module: 'activities',
        color: '#3B82F6',
        icon: 'calendar'
    },
    {
        id: 'goals_progress',
        name: 'Goals Progress',
        description: 'Progreso de metas familiares',
        module: 'goals',
        color: '#F59E0B',
        icon: 'trophy'
    },
    {
        id: 'safe_room_message',
        name: 'New Safe Room Message',
        description: 'Nuevo mensaje del cuarto seguro',
        module: 'safeRoom',
        color: '#EC4899',
        icon: 'heart'
    },
    {
        id: 'device_ring',
        name: 'Ring All Devices',
        description: 'Llamar a todos los dispositivos',
        module: 'deviceTools',
        color: '#8B5CF6',
        icon: 'call'
    }
];

// Mock widget data for development
export const MOCK_WIDGET_DATA = {
    tasks_today: {
        title: 'Tareas de Hoy',
        tasks: [
            { id: '1', title: 'Limpiar la cocina', completed: false },
            { id: '2', title: 'Sacar la basura', completed: true },
            { id: '3', title: 'Hacer la cama', completed: false }
        ],
        completedCount: 1,
        totalCount: 3
    },
    penalty_active: {
        title: 'Penalización Activa',
        reason: 'No completó tarea asignada',
        timeRemaining: 25, // minutes
        isActive: true
    },
    activities_weekly: {
        title: 'Actividades de la Semana',
        activities: [
            { id: '1', title: 'Noche de películas', date: '2024-01-15' },
            { id: '2', title: 'Cena familiar', date: '2024-01-17' }
        ],
        upcomingCount: 2
    },
    goals_progress: {
        title: 'Progreso de Metas',
        goals: [
            { id: '1', title: 'Leer 10 libros', progress: 60 },
            { id: '2', title: 'Ejercicio diario', progress: 80 }
        ],
        averageProgress: 70
    },
    safe_room_message: {
        title: 'Nuevo Mensaje',
        message: '¡Te amo mucho! ❤️',
        sender: 'Mamá',
        timestamp: '2024-01-14 10:30',
        isUnread: true
    },
    device_ring: {
        title: 'Llamar Dispositivos',
        connectedDevices: 3,
        totalDevices: 4,
        lastRingTime: '2024-01-14 09:15'
    }
};

// Widget service for Android
export class WidgetService {
    static async createWidget(widgetId: string): Promise<boolean> {
        if (Platform.OS !== 'android') {
            console.log('Widgets solo están disponibles en Android');
            return false;
        }

        try {
            // This would integrate with react-native-android-widget
            // For now, we'll simulate the widget creation
            console.log(`Creating widget: ${widgetId}`);

            // Simulate widget creation delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            return true;
        } catch (error) {
            console.error('Error creating widget:', error);
            return false;
        }
    }

    static async updateWidget(widgetId: string, data: any): Promise<boolean> {
        if (Platform.OS !== 'android') {
            return false;
        }

        try {
            console.log(`Updating widget ${widgetId} with data:`, data);

            // Simulate widget update
            await new Promise(resolve => setTimeout(resolve, 500));

            return true;
        } catch (error) {
            console.error('Error updating widget:', error);
            return false;
        }
    }

    static async removeWidget(widgetId: string): Promise<boolean> {
        if (Platform.OS !== 'android') {
            return false;
        }

        try {
            console.log(`Removing widget: ${widgetId}`);

            // Simulate widget removal
            await new Promise(resolve => setTimeout(resolve, 500));

            return true;
        } catch (error) {
            console.error('Error removing widget:', error);
            return false;
        }
    }

    static getWidgetData(widgetId: string): any {
        return MOCK_WIDGET_DATA[widgetId as keyof typeof MOCK_WIDGET_DATA] || null;
    }

    static getAllWidgets(): WidgetConfig[] {
        return WIDGET_CONFIGS;
    }

    static getWidgetsByModule(module: string): WidgetConfig[] {
        return WIDGET_CONFIGS.filter(widget => widget.module === module);
    }
}

export default WidgetService;




