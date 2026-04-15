# Struttura e Architettura di Pizza Theory

Questo documento illustra l'architettura tecnica del progetto `Pizza Theory`, le librerie scelte, e l'approccio allo sviluppo dell'interfaccia utente (UI).

## 1. Architettura di Base
Il progetto è basato su **Expo**. Expo permette di sviluppare applicazioni **Universal React** (scrivendo componenti React Native che vengono compilati sia per Mobile iOS/Android che per Web Browser).
- **Cartella `app/`**: Contiene la logica di navigazione basata su **Expo Router** (file-based routing simile a Next.js).
- **Cartella `components/`**: Contiene componenti riutilizzabili nell'app indipendenti dalle schermate (es. il loader `PizzaLoader.tsx`).
- **Cartella `utils/`**: Contiene la logica scorporata dalla UI (es. l'algoritmo di calcolo in `calculator.ts` e le logiche di lettura/scrittura su memoria locale in `storage.ts`).

## 2. Librerie Utilizzate
Oltre al core di React e React Native, l'app si affida a librerie stabili e standard per l'ecosistema Expo:
- **`expo-router`**: Gestisce in automatico la navigazione tra le pagine `index.tsx` (Home), `results.tsx` e `history.tsx`.
- **`react-native-paper`**: È il design system principale dell'app. Implementa i fondamenti del Material Design v3 e ci offre componenti pronti (Card, Input, Bottoni) superando la necessità di crearli da zero. È al 100% compatibile sia col Web che col Mobile nativo.
- **`@react-navigation/drawer` & `react-native-gesture-handler`**: Integrati sotto il cofano da Expo Router per gestire il "Burger Menu" (Drawer Navigation) fluido a sinistra.
- **`@react-native-async-storage/async-storage`**: È il "database" dell'app. Permette di salvare e recuperare JSON (la cronologia impasti) in modo asincrono, usando il LocalStorage su Web e l'archiviazione sicura nativa su iOS/Android.

## 3. Gestione dello Stile (Styling)
Come richiesto, il progetto **non fa uso di CSS o SCSS veri e propri**.
- **Theming Globale**: Lo stile centrale è istanziato nel file `app/_layout.tsx`. Abbiamo avvolto l'app intera con il `<PaperProvider>` di React Native Paper e gli abbiamo passato il nostro tema custom basato sul tema *Dark Preset* di Material (`MD3DarkTheme`). Sono stati sovrascritti i colori primari per fornire toni accesi ed eleganti che richiamano la pizza (`#FF6347` per il Tomato red, `#FFA500` per l'Orange e sfondi molto scuri per risaltarli).
- **Styling Inline**: Al posto del CSS, passiamo alle singole View e Testi i file JavaScript chiamati `StyleSheet.create()`. Questo metodo assicura performance massime su Mobile e traduce lo stile automaticamente in stili CSS atomici quando si visualizza l'app sul Web.

## 4. Panoramica del Flusso
1. **L'avvio (`_layout.tsx`)**: Inizializza i provider del layout e della navigazione a comparsa dal lato (Drawer).
2. **Homepage (`index.tsx`)**: Cattura lo stato degli input utente tramite l'Hook `useState`. Al momento di calcolare si abilita il componente `<PizzaLoader />` fittizio ma esteticamente d'effetto (senza usare pesanti librerie Lottie). Al compimento chiama la funzione in `./utils/calculator`, salva la history con `storage.ts` e passa l'id della run alla pagina risultati.
3. **Risultati (`results.tsx`)**: Legge il risultato salvato usando l'Id e chiama API native (come `Share.share` o `navigator.share` su Web) per favorire la condivisione social dell'impasto.
4. **Cronologia (`history.tsx`)**: Legge dinamicamente lo storico. Offre input dinamici per inserire le "Note" su come l'impasto ha risposto alle attese.
