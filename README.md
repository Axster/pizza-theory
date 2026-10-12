<div align="center">

# Pizza Theory 🍕

**Il calcolatore di impasti che completa da solo i parametri che non conosci.**

[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Platforms](https://img.shields.io/badge/iOS%20·%20Android%20·%20Web-universale-C62828)](#)

</div>

---

## Cos'è

Pizza Theory calcola dosi e tempistiche per impasti **diretti** di pizza napoletana.
A differenza dei calcolatori lineari, è un **sistema esperto**: radicato nel disciplinare
**AVPN**, deduce a cascata i parametri che non gli dai e **blocca le combinazioni fisicamente
impossibili spiegandoti il perché**.

Un solo codice, tre piattaforme: **iOS, Android e Web** con la stessa interfaccia
(React Native + Expo).

```
Peso impasto · Temperatura · Tipo di lievito        ← gli unici campi obbligatori
                    ↓
        Farina · Acqua · Sale · Lievito
        Ore a temperatura ambiente · Ore in frigo
        Forza W consigliata · Consigli dell'esperto
```

---

## Come funziona il motore

### 🧮 Due regimi di calcolo

**1. AVPN puro — il vangelo.**
Se non specifichi nulla di facoltativo, valgono i valori del disciplinare: idratazione 57 %,
8 ore di maturazione, W240. L'unica variabile che ricalcola i dosaggi è la **temperatura
ambiente**, che modula il lievito secondo la legge di Q₁₀ (raddoppio ogni ~7 °C).

**2. Adattamento esperto.**
Se chiedi condizioni particolari — alta idratazione, 48 ore in cella, farine W400 — l'algoritmo
riconosce i valori fuori dalla comfort zone e ricalibra tempistiche, spinta del lievito e
assorbimenti, mandando l'impasto in frigorifero quando serve.

### 🎯 L'effetto domino

Puoi compilare **un solo campo** e lasciare che la chimica faccia il resto.

> Chiedi un'idratazione al **90 %** e basta.
> L'app deduce che per reggere quell'acqua serve un **W390** → che quella maglia glutinica
> richiede **23 ore** di maturazione → e che 21 di quelle ore vanno passate **in frigorifero**,
> per frenare la lievitazione e lasciar lavorare gli enzimi.

Un campo, tre deduzioni.

### 🧬 Lievitazione ≠ maturazione

Sono due processi distinti, e l'algoritmo li tratta come tali:

| | Cos'è | In frigorifero |
|---|---|---|
| **Lievitazione** | Il lievito produce CO₂ e gonfia il glutine | **Si ferma** quasi del tutto |
| **Maturazione** | Gli enzimi scompongono amidi e proteine | **Continua** indisturbata |

Da qui l'unica ragione per cui l'app manda un impasto in cella: **disaccoppiare** i due processi.
Con una W300 o più, si frena a forza la lievitazione per dare agli enzimi il tempo di rendere
l'impasto digeribile — senza che nel frattempo collassi.

### 🛡️ L'app come tutor

Alcune combinazioni sono fisicamente disastrose, e l'app le blocca **spiegando la chimica**
(solo quando incroci due o più parametri facoltativi, altrimenti deduce e basta):

- **24 ore su una W200** → il glutine si degrada: panetto acido e collassato
- **W400 in 4 ore** → amidi non scomposti: pasta gommosa e indigeribile
- **Idratazione 75 % in meno di 8 ore** → l'acqua non fa in tempo a essere assorbita

---

## Avvio rapido

```bash
npm install
```

### Il comando unico

```bash
npm run run-dev -- --web        # 🌐 Browser su http://localhost:8081
npm run run-dev -- --android    # 🤖 Dispositivo Android fisico collegato
npm run run-dev -- --ios        # 🍎 iPhone/iPad fisico collegato
```

> `run-dev` verifica che ci sia un dispositivo **fisico** collegato prima di partire e
> **non avvia mai emulatori o simulatori**. Se non ne trova, ti spiega in console cosa manca.
> Ogni argomento extra viene inoltrato a `expo start`:
> `npm run run-dev -- --android --clear`

### Alternative

| Comando | Cosa fa |
|---|---|
| `npm start` | Dev server con QR code per **Expo Go** (iOS e Android, senza cavo) |
| `npm run android` / `npm run ios` | Avvia **anche** emulatore/simulatore, se li vuoi |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

### Verificare il motore

```bash
node --experimental-strip-types utils/tests/expert_matrix.ts
```

Esegue la matrice di regressione: 10 scenari d'impasto con input, output, warning e tip.

---

## Struttura

```
app/           Rotte expo-router (index, results, history, favorites)
components/    Atomic Design: atoms → molecules → organisms → templates
utils/
  calculator.ts    🔬 Il motore — tutta la matematica AVPN
  validators.ts    Blocchi assoluti e di proporzione
  storage.ts       Ponte AsyncStorage ↔ localStorage
constants/     Temi chiaro/scuro e token di brand
scripts/       run-dev.js
docs/          Documentazione (vedi sotto)
```

---

## Documentazione

| Documento | Contenuto |
|---|---|
| [`docs/ALGORITHM.md`](docs/ALGORITHM.md) | **Ontologia del motore**: variabili, equazioni, invarianti |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Struttura, stack, convenzioni, flusso |
| [`docs/SPECIFICATIONS.md`](docs/SPECIFICATIONS.md) | Requisiti di prodotto e linee guida di design |
| [`docs/BACKEND.md`](docs/BACKEND.md) | Analisi e proposta per backend e database |

### La regola che tiene insieme tutto

> `docs/ALGORITHM.md` è **normativo**: definisce il modello, e `utils/calculator.ts` ne è
> l'implementazione. **Ogni modifica al motore richiede l'aggiornamento del documento nello stesso
> commit.** Prima si aggiorna il modello, poi il codice.

---

## Sviluppo assistito da AI

Il progetto è predisposto per lo **spec-driven development** con agenti AI.

| File | Letto da |
|---|---|
| **`AGENTS.md`** | Claude Code, Cursor, Cline/Roo, Codex — **file canonico** delle regole |
| `CLAUDE.md` | Claude Code: importa `AGENTS.md` e aggiunge il resto |
| `.claude/` | Comandi, permessi e hook di Claude Code |

Le regole stanno **in un solo posto**. `AGENTS.md` è uno standard aperto letto nativamente dagli
agenti principali, quindi non servono file di regole per singolo strumento: niente duplicazione,
niente contesto che diverge.

**Comandi disponibili in Claude Code:**

| Comando | Cosa fa |
|---|---|
| `/calcolo` | Verifica il motore contro l'ontologia e la matrice di regressione |
| `/componente` | Crea un componente rispettando l'Atomic Design |
| `/parita` | Audit delle divergenze fra web e mobile |
| `/stato` | Aggiorna le note di lavoro |

Un hook `PostToolUse` ricorda automaticamente di aggiornare `docs/ALGORITHM.md` quando viene
toccato `utils/calculator.ts`.

---

## Convenzioni

- **Commit:** [Conventional Commits](https://www.conventionalcommits.org), imposti da husky + commitlint
  (`feat:` `fix:` `docs:` `refactor:` `chore:` `test:` `style:` `perf:`)
- **Componenti:** Atomic Design — vedi [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) §3
- **Stile:** solo `StyleSheet.create()`, mai CSS/SCSS, mai colori cablati (sempre da `useTheme()`)
- **Prima di aprire una PR:** `npm run typecheck && npm run lint`

---

<div align="center">
<sub>Costruito con React Native, Expo e un discreto rispetto per il disciplinare AVPN.</sub>
</div>
