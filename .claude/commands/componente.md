---
description: Crea un nuovo componente rispettando l'Atomic Design del progetto
allowed-tools: Read, Write, Edit, Grep, Glob
---

Crea il componente richiesto: **$ARGUMENTS**

Procedi così:

1. **Classifica** il componente nel livello Atomic Design corretto e motiva la scelta in una riga:
   - `components/atoms/` — unità indivisibile, solo props primitive, zero logica di business
   - `components/molecules/` — compone 2–5 atoms, stato locale minimo, nessun side-effect
   - `components/organisms/` — sezione UI completa, può usare hook/context/stato
   - `components/templates/` — scheletro di layout, nessun dato reale
   Non usare mai `components/ui/` (cartella legacy del template Expo).

2. **Guarda prima i vicini**: leggi 1–2 componenti già presenti nello stesso livello
   (es. `components/molecules/ToggleSliderField.tsx`) e allinea stile, naming e struttura delle props.

3. **Scrivi il file** in `PascalCase.tsx`, un solo export, con:
   - interfaccia `Props` tipizzata ed esplicita;
   - colori presi **sempre** da `useTheme()` di react-native-paper o da `constants/theme.ts` —
     mai valori esadecimali cablati, altrimenti si rompe il dark/light mode;
   - stili in un `StyleSheet.create()` in fondo al file;
   - `accessibilityLabel` sugli elementi interattivi.

4. **Niente fork `.web.tsx`** se non è strettamente necessario: se serve adattarsi allo schermo,
   usa `useWindowDimensions()` dentro l'unico componente.

5. Chiudi con `npm run typecheck && npm run lint`.
