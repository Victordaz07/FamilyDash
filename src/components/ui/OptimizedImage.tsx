/**
 * 🖼️ OPTIMIZED IMAGE COMPONENT — FamilyDash+
 * Imagen optimizada con lazy loading y caché
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useLazyImage } from '../hooks/usePerformance';

interface OptimizedImageProps {
  uri: string;
  placeholder?: string;
  style?: ViewStyle;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onPress?: () => void;
  showLoading?: boolean;
  borderRadius?: number;
  shadow?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  placeholder = 'https://via.placeholder.com/150x150/8B5CF6/FFFFFF?text=Loading',
  style,
  resizeMode = 'cover',
  onPress,
  showLoading = true,
  borderRadius = 0,
  shadow = false,
}) => {
  const { loaded, error, onLoad, onError, source } = useLazyImage(uri, placeholder);
  const [loading, setLoading] = useState(true);

  const handleLoad = useCallback(() => {
    setLoading(false);
    onLoad();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setLoading(false);
    onError();
  }, [onError]);

  const imageStyle = [
    styles.image,
    {
      borderRadius,
      shadowColor: shadow ? '#000' : 'transparent',
      shadowOffset: shadow ? { width: 0, height: 2 } : { width: 0, height: 0 },
      shadowOpacity: shadow ? 0.1 : 0,
      shadowRadius: shadow ? 4 : 0,
      elevation: shadow ? 3 : 0,
    },
    style,
  ];

  const renderImage = () => (
    <Image
      source={source}
      style={imageStyle}
      resizeMode={resizeMode}
      onLoad={handleLoad}
      onError={handleError}
    />
  );

  const renderContent = () => {
    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          {renderImage()}
        </TouchableOpacity>
      );
    }
    return renderImage();
  };

  return (
    <View style={styles.container}>
      {renderContent()}
      {showLoading && loading && (
        <View style={[styles.loadingContainer, { borderRadius }]}>
          <ActivityIndicator size="small" color="#8B5CF6" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OptimizedImage;
