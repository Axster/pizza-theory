import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, SegmentedButtons as PaperSegmentedButtons, useTheme } from 'react-native-paper';

interface LabeledSegmentedButtonsProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  buttons: Array<{
    value: string;
    label?: string;
    icon?: string;
    disabled?: boolean;
    onPress?: () => void;
    labelStyle?: any;
    style?: any;
    showSelectedCheck?: boolean;
    testID?: string;
  }>;
  style?: any;
}

export function LabeledSegmentedButtons({
  label,
  value,
  onValueChange,
  buttons,
  style,
}: LabeledSegmentedButtonsProps) {
  const theme = useTheme();

  return (
    <View style={style}>
      <Text
        variant="labelLarge"
        style={[
          styles.label,
          { color: theme.colors.onSurfaceVariant },
        ]}
      >
        {label}
      </Text>
      <PaperSegmentedButtons
        value={value}
        onValueChange={onValueChange}
        buttons={buttons}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 8,
    marginLeft: 4,
  },
});
