import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface PenaltyTimerProps {
    remainingMinutes: number;
    totalMinutes: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    backgroundColor?: string;
    showDays?: boolean; // Show days instead of time
}

const PenaltyTimer: React.FC<PenaltyTimerProps> = ({
    remainingMinutes,
    totalMinutes,
    size = 80,
    strokeWidth = 8,
    color = '#8B5CF6',
    backgroundColor = '#E5E7EB',
    showDays = false,
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = totalMinutes > 0 ? (remainingMinutes / totalMinutes) : 0;
    const strokeDashoffset = circumference * (1 - progress);

    const formatTime = () => {
        if (showDays) {
            const days = Math.floor(remainingMinutes / (24 * 60));
            const hours = Math.floor((remainingMinutes % (24 * 60)) / 60);

            if (days > 0) {
                return `${days}d ${hours}h`;
            } else {
                return `${hours}h`;
            }
        } else {
            const minutes = Math.floor(remainingMinutes);
            const seconds = Math.round((remainingMinutes - minutes) * 60);
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    };

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background circle */}
                <Circle
                    stroke={backgroundColor}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <Circle
                    stroke={color}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>

            {/* Text overlay */}
            <View style={styles.textContainer}>
                <Text style={[styles.timeText, { fontSize: size / (showDays ? 4 : 3.5) }]}>
                    {formatTime()}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeText: {
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
    },
});

export default PenaltyTimer;