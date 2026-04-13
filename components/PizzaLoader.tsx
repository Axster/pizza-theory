import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

interface PizzaLoaderProps {
  message?: string;
}

export function PizzaLoader({ message = 'Impastando...' }: PizzaLoaderProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.pizza, { transform: [{ rotate: spin }] }]}>
        🍕
      </Animated.Text>
      <Text variant="titleMedium" style={styles.message}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)', // semi-transparent overlay
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  pizza: {
    fontSize: 80,
  },
  message: {
    marginTop: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
});
