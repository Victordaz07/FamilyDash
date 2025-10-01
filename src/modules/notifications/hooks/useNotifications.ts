import { useState, useEffect } from 'react';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'task' | 'penalty' | 'activity' | 'goal' | 'reminder' | 'emergency' | 'family';
    time: string;
    read: boolean;
    priority: 'low' | 'medium' | 'high';
    action?: () => void;
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            title: 'Tarea Pendiente',
            message: 'Ariella tiene una tarea pendiente: "Limpiar su cuarto" - Vence en 2 horas',
            type: 'task',
            time: 'Hace 5 min',
            read: false,
            priority: 'high',
        },
        {
            id: '2',
            title: 'Recordatorio de Actividad',
            message: 'Movie Night está programada para las 7:00 PM - ¡No olviden las palomitas!',
            type: 'activity',
            time: 'Hace 15 min',
            read: false,
            priority: 'medium',
        },
        {
            id: '3',
            title: 'Penalidad Activa',
            message: 'Noah está cumpliendo una penalidad por no hacer la tarea - 15 min restantes',
            type: 'penalty',
            time: 'Hace 30 min',
            read: true,
            priority: 'high',
        },
        {
            id: '4',
            title: 'Meta Completada',
            message: '¡Felicitaciones! La familia completó la meta "Leer 30 minutos diarios"',
            type: 'goal',
            time: 'Hace 1 hora',
            read: true,
            priority: 'low',
        },
        {
            id: '5',
            title: 'Recordatorio Familiar',
            message: 'No olviden la cita médica de mañana a las 10:00 AM',
            type: 'reminder',
            time: 'Hace 2 horas',
            read: false,
            priority: 'medium',
        },
        {
            id: '6',
            title: 'Mensaje Familiar',
            message: 'Mamá: "¿Quién quiere ayudar a preparar la cena?"',
            type: 'family',
            time: 'Hace 3 horas',
            read: false,
            priority: 'low',
        },
        {
            id: '7',
            title: 'Alerta de Seguridad',
            message: 'Se detectó actividad inusual en el dispositivo de Noah',
            type: 'emergency',
            time: 'Hace 4 horas',
            read: true,
            priority: 'high',
        },
    ]);

    const [refreshing, setRefreshing] = useState(false);

    // Estadísticas
    const unreadCount = notifications.filter(n => !n.read).length;
    const highPriorityCount = notifications.filter(n => n.priority === 'high').length;
    const totalCount = notifications.length;

    // Funciones de gestión
    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        );
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const addNotification = (notification: Omit<Notification, 'id'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const refreshNotifications = () => {
        setRefreshing(true);
        // Simular actualización desde servidor
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    // Filtros
    const getFilteredNotifications = (filter: 'all' | 'unread' | 'high') => {
        switch (filter) {
            case 'unread':
                return notifications.filter(n => !n.read);
            case 'high':
                return notifications.filter(n => n.priority === 'high');
            default:
                return notifications;
        }
    };

    // Utilidades para iconos y colores
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'task':
                return 'checkmark-circle';
            case 'penalty':
                return 'warning';
            case 'activity':
                return 'calendar';
            case 'goal':
                return 'trophy';
            case 'reminder':
                return 'time';
            case 'emergency':
                return 'alert-circle';
            case 'family':
                return 'people';
            default:
                return 'notifications';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'task':
                return '#10B981';
            case 'penalty':
                return '#EF4444';
            case 'activity':
                return '#8B5CF6';
            case 'goal':
                return '#F59E0B';
            case 'reminder':
                return '#3B82F6';
            case 'emergency':
                return '#DC2626';
            case 'family':
                return '#EC4899';
            default:
                return '#6B7280';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return '#EF4444';
            case 'medium':
                return '#F59E0B';
            case 'low':
                return '#10B981';
            default:
                return '#6B7280';
        }
    };

    return {
        notifications,
        refreshing,
        unreadCount,
        highPriorityCount,
        totalCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        addNotification,
        refreshNotifications,
        getFilteredNotifications,
        getNotificationIcon,
        getNotificationColor,
        getPriorityColor,
    };
};
