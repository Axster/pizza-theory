# Backend e database — analisi e proposta

> **Documento di valutazione, non di implementazione.** Oggi Pizza Theory è **100 % client-side**:
> tutto vive in `AsyncStorage`/`localStorage` sul dispositivo. Questo file analizza se, quando e
> come introdurre un backend.

## ⏱️ Collocazione temporale — leggere prima di tutto il resto

Nulla di questo documento riguarda la fase attuale del progetto. Le fasi sono tre, **sequenziali**,
e ognuna ha senso solo se la precedente è conclusa e stabile:

| Fase | Contenuto | Stato |
|---|---|---|
| **1 — Attuale** | App client-side completa. Motore di calcolo, UI unificata e responsive, storage locale, correzione dei bug noti. | 🔵 **in corso** |
| **2 — Avanzata** | Backend + database: account, sincronizzazione multi-device, backup cloud, contenuti remoti. **Tutto questo documento, §1–§9.** | ⚪ non iniziata |
| **3 — Molto avanzata** | Trasformazione del motore in un modello appreso dai dati di feedback. **§10.** | ⚪ ipotesi |

**Cosa comporta, in pratica:**

- La **fase 2 non si apre** finché la fase 1 non è conclusa: `FEAT-01` (UI responsive unificata) e
  i bug 🔴 di `stato-dei-lavori.md` vengono prima. Un backend costruito su un'app ancora instabile
  è infrastruttura che va rifatta.
- La **fase 3 dipende dai dati**, non dalla volontà: servono ~500 feedback reali solo per il
  primo stadio (§10.2). Prima di averli, non è pianificabile — è una direzione, non una roadmap.
- **Il motore di calcolo resta sul client in tutte e tre le fasi.** Nemmeno la fase 3 lo sposta
  sul server: il modello appreso produce una correzione, non sostituisce il calcolo locale (§10.3).

> Scritto diversamente: **oggi non serve un backend.** Questo documento esiste perché le decisioni
> di schema da prendere *adesso* — UUID stabili, `modelVersion`, feedback strutturato — sono
> quelle che renderanno possibili le fasi 2 e 3 senza riscrivere tutto. I dati non raccolti oggi
> non si recuperano domani.

---

## 1. Serve davvero un backend?

Onestamente: **il calcolatore non ne ha bisogno.** `calculateDough()` è una funzione pura e
sincrona; farla girare sul server aggiungerebbe latenza, un punto di fallimento e un costo, senza
migliorare nulla. **Il motore deve restare sul client.**

Quello che un backend abilita davvero è altro:

| Funzionalità | Richiede backend? | Perché |
|---|---|---|
| Calcolo dell'impasto | ❌ no | Funzione pura, meglio offline |
| Cronologia locale | ❌ no | `AsyncStorage` basta |
| **Account e sincronizzazione multi-device** | ✅ sì | Serve un'identità e uno storage condiviso |
| **Backup contro la perdita del dispositivo** | ✅ sì | Oggi disinstallare l'app = perdere tutto |
| **Condividere una ricetta con un link** | ✅ sì | Serve un URL che risolva una ricetta |
| **Contenuti aggiornabili senza rilasciare l'app** (tip, glossario, consigli di Albert) | ✅ sì | Altrimenti ogni correzione di testo è una release |
| **Capire quali impasti funzionano** (analytics sulle note utente) | ✅ sì | Dato aggregato, non locale |
| **Ricalibrare il modello sui feedback reali** | ✅ sì | È il vero valore a lungo termine |

L'ultimo punto è quello interessante. L'app chiede già all'utente *"com'è venuta la pizza?"* in
`history.tsx`, e oggi quella risposta muore sul telefono. Raccoglierla significa poter tarare le
costanti di `docs/ALGORITHM.md` su dati reali invece che su letteratura. **Questa, più della
sincronizzazione, è la ragione forte per avere un backend.**

### 1.1 Requisiti decisi

Il backend, quando si farà, dovrà soddisfare questi tre punti:

1. **Autenticazione con login**, preferibilmente **Sign in with Google** e **Sign in with Apple**
   (vedi §4.1). L'accesso con email e password resta un'opzione secondaria, non la principale.
2. **Persistenza per utente** di impasti, note, preferiti e preferenze: tutto ciò che nella fase
   iniziale vive in `AsyncStorage`/`localStorage` deve poter **migrare** sull'account senza
   che l'utente perda nulla (vedi §3.2).
3. **Meccanismo di feedback** strutturato, pensato fin dall'inizio per alimentare la
   ricalibrazione del motore di calcolo — e, in prospettiva, un modello ML (vedi §10).

> L'autenticazione non è un fine: è il **prerequisito** degli altri due punti. Senza un'identità
> non c'è né sincronizzazione né dataset di feedback attribuibile.

### Raccomandazione sul "quando"

> Introdurre il backend **solo insieme** alla funzionalità account (voce 14 della vecchia roadmap).
> Prima di allora sarebbe infrastruttura senza utenti. Fino a quel momento, un backup
> esporta/importa JSON locale copre il 90 % del rischio con l'1 % del lavoro.

---

## 2. Valutazione dello stack proposto (Node + MongoDB)

L'ipotesi di partenza — **Node.js + MongoDB** — è **corretta per questo progetto**. Le ragioni:

**A favore di Node**
- Stesso linguaggio del client: `DoughParams` e `DoughResult` sono già tipi TypeScript, si
  condividono fra app e server senza riscriverli né tradurli.
- `calculateDough()` può essere eseguito *identico* lato server quando serve (es. rigenerare
  l'anteprima di una ricetta condivisa) — impossibile con Python o Go senza duplicare il modello.
- Il carico è I/O-bound e bassissimo: niente giustifica un runtime più performante.

**A favore di MongoDB**
- Un impasto salvato **è già un documento JSON** (`HistoryItem`: params + result + notes annidati).
  Normalizzarlo in tabelle relazionali significherebbe 4 join per ricostruire ciò che oggi è un
  singolo oggetto.
- Lo schema del motore **evolverà** (biga, poolish, multi-farina, puntata/appretto: tutta la
  roadmap aggiunge campi). Un datastore documentale assorbe l'aggiunta di campi facoltativi senza
  migrazioni bloccanti.
- Le query reali sono banali: "le ricette di questo utente", "questa ricetta per id".
  Nessun JOIN complesso, nessuna transazione multi-entità.

**Dove PostgreSQL batterebbe Mongo:** analisi aggregata dei feedback (correlare parametri d'impasto
e valutazioni su milioni di righe). È uno scenario lontano, e l'aggregation pipeline di Mongo lo
copre fino a volumi ben oltre quelli previsti. Se un giorno servisse, si esporta su un warehouse —
non si riscrive l'app.

**Conclusione:** ✅ **Node + MongoDB confermato.** Non è un compromesso, è la scelta giusta.

---

## 3. Architettura proposta

```
┌──────────────────────────────────────────┐
│  App (iOS / Android / Web)               │
│  ├─ calculateDough()   ← resta QUI       │
│  ├─ Storage locale     ← sorgente di     │
│  │                       verità offline  │
│  └─ SyncService        ← nuovo           │
└───────────────┬──────────────────────────┘
                │  HTTPS + JWT
                ▼
┌──────────────────────────────────────────┐
│  API Node (Fastify + TypeScript)         │
│  ├─ /auth      registrazione, login      │
│  ├─ /recipes   CRUD + sync               │
│  ├─ /share     link pubblici             │
│  └─ /content   tip e glossario           │
└───────────────┬──────────────────────────┘
                ▼
┌──────────────────────────────────────────┐
│  MongoDB Atlas (free tier M0)            │
│  users · recipes · shared · content      │
└──────────────────────────────────────────┘
```

### 3.1 Principio guida: offline-first

> **Il dispositivo resta la sorgente di verità. Il server è una copia.**

L'app deve continuare a funzionare al 100 % senza rete — è un calcolatore che si usa in cucina,
dove il Wi-Fi spesso non arriva. La sincronizzazione è un *di più* opportunistico, mai un requisito.

Ogni `HistoryItem` acquisisce tre campi:

```ts
updatedAt: string;                       // ISO 8601, per risolvere i conflitti
syncedAt?: string;                       // null = modifica locale non ancora inviata
deleted?: boolean;                       // tombstone: cancellare davvero rompe la sync
```

**Risoluzione dei conflitti: last-write-wins su `updatedAt`.** Per dei dosaggi di pizza è più che
sufficiente; un CRDT sarebbe sovra-ingegnerizzazione.

> ⚠️ Serve prima sistemare `HistoryItem.id`: oggi è `Date.now().toString()`, che collide se due
> salvataggi cadono nello stesso millisecondo e, peggio, **collide fra dispositivi diversi**.
> Passare a `crypto.randomUUID()` è prerequisito della sincronizzazione (`BUG-07`).

---

### 3.2 Migrazione dal locale all'account

Nella fase iniziale tutto vive sul dispositivo. Quando l'utente accede per la prima volta, i dati
locali **non devono sparire né duplicarsi**.

```
1. L'utente accede (Google/Apple) per la prima volta
2. L'app trova N impasti locali senza `userId`
3. Chiede: "Vuoi aggiungere i tuoi N impasti a questo account?"
4. Se sì → POST /recipes/batch con gli UUID già esistenti
5. Gli UUID lato client (BUG-07) garantiscono che un secondo accesso NON duplichi nulla
```

> È qui che `BUG-07` presenta il conto: con `Date.now()` come id, due dispositivi che caricano
> lo stesso impasto generano due record diversi — oppure, peggio, collidono e se ne sovrascrivono
> uno a vicenda. **UUID stabili lato client sono il prerequisito di tutta la migrazione.**

L'utente che **non** accede deve continuare a usare l'app esattamente come prima: il login è
opzionale, e chi lo rifiuta non perde nessuna funzionalità di calcolo.

---

## 4. Stack tecnico consigliato

| Livello | Scelta | Perché questa e non un'altra |
|---|---|---|
| Runtime | **Node.js 22 LTS** | Stesso linguaggio del client |
| Framework | **Fastify** | ~2× Express in throughput, validazione JSON Schema integrata, TypeScript di prima classe. Express è la scelta "di default", Fastify quella informata. |
| Validazione | **Zod** | Uno schema → tipo TS + validazione runtime. Condivisibile con l'app. |
| ODM | **Mongoose** | Schema espliciti e validazione. In alternativa il driver nativo se si preferisce leggerezza. |
| Auth | **OAuth/OIDC Google + Apple**, sessione via **JWT** (access 15 min + refresh 30 gg) | Vedi §4.1. Niente password da gestire nel caso principale; per il fallback email, hash con **Argon2id**. |
| Hosting API | **Railway** o **Render** | Deploy da git, free tier reale, zero configurazione |
| Database | **MongoDB Atlas M0** | Gratuito fino a 512 MB ≈ decine di migliaia di ricette |
| Log/errori | **Pino** + **Sentry** | Pino è integrato in Fastify |
| Test | **Vitest** + **mongodb-memory-server** | Test di integrazione veri senza DB esterno |

### 4.1 Login social: Google e Apple

**Perché social e non email+password**

- Nessuna password da conservare, resettare o farsi rubare: sparisce un'intera classe di rischi
  e di schermate da costruire (registrazione, recupero, cambio password, verifica email).
- Attrito di registrazione molto più basso — e l'account serve a raccogliere feedback, quindi
  ogni passaggio in meno è dataset in più.
- Su mobile è il pattern che gli utenti si aspettano.

**⚠️ Vincolo App Store, non negoziabile**

> Le linee guida Apple (4.8, *Login Services*) impongono che un'app che offre login social di
> terze parti (Google incluso) offra **anche Sign in with Apple**, con pari evidenza.
> Non è una preferenza: senza, la review iOS viene respinta.

Quindi: **Google e Apple insieme, o nessuno dei due.**

**Implicazioni tecniche**

| Aspetto | Nota |
|---|---|
| Librerie | `expo-auth-session` (Google) + `expo-apple-authentication` (Apple, solo iOS) |
| Verifica | Il server **deve** validare l'`id_token` lato backend. Mai fidarsi del token che arriva dal client. |
| Email privata Apple | Apple può restituire un indirizzo relay `@privaterelay.appleid.com`. È un'email valida: non filtrarla, non chiedere "quella vera". |
| Nome utente | Apple fornisce nome e cognome **solo al primo accesso**. Se non lo salvi subito, è perso per sempre. |
| Chiave di identità | Indicizza su `provider + providerUserId`, **non** sull'email: l'email può cambiare, l'id del provider no. |
| Account merge | Stessa persona che entra prima con Google e poi con Apple: decidere a monte se unire gli account sull'email verificata o tenerli separati. Deciderlo dopo è doloroso. |
| Web | Su web Apple usa un flusso popup/redirect diverso da quello nativo: va previsto. |

### Alternativa da considerare seriamente: BaaS

Se l'obiettivo è **avere account e sync il prima possibile**, un Backend-as-a-Service elimina del
tutto il lavoro di infrastruttura:

| Opzione | Pro | Contro |
|---|---|---|
| **Appwrite** / **Supabase** | Auth, DB, storage e realtime pronti; SDK React Native ufficiale; self-hostabili | Supabase è PostgreSQL (meno naturale per documenti annidati) |
| **Firebase** | Offline-first *nativo*, sync automatica, maturo | Lock-in Google, costi imprevedibili a volume |
| **Node + Mongo custom** | Controllo totale, logica di dominio propria, nessun lock-in | ~2–3 settimane di lavoro iniziale |

> **Il mio consiglio:** se il backend serve *solo* per account e sincronizzazione, parti da
> **Appwrite** e risparmia settimane. Passa al backend custom **quando** arriva la logica di
> dominio vera — la ricalibrazione del modello sui feedback — che un BaaS non sa fare.
> L'astrazione `SyncService` lato app rende questa migrazione quasi indolore, purché la si preveda
> da subito.

---

## 5. Modello dati

### `users`

```js
{
  _id:          ObjectId,
  email:        String,   // unique, indicizzato, lowercase (può essere un relay Apple)
  emailVerified: Boolean,
  identities: [           // un utente, più provider — vedi §4.1
    { provider: 'google' | 'apple' | 'password',
      providerUserId: String,   // 'sub' dell'id_token; CHIAVE DI IDENTITÀ
      linkedAt: Date }
  ],
  passwordHash: String,   // Argon2id — solo per provider 'password'
  displayName:  String,
  consents: {             // GDPR: consensi separati e revocabili — vedi §7.1
    training:      { granted: Boolean, at: Date, policyVersion: String },
    analytics:     { granted: Boolean, at: Date }
  },
  preferences: {
    locale:      'it' | 'en',
    theme:       'light' | 'dark' | 'auto',
    weightUnit:  'g' | 'kg' | 'lb' | 'oz',
    tempUnit:    'C' | 'F'
  },
  createdAt: Date,
  lastSeenAt: Date
}
```

> Le `preferences` sono qui e non in una collection separata perché si leggono **sempre** insieme
> all'utente e **mai** da sole: separarle significherebbe una query in più a ogni avvio.

### `recipes`

```js
{
  _id:       String,      // UUID generato dal CLIENT — vedi §3.1
  userId:    ObjectId,    // indicizzato
  params:    { weight, temp, yeastType, leaveningTime?, hydration?, flourStrength? },
  result:    { yeastAmount, hoursRT, hoursFridge, saltAmount,
               flourAmount, flourStrengthW, waterAmount, hoursAcclimation?, infoTips? },
  notes:      String,     // testo libero dell'utente
  feedback: {             // STRUTTURATO — vedi §10.1. È il dataset di addestramento.
    rating:       Number,   // 1–5 complessivo
    outcome: {              // tag chiusi, non testo libero
      rise:       'insufficiente' | 'corretta' | 'eccessiva',
      texture:    'gommosa' | 'corretta' | 'collassata',
      flavor:     'insipida' | 'corretta' | 'acida',
      workability:'difficile' | 'corretta' | 'appiccicosa'
    },
    actualTemp:   Number,   // temperatura REALE misurata, può differire da params.temp
    actualHours:  Number,   // ore REALI, l'utente raramente rispetta il piano
    submittedAt:  Date
  },
  isFavorite: Boolean,
  modelVersion: String,   // es. "1.0.0" — vedi §5.1
  createdAt:  Date,
  updatedAt:  Date,       // last-write-wins
  deleted:    Boolean     // tombstone
}
```

**Indici:**
```js
{ userId: 1, updatedAt: -1 }   // sync delta e lista cronologia
{ userId: 1, isFavorite: 1 }   // schermata preferiti
```

### 5.1 `modelVersion`: il campo che non sembra importante e lo è

Memorizzare la versione del modello (`docs/ALGORITHM.md` §10) usata per ogni ricetta permette di:

1. **riprodurre** una ricetta vecchia esattamente com'era, anche dopo aver corretto il motore;
2. **sapere quali dati sono confrontabili** quando si ricalibrano le costanti sui feedback;
3. **avvisare l'utente** che una ricetta salvata è stata calcolata con una formula poi corretta.

Senza questo campo, la prima correzione del motore (es. `BUG-01`) rende l'intero storico
silenziosamente incoerente. **Va aggiunto anche allo storage locale, subito, prima del backend.**

### `shared`

```js
{
  _id:       String,      // slug breve e leggibile, es. "verace-8h-a3f9"
  recipeId:  String,
  snapshot:  Object,      // copia immutabile: la ricetta condivisa non cambia più
  viewCount: Number,
  createdAt: Date,
  expiresAt: Date         // TTL index → cancellazione automatica
}
```

> `snapshot` e non un riferimento: se l'autore modifica o cancella la ricetta, il link già
> condiviso deve continuare a mostrare ciò che è stato condiviso.

### `content`

Tip di Albert, voci di glossario, consigli contestuali — oggi cablati nel codice.

```js
{
  _id:     ObjectId,
  type:    'tip' | 'glossary' | 'advice',
  key:     String,                      // identificatore stabile
  locale:  'it' | 'en',
  title:   String,
  body:    String,
  conditions: { minHydration?, maxHydration?, yeastType?, minW?, maxW? },
  publishedAt: Date
}
```

Spostare qui i contenuti editoriali significa **correggere un testo senza passare dallo store**.
L'app li scarica, li mette in cache e usa una copia cablata come fallback offline.

---

## 6. API

Tutte le rotte sotto `/api/v1`. Autenticazione `Authorization: Bearer <access_token>`.

| Metodo | Rotta | Descrizione |
|---|---|---|
| `POST` | `/auth/register` | Registrazione → access + refresh token |
| `POST` | `/auth/login` | Login |
| `POST` | `/auth/refresh` | Rinnovo dell'access token |
| `POST` | `/auth/logout` | Revoca del refresh token |
| `GET` | `/recipes?since=<ISO>` | **Sync delta**: solo ciò che è cambiato |
| `POST` | `/recipes/batch` | **Push batch**: invia le modifiche locali in un colpo solo |
| `PATCH` | `/recipes/:id` | Aggiorna nota, rating, preferito |
| `DELETE` | `/recipes/:id` | Tombstone (non cancella davvero) |
| `POST` | `/share` | Crea un link pubblico → slug |
| `GET` | `/share/:slug` | Legge una ricetta condivisa (pubblica, senza auth) |
| `GET` | `/content?locale=it&since=<ISO>` | Contenuti editoriali (pubblica) |
| `GET` | `/health` | Liveness probe |

### Il protocollo di sincronizzazione in tre passi

```
1. PUSH   POST /recipes/batch  con tutti gli item dove syncedAt == null
2. PULL   GET  /recipes?since=<ultimo syncedAt>
3. MERGE  per ogni id in conflitto, vince updatedAt più recente
```

Si esegue all'avvio, al ritorno in foreground e dopo ogni salvataggio (con debounce).
Se la rete non c'è, **non succede niente**: l'app continua a funzionare e riproverà dopo.

---

## 7. Sicurezza — proporzionata al rischio

Il dato trattato è *"quanto lievito ho messo in una pizza"*: non è sanitario, non è finanziario.
Il livello giusto è **igiene di base fatta bene**, non difesa in profondità.

**Indispensabile** (costo quasi nullo, protegge dagli errori reali):

- [ ] **HTTPS ovunque**, HSTS attivo
- [ ] **Validazione lato server dell'`id_token`** Google/Apple a ogni accesso — firma,
      `aud`, `iss`, scadenza. Mai fidarsi di ciò che arriva dal client
- [ ] **Argon2id** per le password del solo fallback email (mai MD5/SHA)
- [ ] **Validazione di ogni input con Zod** al confine dell'API — la difesa principale contro
      injection in Mongo è non passare mai oggetti non validati nelle query
- [ ] **Rate limiting**: 5 tentativi di login / 15 min per IP, 100 req/min sulle rotte autenticate
- [ ] **Segreti in variabili d'ambiente**, mai nel repo
- [ ] **CORS** ristretto all'origine web dell'app
- [ ] `helmet` per gli header di sicurezza
- [ ] **Access token a vita breve** (15 min) + refresh revocabile
- [ ] **Autorizzazione per risorsa**: ogni query filtra per `userId`, sempre — mai fidarsi dell'id
      che arriva dal client
- [ ] Dipendenze aggiornate (`npm audit` in CI)

**Non necessario adesso:** 2FA, cifratura a riposo lato campo, audit log immutabili, WAF, SOC2.

**Da non sbagliare comunque — è legge, non sicurezza:**

- **GDPR**: l'app è italiana e tratta email. Servono privacy policy, **export dei propri dati** e
  **cancellazione account effettiva**. Il consenso all'uso dei dati per **addestrare il modello**
  (§10.5) deve essere **separato, esplicito e revocabile**: non incluso nei ToS, non pre-spuntato.
- **Sign in with Apple obbligatorio** se si offre Google (linea guida Apple 4.8) — vedi §4.1.
- **Store**: sia App Store sia Google Play richiedono, per le app con account, una procedura di
  cancellazione dell'account raggiungibile **dall'app stessa**. Senza, la review viene respinta.

---

## 8. Percorso di implementazione

| Fase | Contenuto | Stima | Dipendenze |
|---|---|---|---|
| **0** | `id` → UUID, aggiunta di `updatedAt`/`modelVersion` allo storage locale, export/import JSON | 2–3 gg | nessuna — **si può fare subito** |
| **1** | Scaffold API: Fastify + Mongoose + Zod, `/health`, CI, deploy | 3–4 gg | fase 0 |
| **2** | Auth **Google + Apple** (§4.1) + schermate di accesso | 6–9 gg | fase 1 |
| **3** | `SyncService` lato app + rotte `/recipes` + **migrazione dati locali** (§3.2) | 6–8 gg | fase 2 |
| **4** | Link di condivisione pubblici | 2–3 gg | fase 3 |
| **5** | `/content` + CMS minimale per i tip | 3–5 gg | fase 1 |
| **6** | **Feedback strutturato** (§10.1) nell'app + raccolta consensi | 4–6 gg | fase 3 |
| **7** | Dashboard di ricalibrazione delle costanti (§10.2, stadio 1) | 5+ gg | fase 6 + ~500 feedback |

> **La fase 0 ha valore anche se il backend non si farà mai**: UUID stabili, `modelVersion` ed
> export JSON rendono l'app più robusta da sola. È il primo passo in ogni caso.

---

## 9. Costi stimati (fase iniziale)

| Voce | Soluzione | Costo/mese |
|---|---|---|
| Database | MongoDB Atlas M0 (512 MB) | € 0 |
| API hosting | Railway / Render free tier | € 0 |
| Monitoraggio | Sentry free (5k eventi) | € 0 |
| Dominio API | `api.pizzatheory.app` | ~€ 1 |

Oltre i ~2.000 utenti attivi: Atlas M10 (~€ 50) + hosting a pagamento (~€ 15). Fino ad allora, zero.

---

## 10. Evoluzione del motore: dai feedback al machine learning

> Prospettiva di lungo periodo. Nulla di questa sezione è realizzabile prima di avere un volume
> di feedback significativo — ma **le decisioni di schema vanno prese adesso**, perché i dati non
> raccolti oggi non si recuperano domani.

### 10.1 Il feedback va strutturato, non lasciato libero

Oggi `history.tsx` chiede *"com'è venuta la pizza?"* in un campo di testo libero. Per un essere
umano è perfetto; come dato di addestramento è quasi inutilizzabile: non si aggrega, non si
confronta, non si misura.

Serve affiancargli **tag chiusi** (vedi `recipes.feedback` in §5). Quattro assi bastano, e ognuno
mappa su un parametro del modello:

| Asse | Valori | Cosa corregge in `docs/ALGORITHM.md` |
|---|---|---|
| Lievitazione | insufficiente / corretta / eccessiva | Dosaggio lievito (§6) e ripartizione oraria (§5) |
| Consistenza | gommosa / corretta / collassata | Relazione W ↔ tempo (§3.2a) |
| Sapore | insipida / corretta / acida | Sale (§4.2), eccesso di fermentazione |
| Lavorabilità | difficile / corretta / appiccicosa | Fattore idratazione (§6.1.3) |

**I due campi che valgono più di tutti gli altri:** `actualTemp` e `actualHours`, cioè le
condizioni **realmente** verificatesi. L'utente imposta 22 °C e 8 ore, poi la cucina sta a 26 °C e
lui inforna dopo 11 ore. Senza i valori reali, il feedback è rumore: staresti correlando l'esito a
condizioni che non si sono mai verificate.

### 10.2 Prima la ricalibrazione, poi (forse) il ML

Il percorso realistico ha tre stadi, e **non si saltano**:

| Stadio | Metodo | Dati necessari | Cosa si ottiene |
|---|---|---|---|
| **1. Ricalibrazione** | Regressione sui residui: si tarano le costanti esistenti ($\lambda_0$, 0,008, 0,003, $\phi$) | ~500 feedback | Le stesse formule, con numeri giusti invece che da letteratura |
| **2. Correzione appresa** | Un modello leggero (gradient boosting) che predice lo **scarto** fra esito previsto e reale | ~5.000 feedback | Correzioni contestuali che la formula non cattura |
| **3. Modello generativo** | Rete neurale che propone direttamente i parametri | ~50.000+ feedback | Discutibile, vedi §10.3 |

Lo stadio 1 è quello che **vale davvero** e richiede due ordini di grandezza in meno di dati.
Realisticamente è anche l'unico che questo progetto raggiungerà, e va benissimo così:
significherebbe comunque avere il primo calcolatore di impasti tarato su dati reali.

### 10.3 Il vincolo che non va violato: l'app spiega

> Il valore di Pizza Theory non è *dare un numero*: è **dire perché**. Un modello a scatola nera
> che risponde "metti 2,7 g di lievito" senza motivazione distruggerebbe il prodotto, anche se
> fosse più accurato.

Quindi, se si arriva al ML, **l'architettura corretta è ibrida**:

```
                 ┌──────────────────────┐
   parametri ───►│  Modello fisico      │───► previsione base  ─┐
                 │  (ALGORITHM.md)      │     + spiegazione     │
                 └──────────────────────┘                       ├──► risultato
                 ┌──────────────────────┐                       │    finale
   contesto ────►│  Correzione appresa  │───► delta ────────────┘
                 │  (sui feedback)      │     (limitato a ±20%)
                 └──────────────────────┘
```

Il modello fisico resta il **prior** e la fonte della spiegazione; il ML applica una correzione
**vincolata entro limiti espliciti**. Così:

- gli invarianti di `docs/ALGORITHM.md` §7 continuano a valere;
- l'app può sempre dire *perché* (dal modello fisico);
- un errore del ML degrada la precisione, non produce un impasto assurdo;
- si resta conformi all'AVPN anche quando i dati suggerirebbero di allontanarsene.

> Questo è anche il motivo per cui `modelVersion` (§5.1) non è un dettaglio: senza sapere quale
> versione del modello ha generato una ricetta, i feedback di versioni diverse non sono
> confrontabili e il dataset è inutilizzabile.

### 10.4 Cosa serve raccogliere (e cosa no)

**Sì:** parametri d'ingresso, risultato calcolato, `modelVersion`, feedback strutturato,
condizioni reali, tipo di forno (quando `FEAT-02` esisterà), pseudonimo utente per escludere
i duplicati dello stesso utente dal training.

**No:** posizione, contatti, identificatori pubblicitari, contenuto delle note libere nel
dataset di training (è testo personale: si usa per il prodotto, non per addestrare).

### 10.5 Vincoli legali, non opzionali

> Addestrare un modello sui dati degli utenti richiede **un consenso esplicito, separato e
> revocabile** — non incluso nei termini di servizio, non pre-spuntato. È il motivo del campo
> `consents.training` in `users` (§5).

- Il rifiuto del consenso **non** deve limitare l'uso dell'app.
- La revoca deve escludere i dati dai training successivi (non si può "spacchettare" un modello
  già addestrato: documentarlo onestamente nella privacy policy).
- I dati usati per il training vanno **pseudonimizzati**: il dataset non ha bisogno di sapere
  *chi* ha fatto l'impasto, solo che impasti diversi vengono da utenti diversi.

---

## 11. Checklist decisionale

Prima di scrivere una riga di backend, rispondere a:

- [ ] Gli utenti **chiedono** la sincronizzazione, o la stiamo immaginando?
- [ ] Siamo disposti a mantenere un servizio (uptime, backup, aggiornamenti) a tempo indeterminato?
- [ ] Un export/import JSON locale risolverebbe il 90 % del problema con l'1 % del lavoro?
- [ ] Vogliamo davvero raccogliere i feedback per ricalibrare il modello? *(se sì, il backend si
      giustifica da solo — ed è l'unica risposta che lo giustifica davvero)*
- [ ] Abbiamo privacy policy e cancellazione account pronte? *(non opzionali, sono bloccanti per gli store)*
- [ ] Siamo pronti a offrire **Sign in with Apple** insieme a Google? *(obbligatorio, non una scelta)*
- [ ] Il feedback che raccogliamo è **strutturato**? *(il testo libero non addestra nulla)*
- [ ] Registriamo le condizioni **reali** oltre a quelle pianificate? *(senza, il dataset è rumore)*
