/**
 * ToggleSliderField.web.tsx
 * WEB version — no toggle, no slider.
 * Always visible TextInput field:
 *   - If the field is "optional": placeholder "(optional)", empty field
 *   - If the field has a default value: shows it in the field
 * Metro automatically selects this file for the browser.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, useTheme } from 'react-native-paper';

interface ToggleSliderFieldProps {
  label: string;
  /** Current numeric value (used as default in the field) */
  value: number;
  /** If false, the field is empty with placeholder "(optional)" */
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  trackColor: string;
  leftIconName: string;
  rightIconName: string;
  placeholder?: string;
}

export function ToggleSliderField({
  label,
  value,
  enabled,
  onChange,
  min,
  max,
  unit = '',
  placeholder = 'facoltativo',
}: ToggleSliderFieldProps) {
  const theme = useTheme();

  // On web, the field is always visible.
  // If disabled (not enabled): empty value with text placeholder.
  // If enabled: shows the numeric value with unit.
  const displayValue = enabled ? `${value}${unit}` : '';

  return (
    <View style={styles.fieldWrapper}>
      <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
        {label}
      </Text>
      <TextInput
        value={displayValue}
        placeholder={`(${placeholder})`}
        onChangeText={(v) => {
          // Removes unit (e.g. "%") before parsing
          const clean = v.replace(/[^0-9]/g, '');
          const n = parseInt(clean, 10);
          if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
          else if (clean === '') onChange(min); // reset to minimum if empty
        }}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
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
