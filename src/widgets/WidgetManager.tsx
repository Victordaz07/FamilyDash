import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WidgetService, WidgetConfig, MOCK_WIDGET_DATA } from './WidgetService';

interface WidgetManagerProps {
    module?: string;
}

const WidgetManager: React.FC<WidgetManagerProps> = ({ module }) => {
    const [availableWidgets, setAvailableWidgets] = useState<WidgetConfig[]>([]);
    const [installedWidgets, setInstalledWidgets] = useState<string[]>([]);

    useEffect(() => {
        loadWidgets();
    }, [module]);

    const loadWidgets = () => {
        const widgets = module
            ? WidgetService.getWidgetsByModule(module)
            : WidgetService.getAllWidgets();
        setAvailableWidgets(widgets);
    };

    const handleInstallWidget = async (widgetId: string) => {
        try {
            const success = await WidgetService.createWidget(widgetId);
            if (success) {
                setInstalledWidgets(prev => [...prev, widgetId]);
                Alert.alert('✅ Widget Instalado', 'El widget se ha agregado a tu pantalla de inicio.');
            } else {
                Alert.alert('❌ Error', 'No se pudo instalar el widget.');
            }
        } catch (error) {
            Alert.alert('❌ Error', 'Ocurrió un error al instalar el widget.');
        }
    };

    const handleRemoveWidget = async (widgetId: string) => {
        try {
            const success = await WidgetService.removeWidget(widgetId);
            if (success) {
                setInstalledWidgets(prev => prev.filter(id => id !== widgetId));
                Alert.alert('✅ Widget Removido', 'El widget se ha eliminado de tu pantalla de inicio.');
            } else {
                Alert.alert('❌ Error', 'No se pudo remover el widget.');
            }
        } catch (error) {
            Alert.alert('❌ Error', 'Ocurrió un error al remover el widget.');
        }
    };

    const handleUpdateWidget = async (widgetId: string) => {
        try {
            const data = WidgetService.getWidgetData(widgetId);
            const success = await WidgetService.updateWidget(widgetId, data);
            if (success) {
                Alert.alert('✅ Widget Actualizado', 'El widget se ha actualizado con la información más reciente.');
            } else {
                Alert.alert('❌ Error', 'No se pudo actualizar el widget.');
            }
        } catch (error) {
            Alert.alert('❌ Error', 'Ocurrió un error al actualizar el widget.');
        }
    };

    const renderWidgetPreview = (widget: WidgetConfig) => {
        const data = MOCK_WIDGET_DATA[widget.id as keyof typeof MOCK_WIDGET_DATA];
        const isInstalled = installedWidgets.includes(widget.id);

        return (
            <View key={widget.id} style={styles.widgetCard}>
                <View style={styles.widgetHeader}>
                    <View style={[styles.widgetIcon, { backgroundColor: widget.color }]}>
                        <Ionicons name={widget.icon as any} size={24} color="white" />
                    </View>
                    <View style={styles.widgetInfo}>
                        <Text style={styles.widgetName}>{widget.name}</Text>
                        <Text style={styles.widgetDescription}>{widget.description}</Text>
                    </View>
                    <View style={styles.widgetStatus}>
                        {isInstalled ? (
                            <View style={styles.installedBadge}>
                                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                            </View>
                        ) : (
                            <View style={styles.availableBadge}>
                                <Ionicons name="add-circle-outline" size={20} color="#6B7280" />
                            </View>
                        )}
                    </View>
                </View>

                {data && (
                    <View style={styles.widgetPreview}>
                        <Text style={styles.previewTitle}>Vista Previa:</Text>
                        <View style={styles.previewContent}>
                            {widget.id === 'tasks_today' && (
                                <View>
                                    <Text style={styles.previewText}>
                                        {(data as any).completedCount}/{(data as any).totalCount} tareas completadas
                                    </Text>
                                    {(data as any).tasks?.slice(0, 2).map((task: any) => (
                                        <Text key={task.id} style={styles.previewTask}>
                                            {task.completed ? '✅' : '⏳'} {task.title}
                                        </Text>
                                    ))}
                                </View>
                            )}

                            {widget.id === 'penalty_active' && (
                                <View>
                                    <Text style={styles.previewText}>
                                        {(data as any).isActive ? `${(data as any).timeRemaining} min restantes` : 'Sin penalizaciones'}
                                    </Text>
                                    <Text style={styles.previewSubtext}>{(data as any).reason}</Text>
                                </View>
                            )}

                            {widget.id === 'activities_weekly' && (
                                <View>
                                    <Text style={styles.previewText}>
                                        {(data as any).upcomingCount} actividades próximas
                                    </Text>
                                    {(data as any).activities?.slice(0, 1).map((activity: any) => (
                                        <Text key={activity.id} style={styles.previewTask}>
                                            📅 {activity.title}
                                        </Text>
                                    ))}
                                </View>
                            )}

                            {widget.id === 'goals_progress' && (
                                <View>
                                    <Text style={styles.previewText}>
                                        Progreso promedio: {(data as any).averageProgress}%
                                    </Text>
                                    {(data as any).goals?.slice(0, 1).map((goal: any) => (
                                        <Text key={goal.id} style={styles.previewTask}>
                                            🏆 {goal.title}: {goal.progress}%
                                        </Text>
                                    ))}
                                </View>
                            )}

                            {widget.id === 'safe_room_message' && (
                                <View>
                                    <Text style={styles.previewText}>
                                        {(data as any).isUnread ? 'Nuevo mensaje' : 'Sin mensajes nuevos'}
                                    </Text>
                                    <Text style={styles.previewSubtext}>
                                        {(data as any).sender}: {(data as any).message}
                                    </Text>
                                </View>
                            )}

                            {widget.id === 'device_ring' && (
                                <View>
                                    <Text style={styles.previewText}>
                                        {(data as any).connectedDevices}/{(data as any).totalDevices} dispositivos conectados
                                    </Text>
                                    <Text style={styles.previewSubtext}>
                                        Última llamada: {(data as any).lastRingTime}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                <View style={styles.widgetActions}>
                    {isInstalled ? (
                        <>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.updateButton]}
                                onPress={() => handleUpdateWidget(widget.id)}
                            >
                                <Ionicons name="refresh" size={16} color="white" />
                                <Text style={styles.actionButtonText}>Actualizar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.removeButton]}
                                onPress={() => handleRemoveWidget(widget.id)}
                            >
                                <Ionicons name="trash" size={16} color="white" />
                                <Text style={styles.actionButtonText}>Remover</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.installButton]}
                            onPress={() => handleInstallWidget(widget.id)}
                        >
                            <Ionicons name="add" size={16} color="white" />
                            <Text style={styles.actionButtonText}>Instalar Widget</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>📱 Widgets de Android</Text>
                <Text style={styles.headerSubtitle}>
                    Agrega widgets a tu pantalla de inicio para acceso rápido
                </Text>
            </View>

            <View style={styles.content}>
                {availableWidgets.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="phone-portrait-outline" size={64} color="#8B5CF6" />
                        <Text style={styles.emptyText}>No hay widgets disponibles</Text>
                        <Text style={styles.emptySubtext}>
                            Los widgets solo están disponibles en dispositivos Android
                        </Text>
                    </View>
                ) : (
                    availableWidgets.map(renderWidgetPreview)
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        padding: 24,
        backgroundColor: '#8B5CF6',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    content: {
        padding: 16,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#8B5CF6',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
    },
    widgetCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    widgetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    widgetIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    widgetInfo: {
        flex: 1,
    },
    widgetName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    widgetDescription: {
        fontSize: 14,
        color: '#6B7280',
    },
    widgetStatus: {
        alignItems: 'center',
    },
    installedBadge: {
        backgroundColor: '#F0FDF4',
        padding: 4,
        borderRadius: 12,
    },
    availableBadge: {
        backgroundColor: '#F3F4F6',
        padding: 4,
        borderRadius: 12,
    },
    widgetPreview: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    previewTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6B7280',
        marginBottom: 8,
    },
    previewContent: {
        paddingLeft: 8,
    },
    previewText: {
        fontSize: 14,
        color: '#1F2937',
        marginBottom: 4,
    },
    previewSubtext: {
        fontSize: 12,
        color: '#6B7280',
    },
    previewTask: {
        fontSize: 12,
        color: '#1F2937',
        marginBottom: 2,
    },
    widgetActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    installButton: {
        backgroundColor: '#8B5CF6',
    },
    updateButton: {
        backgroundColor: '#3B82F6',
    },
    removeButton: {
        backgroundColor: '#EF4444',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 4,
    },
});

export default WidgetManager;




