import React, { useCallback, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, TextInput, Button, IconButton, useTheme } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { Storage, HistoryItem } from '../utils/storage';

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});
  const theme = useTheme();

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    const data = await Storage.getHistory();
    // Use only top 30 to display in history tab as requested
    setHistory(data.slice(0, 30));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const toggleFavorite = async (id: string) => {
    await Storage.toggleFavorite(id);
    await loadHistory();
  };

  const handleNoteChange = (id: string, text: string) => {
    setEditingNotes(prev => ({ ...prev, [id]: text }));
  };

  const saveNote = async (id: string) => {
    const newNote = editingNotes[id];
    if (newNote !== undefined) {
      await Storage.updateHistoryNote(id, newNote);
      await loadHistory();
    }
  };

  const deleteItem = async (id: string) => {
    await Storage.deleteHistoryItem(id);
    await loadHistory();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.content}>
      {history.length === 0 ? (
        <Text style={styles.emptyText}>Nessun impasto salvato. Crea la tua prima pizza!</Text>
      ) : (
        history.map(item => {
          const isExpanded = expandedId === item.id;
          const noteText = editingNotes[item.id] !== undefined ? editingNotes[item.id] : (item.notes || '');

          return (
            <Card key={item.id} style={styles.card} onPress={() => toggleExpand(item.id)}>
              <Card.Title 
                title={`${new Date(item.date).toLocaleDateString()} - ${item.params.weight}g`} 
                subtitle={`Lievito ${item.params.yeastType} • ${item.params.temp}°C`}
                right={(props) => (
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <IconButton {...props} icon={item.isFavorite ? 'heart' : 'heart-outline'} iconColor="#FF6347" onPress={() => toggleFavorite(item.id)} />
                    <IconButton {...props} icon="delete" iconColor="#ff4d4d" onPress={() => deleteItem(item.id)} />
                    <IconButton {...props} icon={isExpanded ? 'chevron-up' : 'chevron-down'} />
                  </View>
                )}
              />
              {isExpanded && (
                <Card.Content>
                  <View style={styles.details}>
                    <Text variant="labelLarge" style={{color: theme.colors.primary}}>Dettagli:</Text>
                    <Text>Acqua: {item.result.waterAmount}g</Text>
                    <Text>Farina: {item.result.flourAmount}g (W{item.result.flourStrengthW})</Text>
                    <Text>Lievito: {item.result.yeastAmount}g</Text>
                    <Text>Sale: {item.result.saltAmount}g</Text>
                    <Text>Tempo TA: {item.result.hoursRT}h | Frigo: {item.result.hoursFridge}h</Text>
                  </View>

                  <View style={styles.notesContainer}>
                    <Text variant="labelLarge" style={{color: theme.colors.secondary, marginBottom: 5}}>Recensione / Note:</Text>
                    <TextInput
                      mode="outlined"
                      multiline
                      numberOfLines={3}
                      value={noteText}
                      onChangeText={(text) => handleNoteChange(item.id, text)}
                      placeholder="Com'è venuta la pizza? Troppa gomma? Lievitata bene?"
                      style={styles.notesInput}
                    />
                    <Button mode="contained-tonal" onPress={() => saveNote(item.id)} style={styles.saveButton}>
                      Salva Nota
                    </Button>
                  </View>
                </Card.Content>
              )}
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
  },
  details: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  notesContainer: {
    marginTop: 5,
  },
  notesInput: {
  },
  saveButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
  }
});
