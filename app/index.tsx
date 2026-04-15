import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Image, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, useTheme, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { calculateDough, DoughParams, YeastType } from '../utils/calculator';
import { Storage } from '../utils/storage';
import { PizzaLoader } from '../components/PizzaLoader';
import { validateInput } from '../utils/validators';

export default function Home() {
  const router = useRouter();
  const theme = useTheme();

  const [weight, setWeight] = useState('1000');
  const [temp, setTemp] = useState('22');
  const [yeastType, setYeastType] = useState<YeastType>('birra');
  const [time, setTime] = useState('');
  const [hydration, setHydration] = useState('');
  const [strength, setStrength] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

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
      const propErrors = errors.filter(e => e.type === 'proportion');
      const absoluteErrors = errors.filter(e => e.type !== 'proportion');

      if (propErrors.length > 0) {
         // Proportional error detected! Trigger Popup and halt.
         const propMessages = propErrors.map(e => `• ${e.message}`).join('\n\n');
         
         if (Platform.OS === 'web') {
           window.alert(`Errore di Proporzione tra i Dati:\n\n${propMessages}`);
         } else {
           Alert.alert('Errore di Proporzione', propMessages, [{ text: 'Correggo' }]);
         }
         return;
      }

      // No proporational errors, but absolute boundaries broken
      const fieldErrs: any = {};
      const texts: string[] = [];
      absoluteErrors.forEach(e => {
        fieldErrs[e.field] = e.message;
        texts.push(`• ${e.message}`);
      });
      setFormErrors(fieldErrs);
      setErrorText(texts.join('\n'));
      return;
    }

    setLoading(true);

    // Give the loader time to animate and render
    setTimeout(async () => {
      const params: DoughParams = {
        weight: Number(weight) || 1000,
        temp: Number(temp) || 25,
        yeastType,
        leaveningTime: time ? Number(time) : undefined,
        hydration: hydration ? Number(hydration) : undefined,
        flourStrength: strength ? Number(strength) : undefined,
      };

      const result = precomputed;
      
      const historyItem = await Storage.saveHistoryItem(params, result);
      
      setLoading(false);
      // Navigate to results
      router.push({
        pathname: '/results',
        params: { id: historyItem.id }
      });
    }, 2000); // 2 second loading
  };

  return (
    <View style={styles.container}>
      {loading && <PizzaLoader />}
      
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Image source={require('../assets/images/logo.png')} style={styles.logo} />
          <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Pizza Theory</Text>
        </View>

        <Text variant="bodyLarge" style={styles.subtitle}>Calcola il tuo impasto ideale</Text>

        <TextInput
          label="Quantità Impasto (g) *"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
          error={!!formErrors.weight}
        />

        <TextInput
          label="Temperatura Ambiente (°C) *"
          value={temp}
          onChangeText={setTemp}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
          error={!!formErrors.temp}
        />

        <Text variant="labelLarge" style={styles.label}>Tipo di Lievito</Text>
        <SegmentedButtons
          value={yeastType}
          onValueChange={(val) => setYeastType(val as YeastType)}
          buttons={[
            { value: 'birra', label: 'Birra (Fresco)' },
            { value: 'secco', label: 'Secco' },
            { value: 'madre', label: 'Madre' }
          ]}
          style={styles.segmented}
        />

        <TextInput
          label="Ore Lievitazione (Facoltativo)"
          value={time}
          onChangeText={setTime}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
          error={!!formErrors.time}
        />

        <TextInput
          label="Idratazione % (Facoltativo)"
          value={hydration}
          onChangeText={setHydration}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
          error={!!formErrors.hydration}
        />

        <TextInput
          label="Forza Farina W (Facoltativo)"
          value={strength}
          onChangeText={setStrength}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
          error={!!formErrors.strength}
        />

        {errorText && (
          <HelperText type="error" visible={true} style={styles.errorText}>
            {errorText}
          </HelperText>
        )}

        <Button 
          mode="contained" 
          onPress={handleCalculate} 
          style={styles.button}
          contentStyle={{ paddingVertical: 8 }}
          labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
        >
          Impasta!
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#ccc',
  },
  input: {
    marginBottom: 15,
  },
  label: {
    marginTop: 10,
    marginBottom: 8,
    color: '#ccc',
  },
  segmented: {
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 10,
    borderRadius: 8,
  }
});
