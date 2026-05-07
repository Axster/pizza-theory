import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PizzaDarkTheme, PizzaLightTheme } from '@/constants/theme';

/**
 * Symmetrical inverted triangle hamburger icon.
 * Three centered horizontal lines of decreasing length from top to bottom.
 * Produces a triangle ▽ — wide top, narrow bottom.
 */
function PizzaMenuIcon({ color }: { color: string }) {
  return (
    <View style={pizzaIconStyles.container}>
      <View style={[pizzaIconStyles.line, { width: 24, backgroundColor: color }]} />
      <View style={[pizzaIconStyles.line, { width: 16, backgroundColor: color }]} />
      <View style={[pizzaIconStyles.line, { width: 8,  backgroundColor: color }]} />
    </View>
  );
}

const pizzaIconStyles = StyleSheet.create({
  container: {
    gap: 4,
    alignItems: 'center',   // ← centered → symmetrical inverted triangle
    justifyContent: 'center',
  },
  line: {
    height: 2.5,
    borderRadius: 2,
  },
});

export default function Layout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? PizzaDarkTheme : PizzaLightTheme;
  const inactiveTint = isDark ? '#ECECEC' : '#444444';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
        <Drawer
          screenOptions={({ navigation }) => ({
            // On web, the native header is hidden (the page handles its own header)
            headerShown: Platform.OS !== 'web',

            // ── Mobile Header ────────────────────────────────────────────────
            headerStyle: {
              backgroundColor: theme.colors.surface,
              elevation: 0,       // Android: removes shadow
              shadowOpacity: 0,   // iOS: removes shadow
            },
            headerTintColor: theme.colors.primary,
            headerTitleStyle: { fontWeight: 'bold' },

            // ── Drawer ──────────────────────────────────────────────────────
            drawerStyle: { backgroundColor: theme.colors.surface },
            drawerActiveTintColor: theme.colors.primary,
            drawerInactiveTintColor: inactiveTint,

            // ── Inverted triangle burger menu (mobile only) ────────────────
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.openDrawer()}
                style={{ paddingLeft: 16, paddingVertical: 10 }}
                accessibilityLabel="Apri menu"
              >
                <PizzaMenuIcon color={theme.colors.primary} />
              </TouchableOpacity>
            ),
          })}
        >
          <Drawer.Screen name="index"     options={{ drawerLabel: 'Calcolatore Impasto', title: 'Pizza Theory' }} />
          <Drawer.Screen name="history"   options={{ drawerLabel: 'Cronologia',          title: 'I Miei Impasti' }} />
          <Drawer.Screen name="favorites" options={{ drawerLabel: 'Preferiti',           title: 'Impasti Preferiti' }} />
          <Drawer.Screen name="results"   options={{ drawerItemStyle: { display: 'none' }, title: 'Risultati Impasto' }} />
        </Drawer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
