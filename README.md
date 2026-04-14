# pizzApp 🍕

**pizzApp** è un calcolatore per impasti diretti di pizza, sviluppato internamente come un'applicazione "Universale" usando **React Native** ed **Expo**. L'applicazione è predisposta in modo nativo per funzionare cross-platform sui sistemi operativi Mobile (iOS, Android) e sui browser web mantenendo la stessa UI e la medesima struttura di componenti.

> Puoi trovare i file di progettazione completi e documentati ([`SPECIFICATIONS.md`](docs/SPECIFICATIONS.md), [`PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md) e [`AI_INSTRUCTIONS.md`](docs/AI_INSTRUCTIONS.md)) all'interno della cartella `/docs`.

---

## 🧮 Obiettivo e Filosofia (Il Metodo AVPN)

L'obiettivo fondamentale dell'algoritmo di **pizzApp** è usare come base intrinseca i rigidi valori stabiliti dall'**Associazione Verace Pizza Napoletana (AVPN)**, per poi ricalcolarli in modo "intelligente" e matematico qualora le esigenze o le condizioni esterne dell'utente varino.

La logica del motore agisce su due binari:
1. **AVPN Puro (Il Vangelo)**: Se i parametri facoltativi (Idratazione %, Ore Lievitazione, Forza W) non vengono inseriti, i valori tradizionali AVPN diventano l'assoluto punto di riferimento (es. idratazione matematica 57% e maturazioni base di 8h a temperatura ambiente). **L'unico fattore che farà ricalcolare i dosaggi "scolpiti sulla pietra" sarà in questo caso la variazione di Temperatura Ambiente** inserita, che andrà a modificare esponenzialmente l'utilizzo dei lieviti con la curva di Van't Hoff.
2. **Adattamento Esperto**: Se al contrario l'utente necessita di condizioni particolari (desidera produrre Impasti ad Alta Idratazione, maturazioni in 48 ore in cella, l'uso di farine proteiche W400, ecc.), l'algoritmo percepirà i valori fuori dalla "comfort zone" convenzionale dell'arte bianca per ricalibrare (tramite deduzioni incrociate e uso automatico del frigorifero) tempistiche, spinta del lievito e assorbimenti.

Alla base delle equazioni vi sono questi principi cardine:

- **Volume totale scalare**: Dal totale dell'impasto inserito dall'utente viene isolata in percentuale la farina. L'ingrediente principale definisce in cascata tutti gli altri dosaggi in percentuali esatte (cd. "Braker's Percentage").
- **Acqua (Idratazione)**: Modulata in base alla forza *W* o tempo, ma tenuta idealmente intorno al 60% per idratazioni standard da disciplinare.
- **Sale**: La salinità è fissata costantemente al parametro ottimale che incrocia le quote AVPN (~2.5% netto in relazione al peso assoluto o ~50g per Litro d'acqua). 
- **Lievito (Birra/Madre/Secco)**: Il componente più dinamico. Le formule scalano esponenzialmente la grammatura proporzionandola sia alla Temperatura Ambiente fornita, alla Forza, e modulata sull'asse tempo-idratazione secondo tabelle euristiche avanzate.

---

## 🧬 Biologia: Lievitazione vs Maturazione

Spesso nell'arte bianca si fondono i concetti di Lievitazione e Maturazione, ma sono fenomenti biologicamente distinti. **L'algoritmo di pizzApp ingloba categoricamente entrambi all'interno del calcolo generale delle tue "Ore di Lievitazione"**:
- **Lievitazione (L'Aumento di Volume)**: È l'azione in cui il lievito ingerisce zuccheri e produce gas gonfiando il glutine. Avviene in modo estremamente rapido a Temperatura Ambiente, ma si anestetizza quasi totalmente posizionando l'impasto in Frigorifero.
- **Maturazione (La Digeribilità e Sapore)**: È il lavoro a lenta cessione degli enzimi naturali della farina che scompongono gli amidi complessi. Questo processo è ciò che rende la pizza esplosiva in forno e leggerissima nello stomaco. Al contrario della lievitazione, **la maturazione non si ferma al freddo**!
L'engine di pizzApp opera su queste basi: quando il sistema decide arbitrariamente di piazzare per lunghe ore il tuo impasto in Frigorifero (es. se selezioni Farine W300 o più), lo fa proprio con lo scopo di placare a forza la *Lievitazione*, per dare il tempo chimico alla *Maturazione enzimatica* di disintegrare le proteine complesse di quella farina, preservando l'impasto dal rovistarsi!

### 🔮 Prossimi Sviluppi (Roadmap)

Siamo costantemente al lavoro per espandere le capacità e la componente didattica del calcolatore! Di seguito le priorità di sviluppo per i prossimi aggiornamenti:

1. **Sezione "Forno" e "Cottura" in Ricetta**
   Disporremo per l'utente una sezione forno, in cui poter inserire la temperatura massima del forno (facoltativa, default a 350°C). Se inserita, apparirà nella ricetta il tempo di cottura, calcolato in base alla temperatura inserita e al tipo di impasto (idratazione). Aggiungeremo all'interno della sezione (non come tip) l'informazione che l'uso di un forno che non arriva ad almeno 300 gradi (come i classici elettrici da cucina) è fortemente sconsigliato. Ci sarà anche una spunta facoltativa "Cielo e platea regolabili" (con un tip che ne spiega il significato): se selezionata, nella ricetta apparirà la temperatura separata di cielo e platea, altrimenti comparirà la temperatura generale.

2. **Inserimento Tip Informativi**
   L'applicazione verrà dotata di pratiche icone (tip) per spiegare nel dettaglio le dinamiche dell'impasto, le voci di calcolo principali e i consigli su impasto e cottura.

3. **Aggiornamento Lieviti**
   Oltre ai lieviti selezionabili attuali (Lievito di birra fresco, secco istantaneo, madre solido), aggiungeremo una voce "Altri tipi" che prevedrà:
   - *Lievito madre liquido* (Li.Co.Li.)
   - *Lievito di birra secco attivo* (mostrando tra i consigli una breve spiegazione su come attivarlo prima dell'uso).

4. **Puntata e Appretto**
   Verrà inserita la ripartizione scientifica delle ore dedicate alla "Puntata" (prima lievitazione in massa) e "Appretto" (lievitazione in panetti), incrociate alle tempistiche di cella frigorifera o ambiente. Vi sarà una sezione dedicata nella ricetta finale, in caso di selezione di pizza classica/verace che è la selezione di default.

5. **Switch Pizza in Teglia o Classica/Verace**
   Aggiunta di uno switch per scegliere "Impasto per pizza in teglia" o "Classica (verace)" per agganciare in automatico diversi valori di default al motore di calcolo, sviluppando guide e parametri ad hoc per l'impasto in teglia.

6. **Impostazioni**
   Gestione preferenze utente: cambio lingua (Italiano/Inglese), cambio tema (Chiaro/Scuro), unità di misura del peso (g, kg, lb, oz) e temperatura (°C o °F).

7. **Modifica Sezione Farina (Inserimento manuale e Multi-Farina)**
   Sotto il campo W della farina inseriremo la spunta "Inserisci manualmente il peso della farina" (con tip annesso). Se flaggata, si disabiliterà il campo totale impasto e comparirà il campo "peso", che ricalcolerà la quantità finale dell'impasto. Inoltre, implementeremo lo switch "Una farina / Più farine". Scegliendo "Più farine" si potranno aggiungere fino a 5 farine diverse fornendo il relativo W (e il peso, se la spunta suddetta è attiva; altrimenti il motore bilancerà le quantità per raggiungere la forza media necessaria). I controlli incrociati valideranno sempre se le scelte dell'utente sono compatibili.

8. **Calcolo W**
   Una pagina dedicata con uno switch: "W da peso farina" o "Peso farina da W". 
   - *W da peso farina*: inserendo peso e W di diverse farine ti darà il W finale calcolato in media ponderata. 
   - *Peso farina da W*: inserendo il W desiderato e i W delle diverse farine, ti darà il peso esatto di ogni farina da inserire. 
   I calcoli saranno condivisibili; tutti i campi obbligatori con limiti esatti impostati.

9. **Calcolo Idratazione**
   Una pagina dedicata con uno switch "A partire da:" con opzioni "Percentuale idratazione" o "Dosi".
   - *Percentuale*: si inserisce il peso della farina e la %, ricavando la quantità d'acqua.
   - *Dosi*: si inserisce farina totale e l'acqua in grammi/litri per calcolare la percentuale idratata.

10. **Temperatura Acqua e Sezione Dati Avanzati con Modalità Impasto**
    Una nuova area "Dati Avanzati" raggrupperà Modalità Impasto e Prefermento. 
    La *"Modalità Impasto"* permetterà di selezionare: A mano, Impastatrice o Planetaria, perfezionando il calcolo del riscaldamento della massa in lavorazione. Il calcolo della *Temperatura dell'acqua* valuterà l'idratazione, la TA e la modalità d'impasto per indicare di usare acqua da frigo, a TA o riscaldata (indicando i gradi). Per l'impasto "a mano", i consigli della ricetta suggeriranno pause e pieghe per ottimizzare la forza del glutine.

11. **Prefermento (Biga o Poolish)**
    All'interno della sezione "Dati Avanzati" ci sarà uno switch tra Biga e Poolish. A seguito della selezione, verrà aggiunta in ricetta una sezione "Prefermento" con le rispettive quantità di acqua, farina (calcolata dinamicamente anche su multi-farine) e lievito, sottraendo i pesi all'impasto per ricalcoleranno le dosi finali con precisione scientifica.

12. **Pagina Glossario**
    All'interno del menu risiederà un glossario con la spiegazione dei termini tecnici utilizzati (W, Idratazione, Tipi di Lievito, etc.).

13. **Redesign App**
    Rivisitazione dell'interfaccia in maniera progressiva, puntando a standard di alta qualità visuale per elevare l'esperienza utente a un livello professionale premium.

### 🛡️ Controlli di Proporzione Intelligenti

L'applicativo funge inoltre da tutor se si cerca di inserire forzatamente manualità di calcolo fisicamente disastrose. I seguenti check scattano provocando un blocco **esclusivamente se si vanno a compilare incrociando multipli parametri facoltativi contemporaneamente**:
- **Piu Tempo = Server Farina più Forte**: Selezionare poco tempo (es. 4h) per un W400 causerà pizze di gomma crude; viceversa lunghe maturazioni (es. 24h) su W200 genererebbero un brodo acido privo di glutine. L'app vi fermerà a scopo educativo!
- **Piu Idratazione = Serve Farina più Forte**: Un'idro elevatissima (es. +70%) gettata su un W debole vi trasformerà l'impasto in una colla ingestibile. Un Popup vi consiglierà ricalibrazioni.
- **Acqua elevata richiede tempo**: Mai usare le percentuali di idratazione esagerata in lievitazioni rapide (sotto le 8h) perché servono soste prolungate o ore in frigo per far assorbire l'idratazione estrema. Penserà a tutto il Controllo Proporzioni!

### 🎯 Motore di Deduzione a Catena (Effetto Domino)

Il vantaggio enorme del motore AVPN di base è che puoi **compilare anche un solo singolo campo** e goderti la magia della chimica automatizzata dell'app.
Se l'utente ha il vizio estremo di voler idratare un impasto al 90% ma tralascia totalmente tutto il resto dei parametri, l'App *non sposerà l'idratazione con i valori deboli AVPN di base*, altrimenti uscirebbe una pozzanghera, ma **provvederà a evolversi a cascata**: dedurrà che per sorreggere il 90% dovrà trasformare la farina a un brutale **W390**. Da quell'indicatore percepirà istantaneamente che una maglia glutinica del genere merita **23 ore fitte di stop**. E accorgendosi dei valori estremi attivati su se stessi, ritirerà in via automatica da sola ben **21 di quelle ore scaturendoti l'uso in Frigorifero** per domare la creatura.

---

## 🚀 Come avviare l'app

Assicurati di essere nella cartella root del progetto (`/Users/andrea/Desktop/pizzApp`) dal tuo terminale e, qualora non l'avessi ancora fatto, esegui:
```bash
npm install
```

### 💻 Avvio sul Web
Per avviare l'app come un normale sito internet nel browser in modalità sviluppatore:
```bash
npm run web
```
Questo genererà un bundler per il web e aprirà l'app all'indirizzo `http://localhost:8081`. 

### 📱 Avvio su Smartphone Fisico (tramite Expo Go)
Rendi attiva l'app sul tuo cellulare facilmente senza dover compilare tutto il codice:
```bash
npx expo start
```
1. Comparirà un **QR code** all'interno del terminale.
2. Assicurati di scaricare l'app gratuita **Expo Go** da App Store (iOS) o Google Play Store (Android).
3. Apri Expo Go e procedi con la scansione del codice QR (su iOS puoi usare direttamente la fotocamera del tuo iPhone).

### 🖥️ Avvio su Emulatori (Se installati su Mac)
Qualora tu avessi installati Android Studio o Xcode nel tuo Mac, puoi avviare i rispettivi simulatori nativi:
- **Simulatore iOS (Xcode)**: Esegui `npm run ios` (oppure avvia con server `npx expo start` e premi il tasto `i` sulla tastiera).
- **Emulatore Android (Android Studio)**: Esegui `npm run android` (oppure avvia con `npx expo start` e premi il tasto `a`).

---

## 🤖 AI Agent Context (Spec-Driven Development)
All'interno della root del progetto noterai la presenza dei file `.cursorrules` e `.clinerules`. 
Questi file fungono da "Direttiva Suprema" per l'Intelligenza Artificiale (come agenti integrati in Cursor IDE o estensioni come Roo/Cline su VSCode). 
**Vengono letti automaticamente dall'AI all'apertura del progetto**, passando all'agente l'intero contesto ingegneristico e le formule matematiche del disciplinare AVPN, prima ancora che venga digitato un singolo messaggio in chat. Questo assicura che nessuna futura sessione di sviluppo comprometta mai le complesse equazioni di bilanciamento o lo scorporo del lievito madre implementate nel codice.
