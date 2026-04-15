import { Drawer } from 'expo-router/drawer';
import { PaperProvider, MD3DarkTheme as DefaultTheme } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF6347', // Tomato red
    secondary: '#FFA500', // Orange
    background: '#121212',
    surface: '#1E1E1E',
  },
};

export default function Layout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <PaperProvider theme={theme}>
        <Drawer
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1E1E1E',
            },
            headerTintColor: '#FF6347',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            drawerStyle: {
              backgroundColor: '#1E1E1E',
            },
            drawerActiveTintColor: '#FF6347',
            drawerInactiveTintColor: '#FFFFFF',
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
              drawerItemStyle: { display: 'none' }, // Nascondi dal drawer
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
