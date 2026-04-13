import { calculateDough } from './utils/calculator';
import { validateInput } from './utils/validators';

const cases = [
  { name: "[1] Classic Verace Diretto", temp: 23, leaveningTime: 8, hydration: 60, flourStrength: 240, yeastType: "birra" },
  { name: "[2] Contemporanea Frigo", temp: 20, leaveningTime: 24, hydration: 70, flourStrength: 300, yeastType: "birra" },
  { name: "[3] Estrema Maturazione", temp: 25, leaveningTime: 72, hydration: 80, flourStrength: 380, yeastType: "birra" },
  { name: "[4] Caldo Estivo Diretto", temp: 32, leaveningTime: 8, hydration: 60, flourStrength: 240, yeastType: "secco" },
  { name: "[5] Inverno Freddo", temp: 16, leaveningTime: 12, hydration: 65, flourStrength: 260, yeastType: "birra" },
  { name: "[6] Lievito Madre Classico", temp: 22, leaveningTime: 12, hydration: 65, flourStrength: 260, yeastType: "madre" },
  { name: "[7] Lievito Madre 48h", temp: 25, leaveningTime: 48, hydration: 75, flourStrength: 320, yeastType: "madre" },
  { name: "[8] Errore: Alta Idro / Poco tempo", temp: 25, leaveningTime: 4, hydration: 85, flourStrength: undefined, yeastType: "birra" },
  { name: "[9] Errore: W400 / Poco tempo", temp: 25, leaveningTime: 4, hydration: undefined, flourStrength: 400, yeastType: "birra" },
  { name: "[10] Default AVPN App", temp: 23, leaveningTime: undefined, hydration: undefined, flourStrength: undefined, yeastType: "birra" }
];

const results = cases.map(c => {
  const params = {
    weight: 1000,
    temp: c.temp,
    yeastType: c.yeastType as any,
    leaveningTime: c.leaveningTime,
    hydration: c.hydration,
    flourStrength: c.flourStrength
  };
  
  try {
      const calc = calculateDough(params);
      const errors = validateInput(params, calc.yeastAmount).map(e => e.message);
      return {
          scenario: c.name,
          input: `Temp: ${c.temp}°C | Time: ${c.leaveningTime || 'AUTO'}h | Hydration: ${c.hydration || 'AUTO'}% | W: ${c.flourStrength || 'AUTO'} | Yeast: ${c.yeastType}`,
          output: `Farina: ${calc.flourAmount}g (W${calc.flourStrengthW}) | Acqua: ${calc.waterAmount}g | Lievito: ${calc.yeastAmount}g | Ore TA: ${calc.hoursRT}h | Ore Frigo: ${calc.hoursFridge}h`,
          warnings: errors.length > 0 ? errors : ["Nessuno (Perfetto)"],
          tips: calc.infoTips && calc.infoTips.length > 0 ? calc.infoTips : ["Nessuno"]
      };
  } catch(e: any) {
      return { scenario: c.name, error: e.message };
  }
});

console.log(JSON.stringify(results, null, 2));
