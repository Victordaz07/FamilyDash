import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFamilyDashStore } from '@/state/store';

interface DeviceToolsScreenProps {
    navigation: any;
}

const DeviceToolsScreen: React.FC<DeviceToolsScreenProps> = ({ navigation }) => {
    const { user } = useFamilyDashStore();
    const [isRinging, setIsRinging] = useState(false);

    const handleRingAllDevices = () => {
        setIsRinging(true);
        Alert.alert(
            '🔔 Sonando Todos los Dispositivos',
            'Se está enviando una señal de llamada a todos los dispositivos familiares.',
            [
                {
                    text: 'Cancelar',
                    onPress: () => setIsRinging(false),
                    style: 'cancel'
                },
                {
                    text: 'OK',
                    onPress: () => {
                        // Simulate ringing for 5 seconds
                        setTimeout(() => {
                            setIsRinging(false);
                            Alert.alert('✅ Llamada Completada', 'Se ha enviado la señal a todos los dispositivos.');
                        }, 5000);
                    }
                }
            ]
        );
    };

    const handleFindDevice = (deviceName: string) => {
        Alert.alert(
            `🔍 Buscando ${deviceName}`,
            `Se está enviando una señal de localización a ${deviceName}.`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'OK',
                    onPress: () => {
                        Alert.alert('✅ Dispositivo Encontrado', `${deviceName} ha respondido a la señal.`);
                    }
                }
            ]
        );
    };

    const handleAndroidWidgets = () => {
        navigation.navigate('AndroidWidgets');
    };

    const handleEmergencyAlert = () => {
        Alert.alert(
            '🚨 Alerta de Emergencia',
            '¿Estás seguro de que quieres enviar una alerta de emergencia a todos los dispositivos familiares?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Enviar Alerta',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('🚨 Alerta Enviada', 'Se ha enviado una alerta de emergencia a todos los dispositivos.');
                    }
                }
            ]
        );
    };

    const mockDevices = [
        { name: 'iPhone de Papá', status: 'online', battery: 85 },
        { name: 'iPad de Mamá', status: 'online', battery: 92 },
        { name: 'Android de Juan', status: 'offline', battery: 0 },
        { name: 'Tablet de María', status: 'online', battery: 67 },
    ];

    return (
        <ScrollView style={styles.container}>
            <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>📱 Herramientas de Dispositivos</Text>
                <Text style={styles.headerSubtitle}>
                    {mockDevices.filter(d => d.status === 'online').length} dispositivos conectados
                </Text>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.welcomeSection}>
                    <Ionicons name="phone-portrait" size={48} color="#8B5CF6" />
                    <Text style={styles.welcomeTitle}>Control Familiar</Text>
                    <Text style={styles.welcomeText}>
                        Gestiona y localiza todos los dispositivos de tu familia desde un solo lugar.
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.ringButton, isRinging && styles.buttonDisabled]}
                        onPress={handleRingAllDevices}
                        disabled={isRinging}
                    >
                        <Ionicons name="call" size={24} color="white" />
                        <Text style={styles.actionButtonText}>
                            {isRinging ? 'Sonando...' : '🔔 Llamar Todos'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.emergencyButton]}
                        onPress={handleEmergencyAlert}
                    >
                        <Ionicons name="warning" size={24} color="white" />
                        <Text style={styles.actionButtonText}>🚨 Emergencia</Text>
                    </TouchableOpacity>
                </View>

                {/* Android Widgets Card */}
                <View style={styles.widgetCard}>
                    <View style={styles.widgetHeader}>
                        <View style={styles.widgetIcon}>
                            <Ionicons name="grid" size={24} color="white" />
                        </View>
                        <View style={styles.widgetInfo}>
                            <Text style={styles.widgetTitle}>Android Widgets</Text>
                            <Text style={styles.widgetSubtitle}>Configurar widgets del home screen</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.widgetButton}
                            onPress={handleAndroidWidgets}
                        >
                            <Ionicons name="arrow-forward" size={20} color="#8B5CF6" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.widgetDescription}>
                        Agrega widgets de FamilyDash a tu pantalla de inicio para acceso rápido a tareas, penalidades y más.
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Dispositivos Conectados</Text>

                {mockDevices.map((device, index) => (
                    <View key={index} style={styles.deviceCard}>
                        <View style={styles.deviceHeader}>
                            <View style={styles.deviceInfo}>
                                <Text style={styles.deviceName}>
                                    {device.name}
                                </Text>
                                <View style={styles.deviceStatus}>
                                    <View style={[
                                        styles.statusDot,
                                        { backgroundColor: device.status === 'online' ? '#10B981' : '#EF4444' }
                                    ]} />
                                    <Text style={styles.statusText}>
                                        {device.status === 'online' ? 'En línea' : 'Desconectado'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.deviceActions}>
                                {device.status === 'online' && (
                                    <TouchableOpacity
                                        style={styles.findButton}
                                        onPress={() => handleFindDevice(device.name)}
                                    >
                                        <Ionicons name="locate" size={20} color="#8B5CF6" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        <View style={styles.deviceDetails}>
                            <View style={styles.detailRow}>
                                <Ionicons name="battery-half-outline" size={16} color="#6B7280" />
                                <Text style={styles.detailText}>
                                    Batería: {device.battery}%
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="time-outline" size={16} color="#6B7280" />
                                <Text style={styles.detailText}>
                                    Última conexión: {device.status === 'online' ? 'Ahora' : 'Hace 2 horas'}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}

                <Text style={styles.sectionTitle}>Configuración</Text>

                <View style={styles.configSection}>
                    <TouchableOpacity style={styles.configButton}>
                        <Ionicons name="settings-outline" size={20} color="#8B5CF6" />
                        <Text style={styles.configButtonText}>Configurar Notificaciones</Text>
                        <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.configButton}>
                        <Ionicons name="shield-outline" size={20} color="#8B5CF6" />
                        <Text style={styles.configButtonText}>Configurar Restricciones</Text>
                        <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.configButton}>
                        <Ionicons name="time-outline" size={20} color="#8B5CF6" />
                        <Text style={styles.configButtonText}>Horarios de Uso</Text>
                        <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                    </TouchableOpacity>
                </View>
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
        paddingTop: 40,
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
    welcomeSection: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    welcomeTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#8B5CF6',
        marginTop: 12,
        marginBottom: 8,
    },
    welcomeText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
        marginTop: 24,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 4,
    },
    ringButton: {
        backgroundColor: '#8B5CF6',
    },
    emergencyButton: {
        backgroundColor: '#EF4444',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    widgetCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
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
        backgroundColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    widgetInfo: {
        flex: 1,
    },
    widgetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    widgetSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    widgetButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    widgetDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    deviceCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    deviceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    deviceInfo: {
        flex: 1,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    deviceStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        color: '#6B7280',
    },
    deviceActions: {
        flexDirection: 'row',
    },
    findButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: '#F3F4F6',
    },
    deviceDetails: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 8,
    },
    configSection: {
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    configButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    configButtonText: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        marginLeft: 12,
    },
});

export default DeviceToolsScreen;
