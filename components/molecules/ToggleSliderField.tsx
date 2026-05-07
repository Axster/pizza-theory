/**
 * ToggleSliderField — Molecule for optional sliders with a toggle (e.g., Hydration, Flour Strength).
 * NOTE: This file is used ONLY on iOS/Android.
 * Metro automatically selects ToggleSliderField.web.tsx for the browser.
 */
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { Text, useTheme } from "react-native-paper";
import { ToggleSwitch } from "../atoms/ToggleSwitch";

interface ToggleSliderFieldProps {
  label: string;
  value: number;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  /** Color of the track and thumb when enabled */
  trackColor: string;
  /** Name of the @expo/vector-icons MaterialCommunityIcons for the left (weak) side */
  leftIconName: string;
  /** Name of the @expo/vector-icons MaterialCommunityIcons for the right (strong) side */
  rightIconName: string;
  /** Placeholder text shown when disabled */
  placeholder?: string;
}

export function ToggleSliderField({
  label,
  value,
  enabled,
  onToggle,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  trackColor,
  leftIconName,
  rightIconName,
  placeholder = "facoltativo",
}: ToggleSliderFieldProps) {
  const theme = useTheme();

  const isDark = theme.dark;
  const iconColor = enabled ? trackColor : isDark ? "#555" : "#bbb";
  const disabledTrack = isDark ? "#444" : "#d0d0d0";
  const disabledThumb = isDark ? "#555" : "#c0c0c0";

  // ─── Header row (always visible) ─────────────────────────────────────────
  const HeaderRow = () => (
    <View style={[styles.headerRow, { marginBottom: enabled ? 4 : 0 }]}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text variant="labelLarge" style={{ color: theme.colors.onSurface }}>
          {label}{" "}
        </Text>
        {enabled ? (
          <Text
            variant="labelLarge"
            style={{ color: trackColor, fontWeight: "bold" }}
          >
            {value}
            {unit}
          </Text>
        ) : (
          <Text
            variant="labelMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            ({placeholder})
          </Text>
        )}
      </View>
      <ToggleSwitch
        value={enabled}
        onValueChange={onToggle}
        activeColor={trackColor}
      />
    </View>
  );

  // ─── MOBILE: slider with side icons ────────────────────────────────────
  return (
    <Animated.View 
      layout={LinearTransition.duration(400)}
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
    >
      <HeaderRow />

      {enabled && (
        <Animated.View 
          entering={FadeIn.duration(400).delay(200)} 
          exiting={FadeOut.duration(200)}
          style={styles.sliderRow}
        >
          {/* Left icon */}
          <MaterialCommunityIcons
            name={leftIconName as any}
            size={22}
            color={iconColor}
            style={{ marginRight: 8 }}
          />

          {/* Slider */}
          <View style={{ flex: 1 }}>
            <Slider
              value={value}
              minimumValue={min}
              maximumValue={max}
              step={step}
              onValueChange={(v: number) => {
                if (enabled) onChange(Math.round(v / step) * step);
              }}
              minimumTrackTintColor={enabled ? trackColor : disabledTrack}
              maximumTrackTintColor={disabledTrack}
              thumbTintColor={enabled ? trackColor : disabledThumb}
              disabled={!enabled}
              style={{ width: "100%", height: 36 }}
            />
          </View>

          {/* Right icon */}
          <View
            style={{ flexDirection: "row", alignItems: "center", marginLeft: 8 }}
          >
            <MaterialCommunityIcons
              name={rightIconName as any}
              size={22}
              color={iconColor}
            />
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
});
