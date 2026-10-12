# Pizza Theory — Brief per agenti AI

> **File canonico.** `AGENTS.md` è lo standard aperto letto nativamente da Claude Code, Cursor,
> Cline/Roo, Codex e dagli altri agenti: è l'unico posto dove vivono le regole di progetto.
> `CLAUDE.md` lo importa e aggiunge solo ciò che è specifico di Claude Code.

## Cos'è

Calcolatore di impasti diretti per pizza. Non è un calcolatore lineare: è un **sistema esperto**
radicato nel disciplinare **AVPN** (Associazione Verace Pizza Napoletana) che *deduce a cascata* i
parametri mancanti invece di chiederli tutti.

App **universale** React Native + Expo Router: **un solo codice** per iOS, Android e Web.

## Stack

| Area | Scelta |
|---|---|
| Framework | Expo SDK 54, React Native 0.81, React 19 |
| Routing | `expo-router` v6 (file-based) + Drawer |
| UI kit | `react-native-paper` (Material Design 3) |
| Stile | **Solo `StyleSheet.create()`** — mai CSS/SCSS, mai stili inline ad-hoc su JSX |
| Persistenza | `AsyncStorage` (nativo) / `localStorage` (web), dietro `utils/storage.ts` |
| Lingua UI | Italiano (nessun i18n ancora) |
| Commit | Conventional Commits, imposti da husky + commitlint |

## Mappa del codice

```
app/                  Rotte expo-router (index, results, history, favorites, _layout)
components/           Atomic Design: atoms/ → molecules/ → organisms/ → templates/
  ui/                 ⚠️ Legacy template Expo — NON aggiungere nulla qui
constants/theme.ts    Temi Paper chiaro/scuro + token colore del brand
hooks/                Hook condivisi (color scheme)
utils/calculator.ts   🔬 Il motore. Tutta la matematica AVPN.
utils/validators.ts   Blocchi di validazione assoluta e di proporzione
utils/storage.ts      Ponte storage cross-platform
docs/                 Documentazione di progetto (vedi docs/README.md)
scripts/run-dev.js    Launcher dev multi-piattaforma
```

## Regole non negoziabili

### 1. Il motore di calcolo è documentato, non improvvisato

`docs/ALGORITHM.md` è l'**ontologia formale** del calcolo: variabili, domini, equazioni, invarianti.

> **Qualsiasi modifica a `utils/calculator.ts` o `utils/validators.ts` DEVE essere accompagnata,
> nello stesso commit, dall'aggiornamento di `docs/ALGORITHM.md`.**
> Prima si aggiorna il modello, poi il codice. Il codice è l'implementazione del documento, non viceversa.

Gli **invarianti** elencati in `docs/ALGORITHM.md` §7 non vanno mai violati. In particolare:

- **Scorporo del lievito madre**: il madre è idratato al 50% (2/3 farina, 1/3 acqua) e quelle
  quantità vanno sottratte da farina e acqua, altrimenti il panetto non pesa quanto richiesto.
- **Cap del lievito**: madre vincolato fra il 5% e il 20% del peso farina.
- **Bilancio di massa**: la somma degli ingredienti deve restare uguale al peso richiesto.

### 2. Atomic Design obbligatorio

| Livello | Cartella | Regola |
|---|---|---|
| Atom | `components/atoms/` | Unità indivisibile. Solo props primitive. Zero logica di business. |
| Molecule | `components/molecules/` | Compone 2–5 atoms. Stato locale minimo. Nessun side-effect. |
| Organism | `components/organisms/` | Sezione UI completa. Può usare hook, context, stato. |
| Template | `components/templates/` | Scheletro di layout. Nessun dato reale, solo slot/children. |

File in `PascalCase`, un solo export per file, stili con `StyleSheet.create()` nello stesso file.

### 3. Cross-platform: una sola UI

L'obiettivo dichiarato è **la stessa interfaccia** su web e mobile.

Le estensioni `.web.tsx` vengono risolte da Metro **a build time in base alla piattaforma, non alla
larghezza della finestra**. Un file `.web.tsx` non è quindi un breakpoint responsive: è un fork
permanente del codice. Usalo solo quando una API è davvero indisponibile sul web.

> Oggi `app/index.web.tsx` è un fork divergente di `app/index.tsx` (campi di testo invece di slider,
> parametri facoltativi precompilati). È **debito tecnico noto**, tracciato in `stato-dei-lavori.md`.
> **Non aggiungere nuovi fork `.web.tsx`**: preferisci un componente unico + `useWindowDimensions()`.

### 4. Temi, mai colori cablati

Prendi sempre i colori da `useTheme()` o da `constants/theme.ts`. Un `color: '#fff'` cablato diventa
testo bianco su sfondo bianco in light mode (è già successo: vedi `stato-dei-lavori.md`).

### 5. Commit convenzionali

`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`, `style:`, `perf:`.
Husky blocca i commit fuori standard.

## Prima di dire "fatto"

```bash
npm run typecheck   # tsc --noEmit — deve passare pulito
npm run lint        # eslint — zero errori
```

## Dove sta scritto cosa

| Domanda | File |
|---|---|
| Come funziona la matematica? | `docs/ALGORITHM.md` |
| Com'è strutturato il progetto? | `docs/ARCHITECTURE.md` |
| Cosa deve fare il prodotto? | `docs/SPECIFICATIONS.md` |
| Come si aggiungerebbe un backend? | `docs/BACKEND.md` |
| Cosa c'è da fare adesso? | `stato-dei-lavori.md` (privato, non versionato) |
