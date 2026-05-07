/**
 * SliderField — Molecule for a standard slider (e.g., Temperature).
 * NOTE: This file is used ONLY on iOS/Android.
 * Metro automatically selects SliderField.web.tsx for the browser.
 */
import React, { useState } from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  /** Left→Right gradient colors (min 2 values) */
  gradientColors?: string[];
  /** Thumb and track color if not using a gradient */
  trackColor?: string;
}

const SIDE_PAD = 14; // internal card padding
const SLIDER_INNER_PAD = 14; // native RN slider side padding

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  gradientColors = ['#F5C842', '#E8502A', '#C0392B'],
  trackColor = '#FF6347',
}: SliderFieldProps) {
  const theme = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);

  // ─── MOBILE: Gradient slider with 🍕 thumb ────────────────────────────────
  const fraction = containerWidth > 0 ? (value - min) / (max - min) : 0;
  const trackEffectiveWidth = containerWidth - SLIDER_INNER_PAD * 2;
  const pizzaX = SLIDER_INNER_PAD + fraction * trackEffectiveWidth - 11; // 11 = metà emoji

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      {/* Label + current value */}
      <View style={styles.labelRow}>
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {label}
        </Text>
        <View style={styles.valueRow}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginRight: 6 }}>
            {min}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
            {value}{unit}
          </Text>
        </View>
      </View>

      {/* Slider with gradient */}
      <View
        style={styles.sliderWrapper}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {/* Gradient track */}
        <LinearGradient
          colors={gradientColors as [string, string, ...string[]]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[
            styles.gradientTrack,
            { left: SLIDER_INNER_PAD, right: SLIDER_INNER_PAD },
          ]}
        />

        {/* Native slider — transparent track, transparent thumb (emoji on top) */}
        <Slider
          style={StyleSheet.absoluteFill}
          value={value}
          minimumValue={min}
          maximumValue={max}
          step={step}
          onValueChange={(v: number) => onChange(Math.round(v / step) * step)}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor="transparent"
        />

        {/* 🍕 thumb positioned based on the fraction */}
        {containerWidth > 0 && (
          <RNText
            style={[styles.pizzaThumb, { left: pizzaX }]}
            selectable={false}
          >
            🍕
          </RNText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    paddingHorizontal: SIDE_PAD,
    paddingVertical: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  sliderWrapper: {
    height: 46,
    position: 'relative',
    justifyContent: 'center',
  },
  gradientTrack: {
    position: 'absolute',
    height: 6,
    borderRadius: 3,
    top: 20, // (46 - 6) / 2
  },
  pizzaThumb: {
    position: 'absolute',
    fontSize: 22,
    top: 12, // (46 - 22) / 2
  },
});
