/**
 * Weather Service
 * Mock weather service for family calendar planning
 */

export interface WeatherData {
    date: string;
    temperature: {
        min: number;
        max: number;
        current: number;
    };
    condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'partly-cloudy';
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
    recommendations: string[];
}

export interface WeeklyWeather {
    location: string;
    current: WeatherData;
    forecast: WeatherData[];
    lastUpdated: Date;
}

class WeatherService {
    private weatherData: WeeklyWeather | null = null;

    // Mock weather data generator
    private generateMockWeather(): WeeklyWeather {
        const today = new Date();
        const forecast: WeatherData[] = [];

        const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy', 'partly-cloudy', 'stormy'];
        const descriptions = {
            sunny: 'Clear skies, perfect for outdoor activities',
            cloudy: 'Overcast skies, good for indoor family time',
            rainy: 'Rain expected, plan indoor activities',
            'partly-cloudy': 'Mixed conditions, flexible planning',
            stormy: 'Severe weather, stay indoors',
            snowy: 'Snow expected, winter activities'
        };

        const recommendations = {
            sunny: ['Family picnic', 'Outdoor games', 'Garden activities', 'Park visit'],
            cloudy: ['Indoor crafts', 'Movie night', 'Board games', 'Cooking together'],
            rainy: ['Indoor activities', 'Reading time', 'Puzzle solving', 'Home projects'],
            'partly-cloudy': ['Flexible outdoor plans', 'Indoor backup activities'],
            stormy: ['Stay indoors', 'Emergency preparedness', 'Indoor entertainment'],
            snowy: ['Snow activities', 'Hot chocolate time', 'Winter crafts']
        };

        // Generate 7-day forecast
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const condition = conditions[Math.floor(Math.random() * conditions.length)];
            const baseTemp = 20 + Math.random() * 15; // 20-35°C

            forecast.push({
                date: date.toISOString().split('T')[0],
                temperature: {
                    min: Math.round(baseTemp - 5),
                    max: Math.round(baseTemp + 5),
                    current: Math.round(baseTemp)
                },
                condition,
                humidity: Math.round(40 + Math.random() * 40), // 40-80%
                windSpeed: Math.round(5 + Math.random() * 15), // 5-20 km/h
                description: descriptions[condition],
                icon: this.getWeatherIcon(condition),
                recommendations: recommendations[condition]
            });
        }

        return {
            location: 'Family Home',
            current: forecast[0],
            forecast,
            lastUpdated: new Date()
        };
    }

    private getWeatherIcon(condition: WeatherData['condition']): string {
        const icons = {
            sunny: '☀️',
            cloudy: '☁️',
            rainy: '🌧️',
            stormy: '⛈️',
            snowy: '❄️',
            'partly-cloudy': '⛅'
        };
        return icons[condition];
    }

    // Get current weather
    async getCurrentWeather(): Promise<WeatherData> {
        if (!this.weatherData) {
            this.weatherData = this.generateMockWeather();
        }
        return this.weatherData.current;
    }

    // Get weekly forecast
    async getWeeklyForecast(): Promise<WeeklyWeather> {
        if (!this.weatherData) {
            this.weatherData = this.generateMockWeather();
        }
        return this.weatherData;
    }

    // Get weather for specific date
    async getWeatherForDate(date: string): Promise<WeatherData | null> {
        const weekly = await this.getWeeklyForecast();
        return weekly.forecast.find(day => day.date === date) || null;
    }

    // Refresh weather data
    async refreshWeather(): Promise<WeeklyWeather> {
        this.weatherData = this.generateMockWeather();
        return this.weatherData;
    }

    // Get activity recommendations based on weather
    getActivityRecommendations(condition: WeatherData['condition']): string[] {
        const recommendations = {
            sunny: ['Family picnic', 'Outdoor games', 'Garden activities', 'Park visit', 'Bike ride'],
            cloudy: ['Indoor crafts', 'Movie night', 'Board games', 'Cooking together', 'Art projects'],
            rainy: ['Indoor activities', 'Reading time', 'Puzzle solving', 'Home projects', 'Baking'],
            'partly-cloudy': ['Flexible outdoor plans', 'Indoor backup activities', 'Short outdoor walks'],
            stormy: ['Stay indoors', 'Emergency preparedness', 'Indoor entertainment', 'Family games'],
            snowy: ['Snow activities', 'Hot chocolate time', 'Winter crafts', 'Indoor winter sports']
        };
        return recommendations[condition];
    }
}

export const weatherService = new WeatherService();




