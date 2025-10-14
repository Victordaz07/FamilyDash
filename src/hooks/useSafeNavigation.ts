import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

export const useSafeNavigation = () => {
    try {
        const navigation = useNavigation();

        const safeGoBack = useCallback(() => {
            try {
                if (navigation && typeof navigation.goBack === 'function') {
                    navigation.goBack();
                }
            } catch (error) {
                console.warn('Navigation error:', error);
            }
        }, [navigation]);

        const safeNavigate = useCallback((routeName: string, params?: any) => {
            try {
                if (navigation && typeof navigation.navigate === 'function') {
                    navigation.navigate(routeName as never, params);
                }
            } catch (error) {
                console.warn('Navigation error:', error);
            }
        }, [navigation]);

        return {
            safeGoBack,
            safeNavigate,
            navigation
        };
    } catch (error) {
        console.warn('useSafeNavigation initialization error:', error);
        return {
            safeGoBack: () => {},
            safeNavigate: () => {},
            navigation: null
        };
    }
};
