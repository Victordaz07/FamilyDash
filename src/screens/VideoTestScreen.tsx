/**
 * 🎥 Video Test Screen - Pantalla para probar el reproductor de video
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { VideoTestComponent } from '@/components/VideoTestComponent';

interface VideoTestScreenProps {
    navigation: any;
}

export default function VideoTestScreen({ navigation }: VideoTestScreenProps) {
    const [customUri, setCustomUri] = useState('');
    const [currentUri, setCurrentUri] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');

    const testVideos = [
        {
            name: 'Big Buck Bunny',
            uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        },
        {
            name: 'Elephant Dream',
            uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
        },
        {
            name: 'For Bigger Blazes',
            uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
        },
        {
            name: 'For Bigger Escapes',
            uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
        },
        {
            name: 'For Bigger Fun',
            uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
        },
    ];

    const handleVideoSelect = (uri: string) => {
        setCurrentUri(uri);
    };

    const handleCustomVideo = () => {
        if (customUri.trim()) {
            setCurrentUri(customUri.trim());
        } else {
            Alert.alert('Error', 'Por favor ingresa una URL válida');
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>🎥 Prueba de Video</Text>
                        <Text style={styles.headerSubtitle}>Test del reproductor de video</Text>
                    </View>
                    <View style={styles.headerSpacer} />
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Video Player */}
                <View style={styles.section}>
                    <VideoTestComponent videoUri={currentUri} />
                </View>

                {/* Video Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📹 Videos de Prueba</Text>
                    <Text style={styles.sectionSubtitle}>Selecciona un video para probar:</Text>

                    {testVideos.map((video, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.videoOption,
                                currentUri === video.uri && styles.videoOptionSelected
                            ]}
                            onPress={() => handleVideoSelect(video.uri)}
                        >
                            <View style={styles.videoOptionLeft}>
                                <Ionicons
                                    name="videocam"
                                    size={20}
                                    color={currentUri === video.uri ? '#8B5CF6' : '#666'}
                                />
                                <Text style={[
                                    styles.videoOptionText,
                                    currentUri === video.uri && styles.videoOptionTextSelected
                                ]}>
                                    {video.name}
                                </Text>
                            </View>
                            {currentUri === video.uri && (
                                <Ionicons name="checkmark-circle" size={20} color="#8B5CF6" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Custom Video URL */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🔗 Video Personalizado</Text>
                    <Text style={styles.sectionSubtitle}>Ingresa una URL de video:</Text>

                    <View style={styles.customVideoContainer}>
                        <TextInput
                            style={styles.urlInput}
                            placeholder="https://example.com/video.mp4"
                            value={customUri}
                            onChangeText={setCustomUri}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TouchableOpacity
                            style={styles.loadButton}
                            onPress={handleCustomVideo}
                        >
                            <LinearGradient
                                colors={['#8B5CF6', '#7C3AED']}
                                style={styles.loadButtonGradient}
                            >
                                <Ionicons name="download" size={16} color="white" />
                                <Text style={styles.loadButtonText}>Cargar</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ℹ️ Información</Text>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoText}>
                            • Este es un componente de prueba para verificar que el reproductor de video funciona correctamente
                        </Text>
                        <Text style={styles.infoText}>
                            • Usa expo-video para la reproducción
                        </Text>
                        <Text style={styles.infoText}>
                            • Los videos se reproducen en modo muted por defecto
                        </Text>
                        <Text style={styles.infoText}>
                            • Si hay errores, se mostrará un mensaje de error
                        </Text>
                    </View>
                </View>

                {/* Current URI Display */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📍 URI Actual</Text>
                    <View style={styles.uriContainer}>
                        <Text style={styles.uriText}>{currentUri}</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

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
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    videoOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    videoOptionSelected: {
        borderColor: '#8B5CF6',
        backgroundColor: '#F3E8FF',
    },
    videoOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    videoOptionText: {
        fontSize: 14,
        color: '#374151',
        marginLeft: 12,
        flex: 1,
    },
    videoOptionTextSelected: {
        color: '#8B5CF6',
        fontWeight: '600',
    },
    customVideoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    urlInput: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        fontSize: 14,
    },
    loadButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    loadButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 6,
    },
    loadButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    infoCard: {
        backgroundColor: '#EFF6FF',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
    },
    infoText: {
        fontSize: 14,
        color: '#1E40AF',
        marginBottom: 8,
        lineHeight: 20,
    },
    uriContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    uriText: {
        fontSize: 12,
        color: '#6B7280',
        fontFamily: 'monospace',
    },
});
