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
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigation } from '@react-navigation/native';

interface NotificationsScreenProps {
    navigation: any;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState<'all' | 'unread' | 'priority'>('all');

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        // The hook will automatically refresh data
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleNotificationPress = async (notification: any) => {
        // Mark as read
        await markAsRead(notification.id);

        // Navigate if there's action data
        if (notification.actionData?.screen) {
            navigation.navigate(notification.actionData.screen, notification.actionData.params);
        }
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        Alert.alert('Notificaciones', 'Todas las notificaciones han sido marcadas como leídas');
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'task': return 'checkmark-circle';
            case 'penalty': return 'warning';
            case 'activity': return 'calendar';
            case 'reminder': return 'alarm';
            case 'emergency': return 'shield';
            case 'family': return 'people';
            case 'vote': return 'people-outline';
            case 'chat': return 'chatbubbles';
            default: return 'notifications';
        }
    };

    const getNotificationColor = (type: string, priority: string) => {
        if (priority === 'high') return '#FF6B6B';
        if (priority === 'medium') return '#4ECDC4';
        if (priority === 'low') return '#95E1D3';

        switch (type) {
            case 'task': return '#4ECDC4';
            case 'penalty': return '#FF6B6B';
            case 'activity': return '#95E1D3';
            case 'reminder': return '#FFEAA7';
            case 'emergency': return '#FF6B6B';
            case 'family': return '#A29BFE';
            case 'vote': return '#6C5CE7';
            case 'chat': return '#74B9FF';
            default: return '#636E72';
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `Hace ${minutes} min`;
        if (hours < 24) return `Hace ${hours}h`;
        return `Hace ${days} días`;
    };

    const filteredNotifications = notifications.filter(notification => {
        if (viewMode === 'unread') return !notification.read;
        if (viewMode === 'priority') return notification.priority === 'high';
        return true;
    });

    const renderNotification = (notification: any, index: number) => (
        <Animated.View
            key={notification.id}
            style={[
                styles.notificationCard,
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateY: slideAnim },
                        { scale: fadeAnim }
                    ]
                }
            ]}
        >
            <TouchableOpacity
                style={[
                    styles.notificationContent,
                    !notification.read && styles.unreadNotification
                ]}
                onPress={() => handleNotificationPress(notification)}
                activeOpacity={0.7}
            >
                <View style={styles.notificationHeader}>
                    <View style={[
                        styles.notificationIcon,
                        { backgroundColor: getNotificationColor(notification.type, notification.priority) }
                    ]}>
                        <Ionicons
                            name={getNotificationIcon(notification.type)}
                            size={20}
                            color="white"
                        />
                    </View>
                    <View style={styles.notificationText}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        <Text style={styles.notificationMessage}>{notification.message}</Text>
                    </View>
                    <View style={styles.notificationMeta}>
                        <Text style={styles.notificationTime}>
                            {formatTime(notification.time)}
                        </Text>
                        {!notification.read && <View style={styles.unreadDot} />}
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerText}>
                        <Text style={styles.headerTitle}>Notificaciones</Text>
                        <Text style={styles.headerSubtitle}>
                            {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
                        </Text>
                    </View>
                    {unreadCount > 0 && (
                        <TouchableOpacity
                            style={styles.markAllButton}
                            onPress={handleMarkAllAsRead}
                        >
                            <Text style={styles.markAllText}>Marcar todo</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[styles.filterTab, viewMode === 'all' && styles.activeFilterTab]}
                        onPress={() => setViewMode('all')}
                    >
                        <Text style={[styles.filterText, viewMode === 'all' && styles.activeFilterText]}>
                            Todas ({notifications.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterTab, viewMode === 'unread' && styles.activeFilterTab]}
                        onPress={() => setViewMode('unread')}
                    >
                        <Text style={[styles.filterText, viewMode === 'unread' && styles.activeFilterText]}>
                            Sin leer ({unreadCount})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterTab, viewMode === 'priority' && styles.activeFilterTab]}
                        onPress={() => setViewMode('priority')}
                    >
                        <Text style={[styles.filterText, viewMode === 'priority' && styles.activeFilterText]}>
                            Importantes
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Notifications List */}
            <ScrollView
                style={styles.notificationsList}
                contentContainerStyle={styles.notificationsContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Cargando notificaciones...</Text>
                    </View>
                ) : filteredNotifications.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off" size={64} color="#ccc" />
                        <Text style={styles.emptyTitle}>
                            {viewMode === 'unread' ? 'No hay notificaciones sin leer' :
                                viewMode === 'priority' ? 'No hay notificaciones importantes' :
                                    'No hay notificaciones'}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {viewMode === 'all' ? 'Las notificaciones aparecerán aquí cuando haya actividad familiar' :
                                'Cambia el filtro para ver más notificaciones'}
                        </Text>
                    </View>
                ) : (
                    filteredNotifications.map((notification, index) =>
                        renderNotification(notification, index)
                    )
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
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
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    headerText: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        color: '#fff',
        fontWeight: '800',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#EEE',
        marginTop: 4,
    },
    markAllButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    markAllText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    filterContainer: {
        backgroundColor: 'white',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 4,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
    },
    activeFilterTab: {
        backgroundColor: '#667eea',
    },
    filterText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeFilterText: {
        color: 'white',
    },
    notificationsList: {
        flex: 1,
    },
    notificationsContent: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        color: '#666',
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    notificationCard: {
        marginBottom: 12,
        borderRadius: 16,
        backgroundColor: 'white',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    notificationContent: {
        padding: 16,
    },
    unreadNotification: {
        borderLeftWidth: 4,
        borderLeftColor: '#667eea',
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    notificationText: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    notificationMeta: {
        alignItems: 'flex-end',
    },
    notificationTime: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#667eea',
    },
});

export default NotificationsScreen;