/**
 * SliderField.web.tsx
 * Versione WEB — nessuno slider, solo TextInput numerico standard.
 * Metro seleziona automaticamente questo file per il browser.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, useTheme } from 'react-native-paper';

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  gradientColors?: string[];
  trackColor?: string;
}

export function SliderField({
  label,
  value,
  min,
  max,
  unit = '',
  onChange,
}: SliderFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.fieldWrapper}>
      <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
        {label}
      </Text>
      <TextInput
        value={String(value)}
        onChangeText={(v) => {
          const n = parseInt(v, 10);
          if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
        }}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        right={unit ? <TextInput.Affix text={unit} /> : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrapper: {
    marginBottom: 8,
  },
  label: {
    marginBottom: 2,
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'transparent',
  },
});
