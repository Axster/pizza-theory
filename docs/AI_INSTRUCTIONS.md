# Pizza Theory - Agent Context & Rules

## 🎯 Project Overview
Pizza Theory is an advanced, strictly cross-platform (React Native + Expo Web) pizza dough calculator. It's not a standard linear calculator; it’s an "Expert System" mathematically rooted in the AVPN (Associazione Verace Pizza Napoletana) protocols and refined by teachings of modern masters (like Giorilli, Bonci, and 'Malati di Pizza').

## 🧬 Core Logic (The AVPN Engine)
Any AI agent interacting with this repository MUST respect these mathematical constraints:
- **Base Hydration AVPN:** 57%-60%.
- **Salt:** Strictly calculated as 50g per Liter of Water (~2.5% of total dough weight).
- **Exact Dough Proportions (The Scaling Math):** Total Dough Weight = Flour + Water + Salt. The algebraic isolation of Flour is MUST be handled as: `Flour = Total Weight / (1 + HydrationRatio + (HydrationRatio * 0.05))`. Water is then `Flour * HydrationRatio`. Salt is `Water * 0.05`.
- **Yeast Curve (Van't Hoff):** Exponential metabolic scaling based on Room Temperature (TA). The explicit algebraic multiplier must be exactly: `Math.pow(2.0, (23 - Math.max(2, temp)) / 7)`.
- **Yeast Types Mapping:**
  - Fresh Baker's Yeast (`birra`): The baseline calculation (limits 0.1g to 30g per kg).
  - Dry Baker's Yeast (`secco`): EXACTLY 1/3 of the Fresh Yeast.
  - Sourdough (`madre`): Scaled via a damped (square root) temperature/time curve. Bound strictly between 5% and 20% of the Flour Weight. Contains 50% hydration natively (2/3 flour, 1/3 water), which MUST be mathematically subtracted from the final water/flour output to preserve target dough hydration: `Flour -= Sourdough * (2/3); Water -= Sourdough * (1/3);`
- **Leavening vs Maturation:** The engine uses Fridge time to slow down biological Leavening (yeast reproduction) while enzymatic Maturation (gluten/starch breakdown in strong W>300 flours) continues safely. 
- **Validation Blocks:** Do not let the user calculate physically impossible doughs (e.g. 400W in 4h, or 90% hydration with 200W). Alert native cross-platform UI popups instead.

## 🛠️ Stack & Architecture
- **Framework:** Expo + React Native + Expo Router.
- **UI:** React Native Paper (Material UI 3). Ensure beautiful, vibrant, dark-mode friendly components. No generic looks.
- **Storage:** `../utils/storage.ts` bridges `localStorage` (Web) and `AsyncStorage` (Mobile app).
- **Calculator:** `../utils/calculator.ts` contains all algebraic AVPN deductions.
- **Validators:** `../utils/validators.ts` throws errors and educational "Tips".

## 🚀 Prossimi Sviluppi (Roadmap Context)
When adding new features, follow the mapped roadmap:
- **Biga / Poolish:** Handling pre-ferments.
- **Appretto & Puntata:** Splitting leavening stages.
- **Tooltips:** Educating the user on terms like "Forza W" in the UI.
- **TFI (Temperatura Fine Impasto):** Calculating water temperature targets mathematically.
- **Sezione Cottura:** Oven baking recommendations post-calculation.

**Never break the Sourdough Hydration Subtraction logic, or the Yeast Limiter caps.**
