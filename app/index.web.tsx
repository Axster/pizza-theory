/**
 * index.web.tsx — Home screen DESKTOP/WEB version
 * Expo Router automatically selects this file for the browser.
 */
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  HelperText,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { TipBanner } from "../components/molecules/TipBanner";
import { calculateDough, DoughParams, YeastType } from "../utils/calculator";
import { Storage } from "../utils/storage";
import { validateInput } from "../utils/validators";
import { LabeledSegmentedButtons } from "../components/molecules/LabeledSegmentedButtons";

import { WebHeader } from "../components/molecules/WebHeader";

export default function HomeWeb() {
  const router = useRouter();
  const navigation = useNavigation();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // ─── Form State ───────────────────────────────────────────────────────────
  const [weight, setWeight] = useState("1000");
  const [temp, setTemp] = useState("22");
  const [yeastType, setYeastType] = useState<YeastType>("birra");
  const [time, setTime] = useState("");
  const [hydration, setHydration] = useState("57"); // facoltativo — vuoto di default
  const [strength, setStrength] = useState(""); // facoltativo — vuoto di default

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const bgImage = isDark
    ? require("../assets/bg/bg-dark-outline.png")
    : require("../assets/bg/bg-light-outline.png");

  // ─── Calculation ──────────────────────────────────────────────────────────
  const handleCalculate = async () => {
    setErrorText(null);
    setFormErrors({});

    const params: DoughParams = {
      weight: Number(weight) || 1000,
      temp: Number(temp) || 22,
      yeastType,
      leaveningTime: time ? Number(time) : undefined,
      hydration: hydration ? Number(hydration) : undefined,
      flourStrength: strength ? Number(strength) : undefined,
    };

    const precomputed = calculateDough({ ...params });
    const errors = validateInput(params, precomputed.yeastAmount);

    if (errors.length > 0) {
      const propErrors = errors.filter((e) => e.type === "proportion");
      const absoluteErrors = errors.filter((e) => e.type !== "proportion");

      if (propErrors.length > 0) {
        window.alert(
          `Errore tra i dati:\n\n${propErrors.map((e) => `• ${e.message}`).join("\n\n")}`,
        );
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
    const result = precomputed;
    const historyItem = await Storage.saveHistoryItem(params, result);
    setLoading(false);
    router.push({ pathname: "/results", params: { id: historyItem.id } });
  };

  const fieldBg = { backgroundColor: theme.colors.surface };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {/* ── Pizza pattern background ────────────────────────────────────────── */}
      <Image
        source={bgImage}
        style={[StyleSheet.absoluteFill, { opacity: isDark ? 0.14 : 0.2 }]}
        resizeMode="repeat"
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header: surface background bar ────────────────────────────────── */}
        <WebHeader title="Pizza Theory" />

        {/* ── Centered Form ─────────────────────────────────────────────────── */}
        <View style={styles.formCard}>
          {/* Albert tip */}
          <TipBanner />


          {/* Dough Quantity */}
          <TextInput
            label="Quantità Impasto (g)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            mode="outlined"
            style={[styles.field, fieldBg]}
            error={!!formErrors.weight}
          />
          {formErrors.weight && (
            <HelperText type="error">{formErrors.weight}</HelperText>
          )}

          {/* Temperature */}
          <TextInput
            label="Temperatura Ambiente (°C)"
            value={temp}
            onChangeText={setTemp}
            keyboardType="numeric"
            mode="outlined"
            style={[styles.field, fieldBg]}
          />

          {/* Leavening Time */}
          <TextInput
            label="Ore Lievitazione (facoltativo)"
            value={time}
            onChangeText={setTime}
            keyboardType="numeric"
            mode="outlined"
            style={[styles.field, fieldBg]}
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

          {/* Hydration — optional */}
          <TextInput
            label="Idratazione (facoltativo)"
            value={hydration}
            placeholder="es. 65"
            onChangeText={(v) => setHydration(v.replace(/[^0-9]/g, ""))}
            keyboardType="numeric"
            mode="outlined"
            style={[styles.field, fieldBg]}
            right={hydration ? <TextInput.Affix text="%" /> : undefined}
          />

          {/* Flour Strength W — optional */}
          <TextInput
            label="Forza Farina W (facoltativo)"
            value={strength}
            placeholder="es. 250"
            onChangeText={setStrength}
            keyboardType="numeric"
            mode="outlined"
            style={[styles.field, fieldBg]}
          />

          {/* Errors */}
          {errorText && (
            <HelperText type="error" visible style={{ marginBottom: 8 }}>
              {errorText}
            </HelperText>
          )}

          {/* CTA */}
          <Button
            mode="contained"
            onPress={handleCalculate}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={{ paddingVertical: 12 }}
            labelStyle={{
              fontSize: 18,
              fontWeight: "bold",
              letterSpacing: 0.5,
            }}
          >
            Impasta!
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const FORM_MAX_WIDTH = 500;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: "100vh" as any,
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 72,
  },

  // ── Form ───────────────────────────────────────────────────────────────────
  formCard: {
    width: "100%",
    maxWidth: FORM_MAX_WIDTH,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 24,
  },
  field: {},
  sectionLabel: {
    marginLeft: 2,
  },
  segmented: {},
  button: {
    borderRadius: 10,
  },
});
