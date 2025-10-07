/**
 * ✨ ANIMATION HOOKS — FamilyDash+
 * Hooks personalizados para animaciones suaves y transiciones
 */

import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

// Hook para animaciones de entrada
export const useFadeIn = (duration: number = 300, delay: number = 0) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, duration, delay]);

  return fadeAnim;
};

// Hook para animaciones de slide
export const useSlideIn = (direction: 'up' | 'down' | 'left' | 'right' = 'up', duration: number = 300) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, [slideAnim, duration]);

  const getTransform = () => {
    const distance = 50;
    switch (direction) {
      case 'up':
        return {
          translateY: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [distance, 0],
          }),
        };
      case 'down':
        return {
          translateY: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-distance, 0],
          }),
        };
      case 'left':
        return {
          translateX: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [distance, 0],
          }),
        };
      case 'right':
        return {
          translateX: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-distance, 0],
          }),
        };
      default:
        return {};
    }
  };

  return {
    slideAnim,
    transform: getTransform(),
  };
};

// Hook para animaciones de escala
export const useScaleIn = (duration: number = 300, delay: number = 0) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.elastic(1),
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, duration, delay]);

  return {
    scaleAnim,
    transform: {
      scale: scaleAnim,
    },
  };
};

// Hook para animaciones de pulso
export const usePulse = (duration: number = 1000) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };

    pulse();
  }, [pulseAnim, duration]);

  return {
    pulseAnim,
    transform: {
      scale: pulseAnim,
    },
  };
};

// Hook para animaciones de rotación
export const useRotation = (duration: number = 2000) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      })
    ).start();
  }, [rotationAnim, duration]);

  return {
    rotationAnim,
    transform: {
      rotate: rotationAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      }),
    },
  };
};

// Hook para animaciones de bounce
export const useBounce = (duration: number = 600) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(bounceAnim, {
      toValue: 1,
      duration,
      easing: Easing.bounce,
      useNativeDriver: true,
    }).start();
  }, [bounceAnim, duration]);

  return {
    bounceAnim,
    transform: {
      translateY: bounceAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, 0],
      }),
    },
  };
};

// Hook para animaciones de shimmer (carga)
export const useShimmer = (duration: number = 1500) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim, duration]);

  return {
    shimmerAnim,
    opacity: shimmerAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 1, 0.3],
    }),
  };
};

// Hook para animaciones de lista (staggered)
export const useStaggeredAnimation = (itemCount: number, delay: number = 100) => {
  const animations = useRef(
    Array.from({ length: itemCount }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animateItems = () => {
      animations.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          delay: index * delay,
          useNativeDriver: true,
        }).start();
      });
    };

    animateItems();
  }, [animations, delay]);

  return animations.map((anim, index) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
  }));
};

// Hook para animaciones de progreso
export const useProgressAnimation = (targetValue: number, duration: number = 1000) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: targetValue,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progressAnim, targetValue, duration]);

  return progressAnim;
};

// Hook para animaciones de spring
export const useSpringAnimation = (toValue: number = 1, tension: number = 100, friction: number = 8) => {
  const springAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(springAnim, {
      toValue,
      tension,
      friction,
      useNativeDriver: true,
    }).start();
  }, [springAnim, toValue, tension, friction]);

  return springAnim;
};
