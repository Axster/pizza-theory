import React from 'react';
import { Switch, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  activeColor?: string;
}

export function ToggleSwitch({ value, onValueChange, activeColor }: ToggleSwitchProps) {
  const theme = useTheme();
  const color = activeColor ?? theme.colors.primary;

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#767577', true: color + '99' }}
      thumbColor={value ? color : (Platform.OS === 'android' ? '#f4f3f4' : undefined)}
      ios_backgroundColor="#555555"
    />
  );
}
