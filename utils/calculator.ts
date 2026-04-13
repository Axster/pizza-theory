export type YeastType = "birra" | "secco" | "madre";

export interface DoughParams {
  weight: number;
  temp: number;
  yeastType: YeastType;
  leaveningTime?: number;
  hydration?: number;
  flourStrength?: number;
}

export interface DoughResult {
  yeastAmount: number;
  hoursRT: number;
  hoursFridge: number;
  saltAmount: number;
  flourAmount: number;
  flourStrengthW: number;
  waterAmount: number;
  hoursAcclimation?: number;
  infoTips?: string[];
}

export function calculateDough(params: DoughParams): DoughResult {
  let { weight, temp, yeastType, leaveningTime, hydration, flourStrength } =
    params;

  // Algoritmo Deduttivo "Esperto": Se mancano campi, li deduciano incrociando i presenti
  if (!leaveningTime && !hydration && !flourStrength) {
    // Purismo AVPN se utente lascia tutto bianco
    leaveningTime = 8;
    hydration = 57;
    flourStrength = 240;
  } else {
    if (!flourStrength) {
      // Se manca W, la deduciamo dal tempo o dall'idratazione
      if (leaveningTime) {
        flourStrength = Math.min(400, 200 + leaveningTime * 5);
      } else if (hydration && hydration > 60) {
        // Se si immette solo l'idro, l'acqua fa da padrona sulla maglia: 60%->W240, 80%->W340, 90%->W390
        flourStrength = Math.min(400, 240 + (hydration - 60) * 5);
      } else {
        flourStrength = 240; // Base pura
      }
    }
    if (!hydration) {
      // Idro scalata da W: W240->57%, W300->60%, W400->65%
      hydration = 45 + flourStrength / 20;
    }
    if (!leaveningTime) {
      // Ore scalate da W: W240->8h, W300->14h, W380->22h
      leaveningTime = Math.max(8, Math.floor((flourStrength - 160) / 10));
    }
  }

  // Divisone tempistiche: Frigo vs TA (Logica Esperta AVPN/Alta Idratazione)
  // L'impasto riposa 100% a Temperatura Ambiente (TA) entro le zone di comfort AVPN.
  let hoursRT = leaveningTime;
  let hoursFridge = 0;

  const isHighHydration = hydration > 65;
  const isHighTemp = temp > 25;
  const isLongTime = leaveningTime > 24;
  const isStrongFlour = flourStrength > 300;

  // Situazioni al limite che richiamano l'utilità stabilizzante del frigo
  if (
    isLongTime ||
    (isHighHydration && leaveningTime > 8) ||
    (isHighTemp && leaveningTime > 8) ||
    (isStrongFlour && leaveningTime > 12)
  ) {
    if (temp >= 34) {
      // Con caldo torrido (>30°C) la fermentazione è fulminea. Basterà 1h (o meno) per far partire il lievito.
      hoursRT = Math.min(1, leaveningTime * 0.1);
    } else {
      hoursRT = leaveningTime > 24 ? 2 : Math.min(2, leaveningTime * 0.25); // ~ 1-2h a TA
    }
    hoursFridge = leaveningTime - hoursRT;
  }

  // Calcolo delle masse base rispetto al Disciplinare AVPN
  // Salinità: 50 grammi per Litro di acqua (il 5% sul peso dell'acqua)
  // weight = farina + acqua + sale (+ lievito trascurabile per total)
  // weight = farina + (farina * hydRatio) + (farina * hydRatio * 0.05)
  const hydRatio = hydration / 100;
  const saltRatioOfWater = 0.05; // 50g/1000g d'acqua
  let flourAmount = weight / (1 + hydRatio + hydRatio * saltRatioOfWater);
  let waterAmount = flourAmount * hydRatio;
  const saltAmount = waterAmount * saltRatioOfWater;

  // Algoritmo Lievito Avanzato - Empirico AVPN (Base: 1.5g per Kg farina @ 23°C x 8h, idro 60%)
  // "Da 0.1 a 3g di lievito fresco per 1 Litro di Acqua".
  const baseTemp = 23;
  const baseTime = 8;

  // Stima freddo: Il frigo riduce l'attività a circa 1/10
  const equivalentHoursRT = hoursRT + hoursFridge * 0.1;

  // Legge di Van't Hoff sul metabolismo debole (raddoppio +- 7°C)
  const tempDiff = baseTemp - Math.max(2, temp); // limite minimo calcolo 2°C
  const tempMultiplier = Math.pow(2.0, tempDiff / 7);

  // Ore inverse (approssimazione lievito necessario)
  const timeMultiplier = baseTime / Math.max(0.5, equivalentHoursRT);

  // Idratazione (più è alta, meno lievito serve, l'acqua agevola metabolismo)
  const hydMultiplier = 1 - (hydration - 60) * 0.008;

  // Forza (farina fortissima ha amidi tenaci, la resa cambia esponenzialmente per sforzo)
  const strengthMultiplier = 1 + (flourStrength - 240) * 0.003;

  let yeastBaseFresh = (flourAmount / 1000) * 1.5; // Kg di farina x 1.5g
  let yeastAmount =
    yeastBaseFresh *
    tempMultiplier *
    timeMultiplier *
    hydMultiplier *
    strengthMultiplier;
  yeastAmount = Math.max(0.05, yeastAmount); // Minimo fisiologico 0.05g

  // Applica conversioni per tipo di lievito
  // Lievito di birra fresco (base 1)
  // Lievito secco = 1/3 di birra fresco
  // Lievito madre = circa 10-20% del peso della farina o un moltiplicatore altissimo rispetto al LDB
  if (yeastType === "secco") {
    yeastAmount = yeastAmount / 3;
  } else if (yeastType === "madre") {
    // Base Lievito Madre: 10% sul peso della farina a 23°C per 8 ore. (Standard AVPN/Esperti)
    // Il Lievito Madre è un ecosistema biologico vivo meno sensibile del birra, appiattiamo le curve termiche e temporali.
    let madreBase = flourAmount * 0.10;
    let dampedTimeMultiplier = Math.pow(timeMultiplier, 0.5); 
    let dampedTempMultiplier = Math.pow(tempMultiplier, 0.5); 
    
    let madreAmount = madreBase * dampedTempMultiplier * dampedTimeMultiplier * hydMultiplier * strengthMultiplier;
    
    // Sicurezza esperti (Disciplinare AVPN / Giorilli / Malati di Pizza): il LM si attesta categoricamente dal 5% al 20% della farina.
    yeastAmount = Math.max(flourAmount * 0.05, Math.min(flourAmount * 0.20, madreAmount));
    
    // Ribilanciamento Idratazione e Peso (Scorporo):
    // Il lievito madre solido classico è idratato al 50% (ossia è composto da 2/3 farina e 1/3 acqua).
    // Per far sì che il panetto finito pesi esattamente quanto richiesto e mantenga la perfetta % di idratazione:
    let farinaNelLievito = yeastAmount * (2/3);
    let acquaNelLievito = yeastAmount * (1/3);
    
    flourAmount -= farinaNelLievito;
    waterAmount -= acquaNelLievito;
  }

  // Acclimatazione Frigo: Quante ore prime bisogna estrarre i panetti dal freddo?
  let hoursAcclimation = 0;
  if (hoursFridge > 0) {
    if (temp >= 30) hoursAcclimation = 1;
    else if (temp >= 25) hoursAcclimation = 2;
    else hoursAcclimation = 3;
  }

  // Costruzione Consigli Educativi dell'Esperto in base al calcolo generato
  const infoTips: string[] = [];
  if (hydration > 80) {
    infoTips.push("💧 Alta Idratazione: hai calcolato un impasto estremo (>80%). Assicurati di usare farine molto forti e procedi con incordature o pieghe di rinforzo progressive per non farlo collassare.");
  }
  if (leaveningTime > 24) {
    infoTips.push("⏳ Lunga Maturazione: per impasti superiori a 24h l'uso del Frigorifero è essenziale per evitare l'esaurimento dei lieviti e picchi di acidità che rovinerebbero l'impasto.");
  }
  if (flourStrength > 300) {
    infoTips.push("🌾 Farina Forte: le farine ricche di proteine (>W300) come quella calcolata richiedono per forza tempi lunghi per risultare digeribili. Opta sempre per impasti superiori alle 16/24 ore.");
  }
  if (temp > 30) {
    infoTips.push("🔥 Caldo Estremo: a temperature simili la fermentazione brucia le tappe. Metti subito la massa in frigo per non rovinarla!");
  }

  return {
    yeastAmount: Number(yeastAmount.toFixed(1)),
    hoursRT: Number(hoursRT.toFixed(1)),
    hoursFridge: Number(hoursFridge.toFixed(1)),
    saltAmount: Number(saltAmount.toFixed(1)),
    flourAmount: Number(flourAmount.toFixed(0)),
    flourStrengthW: Number(flourStrength.toFixed(0)),
    waterAmount: Number(waterAmount.toFixed(0)),
    hoursAcclimation,
    infoTips,
  };
}
