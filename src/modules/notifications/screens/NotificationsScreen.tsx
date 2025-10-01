import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Animated,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'task' | 'penalty' | 'activity' | 'goal' | 'reminder' | 'emergency' | 'family';
    time: string;
    read: boolean;
    priority: 'low' | 'medium' | 'high';
    action?: () => void;
}

interface NotificationsScreenProps {
    navigation: any;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const cardsAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Additional states
    const [viewMode, setViewMode] = useState<'all' | 'unread' | 'priority'>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<'time' | 'priority' | 'type'>('time');

    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            title: 'Tarea Pendiente',
            message: 'Ariella tiene una tarea pendiente: "Limpiar su cuarto" - Vence en 2 horas',
            type: 'task',
            time: 'Hace 5 min',
            read: false,
            priority: 'high',
            action: () => navigation.navigate('Tasks'),
        },
        {
            id: '2',
            title: 'Recordatorio de Actividad',
            message: 'Movie Night está programada para las 7:00 PM - ¡No olviden las palomitas!',
            type: 'activity',
            time: 'Hace 15 min',
            read: false,
            priority: 'medium',
            action: () => navigation.navigate('Calendar'),
        },
        {
            id: '3',
            title: 'Penalidad Activa',
            message: 'Noah está cumpliendo una penalidad por no hacer la tarea - 15 min restantes',
            type: 'penalty',
            time: 'Hace 30 min',
            read: true,
            priority: 'high',
            action: () => navigation.navigate('Penalties'),
        },
        {
            id: '4',
            title: 'Meta Completada',
            message: '¡Felicitaciones! La familia completó la meta "Leer 30 minutos diarios"',
            type: 'goal',
            time: 'Hace 1 hora',
            read: true,
            priority: 'low',
            action: () => navigation.navigate('Goals'),
        },
        {
            id: '5',
            title: 'Recordatorio Familiar',
            message: 'No olviden la cita médica de mañana a las 10:00 AM',
            type: 'reminder',
            time: 'Hace 2 horas',
            read: false,
            priority: 'medium',
            action: () => Alert.alert('Recordatorio', 'Agregando a calendario...'),
        },
        {
            id: '6',
            title: 'Mensaje Familiar',
            message: 'Mamá: "¿Quién quiere ayudar a preparar la cena?"',
            type: 'family',
            time: 'Hace 3 horas',
            read: false,
            priority: 'low',
            action: () => Alert.alert('Mensaje', 'Respondiendo a mamá...'),
        },
        {
            id: '7',
            title: 'Alerta de Seguridad',
            message: 'Se detectó actividad inusual en el dispositivo de Noah',
            type: 'emergency',
            time: 'Hace 4 horas',
            read: true,
            priority: 'high',
            action: () => navigation.navigate('DeviceTools'),
        },
    ]);

    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

    useEffect(() => {
        // Entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Cards animation with delay
        Animated.timing(cardsAnim, {
            toValue: 1,
            duration: 1200,
            delay: 300,
            useNativeDriver: true,
        }).start();

        // Pulse animation for unread notifications
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulseAnimation.start();

        return () => {
            pulseAnimation.stop();
        };
    }, []);

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

    const filteredNotifications = notifications.filter(notification => {
        switch (filter) {
            case 'unread':
                return !notification.read;
            case 'high':
                return notification.priority === 'high';
            default:
                return true;
        }
    });

    const unreadCount = notifications.filter(n => !n.read).length;
    const highPriorityCount = notifications.filter(n => n.priority === 'high').length;

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
        Alert.alert('✅ Éxito', 'Todas las notificaciones han sido marcadas como leídas');
    };

    const deleteNotification = (id: string) => {
        Alert.alert(
            'Eliminar Notificación',
            '¿Estás seguro de que quieres eliminar esta notificación?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        setNotifications(prev => prev.filter(n => n.id !== id));
                    }
                }
            ]
        );
    };

    const onRefresh = () => {
        setRefreshing(true);
        // Simular actualización
        setTimeout(() => {
            setRefreshing(false);
            Alert.alert('🔄 Actualizado', 'Las notificaciones han sido actualizadas');
        }, 1000);
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateY: slideAnim },
                        { scale: scaleAnim }
                    ]
                }
            ]}
        >
            {/* Header */}
            <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerText}>
                        <Text style={styles.headerTitle}>Notificaciones</Text>
                        <Text style={styles.headerSubtitle}>
                            {unreadCount} sin leer • {highPriorityCount} importantes
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.settingsButton}>
                        <Ionicons name="settings" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Filter Tabs */}
            <Animated.View
                style={[
                    styles.filterContainer,
                    {
                        opacity: cardsAnim,
                        transform: [{
                            translateY: cardsAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [30, 0]
                            })
                        }]
                    }
                ]}
            >
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
                        Todas ({notifications.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'unread' && styles.activeFilterTab]}
                    onPress={() => setFilter('unread')}
                >
                    <Text style={[styles.filterText, filter === 'unread' && styles.activeFilterText]}>
                        Sin leer ({unreadCount})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'high' && styles.activeFilterTab]}
                    onPress={() => setFilter('high')}
                >
                    <Text style={[styles.filterText, filter === 'high' && styles.activeFilterText]}>
                        Importantes ({highPriorityCount})
                    </Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Actions */}
            <Animated.View
                style={[
                    styles.actionsContainer,
                    {
                        opacity: cardsAnim,
                        transform: [{
                            translateY: cardsAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [30, 0]
                            })
                        }]
                    }
                ]}
            >
                <TouchableOpacity style={styles.actionButton} onPress={markAllAsRead}>
                    <Ionicons name="checkmark-done" size={16} color="#8B5CF6" />
                    <Text style={styles.actionButtonText}>Marcar todas como leídas</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={onRefresh}>
                    <Ionicons name="refresh" size={16} color="#8B5CF6" />
                    <Text style={styles.actionButtonText}>Actualizar</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Notifications List */}
            <ScrollView
                style={styles.notificationsList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {filteredNotifications.map((notification, index) => (
                    <Animated.View
                        key={notification.id}
                        style={{
                            transform: [{
                                translateY: cardsAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [20, 0]
                                })
                            }],
                            opacity: cardsAnim
                        }}
                    >
                        <TouchableOpacity
                            style={[
                                styles.notificationCard,
                                !notification.read && styles.unreadCard,
                            ]}
                            onPress={() => {
                                markAsRead(notification.id);
                                notification.action?.();
                            }}
                        >
                            <View style={styles.notificationContent}>
                                <View style={styles.notificationHeader}>
                                    <View style={styles.notificationIconContainer}>
                                        <Ionicons
                                            name={getNotificationIcon(notification.type) as any}
                                            size={20}
                                            color={getNotificationColor(notification.type)}
                                        />
                                    </View>
                                    <View style={styles.notificationTextContainer}>
                                        <View style={styles.notificationTitleRow}>
                                            <Text style={styles.notificationTitle}>
                                                {notification.title}
                                            </Text>
                                            <View style={[
                                                styles.priorityBadge,
                                                { backgroundColor: getPriorityColor(notification.priority) }
                                            ]}>
                                                <Text style={styles.priorityText}>
                                                    {notification.priority === 'high' ? 'Alta' :
                                                        notification.priority === 'medium' ? 'Media' : 'Baja'}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.notificationTime}>
                                            {notification.time}
                                        </Text>
                                    </View>
                                    <View style={styles.notificationActions}>
                                        {!notification.read && (
                                            <Animated.View
                                                style={[
                                                    styles.unreadDot,
                                                    { transform: [{ scale: pulseAnim }] }
                                                ]}
                                            />
                                        )}
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => deleteNotification(notification.id)}
                                        >
                                            <Ionicons name="trash" size={16} color="#9CA3AF" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <Text style={styles.notificationMessage}>
                                    {notification.message}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                ))}

                {/* Empty State */}
                {filteredNotifications.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off" size={48} color="#9CA3AF" />
                        <Text style={styles.emptyStateTitle}>
                            {filter === 'unread' ? 'No hay notificaciones sin leer' :
                                filter === 'high' ? 'No hay notificaciones importantes' :
                                    'No hay notificaciones'}
                        </Text>
                        <Text style={styles.emptyStateSubtitle}>
                            Te notificaremos cuando haya algo nuevo
                        </Text>
                    </View>
                )}
            </ScrollView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    headerText: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    filterTab: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    activeFilterTab: {
        backgroundColor: '#8B5CF6',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    activeFilterText: {
        color: 'white',
    },
    actionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        marginRight: 12,
    },
    actionButtonText: {
        fontSize: 14,
        color: '#8B5CF6',
        fontWeight: '500',
        marginLeft: 6,
    },
    notificationsList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    notificationCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginVertical: 6,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    unreadCard: {
        backgroundColor: '#FEF7FF',
        borderColor: '#E879F9',
        borderWidth: 1,
    },
    notificationContent: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    notificationIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    notificationTextContainer: {
        flex: 1,
    },
    notificationTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
    },
    priorityBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    priorityText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white',
    },
    notificationTime: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    notificationActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#8B5CF6',
        marginRight: 8,
    },
    deleteButton: {
        padding: 4,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 16,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default NotificationsScreen;
