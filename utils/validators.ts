import { DoughParams } from './calculator';

export interface ValidationError {
  field: 'weight' | 'temp' | 'time' | 'hydration' | 'strength' | 'general' | 'yeast';
  message: string;
  type?: 'absolute' | 'proportion';
}

export function validateInput(params: DoughParams, yeastCalculated: number): ValidationError[] {
  const errors: ValidationError[] = [];

  // Limiti Base Assoluti (Minimi e Massimi stringenti)
  if (params.weight < 200 || params.weight > 20000) {
    errors.push({ field: 'weight', message: 'L\'impasto deve essere tra 200g e 20kg (20000g).' });
  }
  if (params.temp < 0 || params.temp > 45) {
    errors.push({ field: 'temp', message: 'La temperatura deve essere compresa tra 0°C e 45°C.' });
  }
  if (params.leaveningTime !== undefined && (params.leaveningTime < 2 || params.leaveningTime > 96)) {
    errors.push({ field: 'time', message: 'Le ore di lievitazione devono essere tra 2h e 96h.' });
  }
  if (params.hydration !== undefined && (params.hydration < 50 || params.hydration > 90)) {
    errors.push({ field: 'hydration', message: 'L\'idratazione deve rientrare tra il 50% e il 90%.' });
  }
  if (params.flourStrength && (params.flourStrength < 160 || params.flourStrength > 500)) {
    errors.push({ field: 'strength', message: 'La forza della farina W deve essere tra 160 e 500.' });
  }

  // Vincoli logici sul risultato del calcolo lievito in proporzione al TIPO di lievito (Per Kg d'impasto)
  const weightInKg = params.weight / 1000;
  const yeastPerKgDough = yeastCalculated / weightInKg;

  if (params.yeastType === 'birra') {
    if (yeastPerKgDough < 0.1 || yeastPerKgDough > 30) {
      errors.push({ field: 'yeast', message: `Allarme Lievito (Birra): calcolati ${yeastPerKgDough.toFixed(2)}g per Kg d'impasto (limite 0.1g - 30g/Kg).` });
    }
  } else if (params.yeastType === 'secco') {
    if (yeastPerKgDough < 0.03 || yeastPerKgDough > 10) {
      errors.push({ field: 'yeast', message: `Allarme Lievito (Secco): calcolati ${yeastPerKgDough.toFixed(2)}g per Kg d'impasto (limite 0.03 - 10g/Kg).` });
    }
  } else if (params.yeastType === 'madre') {
    if (yeastPerKgDough < 20 || yeastPerKgDough > 400) {
      errors.push({ field: 'yeast', message: `Allarme Lievito (Madre): calcolati ${yeastPerKgDough.toFixed(0)}g per Kg d'impasto (completamente fuori range fisiologico 20g - 400g/Kg per lievito naturale).` });
    }
  }

  // Cross checks Euristici Proporzionali (Solo se inserimenti espliciti incrociati >= 2 campi)
  let optionalDefined = 0;
  if (params.leaveningTime !== undefined) optionalDefined++;
  if (params.hydration !== undefined) optionalDefined++;
  if (params.flourStrength !== undefined) optionalDefined++;

  if (optionalDefined >= 2) {
    const time = params.leaveningTime; 
    const w = params.flourStrength; 
    const hyd = params.hydration;

    // Forza vs Tempo
    if (time !== undefined && w !== undefined) {
      if (time > 18 && w < 260) {
        errors.push({ field: 'strength', type: 'proportion', message: `Una maturazione di ${time}h distruggerebbe la debole maglia glutinica (W${w}), provocando un panetto acido e collassato.` });
      }
      if (time <= 6 && w > 320) {
        errors.push({ field: 'strength', type: 'proportion', message: `Farina troppo forte (W${w}) rispetto ai tempi brevi (${time}h). Otterresti una pasta gommosa e indigeribile.` });
      }
    }

    // Idratazione vs Forza 
    if (hyd !== undefined && w !== undefined) {
      if (hyd >= 70 && w < 280) {
        errors.push({ field: 'hydration', type: 'proportion', message: `Idratazione eccessiva (${hyd}%) per farine medio-deboli (W${w}). Non trattenendo l'acqua otterrai poltiglia ingovernabile.` });
      }
    }

    // Idratazione vs Tempo
    if (hyd !== undefined && time !== undefined) {
      if (hyd >= 75 && time < 8) {
        errors.push({ field: 'hydration', type: 'proportion', message: `Manca fisicamente il tempo di riposo per reggere un'idratazione estrema (${hyd}% in ${time}h).` });
      }
    }
  }

  return errors;
}
