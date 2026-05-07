import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { DrawerActions, useNavigation } from '@react-navigation/native';

interface WebHeaderProps {
  title: string;
}

function PizzaMenuIcon({ color }: { color: string }) {
  return (
    <View style={{ gap: 5, alignItems: 'center' }}>
      <View style={{ height: 3, width: 26, backgroundColor: color, borderRadius: 2 }} />
      <View style={{ height: 3, width: 17, backgroundColor: color, borderRadius: 2 }} />
      <View style={{ height: 3, width: 8,  backgroundColor: color, borderRadius: 2 }} />
    </View>
  );
}

export function WebHeader({ title }: WebHeaderProps) {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.headerBar, { backgroundColor: theme.colors.surface }]}>
      {/* Left slot (spacer) */}
      <View style={styles.headerSlot} />

      {/* Centered title */}
      <Text style={[styles.appTitle, { color: theme.colors.onSurface }]}>
        {title}
      </Text>

      {/* Triangle Hamburger ▽ — right side */}
      <View style={[styles.headerSlot, { alignItems: 'flex-end' }]}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          accessibilityLabel="Apri menu"
        >
          <PizzaMenuIcon color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  headerSlot: { flex: 1 },
  appTitle: {
    fontSize: 34,
    fontWeight: '800',
    fontFamily: "Georgia, 'Times New Roman', serif",
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  menuBtn: { padding: 10 },
});
