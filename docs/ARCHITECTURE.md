# Architettura

Come è fatto il progetto, perché è fatto così e dove mettere le cose nuove.

---

## 1. Il modello universale

Pizza Theory è un'applicazione **universale**: un solo albero di sorgenti compilato verso tre
target.

```
                       ┌─────────────────┐
                       │  codice React   │
                       │  (TypeScript)   │
                       └────────┬────────┘
                                │  Metro bundler
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
         ┌─────────┐      ┌──────────┐      ┌──────────┐
         │   iOS   │      │ Android  │      │   Web    │
         │ (JSC/HM)│      │ (JSC/HM) │      │  RN-Web  │
         └─────────┘      └──────────┘      └──────────┘
```

Su mobile i componenti React Native diventano view native; sul web `react-native-web` li traduce in
elementi DOM e lo `StyleSheet` in CSS atomico. È per questo che il progetto **non usa CSS o SCSS**:
l'unico linguaggio di stile che attraversa tutte e tre le piattaforme è `StyleSheet.create()`.

### 1.1 Risoluzione per piattaforma — e perché NON è responsive

Metro applica le **estensioni di piattaforma**: importando `./SliderField`, risolve in ordine

```
SliderField.ios.tsx → SliderField.native.tsx → SliderField.tsx     (build iOS)
SliderField.android.tsx → SliderField.native.tsx → SliderField.tsx (build Android)
SliderField.web.tsx → SliderField.tsx                              (build web)
```

> ⚠️ **Questa scelta avviene a build time, in base alla piattaforma, non alla larghezza della
> finestra.** Un file `.web.tsx` **non è un breakpoint**: è un fork permanente del codice.
> Restringere la finestra del browser non farà mai comparire la variante mobile.

Un `.web.tsx` si giustifica solo quando una API è realmente indisponibile sul web.
Per adattarsi allo spazio disponibile si usa `useWindowDimensions()` **dentro un unico componente**.

### 1.2 Debito tecnico in corso

| File | Problema |
|---|---|
| `app/index.web.tsx` | Fork divergente di `app/index.tsx`: campi di testo invece di slider, idratazione precompilata a `"57"` benché etichettata "(facoltativo)", nessun loader. A parità di input visibili può produrre un risultato diverso. |
| `components/molecules/SliderField.web.tsx` | Codice morto: `index.web.tsx` non importa `SliderField`. |
| `components/molecules/ToggleSliderField.web.tsx` | Idem. |

Tracciato in `stato-dei-lavori.md` (`BUG-03`, `FEAT-01`). **Non aggiungere nuovi fork `.web.tsx`.**

---

## 2. Mappa delle cartelle

```
app/                       Rotte expo-router (file-based, stile Next.js)
  _layout.tsx              Provider root: Gesture → SafeArea → Paper → Drawer
  index.tsx                Home / calcolatore (mobile)
  index.web.tsx            Home / calcolatore (web) ⚠️ fork divergente
  results.tsx              Schermata ricetta + condivisione
  history.tsx              Cronologia impasti + note
  favorites.tsx            Impasti marcati preferiti

components/                Atomic Design (§3)
  atoms/ molecules/ organisms/ templates/
  ui/                      ⚠️ legacy template Expo — non aggiungere qui
  PizzaLoader.tsx          Loader animato (🍕 che gira, zero librerie)

constants/theme.ts         Temi Paper chiaro/scuro + token di brand
hooks/                     useColorScheme (+ variante .web)
utils/
  calculator.ts            🔬 Il motore — vedi docs/ALGORITHM.md
  validators.ts            Blocchi assoluti e di proporzione
  storage.ts               Ponte AsyncStorage ↔ localStorage
  tests/expert_matrix.ts   Matrice di regressione a 10 scenari

assets/                    Immagini (bg, icone, personaggio Albert)
design/                    Mockup di riferimento (non entrano nel bundle)
docs/                      Questa documentazione
scripts/run-dev.js         Launcher dev multi-piattaforma
```

---

## 3. Atomic Design

Ogni componente custom va collocato nel livello corretto. La regola decide **il livello più basso
che soddisfa il bisogno**.

| Livello | Cartella | Regola | Esempio nel repo |
|---|---|---|---|
| **Atom** | `atoms/` | Unità indivisibile. Solo props primitive. Zero logica di business. | `ToggleSwitch` |
| **Molecule** | `molecules/` | Compone 2–5 atoms. Stato locale minimo. Nessun side-effect esterno. | `ToggleSliderField`, `TipBanner` |
| **Organism** | `organisms/` | Sezione UI completa. Può usare hook, context, stato. | *(ancora vuota)* |
| **Template** | `templates/` | Scheletro di layout. Nessun dato reale, solo slot/children. | *(ancora vuota)* |

**Convenzioni:** file in `PascalCase.tsx` · un solo export per file ·
`StyleSheet.create()` in fondo al file · `accessibilityLabel` su ogni elemento interattivo.

> Le cartelle `organisms/` e `templates/` sono ancora vuote perché le schermate costruiscono il
> layout inline. È il primo refactor da fare quando `app/index.tsx` crescerà ancora.

---

## 4. Stile e theming

### 4.1 Sorgente unica dei colori

`constants/theme.ts` esporta `PizzaLightTheme` e `PizzaDarkTheme`, estensioni di `MD3LightTheme` /
`MD3DarkTheme` di react-native-paper, installate in `app/_layout.tsx` tramite `<PaperProvider>`.

| Token | Valore | Uso |
|---|---|---|
| `BRAND_RED` | `#C62828` | primary — bottoni, accenti, slider forza |
| `BRAND_ORANGE` | `#FF8A65` | secondary |
| `SliderColors.hydration` | `#42A5F5` | slider idratazione (colore acqua) |
| `SliderColors.tempGradient` | `#F5C842 → #E8502A → #C0392B` | slider temperatura |

### 4.2 La regola

> **Prendi sempre i colori da `useTheme()` o da `constants/theme.ts`.**

Un esadecimale cablato funziona in un tema e si rompe nell'altro. È già successo:
`app/results.tsx:127` usa `color: '#fff'` per i consigli dell'esperto → **testo bianco su card
bianca in light mode** (`BUG-04`).

---

## 5. Flusso applicativo

```
_layout.tsx                 Gesture → SafeArea → PaperProvider → Drawer
     │
     ▼
index.tsx / index.web.tsx   Form → useState locale
     │  "Impasta!"
     ▼
calculateDough(params)      utils/calculator.ts  → DoughResult
     │
     ▼
validateInput(params, L)    utils/validators.ts
     │                        ├─ errori di proporzione → Alert nativo / window.alert
     │                        └─ errori assoluti → HelperText sotto al campo
     ▼
Storage.saveHistoryItem()   utils/storage.ts → id
     │
     ▼
router.push('/results?id')  results.tsx legge per id e mostra la ricetta
```

**Da notare:** il calcolo gira **due volte** sul percorso felice — una per validare e una come
risultato (in realtà `precomputed` viene riusato, ma la chiamata di validazione lo richiede prima).
`calculateDough` è puro e sincrono: nessun effetto collaterale, nessuna I/O.

---

## 6. Persistenza

`utils/storage.ts` espone un'unica interfaccia `Storage` che internamente sceglie il backend:

| Piattaforma | Backend |
|---|---|
| iOS / Android | `@react-native-async-storage/async-storage` |
| Web | `window.localStorage` |

Chiave unica: `@pizzatheory_history_v1`. L'intera cronologia è un singolo array JSON.

**Politica di ritenzione:** si conservano i 30 impasti più recenti **più** tutti i preferiti più
vecchi di quella soglia. Nella schermata Preferiti, un elemento fuori dai 30 mostra l'icona
🗑 invece di ♥: togliere il preferito lo cancella definitivamente.

> **Limite architetturale.** Ogni scrittura serializza l'intero array; non c'è migrazione di schema
> (il suffisso `_v1` la prevede ma nessun codice la implementa) e i dati vivono solo sul dispositivo.
> È il punto in cui un backend diventa utile: vedi `docs/BACKEND.md`.

---

## 7. Dipendenze

### Core

| Pacchetto | Ruolo |
|---|---|
| `expo` ~54 | Runtime, build, OTA |
| `expo-router` ~6 | Routing file-based + Drawer |
| `react-native` 0.81 / `react` 19 | Framework |
| `react-native-web` ^0.21 | Target browser |
| `react-native-paper` ^5.15 | Design system Material 3 |
| `@react-native-async-storage/async-storage` | Persistenza nativa |
| `@react-native-community/slider` | Slider nativi |
| `react-native-reanimated` ~4.1 | Animazioni dei toggle |
| `expo-linear-gradient` | Gradiente dello slider temperatura |

### Da verificare

`expo-haptics`, `expo-symbols`, `expo-web-browser`, `expo-font`, `expo-image`,
`@react-navigation/bottom-tabs` risultano installati ma non usati dalle schermate attive: residui
del template Expo. Stessa cosa per `components/ui/`, `hello-wave.tsx`, `parallax-scroll-view.tsx`,
`external-link.tsx`, `haptic-tab.tsx`. Pulizia tracciata come `TECH-02`.

> Nota: `expo-image` è *dichiarato ma non usato*, mentre sarebbe esattamente il componente giusto
> per le immagini pesanti dell'app (vedi `BUG-06`).

---

## 8. Qualità e convenzioni

| Strumento | Comando | Note |
|---|---|---|
| TypeScript | `npm run typecheck` | `strict: true`. Deve passare pulito. |
| ESLint | `npm run lint` | `eslint-config-expo`. Zero errori. |
| Commitlint + Husky | automatico su `git commit` | Conventional Commits obbligatori |
| Regressione motore | `node --experimental-strip-types utils/tests/expert_matrix.ts` | 10 scenari, output ispezionabile |

**Conventional Commits:** `feat:` `fix:` `docs:` `refactor:` `chore:` `test:` `style:` `perf:`

> **Non c'è ancora un test runner.** `utils/tests/expert_matrix.ts` stampa risultati da leggere a
> occhio, non asserisce nulla. Introdurre Jest + `jest-expo` con asserzioni sugli invarianti di
> `docs/ALGORITHM.md` §7 è tracciato come `TECH-01`.

---

## 9. Build e distribuzione

Configurazione in `app.json` (Expo) ed `eas.json` (build cloud).

| Profilo EAS | Uso |
|---|---|
| `development` | Dev client, distribuzione interna |
| `preview` | Build interna di test |
| `production` | Store, `autoIncrement: true` |

Funzioni attive: `typedRoutes` (rotte tipizzate) e `reactCompiler` (memoizzazione automatica).
Output web: `static` (pre-rendering).

> ⚠️ **Manca `ios.bundleIdentifier` in `app.json`.** Android ha `com.axster.pizzatheory`, iOS no:
> la prima build iOS si bloccherà o genererà un identificatore arbitrario. Tracciato come `BUG-08`.

---

## 10. Avvio in sviluppo

```bash
npm install
npm run run-dev -- --web        # browser, http://localhost:8081
npm run run-dev -- --android    # solo se c'è un device fisico collegato
npm run run-dev -- --ios        # solo se c'è un device fisico collegato
```

Lo script `scripts/run-dev.js` verifica la presenza di un dispositivo **fisico** prima di partire e
**non avvia mai emulatori o simulatori**. Se non ne trova, spiega in console cosa manca ed esce con
codice 1. Ogni argomento extra (`--clear`, `--port`, `--tunnel`) viene inoltrato a `expo start`.

Per usare deliberatamente un emulatore: avvialo a mano, poi `npm run android` / `npm run ios`.
