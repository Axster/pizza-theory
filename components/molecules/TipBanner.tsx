import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Text, Surface, useTheme } from "react-native-paper";

interface TipBannerProps {
  message?: string;
}

const DEFAULT_TIP =
  "Benvenuto! Inserisci i tuoi parametri e scopri la ricetta ideale per il tuo impasto. Più dati fornisci, più preciso sarà il calcolo dell'algoritmo AVPN!";

export function TipBanner({ message = DEFAULT_TIP }: TipBannerProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Surface
        style={[styles.bubble, { backgroundColor: theme.colors.surface }]}
        elevation={1}
      >
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurface, lineHeight: 18 }}
        >
          {message}
        </Text>
      </Surface>
      <Image
        source={require("../../assets/images/albert/albert-4096.png")}
        style={styles.albert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  bubble: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
  },
  albert: {
    width: 100,
    height: 100,
  },
});
