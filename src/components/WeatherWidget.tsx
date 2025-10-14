/**
 * WeatherWidget Component
 * Displays current weather and weekly forecast
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { weatherService, WeatherData, WeeklyWeather } from '@/services/weatherService';

interface WeatherWidgetProps {
    visible: boolean;
    onClose: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ visible, onClose }) => {
    const [weatherData, setWeatherData] = useState<WeeklyWeather | null>(null);
    const [loading, setLoading] = useState(false);
    const [slideAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        if (visible) {
            loadWeatherData();
            // Slide in animation
            Animated.timing(slideAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            // Slide out animation
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const loadWeatherData = async () => {
        setLoading(true);
        try {
            const data = await weatherService.getWeeklyForecast();
            setWeatherData(data);
        } catch (error) {
            console.error('Error loading weather:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshWeather = async () => {
        setLoading(true);
        try {
            const data = await weatherService.refreshWeather();
            setWeatherData(data);
        } catch (error) {
            console.error('Error refreshing weather:', error);
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

    const renderCurrentWeather = (current: WeatherData) => (
        <View style={styles.currentWeatherCard}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.currentWeatherGradient}
            >
                <View style={styles.currentWeatherHeader}>
                    <View style={styles.currentWeatherInfo}>
                        <Text style={styles.currentTemp}>{current.temperature.current}°</Text>
                        <Text style={styles.currentCondition}>{current.description}</Text>
                        <Text style={styles.currentLocation}>📍 {weatherData?.location}</Text>
                    </View>
                    <View style={styles.currentWeatherIcon}>
                        <Text style={styles.weatherEmoji}>{current.icon}</Text>
                    </View>
                </View>

                <View style={styles.currentWeatherDetails}>
                    <View style={styles.weatherDetail}>
                        <Ionicons name="thermometer" size={16} color="white" />
                        <Text style={styles.weatherDetailText}>
                            {current.temperature.min}° - {current.temperature.max}°
                        </Text>
                    </View>
                    <View style={styles.weatherDetail}>
                        <Ionicons name="water" size={16} color="white" />
                        <Text style={styles.weatherDetailText}>{current.humidity}%</Text>
                    </View>
                    <View style={styles.weatherDetail}>
                        <Ionicons name="leaf" size={16} color="white" />
                        <Text style={styles.weatherDetailText}>{current.windSpeed} km/h</Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    const renderForecastDay = (day: WeatherData, index: number) => {
        const date = new Date(day.date);
        const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en', { weekday: 'short' });

        return (
            <View key={day.date} style={styles.forecastDay}>
                <View style={styles.forecastDayHeader}>
                    <Text style={styles.forecastDayName}>{dayName}</Text>
                    <Text style={styles.forecastDate}>{date.getDate()}</Text>
                </View>

                <View style={styles.forecastDayContent}>
                    <Text style={styles.forecastIcon}>{day.icon}</Text>
                    <View style={styles.forecastTemps}>
                        <Text style={[styles.forecastTemp, { color: getTemperatureColor(day.temperature.max) }]}>
                            {day.temperature.max}°
                        </Text>
                        <Text style={styles.forecastTempMin}>{day.temperature.min}°</Text>
                    </View>
                </View>

                <Text style={styles.forecastDescription} numberOfLines={2}>
                    {day.description}
                </Text>
            </View>
        );
    };

    const renderRecommendations = (current: WeatherData) => (
        <View style={styles.recommendationsCard}>
            <Text style={styles.recommendationsTitle}>🌤️ Family Activity Suggestions</Text>
            <View style={styles.recommendationsList}>
                {current.recommendations.slice(0, 3).map((activity, index) => (
                    <View key={index} style={styles.recommendationItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                        <Text style={styles.recommendationText}>{activity}</Text>
                    </View>
                ))}
            </View>
        </View>
    );

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.weatherContainer,
                {
                    transform: [{
                        translateY: slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-300, 0]
                        })
                    }],
                    opacity: slideAnim
                }
            ]}
        >
            <View style={styles.weatherHeader}>
                <Text style={styles.weatherTitle}>🌤️ Weekly Weather</Text>
                <View style={styles.weatherActions}>
                    <TouchableOpacity onPress={refreshWeather} disabled={loading}>
                        <Ionicons
                            name={loading ? "refresh" : "refresh-outline"}
                            size={20}
                            color="#6B7280"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading weather data...</Text>
                </View>
            ) : weatherData ? (
                <ScrollView style={styles.weatherContent} showsVerticalScrollIndicator={false}>
                    {renderCurrentWeather(weatherData.current)}

                    <View style={styles.forecastSection}>
                        <Text style={styles.forecastTitle}>7-Day Forecast</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.forecastContainer}>
                                {weatherData.forecast.map(renderForecastDay)}
                            </View>
                        </ScrollView>
                    </View>

                    {renderRecommendations(weatherData.current)}

                    <View style={styles.lastUpdated}>
                        <Text style={styles.lastUpdatedText}>
                            Last updated: {weatherData.lastUpdated.toLocaleTimeString()}
                        </Text>
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Unable to load weather data</Text>
                    <TouchableOpacity onPress={loadWeatherData} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    weatherContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        margin: 16,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    weatherHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    weatherTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    weatherActions: {
        flexDirection: 'row',
        gap: 12,
    },
    weatherContent: {
        flex: 1,
    },
    loadingContainer: {
        padding: 32,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#6B7280',
    },
    errorContainer: {
        padding: 32,
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: '500',
    },

    // Current Weather Styles
    currentWeatherCard: {
        margin: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    currentWeatherGradient: {
        padding: 20,
    },
    currentWeatherHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    currentWeatherInfo: {
        flex: 1,
    },
    currentTemp: {
        fontSize: 48,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    currentCondition: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 4,
    },
    currentLocation: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    currentWeatherIcon: {
        alignItems: 'center',
    },
    weatherEmoji: {
        fontSize: 48,
    },
    currentWeatherDetails: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    weatherDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    weatherDetailText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },

    // Forecast Styles
    forecastSection: {
        margin: 16,
    },
    forecastTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    forecastContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    forecastDay: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        minWidth: 100,
        alignItems: 'center',
    },
    forecastDayHeader: {
        alignItems: 'center',
        marginBottom: 8,
    },
    forecastDayName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
    forecastDate: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    forecastDayContent: {
        alignItems: 'center',
        marginBottom: 8,
    },
    forecastIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    forecastTemps: {
        alignItems: 'center',
    },
    forecastTemp: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    forecastTempMin: {
        fontSize: 12,
        color: '#6B7280',
    },
    forecastDescription: {
        fontSize: 10,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 14,
    },

    // Recommendations Styles
    recommendationsCard: {
        margin: 16,
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#10B981',
    },
    recommendationsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    recommendationsList: {
        gap: 8,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    recommendationText: {
        fontSize: 14,
        color: '#374151',
        flex: 1,
    },

    // Last Updated
    lastUpdated: {
        padding: 16,
        alignItems: 'center',
    },
    lastUpdatedText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});
