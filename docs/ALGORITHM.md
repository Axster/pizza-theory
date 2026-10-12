# Ontologia del motore di calcolo

> **Documento normativo.** Questo file descrive *il modello*; `utils/calculator.ts` e
> `utils/validators.ts` ne sono *l'implementazione*. In caso di divergenza fra i due,
> è il codice a essere sbagliato.
>
> **Regola di progetto:** ogni modifica al motore va accompagnata dall'aggiornamento di questo
> documento **nello stesso commit** (equazioni, domini, invarianti, changelog in §10).

| | |
|---|---|
| **Versione del modello** | `1.0.0` |
| **Implementazione** | `utils/calculator.ts`, `utils/validators.ts` |
| **Regressione** | `utils/tests/expert_matrix.ts` |
| **Ultimo allineamento** | 2026-10-12 |

---

## 1. Scopo e dominio di validità

Il motore risolve un problema di **sintesi sotto-determinata**: l'utente fornisce da 2 a 6 parametri,
il sistema ne restituisce 7 completando quelli mancanti per deduzione.

**Dominio dichiarato:** impasto **diretto** (nessun prefermento), **pizza napoletana classica**,
lievitazione in massa e in panetti, forno ad alta temperatura.

**Fuori dominio** (al 2026-10-12): biga, poolish, pizza in teglia, impasti indiretti, autolisi,
farine non di grano tenero, lievito madre liquido (Li.Co.Li.).

### 1.1 Posizione epistemologica

Il modello **non** è una simulazione della fermentazione. È un'**interpolazione euristica calibrata**
su tre fonti, in ordine di autorità decrescente:

1. **Disciplinare AVPN** — vincoli dimensionali (idratazione, salinità, dosi) trattati come assiomi.
2. **Cinetica chimica classica** — la dipendenza del lievito dalla temperatura segue la forma
   funzionale dell'equazione di **Van 't Hoff** (vedi §4.1 e la nota critica in §4.1.1).
3. **Prassi dei maestri dell'arte bianca** (Giorilli, Bonci, divulgazione tecnica contemporanea) —
   fattori correttivi per idratazione e forza, non derivabili da primi principi.

Dove le tre fonti confliggono, vince l'AVPN sui valori di default e la prassi sulle correzioni.

---

## 2. Vocabolario formale

### 2.1 Grandezze d'ingresso

| Simbolo | Nome | Unità | Dominio | Obbligatorio | Campo UI |
|---|---|---|---|---|---|
| $P$ | Peso totale impasto | g | $[200,\ 20000]$ | sì | Quantità Impasto |
| $T$ | Temperatura ambiente | °C | $[0,\ 45]$ | sì | Temperatura Ambiente |
| $Y$ | Tipo di lievito | enum | `birra` \| `secco` \| `madre` | sì | Tipo di Lievito |
| $t$ | Tempo di lievitazione | h | $[2,\ 96]$ | **no** | Ore Lievitazione |
| $h$ | Idratazione | % | $[50,\ 90]$ | **no** | Idratazione |
| $W$ | Forza della farina | — | $[160,\ 500]$ | **no** | Forza Farina W |

> ⚠️ **Divergenza nota.** Gli slider dell'app non coprono gli stessi domini dei validatori:
> $W$ parte da 100 (validatore: 160) e $h$ arriva a 85 (validatore: 90).
> L'utente può quindi selezionare valori che verranno poi rifiutati. Tracciato come `BUG-05`.

### 2.2 Grandezze d'uscita

| Simbolo | Nome | Unità | Arrotondamento |
|---|---|---|---|
| $F$ | Farina | g | intero |
| $A$ | Acqua | g | intero |
| $S$ | Sale | g | 1 decimale |
| $L$ | Lievito | g | 1 decimale |
| $t_{TA}$ | Ore a temperatura ambiente | h | 1 decimale |
| $t_{FR}$ | Ore in frigorifero | h | 1 decimale |
| $t_{acc}$ | Ore di acclimatamento post-frigo | h | intero |
| $W_{out}$ | Forza farina consigliata | — | intero |

### 2.3 Costanti del modello

| Simbolo | Valore | Significato | Fonte |
|---|---|---|---|
| $h_0$ | 57 % | Idratazione AVPN pura | Disciplinare AVPN |
| $t_0$ | 8 h | Lievitazione AVPN di riferimento | Disciplinare AVPN |
| $W_0$ | 240 | Forza farina di riferimento | Prassi napoletana |
| $\sigma$ | 0,05 | Sale per unità di acqua (50 g/L) | Disciplinare AVPN |
| $T_{ref}$ | 23 °C | Temperatura di riferimento | Calibrazione |
| $t_{ref}$ | 8 h | Tempo di riferimento | Calibrazione |
| $\lambda_0$ | 1,5 g/kg | Lievito di birra fresco base, per kg di **farina** | Calibrazione |
| $Q_{10}^{\ *}$ | 7 °C | Intervallo di raddoppio metabolico | Van 't Hoff (approssimato) |
| $\phi$ | 0,1 | Fattore di riduzione dell'attività in frigo | Calibrazione |

### 2.4 Due concetti da non confondere

Il modello tratta **lievitazione** e **maturazione** come processi distinti che condividono lo stesso
asse temporale:

- **Lievitazione** — riproduzione del lievito e produzione di CO₂. Fortemente dipendente dalla
  temperatura; **si arresta quasi del tutto a 4 °C**.
- **Maturazione** — idrolisi enzimatica di amidi e proteine. **Non si ferma al freddo**: prosegue
  anche in cella.

Da qui la funzione del frigorifero nel modello: **disaccoppiare** i due processi, lasciando correre
la maturazione mentre la lievitazione viene frenata. È l'unica ragione per cui l'algoritmo manda un
impasto in cella.

---

## 3. Deduzione dei parametri mancanti (§ "effetto domino")

Sia $\Omega = \{t, h, W\}$ l'insieme dei parametri facoltativi e $\Omega_d \subseteq \Omega$ quelli
effettivamente forniti.

### 3.1 Caso $\Omega_d = \emptyset$ — AVPN puro

$$t \leftarrow t_0 = 8 \qquad h \leftarrow h_0 = 57 \qquad W \leftarrow W_0 = 240$$

In questo ramo **l'unica variabile libera resta $T$**: i dosaggi AVPN sono fissi e solo la
temperatura ambiente modula il lievito.

### 3.2 Caso $\Omega_d \neq \emptyset$ — deduzione a cascata

L'ordine di risoluzione è **$W$ → $h$ → $t$** ed è significativo: $W$ è la variabile più vincolante
(determina cosa la maglia glutinica può reggere), quindi viene dedotta per prima e le altre si
adattano a lei.

**(a) Forza farina**, se $W \notin \Omega_d$:

$$
W \leftarrow
\begin{cases}
\min(400,\ 200 + 5t) & \text{se } t \in \Omega_d \\[4pt]
\min(400,\ 240 + 5(h - 60)) & \text{se } t \notin \Omega_d \ \wedge\ h > 60 \\[4pt]
240 & \text{altrimenti}
\end{cases}
$$

*Razionale:* più ore di maturazione, o più acqua da trattenere, richiedono più glutine.
Taratura: $h=90\% \Rightarrow W=390$; $t=24\text{h} \Rightarrow W=320$.

**(b) Idratazione**, se $h \notin \Omega_d$:

$$h \leftarrow 45 + \frac{W}{20}$$

*Taratura:* $W240 \Rightarrow 57\%$ · $W300 \Rightarrow 60\%$ · $W400 \Rightarrow 65\%$.
La retta passa esattamente per il punto AVPN $(240,\ 57)$.

**(c) Tempo**, se $t \notin \Omega_d$:

$$t \leftarrow \max\left(8,\ \left\lfloor \frac{W - 160}{10} \right\rfloor\right)$$

*Taratura:* $W240 \Rightarrow 8\text{h}$ · $W300 \Rightarrow 14\text{h}$ · $W380 \Rightarrow 22\text{h}$.

> **Esempio di cascata completa.** L'utente inserisce solo $h = 90\%$.
> (a) $W \leftarrow \min(400,\ 240 + 5\cdot30) = 390$ — serve una farina forte per reggere quell'acqua.
> (c) $t \leftarrow \max(8, \lfloor 23 \rfloor) = 23\text{h}$ — quel glutine va maturato.
> §5 manda poi 21 di quelle 23 ore in frigo. Un solo campo, tre deduzioni.

---

## 4. Bilancio di massa

### 4.1 Isolamento algebrico della farina

Il peso richiesto si ripartisce fra farina, acqua e sale. Con $r = h/100$:

$$P = F + A + S, \qquad A = rF, \qquad S = \sigma A = \sigma r F$$

Sostituendo e isolando:

$$\boxed{\ F = \frac{P}{1 + r + \sigma r}\ } \qquad A = rF \qquad S = \sigma A$$

Questa è la *baker's percentage* risolta rispetto al totale, non alla farina: l'utente ragiona in
"quanto impasto mi serve", non in "quanta farina parto".

> ⚠️ **Approssimazione dichiarata.** Il lievito di birra ($Y \in \{$`birra`, `secco`$\}$) **non**
> compare nel bilancio. Su 1 kg d'impasto l'errore è di 0,5–3 g (≤ 0,3 %), sotto la risoluzione di
> una bilancia domestica. Per il lievito madre, che pesa decine di grammi, la correzione è invece
> obbligatoria: vedi §6.3.

### 4.2 Salinità

$$S = 0{,}05 \cdot A \quad \Longleftrightarrow \quad 50\ \text{g di sale per litro d'acqua}$$

Il disciplinare AVPN fissa questo rapporto **sull'acqua**, non sulla farina né sul totale: è una
costante, non un parametro. Resta invariato in tutti i rami del calcolo.

---

## 5. Ripartizione temporale: ambiente vs frigorifero

### 5.1 Predicati di attivazione

$$
\begin{aligned}
\mathrm{HighHyd} &\equiv h > 65 \\
\mathrm{HighTemp} &\equiv T > 25 \\
\mathrm{LongTime} &\equiv t > 24 \\
\mathrm{StrongFlour} &\equiv W > 300
\end{aligned}
$$

Il frigorifero si attiva se e solo se:

$$
\mathrm{Fridge} \equiv \mathrm{LongTime} \ \vee\ (\mathrm{HighHyd} \wedge t > 8) \ \vee\ (\mathrm{HighTemp} \wedge t > 8) \ \vee\ (\mathrm{StrongFlour} \wedge t > 12)
$$

### 5.2 Ripartizione

Se $\neg\mathrm{Fridge}$: $\quad t_{TA} = t,\quad t_{FR} = 0$.

Se $\mathrm{Fridge}$:

$$
t_{TA} =
\begin{cases}
\min(1,\ 0{,}1\,t) & \text{se } T \geq 34 \\[4pt]
2 & \text{se } T < 34 \ \wedge\ t > 24 \\[4pt]
\min(2,\ 0{,}25\,t) & \text{altrimenti}
\end{cases}
\qquad t_{FR} = t - t_{TA}
$$

*Razionale:* si concede all'impasto solo il tempo di "avviare" il lievito a temperatura ambiente,
poi lo si manda in cella. Più fa caldo, meno avviamento serve.

### 5.3 Acclimatamento

$$
t_{acc} =
\begin{cases}
0 & \text{se } t_{FR} = 0 \\
1 & \text{se } T \geq 30 \\
2 & \text{se } 25 \leq T < 30 \\
3 & \text{se } T < 25
\end{cases}
$$

Ore di estrazione dal frigo prima dello staglio/infornata, perché i panetti tornino in temperatura.

---

## 6. Dosaggio del lievito

### 6.1 Forma moltiplicativa

Il modello è **separabile**: ogni fattore agisce indipendentemente sulla base.

$$L_{\text{fresco}} = \underbrace{\frac{F}{1000}\lambda_0}_{\text{base}} \cdot \underbrace{\mu_T}_{\text{termico}} \cdot \underbrace{\mu_t}_{\text{temporale}} \cdot \underbrace{\mu_h}_{\text{idratazione}} \cdot \underbrace{\mu_W}_{\text{forza}}$$

con $L_{\text{fresco}} \geq 0{,}05$ g (minimo fisiologico pesabile).

**Base.** $\lambda_0 = 1{,}5$ g di lievito di birra fresco per **kg di farina** (non di impasto),
a $T_{ref}=23$ °C, $t_{ref}=8$ h, $h=60\%$, $W=240$.

#### 6.1.1 Fattore termico — Van 't Hoff

$$\mu_T = 2^{\frac{T_{ref} - \max(2,\ T)}{Q_{10}^{\ *}}} = 2^{\frac{23 - \max(2,\ T)}{7}}$$

Il metabolismo del lievito raddoppia ogni ~7 °C: più fa freddo, più lievito serve.
Il $\max(2, T)$ evita la divergenza verso temperature prossime allo zero.

> **Nota critica sulla nomenclatura.** L'equazione di Van 't Hoff in senso stretto descrive la
> dipendenza dalla temperatura di una costante di equilibrio. Quella usata qui è la **regola
> empirica del $Q_{10}$** (Arrhenius linearizzato), con $Q_{10} \approx 2^{10/7} \approx 2{,}7$.
> Il nome "Van 't Hoff" è mantenuto per continuità con la documentazione storica del progetto,
> ma il modello corretto è $Q_{10}$. Non è un errore di calcolo: è un errore di etichetta.

#### 6.1.2 Fattore temporale

$$t_{eq} = t_{TA} + \phi\, t_{FR} = t_{TA} + 0{,}1\, t_{FR}, \qquad \mu_t = \frac{t_{ref}}{\max(0{,}5,\ t_{eq})}$$

Il frigorifero "vale" un decimo di un'ora a temperatura ambiente. $t_{eq}$ è quindi un **tempo
equivalente a 23 °C**, e il lievito necessario è inversamente proporzionale a esso.

> 🐛 **Difetto noto di questa formulazione — `BUG-01`.** $t_{eq}$ è discontinuo sulla soglia del
> frigorifero. A 22 °C, W260, h60%: $t=24$h ⇒ $t_{eq}=24$ ⇒ **0,4 g**; $t=36$h ⇒ $t_{eq}=2+3{,}4=5{,}4$
> ⇒ **1,6 g**. Allungando la maturazione il lievito **quadruplica**, violando l'invariante I-4 (§7).
> Stessa patologia sulla soglia $T\geq34$ (§5.2): 33 °C ⇒ 1,0 g, 34 °C ⇒ 1,3 g.
> Correzione proposta in §9.1.

#### 6.1.3 Fattore idratazione

$$\mu_h = 1 - 0{,}008\,(h - 60)$$

Più acqua ⇒ maggiore mobilità del substrato ⇒ metabolismo più efficiente ⇒ meno lievito.
Lineare, calibrato empiricamente. A $h=90\%$: $\mu_h = 0{,}76$.

#### 6.1.4 Fattore forza

$$\mu_W = 1 + 0{,}003\,(W - 240)$$

Gli amidi delle farine forti sono meno immediatamente disponibili: serve più spinta.
A $W=400$: $\mu_W = 1{,}48$.

### 6.2 Conversione per tipo di lievito

**Birra fresco** ($Y=$ `birra`): $\quad L = L_{\text{fresco}}$

**Secco istantaneo** ($Y=$ `secco`): $\quad L = L_{\text{fresco}} / 3$

Rapporto di conversione standard: il secco ha ~3× la densità cellulare per grammo.

**Lievito madre solido** ($Y=$ `madre`): ecosistema biologico complesso, molto meno reattivo del
lievito commerciale a variazioni di temperatura e tempo. Le curve vengono **smorzate con radice
quadrata**:

$$L_{\text{madre}}^{\ *} = 0{,}10\,F \cdot \sqrt{\mu_T} \cdot \sqrt{\mu_t} \cdot \mu_h \cdot \mu_W$$

$$\boxed{\ L = \mathrm{clamp}\left(L_{\text{madre}}^{\ *},\ 0{,}05\,F,\ 0{,}20\,F\right)\ }$$

Il **cap 5 %–20 % sul peso farina** è un vincolo rigido della prassi: sotto il 5 % il madre non
innesca, sopra il 20 % l'impasto diventa acido e ingestibile.

### 6.3 Scorporo del lievito madre — invariante critico

Il madre solido è **idratato al 50 %**: è composto da 2/3 di farina e 1/3 di acqua.
Aggiungerlo senza correzione significa sballare sia il peso finale sia l'idratazione reale.

$$F \leftarrow F - \tfrac{2}{3}L \qquad A \leftarrow A - \tfrac{1}{3}L$$

**Verifica di conservazione:**

$$\left(F - \tfrac{2}{3}L\right) + \left(A - \tfrac{1}{3}L\right) + S + L = F + A + S = P \quad \checkmark$$

Il sale **non** viene ricalcolato: resta $S = \sigma A_{\text{originale}}$, perché l'acqua totale
nell'impasto (libera + contenuta nel madre) è rimasta la stessa.

> 🐛 **Conseguenza non gestita — `BUG-02`.** Dopo lo scorporo, $A/F$ **non è più** l'idratazione
> richiesta: è il rapporto fra acqua *libera* e farina *libera*. La schermata risultati
> (`app/results.tsx:34`) calcola l'idratazione da mostrare proprio come $A/F$, quindi con il madre
> **mostra un valore sbagliato**: richiesti 70 % → visualizzati 72,9 %.
> L'idratazione reale è e resta $h$, il parametro d'ingresso. Correzione in §9.2.

---

## 7. Invarianti

Questi devono valere **sempre**. Sono il contratto del motore: una modifica che ne rompe uno è una
regressione, non una scelta di design.

| ID | Invariante | Stato |
|---|---|---|
| **I-1** | $F + A + S + L_{\text{madre}} = P$ (entro arrotondamento) | ✅ verificato |
| **I-2** | $S = 0{,}05\,A_{\text{totale}}$ in ogni ramo | ✅ verificato |
| **I-3** | $0{,}05\,F \leq L \leq 0{,}20\,F$ per $Y =$ `madre` | ✅ verificato |
| **I-4** | **Monotonia temporale:** $t_1 < t_2 \Rightarrow L(t_1) \geq L(t_2)$, ceteris paribus | ❌ violato — `BUG-01` |
| **I-5** | **Monotonia termica:** $T_1 < T_2 \Rightarrow L(T_1) \geq L(T_2)$, ceteris paribus | ❌ violato — `BUG-01` |
| **I-6** | $L > 0$ e $F, A, S > 0$ su tutto il dominio d'ingresso | ✅ verificato |
| **I-7** | Il madre non rende mai $F$ o $A$ negativi (garantito dal cap I-3) | ✅ verificato |
| **I-8** | L'idratazione mostrata all'utente = $h$ richiesta | ❌ violato — `BUG-02` |
| **I-9** | Stessi input ⇒ stesso output su web e mobile | ❌ violato — `BUG-03` |

> I-4 e I-5 non sono preferenze estetiche: un calcolatore che chiede *più* lievito per una
> maturazione *più lunga* contraddice il principio fisico che il modello dichiara di implementare.

---

## 8. Validazione

Implementata in `utils/validators.ts`, eseguita **prima** di mostrare il risultato.

### 8.1 Limiti assoluti

Rifiuto diretto se un parametro esce dal dominio di §2.1.

### 8.2 Limiti sul risultato (lievito per kg d'impasto)

| $Y$ | min | max |
|---|---|---|
| `birra` | 0,1 g/kg | 30 g/kg |
| `secco` | 0,03 g/kg | 10 g/kg |
| `madre` | 20 g/kg | 400 g/kg |

Rete di sicurezza a valle: intercetta combinazioni che passano i limiti d'ingresso ma producono
dosaggi assurdi.

### 8.3 Vincoli di proporzione (incrociati)

> **Si attivano solo se l'utente ha compilato almeno 2 parametri facoltativi.**
> Con un solo campo compilato il motore *deduce* (§3) e non ha nulla da contraddire;
> con due o più, le scelte possono essere reciprocamente incompatibili.

| Condizione | Blocco | Razionale |
|---|---|---|
| $t > 18$ ∧ $W < 260$ | Maglia glutinica insufficiente | Il glutine si degrada: panetto acido e collassato |
| $t \leq 6$ ∧ $W > 320$ | Farina troppo forte per i tempi | Pasta gommosa e indigeribile |
| $h \geq 70$ ∧ $W < 280$ | Troppa acqua per quella farina | L'impasto non trattiene: poltiglia |
| $h \geq 75$ ∧ $t < 8$ | Manca il tempo di assorbimento | L'acqua non viene incorporata |

La funzione didattica è esplicita: il blocco **spiega perché**, non si limita a rifiutare.

---

## 9. Correzioni proposte (non ancora implementate)

> Ogni voce qui va implementata **insieme** all'aggiornamento di questo documento e al changelog §10.

### 9.1 Continuità del tempo equivalente (risolve `BUG-01`, I-4, I-5)

La radice del problema è che $t_{eq}$ salta quando il predicato $\mathrm{Fridge}$ cambia valore.
Proposta: sostituire il fattore $\phi$ costante con una **funzione continua della temperatura di
cella**, e introdurre un vincolo esplicito di monotonia.

$$\phi(T_{fr}) = 2^{\frac{T_{fr} - T_{ref}}{7}} \quad \text{con } T_{fr} = 4\ \text{°C} \Rightarrow \phi \approx 0{,}14$$

$$t_{eq} = t_{TA} + \phi(T_{fr})\, t_{FR}$$

Così il frigo usa la **stessa** legge $Q_{10}$ del resto del modello invece di una costante
arbitraria, e la transizione ambiente→cella diventa fisicamente coerente.
Da validare: controllare numericamente $L(t)$ monotono decrescente su $t \in [2, 96]$ a passo 1 h,
per ogni $T \in [2, 45]$.

### 9.2 Idratazione visualizzata (risolve `BUG-02`, I-8)

Aggiungere `hydrationPercent: number` a `DoughResult`, valorizzato con $h$ (il parametro, non il
rapporto ricalcolato), e usarlo in `app/results.tsx` e nel testo di condivisione.
In più, esporre per il madre: farina totale $F + \frac{2}{3}L$ e acqua totale $A + \frac{1}{3}L$.

### 9.3 Coerenza dei consigli (risolve `BUG-09`)

Oggi il tip "🔥 Caldo Estremo: metti subito la massa in frigo" compare per $T > 30$ **anche quando
il motore ha calcolato $t_{FR} = 0$** (es. 32 °C con 8 h: il predicato richiede $t > 8$).
I tip vanno generati **dal risultato**, non dagli input.

### 9.4 Estensioni di dominio

| Estensione | Impatto sul modello |
|---|---|
| Puntata / appretto | Partizione di $t_{TA}$ e $t_{FR}$ in due fasi, con regole proprie |
| Biga / poolish | Sottrazione di un sotto-impasto da $F$, $A$, $L$ con cinetica autonoma |
| Pizza in teglia | Nuovo set di costanti ($h_0 \approx 75\%$, $W_0 \approx 300$) |
| Temperatura acqua (TFI) | $T_{acqua} = k \cdot T_{finale} - T_{ambiente} - T_{farina} - T_{attrito}$ |
| Multi-farina | $W$ come media ponderata sui pesi |
| Tempo di cottura | Funzione di temperatura forno e idratazione |

---

## 10. Changelog del modello

| Versione | Data | Modifica |
|---|---|---|
| `1.0.0` | 2026-10-12 | Prima formalizzazione dell'algoritmo esistente. Nessuna modifica al codice: il documento descrive l'implementazione così com'è al commit `b43b2df`, incluse le divergenze note (`BUG-01`, `BUG-02`, `BUG-03`). |

---

## 11. Riferimenti

- **Disciplinare Internazionale AVPN** — Associazione Verace Pizza Napoletana, specifica tecnica
  della Pizza Napoletana STG (idratazione, salinità, dosi, tempi).
- **Regolamento (UE) n. 97/2010** — riconoscimento STG "Pizza Napoletana".
- **Regola del $Q_{10}$ / equazione di Arrhenius** — dipendenza della velocità di reazione
  biologica dalla temperatura.
- **P. Giorilli, _Il Grande Libro del Pane_** — forza delle farine, rapporto W/tempo di maturazione.
- **G. Bonci** — alte idratazioni e gestione del glutine debole.
