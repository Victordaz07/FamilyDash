import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

interface PenaltyTimerProps {
    remaining: number; // in minutes
    duration: number; // in minutes
    size?: number;
    strokeWidth?: number;
    showText?: boolean;
}

const PenaltyTimer: React.FC<PenaltyTimerProps> = ({
    remaining,
    duration,
    size = 120,
    strokeWidth = 8,
    showText = true
}) => {
    const [displayTime, setDisplayTime] = useState(remaining);

    useEffect(() => {
        setDisplayTime(remaining);
    }, [remaining]);

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = duration > 0 ? (duration - remaining) / duration : 0;
    const strokeDashoffset = circumference - (progress * circumference);

    const formatTime = (minutes: number) => {
        const mins = Math.floor(minutes);
        const secs = Math.floor((minutes - mins) * 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgressColor = () => {
        if (remaining <= 0) return '#10B981'; // Green - completed
        if (remaining / duration < 0.25) return '#EF4444'; // Red - almost done
        if (remaining / duration < 0.5) return '#F59E0B'; // Orange - halfway
        return '#3B82F6'; // Blue - plenty of time
    };

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size} style={styles.svg}>
                {/* Background circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#E5E7EB"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />

                {/* Progress circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={getProgressColor()}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>

            {showText && (
                <View style={styles.textContainer}>
                    <Text style={[styles.timeText, { color: getProgressColor() }]}>
                        {formatTime(displayTime)}
                    </Text>
                    <Text style={styles.labelText}>
                        {remaining <= 0 ? 'Done!' : 'remaining'}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    svg: {
        position: 'absolute',
    },
    textContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    labelText: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
});

export default PenaltyTimer;
