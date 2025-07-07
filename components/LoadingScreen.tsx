import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Wallet, Sparkles, Zap } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Complex logo animations
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    
    const sparkleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    );

    pulseAnimation.start();
    sparkleAnimation.start();
    rotateAnimation.start();

    // Auto-complete loading after 3 seconds
    const timer = setTimeout(() => {
      onLoadingComplete?.();
    }, 3000);

    return () => {
      clearTimeout(timer);
      pulseAnimation.stop();
      sparkleAnimation.stop();
      rotateAnimation.stop();
    };
  }, [fadeAnim, scaleAnim, pulseAnim, sparkleAnim, rotateAnim, onLoadingComplete]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={styles.logoBackground}>
            {/* Main Mosaic Logo */}
            <View style={styles.mosaicLogo}>
              <Wallet size={32} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            
            {/* Rotating Ring */}
            <Animated.View 
              style={[
                styles.rotatingRing,
                {
                  transform: [{ rotate: rotateInterpolate }],
                },
              ]}
            >
              <View style={styles.ringDot} />
              <View style={[styles.ringDot, styles.ringDot2]} />
              <View style={[styles.ringDot, styles.ringDot3]} />
            </Animated.View>
            
            {/* Sparkle Effects */}
            <Animated.View 
              style={[
                styles.sparkle,
                styles.sparkle1,
                { opacity: sparkleAnim }
              ]}
            >
              <Sparkles size={12} color="#FFFFFF" />
            </Animated.View>
            <Animated.View 
              style={[
                styles.sparkle,
                styles.sparkle2,
                { opacity: sparkleAnim }
              ]}
            >
              <Zap size={10} color="#FFFFFF" />
            </Animated.View>
          </View>
        </Animated.View>
        
        <Text style={styles.appName}>Mosaic</Text>
        <Text style={styles.tagline}>Smart Group Finance</Text>
        
        <View style={styles.loadingIndicator}>
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, styles.dot1]} />
            <Animated.View style={[styles.dot, styles.dot2]} />
            <Animated.View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </Animated.View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Loading your financial insights...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    marginBottom: 32,
    position: 'relative',
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  mosaicLogo: {
    zIndex: 3,
  },
  rotatingRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    top: -2,
  },
  ringDot2: {
    transform: [{ rotate: '120deg' }],
  },
  ringDot3: {
    transform: [{ rotate: '240deg' }],
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: 15,
    right: 15,
  },
  sparkle2: {
    bottom: 20,
    left: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  loadingIndicator: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  dot1: {
    animationDelay: '0ms',
  },
  dot2: {
    animationDelay: '150ms',
  },
  dot3: {
    animationDelay: '300ms',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter-Regular',
    letterSpacing: 0.5,
  },
});