import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Share, Platform } from 'react-native';
import { Text, Card, Button, ActivityIndicator, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Storage, HistoryItem } from '../utils/storage';

export default function Results() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  
  const [item, setItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      const history = await Storage.getHistory();
      const found = history.find(h => h.id === id);
      if (found) setItem(found);
      setLoading(false);
    }
    loadData();
  }, [id]);

  const onShare = async () => {
    if (!item) return;
    const { params, result } = item;
    

    const hydrationPerc = Math.round((result.waterAmount / result.flourAmount) * 100);

    const fridgeAcclimationLine = (result.hoursAcclimation && result.hoursAcclimation > 0)
      ? `\n- ❄️ Estrazione dal frigo: ~ ${result.hoursAcclimation}h prima di infornare`
      : '';

    const message = `🍕 Ecco la ricetta per il mio impasto!

Parametri:
- Totale Impasto: ${params.weight}g
- Temperatura: ${params.temp}°C
- Tipo Lievito: ${params.yeastType}

Risultati:
- Farina: ${result.flourAmount}g (Forza: W${result.flourStrengthW})
- Acqua: ${result.waterAmount}g (Idratazione: ${hydrationPerc}%)
- Sale: ${result.saltAmount}g
- Lievito: ${result.yeastAmount}g

Tempistiche:
- Ore Temp. Ambiente: ${result.hoursRT}h
- Ore Frigo: ${result.hoursFridge}h${fridgeAcclimationLine}

Creata con Pizza Theory 🍕`;

    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({ title: 'La mia pizza', text: message });
        } else {
          navigator.clipboard.writeText(message);
          alert('Ricetta copiata negli appunti!');
        }
      } else {
        await Share.share({ message });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading || !item) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const { result } = item;

  const hydrationPerc = Math.round((result.waterAmount / result.flourAmount) * 100);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.content}>
      <Text variant="headlineMedium" style={styles.title}>Ricetta Pronta! 🍕</Text>

      <Card style={styles.card} mode="elevated">
        <Card.Title title="Parametri Base (Tuo Input)" titleStyle={{ color: theme.colors.onSurface, fontWeight: 'bold' }} />
        <Card.Content>
          <View style={styles.row}><Text variant="titleMedium">Totale Impasto:</Text><Text variant="titleMedium" style={styles.value}>{item.params.weight} g</Text></View>
          <View style={styles.row}><Text variant="titleMedium">Temperatura (TA):</Text><Text variant="titleMedium" style={styles.value}>{item.params.temp} °C</Text></View>
        </Card.Content>
      </Card>

      <Card style={styles.card} mode="elevated">
        <Card.Title title="Dosi degli Ingredienti" titleStyle={{ color: theme.colors.primary, fontWeight: 'bold' }} />
        <Card.Content>
          <View style={styles.row}><Text variant="titleMedium">Farina (W{result.flourStrengthW}):</Text><Text variant="titleMedium" style={styles.value}>{result.flourAmount} g</Text></View>
          <View style={styles.row}><Text variant="titleMedium">Acqua ({hydrationPerc}%):</Text><Text variant="titleMedium" style={styles.value}>{result.waterAmount} g</Text></View>
          <View style={styles.row}><Text variant="titleMedium">Sale:</Text><Text variant="titleMedium" style={styles.value}>{result.saltAmount} g</Text></View>
          <View style={styles.row}><Text variant="titleMedium">Lievito ({item.params.yeastType}):</Text><Text variant="titleMedium" style={styles.value}>{result.yeastAmount} g</Text></View>
        </Card.Content>
      </Card>

      <Card style={styles.card} mode="elevated">
        <Card.Title title="Tempistiche" titleStyle={{ color: theme.colors.secondary, fontWeight: 'bold' }} />
        <Card.Content>
          <View style={styles.row}><Text variant="titleMedium">Temperatura Ambiente:</Text><Text variant="titleMedium" style={styles.value}>{result.hoursRT} h</Text></View>
          <View style={styles.row}><Text variant="titleMedium">Frigorifero:</Text><Text variant="titleMedium" style={styles.value}>{result.hoursFridge} h</Text></View>
          {result.hoursAcclimation && result.hoursAcclimation > 0 ? (
            <View style={[styles.row, { borderBottomWidth: 0, marginTop: 8 }]}><Text variant="titleMedium" style={{ color: '#FFB74D' }}>Estrazione dal frigo: ❄️</Text><Text variant="titleMedium" style={[styles.value, { color: '#FFB74D' }]}>~ {result.hoursAcclimation} h prima</Text></View>
          ) : null}
        </Card.Content>
      </Card>

      {result.infoTips && result.infoTips.length > 0 && (
        <Card style={[styles.card, { borderColor: '#FFB74D', borderWidth: 1 }]} mode="elevated">
           <Card.Title title="💡 Consigli dell'Esperto" titleStyle={{ color: '#FFB74D', fontWeight: 'bold' }} />
           <Card.Content>
             {result.infoTips.map((tip, idx) => (
               <Text key={idx} variant="bodyMedium" style={{ color: '#fff', marginBottom: 8, fontStyle: 'italic' }}>
                 {tip}
               </Text>
             ))}
           </Card.Content>
        </Card>
      )}

      <Button mode="contained" icon="share-variant" onPress={onShare} style={styles.button}>
        Condividi Ricetta
      </Button>

      <Button mode="outlined" onPress={() => router.push('/')} style={styles.buttonOutline}>
        Nuovo Impasto
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 4,
  },
  value: {
    fontWeight: 'bold',
  },
  button: {
    marginTop: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonOutline: {
    marginTop: 15,
    borderRadius: 8,
    borderColor: '#FF6347',
  }
});
