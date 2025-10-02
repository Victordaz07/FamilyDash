import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../styles/simpleTheme';

interface PenaltyRouletteProps {
    durationOptions: number[];
    penaltyType: 'yellow' | 'red';
    onResult: (duration: number) => void;
    onClose: () => void;
}

const PenaltyRoulette: React.FC<PenaltyRouletteProps> = ({
    durationOptions,
    penaltyType,
    onResult,
    onClose,
}) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
    const [spinAngle, setSpinAngle] = useState(0);

    const screenWidth = Dimensions.get('window').width;
    const rouletteSize = Math.min(screenWidth * 0.8, 300);
    const radius = rouletteSize / 2 - 20;

    const penaltyTypeConfig = {
        yellow: {
            color: '#F59E0B',
            name: 'Tarjeta Amarilla',
            icon: 'warning',
        },
        red: {
            color: '#EF4444',
            name: 'Tarjeta Roja',
            icon: 'close-circle',
        },
    };

    const config = penaltyTypeConfig[penaltyType];

    const spinRoulette = () => {
        if (isSpinning) return;

        setIsSpinning(true);
        setSelectedDuration(null);

        // Generate random spin (multiple full rotations + random angle)
        const baseRotations = 5 + Math.random() * 3; // 5-8 full rotations
        const randomAngle = Math.random() * 360;
        const totalAngle = baseRotations * 360 + randomAngle;

        setSpinAngle(totalAngle);

        // Simulate spinning time
        setTimeout(() => {
            const finalAngle = totalAngle % 360;
            const segmentAngle = 360 / durationOptions.length;
            const selectedIndex = Math.floor(finalAngle / segmentAngle);
            const result = durationOptions[selectedIndex];

            setSelectedDuration(result);
            setIsSpinning(false);

            // Auto-close after showing result
            setTimeout(() => {
                onResult(result);
            }, 2000);
        }, 3000);
    };

    const renderRouletteSegments = () => {
        const segmentAngle = 360 / durationOptions.length;

        return durationOptions.map((duration, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = (index + 1) * segmentAngle;
            const midAngle = (startAngle + endAngle) / 2;

            // Calculate position for text
            const textRadius = radius * 0.7;
            const textX = Math.cos((midAngle * Math.PI) / 180) * textRadius;
            const textY = Math.sin((midAngle * Math.PI) / 180) * textRadius;

            return (
                <View
                    key={duration}
                    style={[
                        styles.segment,
                        {
                            transform: [
                                { rotate: `${startAngle}deg` },
                                { translateX: radius },
                                { translateY: radius },
                            ],
                        },
                    ]}
                >
                    <View style={styles.segmentContent}>
                        <Text
                            style={[
                                styles.segmentText,
                                {
                                    transform: [
                                        { translateX: textX },
                                        { translateY: textY },
                                    ],
                                },
                            ]}
                        >
                            {duration}d
                        </Text>
                    </View>
                </View>
            );
        });
    };

    return (
        <View style={styles.overlay}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Ruleta de {config.name}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={theme.colors.gray} />
                    </TouchableOpacity>
                </View>

                <View style={styles.rouletteContainer}>
                    <View
                        style={[
                            styles.roulette,
                            {
                                width: rouletteSize,
                                height: rouletteSize,
                                borderRadius: rouletteSize / 2,
                                transform: [{ rotate: `${spinAngle}deg` }],
                            },
                        ]}
                    >
                        {renderRouletteSegments()}
                    </View>

                    {/* Center pointer */}
                    <View style={styles.pointer}>
                        <Ionicons name="triangle" size={20} color={config.color} />
                    </View>
                </View>

                {selectedDuration && (
                    <View style={styles.resultContainer}>
                        <LinearGradient
                            colors={[config.color, config.color + '80']}
                            style={styles.resultCard}
                        >
                            <Ionicons name={config.icon as any} size={32} color="white" />
                            <Text style={styles.resultText}>
                                ¡{selectedDuration} días de penalidad!
                            </Text>
                        </LinearGradient>
                    </View>
                )}

                <TouchableOpacity
                    style={[
                        styles.spinButton,
                        isSpinning && styles.spinButtonDisabled,
                        { backgroundColor: config.color },
                    ]}
                    onPress={spinRoulette}
                    disabled={isSpinning}
                >
                    <LinearGradient
                        colors={[config.color, config.color + 'CC']}
                        style={styles.spinButtonGradient}
                    >
                        <Ionicons
                            name={isSpinning ? "refresh" : "play"}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.spinButtonText}>
                            {isSpinning ? 'Girando...' : 'Girar Ruleta'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.instructions}>
                    Toca el botón para girar la ruleta y ver cuántos días de penalidad tendrás
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    container: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        width: '90%',
        maxWidth: 400,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
    },
    closeButton: {
        padding: 8,
    },
    rouletteContainer: {
        position: 'relative',
        marginBottom: 24,
    },
    roulette: {
        backgroundColor: '#F3F4F6',
        borderWidth: 4,
        borderColor: '#E5E7EB',
        position: 'relative',
        overflow: 'hidden',
    },
    segment: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    segmentContent: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    segmentText: {
        fontSize: 16,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
        backgroundColor: 'white',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    pointer: {
        position: 'absolute',
        top: -10,
        left: '50%',
        transform: [{ translateX: -10 }],
        zIndex: 10,
    },
    resultContainer: {
        marginBottom: 24,
        width: '100%',
    },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        justifyContent: 'center',
    },
    resultText: {
        fontSize: 18,
        fontWeight: theme.typography.fontWeight.bold,
        color: 'white',
        marginLeft: 12,
    },
    spinButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        width: '100%',
    },
    spinButtonDisabled: {
        opacity: 0.6,
    },
    spinButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    spinButtonText: {
        fontSize: 16,
        fontWeight: theme.typography.fontWeight.bold,
        color: 'white',
        marginLeft: 8,
    },
    instructions: {
        fontSize: 14,
        color: theme.colors.gray,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default PenaltyRoulette;
