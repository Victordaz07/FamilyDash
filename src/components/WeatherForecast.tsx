/**
 * WeatherForecast Component for New Event Modal
 * Shows weather forecast for the selected date
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { weatherService, WeatherData } from '@/services/weatherService';

interface WeatherForecastProps {
    selectedDate: string;
    onWeatherChange?: (weather: WeatherData | null) => void;
}

export const WeatherForecast: React.FC<WeatherForecastProps> = ({
    selectedDate,
    onWeatherChange
}) => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (selectedDate) {
            loadWeatherForDate(selectedDate);
        }
    }, [selectedDate]);

    const loadWeatherForDate = async (date: string) => {
        setLoading(true);
        setError(null);

        try {
            const weatherData = await weatherService.getWeatherForDate(date);
            setWeather(weatherData);
            onWeatherChange?.(weatherData);
        } catch (err) {
            setError('Unable to load weather data');
            console.error('Error loading weather for date:', err);
        } finally {
            setLoading(false);
        }
    };

    const getTemperatureColor = (temp: number) => {
        if (temp < 10) return '#4A90E2'; // Cold - Blue
        if (temp < 20) return '#7ED321'; // Cool - Green
        if (temp < 30) return '#F5A623'; // Warm - Orange
        return '#D0021B'; // Hot - Red
    };

    const getActivityRecommendation = (condition: WeatherData['condition']) => {
        const recommendations = {
            sunny: 'Perfect for outdoor activities!',
            cloudy: 'Good for flexible indoor/outdoor plans',
            rainy: 'Consider indoor alternatives',
            'partly-cloudy': 'Mixed conditions, plan accordingly',
            stormy: 'Stay indoors, avoid outdoor activities',
            snowy: 'Winter activities recommended'
        };
        return recommendations[condition];
    };

    const getWeatherIcon = (condition: WeatherData['condition']) => {
        const icons = {
            sunny: '☀️',
            cloudy: '☁️',
            rainy: '🌧️',
            stormy: '⛈️',
            snowy: '❄️',
            'partly-cloudy': '⛅'
        };
        return icons[condition];
    };

    if (!selectedDate) {
        return (
            <View style={styles.container}>
                <View style={styles.placeholderCard}>
                    <Ionicons name="calendar-outline" size={24} color="#9CA3AF" />
                    <Text style={styles.placeholderText}>Select a date to see weather forecast</Text>
                </View>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingCard}>
                    <Ionicons name="cloud-outline" size={24} color="#6B7280" />
                    <Text style={styles.loadingText}>Loading weather forecast...</Text>
                </View>
            </View>
        );
    }

    if (error || !weather) {
        return (
            <View style={styles.container}>
                <View style={styles.errorCard}>
                    <Ionicons name="warning-outline" size={24} color="#EF4444" />
                    <Text style={styles.errorText}>Weather data unavailable</Text>
                </View>
            </View>
        );
    }

    const date = new Date(selectedDate);
    const dayName = date.toLocaleDateString('en', { weekday: 'long' });
    const monthDay = date.toLocaleDateString('en', { month: 'short', day: 'numeric' });

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.weatherCard}
            >
                <View style={styles.weatherHeader}>
                    <View style={styles.weatherInfo}>
                        <Text style={styles.weatherDate}>{dayName}, {monthDay}</Text>
                        <Text style={styles.weatherCondition}>{weather.description}</Text>
                    </View>
                    <View style={styles.weatherIcon}>
                        <Text style={styles.weatherEmoji}>{getWeatherIcon(weather.condition)}</Text>
                    </View>
                </View>

                <View style={styles.weatherDetails}>
                    <View style={styles.temperatureSection}>
                        <Text style={[
                            styles.temperature,
                            { color: getTemperatureColor(weather.temperature.current) }
                        ]}>
                            {weather.temperature.current}°
                        </Text>
                        <Text style={styles.temperatureRange}>
                            {weather.temperature.min}° - {weather.temperature.max}°
                        </Text>
                    </View>

                    <View style={styles.weatherStats}>
                        <View style={styles.statItem}>
                            <Ionicons name="water" size={14} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.statText}>{weather.humidity}%</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="leaf" size={14} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.statText}>{weather.windSpeed} km/h</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.recommendationSection}>
                    <Text style={styles.recommendationText}>
                        💡 {getActivityRecommendation(weather.condition)}
                    </Text>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    weatherCard: {
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 4,
    },
    weatherHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    weatherInfo: {
        flex: 1,
    },
    weatherDate: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 2,
    },
    weatherCondition: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    weatherIcon: {
        alignItems: 'center',
    },
    weatherEmoji: {
        fontSize: 32,
    },
    weatherDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    temperatureSection: {
        alignItems: 'flex-start',
    },
    temperature: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    temperatureRange: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
    },
    weatherStats: {
        flexDirection: 'row',
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '500',
    },
    recommendationSection: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 8,
    },
    recommendationText: {
        fontSize: 12,
        color: 'white',
        textAlign: 'center',
        fontWeight: '500',
    },

    // Placeholder/Loading/Error States
    placeholderCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    placeholderText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
        textAlign: 'center',
    },
    loadingCard: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
    },
    errorCard: {
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    errorText: {
        fontSize: 14,
        color: '#EF4444',
        marginTop: 8,
    },
});
