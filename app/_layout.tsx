import { Drawer } from 'expo-router/drawer';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PizzaDarkTheme, PizzaLightTheme } from '@/constants/theme';

export default function Layout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? PizzaDarkTheme : PizzaLightTheme;

  // Colori di header e drawer derivati dal tema attivo
  const headerBg  = theme.colors.surface;
  const drawerBg  = theme.colors.surface;
  const inactiveTint = isDark ? '#FFFFFF' : '#333333';

  return (
    <GestureHandlerRootView style={styles.container}>
      <PaperProvider theme={theme}>
        <Drawer
          screenOptions={{
            headerStyle: { backgroundColor: headerBg },
            headerTintColor: theme.colors.primary,
            headerTitleStyle: { fontWeight: 'bold' },
            drawerStyle: { backgroundColor: drawerBg },
            drawerActiveTintColor: theme.colors.primary,
            drawerInactiveTintColor: inactiveTint,
          }}
        >
          <Drawer.Screen
            name="index"
            options={{
              drawerLabel: 'Calcolatore Impasto',
              title: 'Pizza Theory',
            }}
          />
          <Drawer.Screen
            name="history"
            options={{
              drawerLabel: 'Cronologia',
              title: 'I Miei Impasti',
            }}
          />
          <Drawer.Screen
            name="favorites"
            options={{
              drawerLabel: 'Preferiti',
              title: 'Impasti Preferiti',
            }}
          />
          <Drawer.Screen
            name="results"
            options={{
              drawerItemStyle: { display: 'none' },
              title: 'Risultati Impasto',
            }}
          />
        </Drawer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
