/**
 * Smart Home Integration Screen
 * Comprehensive IoT device management interface
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SmartHomeManager, {
    SmartDevice,
    SmartRoom,
    AutomationRule,
    VoiceCommand,
    SmartHomeStatus
} from '@/services/smartHome/SmartHomeManager';

interface SmartHomeScreenProps {
    navigation: any;
}

const SmartHomeScreen: React.FC<SmartHomeScreenProps> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [devices, setDevices] = useState<SmartDevice[]>([]);
    const [rooms, setRooms] = useState<SmartRoom[]>([]);
    const [automations, setAutomations] = useState<AutomationRule[]>([]);
    const [voiceCommands, setVoiceCommands] = useState<VoiceCommand[]>([]);
    const [status, setStatus] = useState<SmartHomeStatus | null>(null);
    const [selectedTab, setSelectedTab] = useState<'devices' | 'rooms' | 'automation' | 'voice'>('devices');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [voiceInput, setVoiceInput] = useState('');

    const smartHomeManager = SmartHomeManager.getInstance();

    useEffect(() => {
        initializeSmartHome();
    }, []);

    const initializeSmartHome = async () => {
        try {
            setLoading(true);
            await smartHomeManager.initialize();
            await loadSmartHomeData();
        } catch (error) {
            console.error('Error initializing smart home:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSmartHomeData = async () => {
        try {
            const devicesData = await smartHomeManager.getAllDevices();
            const roomsData = await smartHomeManager.getAllRooms();
            const automationsData = await smartHomeManager.getAllAutomations();
            const voiceCommandsData = await smartHomeManager.getVoiceCommands();
            const statusData = await smartHomeManager.getStatus();

            setDevices(devicesData);
            setRooms(roomsData);
            setAutomations(automationsData);
            setVoiceCommands(voiceCommandsData);
            setStatus(statusData);
        } catch (error) {
            console.error('Error loading smart home data:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await smartHomeManager.refreshDevices();
            await loadSmartHomeData();
        } catch (error) {
            console.error('Error refreshing smart home data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleDeviceControl = async (deviceId: string, action: string, parameters?: any) => {
        try {
            const success = await smartHomeManager.controlDevice(deviceId, action, parameters);
            if (success) {
                await loadSmartHomeData();
            } else {
                Alert.alert('Error', 'Failed to control device');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to control device');
        }
    };

    const handleVoiceCommand = async () => {
        if (!voiceInput.trim()) return;

        try {
            const response = await smartHomeManager.executeVoiceCommand(voiceInput);
            Alert.alert('Voice Assistant', response);
            setVoiceInput('');
            setShowVoiceModal(false);
            await loadSmartHomeData();
        } catch (error) {
            Alert.alert('Error', 'Failed to execute voice command');
        }
    };

    const toggleAutomation = async (automationId: string) => {
        try {
            await smartHomeManager.toggleAutomation(automationId);
            await loadSmartHomeData();
        } catch (error) {
            Alert.alert('Error', 'Failed to toggle automation');
        }
    };

    const getDeviceIcon = (type: SmartDevice['type']): keyof typeof Ionicons.glyphMap => {
        const iconMap: Record<SmartDevice['type'], keyof typeof Ionicons.glyphMap> = {
            light: 'bulb',
            thermostat: 'thermometer',
            camera: 'videocam',
            door: 'lock-closed',
            window: 'square',
            speaker: 'volume-high',
            tv: 'tv',
            fan: 'leaf',
            outlet: 'flash',
            sensor: 'radio',
        };
        return iconMap[type] || 'hardware-chip';
    };

    const getDeviceColor = (device: SmartDevice): string => {
        if (device.status === 'error') return '#EF4444';
        if (device.status === 'offline') return '#6B7280';
        if (device.isOn) return '#10B981';
        return '#9CA3AF';
    };

    const DeviceCard = ({ device }: { device: SmartDevice }) => (
        <View style={styles.deviceCard}>
            <View style={styles.deviceHeader}>
                <View style={styles.deviceInfo}>
                    <Ionicons
                        name={getDeviceIcon(device.type)}
                        size={24}
                        color={getDeviceColor(device)}
                    />
                    <View style={styles.deviceTextInfo}>
                        <Text style={styles.deviceName}>{device.name}</Text>
                        <Text style={styles.deviceDetails}>
                            {device.brand} {device.model} • {device.room}
                        </Text>
                    </View>
                </View>
                <View style={[
                    styles.statusIndicator,
                    { backgroundColor: getDeviceColor(device) }
                ]} />
            </View>

            <View style={styles.deviceProperties}>
                {device.properties.brightness && (
                    <Text style={styles.propertyText}>
                        Brightness: {device.properties.brightness}%
                    </Text>
                )}
                {device.properties.temperature && (
                    <Text style={styles.propertyText}>
                        Temperature: {device.properties.temperature}°F
                    </Text>
                )}
                {device.properties.volume && (
                    <Text style={styles.propertyText}>
                        Volume: {device.properties.volume}%
                    </Text>
                )}
                {device.properties.battery && (
                    <Text style={styles.propertyText}>
                        Battery: {device.properties.battery}%
                    </Text>
                )}
            </View>

            <View style={styles.deviceControls}>
                <TouchableOpacity
                    style={[
                        styles.controlButton,
                        { backgroundColor: device.isOn ? '#EF4444' : '#10B981' }
                    ]}
                    onPress={() => handleDeviceControl(
                        device.id,
                        device.isOn ? 'turn_off' : 'turn_on'
                    )}
                >
                    <Ionicons
                        name={device.isOn ? 'power' : 'power-outline'}
                        size={16}
                        color="white"
                    />
                    <Text style={styles.controlButtonText}>
                        {device.isOn ? 'Turn Off' : 'Turn On'}
                    </Text>
                </TouchableOpacity>

                {device.type === 'light' && device.properties.brightness !== undefined && (
                    <TouchableOpacity
                        style={[styles.controlButton, styles.secondaryButton]}
                        onPress={() => {
                            const newBrightness = device.properties.brightness === 100 ? 50 : 100;
                            handleDeviceControl(device.id, 'set_brightness', { brightness: newBrightness });
                        }}
                    >
                        <Ionicons name="sunny" size={16} color="#F59E0B" />
                        <Text style={[styles.controlButtonText, { color: '#F59E0B' }]}>
                            {device.properties.brightness === 100 ? 'Dim' : 'Bright'}
                        </Text>
                    </TouchableOpacity>
                )}

                {device.type === 'thermostat' && device.properties.temperature !== undefined && (
                    <TouchableOpacity
                        style={[styles.controlButton, styles.secondaryButton]}
                        onPress={() => {
                            const newTemp = device.properties.temperature === 72 ? 68 : 72;
                            handleDeviceControl(device.id, 'set_temperature', { temperature: newTemp });
                        }}
                    >
                        <Ionicons name="thermometer" size={16} color="#3B82F6" />
                        <Text style={[styles.controlButtonText, { color: '#3B82F6' }]}>
                            {device.properties.temperature === 72 ? 'Cool' : 'Warm'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const RoomCard = ({ room }: { room: SmartRoom }) => (
        <View style={styles.roomCard}>
            <View style={styles.roomHeader}>
                <Ionicons name="home" size={24} color="#3B82F6" />
                <Text style={styles.roomName}>{room.name}</Text>
                <Text style={styles.deviceCount}>
                    {devices.filter(d => d.room === room.id).length} devices
                </Text>
            </View>

            <View style={styles.roomDevices}>
                {devices.filter(d => d.room === room.id).map(device => (
                    <View key={device.id} style={styles.roomDeviceItem}>
                        <Ionicons
                            name={getDeviceIcon(device.type)}
                            size={16}
                            color={getDeviceColor(device)}
                        />
                        <Text style={styles.roomDeviceName}>{device.name}</Text>
                        <Text style={[
                            styles.roomDeviceStatus,
                            { color: getDeviceColor(device) }
                        ]}>
                            {device.isOn ? 'On' : 'Off'}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={styles.roomAutomation}>
                <Text style={styles.automationTitle}>Automation</Text>
                <View style={styles.automationSettings}>
                    <View style={styles.automationSetting}>
                        <Text style={styles.automationLabel}>Auto Lights</Text>
                        <Switch
                            value={room.automation.lights.autoOn}
                            onValueChange={() => { }}
                            trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                            thumbColor="#FFFFFF"
                        />
                    </View>
                    <View style={styles.automationSetting}>
                        <Text style={styles.automationLabel}>Auto Temperature</Text>
                        <Switch
                            value={room.automation.temperature.autoControl}
                            onValueChange={() => { }}
                            trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                            thumbColor="#FFFFFF"
                        />
                    </View>
                </View>
            </View>
        </View>
    );

    const AutomationCard = ({ automation }: { automation: AutomationRule }) => (
        <View style={styles.automationCard}>
            <View style={styles.automationHeader}>
                <View style={styles.automationInfo}>
                    <Ionicons name="settings" size={20} color="#8B5CF6" />
                    <Text style={styles.automationName}>{automation.name}</Text>
                </View>
                <Switch
                    value={automation.enabled}
                    onValueChange={() => toggleAutomation(automation.id)}
                    trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                    thumbColor="#FFFFFF"
                />
            </View>

            <Text style={styles.automationDescription}>{automation.description}</Text>

            <View style={styles.automationDetails}>
                <Text style={styles.automationDetail}>
                    Trigger: {automation.trigger.type}
                </Text>
                <Text style={styles.automationDetail}>
                    Actions: {automation.actions.length}
                </Text>
                {automation.lastTriggered && (
                    <Text style={styles.automationDetail}>
                        Last triggered: {new Date(automation.lastTriggered).toLocaleDateString()}
                    </Text>
                )}
            </View>
        </View>
    );

    const VoiceCommandCard = ({ command }: { command: VoiceCommand }) => (
        <View style={styles.voiceCard}>
            <View style={styles.voiceHeader}>
                <Ionicons name="mic" size={20} color="#3B82F6" />
                <Text style={styles.voiceCommand}>"{command.command}"</Text>
                <Text style={styles.voiceUsage}>{command.usageCount} uses</Text>
            </View>
            <Text style={styles.voiceResponse}>{command.response}</Text>
            {command.lastUsed && (
                <Text style={styles.voiceLastUsed}>
                    Last used: {new Date(command.lastUsed).toLocaleDateString()}
                </Text>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading smart home...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <LinearGradient
                colors={['#3B82F6', '#1E40AF']}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Smart Home</Text>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={onRefresh}
                    disabled={refreshing}
                >
                    <Ionicons
                        name={refreshing ? "refresh" : "refresh-outline"}
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>
            </LinearGradient>

            {/* Status Overview */}
            {status && (
                <View style={styles.statusContainer}>
                    <View style={styles.statusItem}>
                        <Text style={styles.statusValue}>{status.onlineDevices}</Text>
                        <Text style={styles.statusLabel}>Online</Text>
                    </View>
                    <View style={styles.statusItem}>
                        <Text style={styles.statusValue}>{status.activeAutomations}</Text>
                        <Text style={styles.statusLabel}>Automations</Text>
                    </View>
                    <View style={styles.statusItem}>
                        <Text style={styles.statusValue}>{status.temperature}°F</Text>
                        <Text style={styles.statusLabel}>Temperature</Text>
                    </View>
                    <View style={styles.statusItem}>
                        <Text style={styles.statusValue}>{status.energyUsage.current}W</Text>
                        <Text style={styles.statusLabel}>Power</Text>
                    </View>
                </View>
            )}

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {[
                    { key: 'devices', label: 'Devices', icon: 'hardware-chip' as keyof typeof Ionicons.glyphMap },
                    { key: 'rooms', label: 'Rooms', icon: 'home' as keyof typeof Ionicons.glyphMap },
                    { key: 'automation', label: 'Automation', icon: 'settings' as keyof typeof Ionicons.glyphMap },
                    { key: 'voice', label: 'Voice', icon: 'mic' as keyof typeof Ionicons.glyphMap },
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[
                            styles.tab,
                            selectedTab === tab.key && styles.tabActive
                        ]}
                        onPress={() => setSelectedTab(tab.key as any)}
                    >
                        <Ionicons
                            name={tab.icon}
                            size={16}
                            color={selectedTab === tab.key ? '#3B82F6' : '#6B7280'}
                        />
                        <Text style={[
                            styles.tabText,
                            selectedTab === tab.key && styles.tabTextActive
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Devices Tab */}
                {selectedTab === 'devices' && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Smart Devices</Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setShowAddDeviceModal(true)}
                            >
                                <Ionicons name="add" size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                        {devices.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="hardware-chip" size={48} color="#9CA3AF" />
                                <Text style={styles.emptyStateTitle}>No Devices</Text>
                                <Text style={styles.emptyStateText}>
                                    Add smart devices to get started with home automation
                                </Text>
                            </View>
                        ) : (
                            devices.map((device) => (
                                <DeviceCard key={device.id} device={device} />
                            ))
                        )}
                    </View>
                )}

                {/* Rooms Tab */}
                {selectedTab === 'rooms' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Rooms</Text>

                        {rooms.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="home" size={48} color="#9CA3AF" />
                                <Text style={styles.emptyStateTitle}>No Rooms</Text>
                                <Text style={styles.emptyStateText}>
                                    Add rooms to organize your smart devices
                                </Text>
                            </View>
                        ) : (
                            rooms.map((room) => (
                                <RoomCard key={room.id} room={room} />
                            ))
                        )}
                    </View>
                )}

                {/* Automation Tab */}
                {selectedTab === 'automation' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Automation Rules</Text>

                        {automations.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="settings" size={48} color="#9CA3AF" />
                                <Text style={styles.emptyStateTitle}>No Automations</Text>
                                <Text style={styles.emptyStateText}>
                                    Create automation rules to make your home smarter
                                </Text>
                            </View>
                        ) : (
                            automations.map((automation) => (
                                <AutomationCard key={automation.id} automation={automation} />
                            ))
                        )}
                    </View>
                )}

                {/* Voice Tab */}
                {selectedTab === 'voice' && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Voice Commands</Text>
                            <TouchableOpacity
                                style={styles.voiceButton}
                                onPress={() => setShowVoiceModal(true)}
                            >
                                <Ionicons name="mic" size={20} color="white" />
                                <Text style={styles.voiceButtonText}>Speak</Text>
                            </TouchableOpacity>
                        </View>

                        {voiceCommands.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="mic" size={48} color="#9CA3AF" />
                                <Text style={styles.emptyStateTitle}>No Voice Commands</Text>
                                <Text style={styles.emptyStateText}>
                                    Use voice commands to control your smart home
                                </Text>
                            </View>
                        ) : (
                            voiceCommands.map((command) => (
                                <VoiceCommandCard key={command.id} command={command} />
                            ))
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Voice Modal */}
            <Modal
                visible={showVoiceModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Voice Assistant</Text>
                        <TouchableOpacity
                            onPress={() => setShowVoiceModal(false)}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        <View style={styles.voiceInputContainer}>
                            <TextInput
                                style={styles.voiceInput}
                                placeholder="Say something like 'turn on lights' or 'set temperature to 72'"
                                value={voiceInput}
                                onChangeText={setVoiceInput}
                                multiline
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.executeButton}
                            onPress={handleVoiceCommand}
                        >
                            <Ionicons name="send" size={20} color="white" />
                            <Text style={styles.executeButtonText}>Execute Command</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    refreshButton: {
        padding: 8,
    },
    statusContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    statusItem: {
        flex: 1,
        alignItems: 'center',
    },
    statusValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    statusLabel: {
        fontSize: 10,
        color: '#6B7280',
        marginTop: 4,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 8,
        gap: 4,
    },
    tabActive: {
        backgroundColor: '#F0F9FF',
    },
    tabText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#3B82F6',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    section: {
        marginVertical: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    addButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    voiceButton: {
        backgroundColor: '#10B981',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    voiceButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
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
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    deviceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    deviceTextInfo: {
        marginLeft: 12,
        flex: 1,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    deviceDetails: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    deviceProperties: {
        marginBottom: 12,
    },
    propertyText: {
        fontSize: 12,
        color: '#374151',
        marginBottom: 2,
    },
    deviceControls: {
        flexDirection: 'row',
        gap: 8,
    },
    controlButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        gap: 4,
    },
    secondaryButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    controlButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    roomCard: {
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
    roomHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    roomName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginLeft: 12,
        flex: 1,
    },
    deviceCount: {
        fontSize: 12,
        color: '#6B7280',
    },
    roomDevices: {
        marginBottom: 12,
    },
    roomDeviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        gap: 8,
    },
    roomDeviceName: {
        fontSize: 12,
        color: '#374151',
        flex: 1,
    },
    roomDeviceStatus: {
        fontSize: 10,
        fontWeight: '600',
    },
    roomAutomation: {
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
    },
    automationTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    automationSettings: {
        gap: 8,
    },
    automationSetting: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    automationLabel: {
        fontSize: 12,
        color: '#374151',
    },
    automationCard: {
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
    automationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    automationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    automationName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginLeft: 8,
    },
    automationDescription: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
    },
    automationDetails: {
        gap: 4,
    },
    automationDetail: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    voiceCard: {
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
    voiceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    voiceCommand: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginLeft: 8,
        flex: 1,
    },
    voiceUsage: {
        fontSize: 10,
        color: '#6B7280',
    },
    voiceResponse: {
        fontSize: 12,
        color: '#374151',
        marginBottom: 4,
    },
    voiceLastUsed: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: 'white',
        borderRadius: 12,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    closeButton: {
        padding: 8,
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    voiceInputContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    voiceInput: {
        fontSize: 16,
        color: '#1F2937',
        minHeight: 100,
        textAlignVertical: 'top',
    },
    executeButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 8,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    executeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});

export default SmartHomeScreen;





