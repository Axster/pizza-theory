import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  HelperText,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { PizzaLoader } from "../components/PizzaLoader";
import { SliderField } from "../components/molecules/SliderField";
import { TipBanner } from "../components/molecules/TipBanner";
import { ToggleSliderField } from "../components/molecules/ToggleSliderField";
import { calculateDough, DoughParams, YeastType } from "../utils/calculator";
import { Storage } from "../utils/storage";
import { validateInput } from "../utils/validators";
import { LabeledSegmentedButtons } from "../components/molecules/LabeledSegmentedButtons";

export default function Home() {
  const router = useRouter();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  // ─── Form State ────────────────────────────────────────────────────────────
  const [weight, setWeight] = useState("1000");
  const [temp, setTemp] = useState(22); // slider number
  const [yeastType, setYeastType] = useState<YeastType>("birra");
  const [time, setTime] = useState("");

  // Optional fields with toggle
  const [hydrationEnabled, setHydrationEnabled] = useState(false);
  const [hydration, setHydration] = useState(57); // Default AVPN: 57%
  const [strengthEnabled, setStrengthEnabled] = useState(false);
  const [strength, setStrength] = useState(240); // Default AVPN: 240W

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // ─── Background pizza pattern ──────────────────────────────────────────
  const bgImage = isDark
    ? require("../assets/bg/bg-dark-outline.png")
    : require("../assets/bg/bg-light-outline.png");

  // ─── Dough calculation ──────────────────────────────────────────────────
  const handleCalculate = async () => {
    setErrorText(null);
    setFormErrors({});

    const params: DoughParams = {
      weight: Number(weight) || 1000,
      temp,
      yeastType,
      leaveningTime: time ? Number(time) : undefined,
      hydration: hydrationEnabled ? hydration : undefined,
      flourStrength: strengthEnabled ? strength : undefined,
    };

    const precomputed = calculateDough({ ...params });
    const errors = validateInput(params, precomputed.yeastAmount);

    if (errors.length > 0) {
      const propErrors = errors.filter((e) => e.type === "proportion");
      const absoluteErrors = errors.filter((e) => e.type !== "proportion");

      if (propErrors.length > 0) {
        const propMessages = propErrors
          .map((e) => `• ${e.message}`)
          .join("\n\n");
        if (Platform.OS === "web") {
          window.alert(`Errore di Proporzione tra i Dati:\n\n${propMessages}`);
        } else {
          Alert.alert("Errore di Proporzione", propMessages, [
            { text: "Correggo" },
          ]);
        }
        return;
      }

      const fieldErrs: Record<string, string> = {};
      const texts: string[] = [];
      absoluteErrors.forEach((e) => {
        fieldErrs[e.field] = e.message;
        texts.push(`• ${e.message}`);
      });
      setFormErrors(fieldErrs);
      setErrorText(texts.join("\n"));
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      const result = precomputed;
      const historyItem = await Storage.saveHistoryItem(params, result);
      setLoading(false);
      router.push({ pathname: "/results", params: { id: historyItem.id } });
    }, 2000);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {/* ── Sfondo trama pizza (behind everything) ── */}
      <Image
        source={bgImage}
        style={[StyleSheet.absoluteFill, { opacity: isDark ? 0.12 : 0.22 }]}
        resizeMode="repeat"
      />

      {/* ── Loader overlay ── */}
      {loading && <PizzaLoader />}

      {/* ── Main content ── */}
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, 48) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Albert + Tip */}
        <TipBanner />

        {/* Dough Quantity */}
        <TextInput
          label="Quantità Impasto (g)"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
          error={!!formErrors.weight}
        />
        {formErrors.weight && (
          <HelperText type="error">{formErrors.weight}</HelperText>
        )}

        {/* Ambient Temperature — yellow→red gradient slider with 🍕 */}
        <SliderField
          label="Temperatura Ambiente"
          value={temp}
          min={2}
          max={40}
          step={1}
          unit="°C"
          onChange={setTemp}
          gradientColors={["#F5C842", "#E8502A", "#C0392B"]}
        />

        {/* Leavening Time — optional text field */}
        <TextInput
          label="Ore Lievitazione (facoltativo)"
          value={time}
          onChangeText={setTime}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
          error={!!formErrors.time}
        />
        {formErrors.time && (
          <HelperText type="error">{formErrors.time}</HelperText>
        )}

        <LabeledSegmentedButtons
          label="Tipo di Lievito"
          value={yeastType}
          onValueChange={(val) => setYeastType(val as YeastType)}
          buttons={[
            { value: "birra", label: "Birra (Fresco)" },
            { value: "secco", label: "Secco" },
            { value: "madre", label: "Madre" },
          ]}
        />

        {/* Hydration — water drop icons */}
        <ToggleSliderField
          label="Idratazione"
          value={hydration}
          enabled={hydrationEnabled}
          onToggle={(enabled) => {
            setHydrationEnabled(enabled);
            if (enabled) setHydration(57);
          }}
          onChange={setHydration}
          min={50}
          max={85}
          step={1}
          unit="%"
          trackColor="#42A5F5"
          leftIconName="water-outline"
          rightIconName="water"
        />

        {/* Flour Strength W — muscle icons */}
        <ToggleSliderField
          label="Forza Farina W"
          value={strength}
          enabled={strengthEnabled}
          onToggle={(enabled) => {
            setStrengthEnabled(enabled);
            if (enabled) setStrength(240);
          }}
          onChange={setStrength}
          min={100}
          max={450}
          step={10}
          unit=""
          trackColor="#C62828"
          leftIconName="arm-flex-outline"
          rightIconName="arm-flex"
        />

        {/* Global errors */}
        {errorText && (
          <HelperText type="error" visible style={styles.errorText}>
            {errorText}
          </HelperText>
        )}

        {/* CTA */}
        <Button
          mode="contained"
          onPress={handleCalculate}
          style={styles.button}
          contentStyle={{ paddingVertical: 10 }}
          labelStyle={{ fontSize: 18, fontWeight: "bold" }}
        >
          Impasta!
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    gap: 24,
  },
  input: {},
  segmented: {},
  errorText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  button: {
    borderRadius: 10,
  },
});
