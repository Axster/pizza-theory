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

  // "Expert" Deductive Algorithm: If fields are missing, we deduce them by cross-referencing existing ones
  if (!leaveningTime && !hydration && !flourStrength) {
    // AVPN Purism if the user leaves everything blank
    leaveningTime = 8;
    hydration = 57;
    flourStrength = 240;
  } else {
    if (!flourStrength) {
      // If W is missing, deduce it from time or hydration
      if (leaveningTime) {
        flourStrength = Math.min(400, 200 + leaveningTime * 5);
      } else if (hydration && hydration > 60) {
        // If only hydration is entered, water dictates the gluten network: 60%->W240, 80%->W340, 90%->W390
        flourStrength = Math.min(400, 240 + (hydration - 60) * 5);
      } else {
        flourStrength = 240; // Base strength
      }
    }
    if (!hydration) {
      // Hydration scaled from W: W240->57%, W300->60%, W400->65%
      hydration = 45 + flourStrength / 20;
    }
    if (!leaveningTime) {
      // Hours scaled from W: W240->8h, W300->14h, W380->22h
      leaveningTime = Math.max(8, Math.floor((flourStrength - 160) / 10));
    }
  }

  // Timing split: Fridge vs Room Temperature (Expert AVPN/High Hydration Logic)
  // The dough rests 100% at Room Temperature (RT) within AVPN comfort zones.
  let hoursRT = leaveningTime;
  let hoursFridge = 0;

  const isHighHydration = hydration > 65;
  const isHighTemp = temp > 25;
  const isLongTime = leaveningTime > 24;
  const isStrongFlour = flourStrength > 300;

  // Edge cases requiring the stabilizing utility of the fridge
  if (
    isLongTime ||
    (isHighHydration && leaveningTime > 8) ||
    (isHighTemp && leaveningTime > 8) ||
    (isStrongFlour && leaveningTime > 12)
  ) {
    if (temp >= 34) {
      // In scorching heat (>30°C), fermentation is lightning fast. 1h (or less) will be enough to start the yeast.
      hoursRT = Math.min(1, leaveningTime * 0.1);
    } else {
      hoursRT = leaveningTime > 24 ? 2 : Math.min(2, leaveningTime * 0.25); // ~ 1-2h at RT
    }
    hoursFridge = leaveningTime - hoursRT;
  }

  // Base mass calculation based on AVPN guidelines
  // Salinity: 50 grams per liter of water (5% on water weight)
  // weight = flour + water + salt (+ negligible yeast for total)
  // weight = flour + (flour * hydRatio) + (flour * hydRatio * 0.05)
  const hydRatio = hydration / 100;
  const saltRatioOfWater = 0.05; // 50g/1000g of water
  let flourAmount = weight / (1 + hydRatio + hydRatio * saltRatioOfWater);
  let waterAmount = flourAmount * hydRatio;
  const saltAmount = waterAmount * saltRatioOfWater;

  // Advanced Yeast Algorithm - Empirical AVPN (Base: 1.5g per Kg of flour @ 23°C x 8h, 60% hydro)
  // "From 0.1 to 3g of fresh yeast per 1 Liter of Water".
  const baseTemp = 23;
  const baseTime = 8;

  // Cold estimate: The fridge reduces activity to about 1/10
  const equivalentHoursRT = hoursRT + hoursFridge * 0.1;

  // Van't Hoff's law on weak metabolism (doubling every +- 7°C)
  const tempDiff = baseTemp - Math.max(2, temp); // minimum calculation limit 2°C
  const tempMultiplier = Math.pow(2.0, tempDiff / 7);

  // Inverse hours (approximation of yeast needed)
  const timeMultiplier = baseTime / Math.max(0.5, equivalentHoursRT);

  // Hydration (higher hydration means less yeast needed, water facilitates metabolism)
  const hydMultiplier = 1 - (hydration - 60) * 0.008;

  // Strength (very strong flour has tough starches, the yield changes exponentially for effort)
  const strengthMultiplier = 1 + (flourStrength - 240) * 0.003;

  let yeastBaseFresh = (flourAmount / 1000) * 1.5; // Kg of flour x 1.5g
  let yeastAmount =
    yeastBaseFresh *
    tempMultiplier *
    timeMultiplier *
    hydMultiplier *
    strengthMultiplier;
  yeastAmount = Math.max(0.05, yeastAmount); // Physiological minimum 0.05g

  // Apply conversions for yeast type
  // Fresh yeast (base 1)
  // Dry yeast = 1/3 of fresh yeast
  // Sourdough = approximately 10-20% of flour weight or a much higher multiplier than commercial yeast
  if (yeastType === "secco") {
    yeastAmount = yeastAmount / 3;
  } else if (yeastType === "madre") {
    // Sourdough base: 10% on flour weight at 23°C for 8 hours (AVPN/Expert Standard)
    // Sourdough is a live biological ecosystem less sensitive than commercial yeast, flattening thermal and temporal curves.
    let madreBase = flourAmount * 0.10;
    let dampedTimeMultiplier = Math.pow(timeMultiplier, 0.5); 
    let dampedTempMultiplier = Math.pow(tempMultiplier, 0.5); 
    
    let madreAmount = madreBase * dampedTempMultiplier * dampedTimeMultiplier * hydMultiplier * strengthMultiplier;
    
    // Expert safety range (AVPN / Giorilli / Pizza Geeks): Sourdough typically ranges from 5% to 20% of the flour.
    yeastAmount = Math.max(flourAmount * 0.05, Math.min(flourAmount * 0.20, madreAmount));
    
    // Hydration and Weight rebalancing (Separation):
    // Classic solid sourdough is hydrated at 50% (i.e., composed of 2/3 flour and 1/3 water).
    // To ensure the finished dough ball weighs exactly as requested and maintains the perfect hydration %:
    let farinaNelLievito = yeastAmount * (2/3);
    let acquaNelLievito = yeastAmount * (1/3);
    
    flourAmount -= farinaNelLievito;
    waterAmount -= acquaNelLievito;
  }

  // Fridge Acclimation: How many hours before should the dough balls be taken out of the cold?
  let hoursAcclimation = 0;
  if (hoursFridge > 0) {
    if (temp >= 30) hoursAcclimation = 1;
    else if (temp >= 25) hoursAcclimation = 2;
    else hoursAcclimation = 3;
  }

  // Construction of Expert Educational Tips based on the generated calculation
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
