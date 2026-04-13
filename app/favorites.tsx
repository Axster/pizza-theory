import React, { useCallback, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Button, IconButton, useTheme } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { Storage, HistoryItem } from '../utils/storage';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<HistoryItem[]>([]);
  const [top30Ids, setTop30Ids] = useState<Set<string>>(new Set());
  const theme = useTheme();

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    const data = await Storage.getHistory(); // Data is already returned sorted by Storage logic
    
    // Determine Top 30 items
    const newest30 = data.slice(0, 30);
    const newestIds = new Set(newest30.map(i => i.id));
    
    // Filter out only favorites
    const favs = data.filter(item => item.isFavorite);
    
    setTop30Ids(newestIds);
    setFavorites(favs);
  };

  const toggleFavorite = async (id: string) => {
    await Storage.toggleFavorite(id);
    await loadFavorites();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {favorites.length === 0 ? (
        <Text style={styles.emptyText}>Non hai ancora salvato nessun impasto nei Preferiti.</Text>
      ) : (
        favorites.map(item => {
          const isOld = !top30Ids.has(item.id);
          const iconName = isOld ? 'delete-sweep' : 'heart';
          const iconColor = isOld ? '#ff4d4d' : '#FF6347'; // Trash is red, Heart is Tomato

          return (
            <Card key={item.id} style={styles.card}>
              <Card.Title 
                title={`${new Date(item.date).toLocaleDateString()} - ${item.params.weight}g`} 
                subtitle={`Lievito ${item.params.yeastType} • ${item.params.temp}°C`}
                right={(props) => (
                  <IconButton 
                    {...props} 
                    icon={iconName} 
                    iconColor={iconColor} 
                    onPress={() => toggleFavorite(item.id)} 
                  />
                )}
              />
              <Card.Content>
                <View style={styles.details}>
                  <Text>Farina: {item.result.flourAmount}g (W{item.result.flourStrengthW})</Text>
                  <Text>Acqua: {item.result.waterAmount}g</Text>
                  <Text>Lievito: {item.result.yeastAmount}g | Sale: {item.result.saltAmount}g</Text>
                  <Text>Tempo TA: {item.result.hoursRT}h | Frigo: {item.result.hoursFridge}h</Text>
                  {item.notes ? (
                    <Text style={styles.notesText}>Nota: "{item.notes}"</Text>
                  ) : null}
                </View>
              </Card.Content>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 16,
  },
  card: {
    marginBottom: 15,
    backgroundColor: '#1E1E1E',
  },
  details: {
    backgroundColor: '#2A2A2A',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  notesText: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#ccc',
  }
});
