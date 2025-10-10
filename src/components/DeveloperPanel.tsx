import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { height: screenHeight } = Dimensions.get('window');

interface DeveloperPanelProps {
    visible: boolean;
    onClose: () => void;
    onNavigate: (screen: string) => void;
}

export const DeveloperPanel: React.FC<DeveloperPanelProps> = ({ visible, onClose, onNavigate }) => {
    const [translateY] = useState(new Animated.Value(screenHeight));
    const [opacity] = useState(new Animated.Value(0));

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: screenHeight,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const tools = [
        {
            id: 'firebase',
            title: 'Firebase Test',
            subtitle: 'Live Firebase Testing',
            icon: 'flame',
            colors: ['#8B5CF6', '#06B6D4'] as const,
            screen: 'FirebaseTestLive'
        },
        {
            id: 'sync',
            title: 'Sync Testing',
            subtitle: 'Multi-device sync test',
            icon: 'sync',
            colors: ['#FF6B6B', '#4ECDC4'] as const,
            screen: 'SyncTesting'
        },
        {
            id: 'debug',
            title: 'Debug Mode',
            subtitle: 'Error detection & auto-fix',
            icon: 'bug',
            colors: ['#9C27B0', '#673AB7'] as const,
            screen: 'DebugDashboard'
        },
        {
            id: 'testing',
            title: 'Testing Reports',
            subtitle: 'Comprehensive Firebase tests',
            icon: 'checkmark-circle',
            colors: ['#00BCD4', '#0097A7'] as const,
            screen: 'TestingReports'
        }
    ];

    if (!visible) return null;

    return (
        <Animated.View style={[styles.overlay, { opacity }]}>
            <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

            <Animated.View style={[styles.panel, { transform: [{ translateY }] }]}>
                <LinearGradient
                    colors={['#1F2937', '#111827'] as const}
                    style={styles.panelGradient}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <Ionicons name="code-slash" size={24} color="#10B981" />
                            <Text style={styles.headerTitle}>Developer Tools</Text>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Tools Grid */}
                    <View style={styles.toolsGrid}>
                        {tools.map((tool, index) => (
                            <TouchableOpacity
                                key={tool.id}
                                style={styles.toolCard}
                                onPress={() => {
                                    onNavigate(tool.screen);
                                    onClose();
                                }}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={tool.colors}
                                    style={styles.toolGradient}
                                >
                                    <View style={styles.toolIcon}>
                                        <Ionicons name={tool.icon as any} size={28} color="white" />
                                    </View>
                                    <View style={styles.toolContent}>
                                        <Text style={styles.toolTitle}>{tool.title}</Text>
                                        <Text style={styles.toolSubtitle}>{tool.subtitle}</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Swipe down or tap outside to close</Text>
                    </View>
                </LinearGradient>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    panel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: screenHeight * 0.7,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    panelGradient: {
        flex: 1,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '700',
        marginLeft: 12,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    toolsGrid: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    toolCard: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    toolGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    toolIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    toolContent: {
        flex: 1,
    },
    toolTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    toolSubtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
    },
    footer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
    },
});
