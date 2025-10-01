import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'task' | 'penalty' | 'activity' | 'goal' | 'reminder' | 'emergency';
    time: string;
    read: boolean;
    action?: () => void;
}

interface NotificationsModalProps {
    visible: boolean;
    onClose: () => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ visible, onClose }) => {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            title: 'Tarea Pendiente',
            message: 'Ariella tiene una tarea pendiente: "Limpiar su cuarto"',
            type: 'task',
            time: 'Hace 5 min',
            read: false,
            action: () => Alert.alert('Tarea', 'Navegando a la tarea de Ariella...'),
        },
        {
            id: '2',
            title: 'Recordatorio de Actividad',
            message: 'Movie Night está programada para las 7:00 PM',
            type: 'activity',
            time: 'Hace 15 min',
            read: false,
            action: () => Alert.alert('Actividad', 'Navegando al calendario...'),
        },
        {
            id: '3',
            title: 'Penalidad Activa',
            message: 'Noah está cumpliendo una penalidad por no hacer la tarea',
            type: 'penalty',
            time: 'Hace 30 min',
            read: true,
            action: () => Alert.alert('Penalidad', 'Navegando a penalidades...'),
        },
        {
            id: '4',
            title: 'Meta Completada',
            message: '¡Felicitaciones! La familia completó la meta "Leer 30 minutos diarios"',
            type: 'goal',
            time: 'Hace 1 hora',
            read: true,
            action: () => Alert.alert('Meta', 'Navegando a metas...'),
        },
        {
            id: '5',
            title: 'Recordatorio Familiar',
            message: 'No olviden la cita médica de mañana a las 10:00 AM',
            type: 'reminder',
            time: 'Hace 2 horas',
            read: false,
            action: () => Alert.alert('Recordatorio', 'Agregando a calendario...'),
        },
    ]);

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
            default:
                return '#6B7280';
        }
    };

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

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <LinearGradient
                        colors={['#8B5CF6', '#7C3AED']}
                        style={styles.header}
                    >
                        <View style={styles.headerContent}>
                            <Text style={styles.headerTitle}>Notificaciones</Text>
                            <Text style={styles.headerSubtitle}>
                                {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas leídas'}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </LinearGradient>

                    {/* Actions */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity style={styles.actionButton} onPress={markAllAsRead}>
                            <Ionicons name="checkmark-done" size={16} color="#8B5CF6" />
                            <Text style={styles.actionButtonText}>Marcar todas como leídas</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="settings" size={16} color="#8B5CF6" />
                            <Text style={styles.actionButtonText}>Configuración</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Notifications List */}
                    <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
                        {notifications.map((notification) => (
                            <TouchableOpacity
                                key={notification.id}
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
                                            <Text style={styles.notificationTitle}>
                                                {notification.title}
                                            </Text>
                                            <Text style={styles.notificationTime}>
                                                {notification.time}
                                            </Text>
                                        </View>
                                        {!notification.read && (
                                            <View style={styles.unreadDot} />
                                        )}
                                    </View>
                                    <Text style={styles.notificationMessage}>
                                        {notification.message}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Empty State */}
                    {notifications.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="notifications-off" size={48} color="#9CA3AF" />
                            <Text style={styles.emptyStateTitle}>No hay notificaciones</Text>
                            <Text style={styles.emptyStateSubtitle}>
                                Te notificaremos cuando haya algo nuevo
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        minHeight: '60%',
    },
    header: {
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
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
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    notificationTextContainer: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    notificationTime: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#8B5CF6',
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
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default NotificationsModal;
