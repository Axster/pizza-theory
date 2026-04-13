# Requisiti e Specifiche di "pizzApp"

Questo documento raccoglie in modo ordinato e strutturato tutte le specifiche fornite per l'app **pizzApp**. È stato creato per poter essere consultato e aggiornato in qualsiasi momento durante lo sviluppo.

## 1. Stack Tecnologico
- **Framework Core**: React Native + React Web (unificati via **Expo** e **Expo Router**).
- **Libreria Interfaccia Utente**: UI Library adatta e performante (es. **React Native Paper** / Material UI), per mantenere gli stessi componenti sia su web che su app e velocizzare lo sviluppo.
- **Stile**: Nessun approccio `css` o `scss`, si usa lo styling inline/nativo di React Native (`StyleSheet`) e i token della UI Library.

## 2. Funzionalità Base (Calcolatore Impasto Diretto)
L'app mira a dare i dosaggi ottimali e le tempistiche per un impasto diretto. L'utente inserirà una serie di **Parametri di Ingresso**, e l'app risponderà con i **Risultati di Output**.

### Parametri di Ingresso (Form della Homepage)
1. Quantità di impasto necessaria (es. in grammi totali o numero/peso dei panetti).
2. Temperatura ambientale.
3. Tipologia di lievito (Birra, Secco o Madre).
4. *(Facoltativo)* Tempo di lievitazione a disposizione. (Se non inserito, potrebbe essere derivato dall'idratazione o forza).
5. *(Facoltativo)* Idratazione desiderata (%). (Se non inserita, derivata dal tempo).
6. *(Facoltativo)* Forza della farina (W). (Se non inserita, derivata dal tempo o idratazione).

### Risultati di Output
Ai valori inseriti corrisponderanno i seguenti risultati calcolati:
- Lievito necessario (g).
- Ore di lievitazione a Temperatura Ambiente (TA).
- Ore di lievitazione in Frigorifero (possono essere anche `0`).
- Sale necessario (g).
- Quantità di farina (g).
- Forza della farina in W.
- Quantità di acqua (g).

## 3. Flusso Utente ed Esperienza (UX/UI)

### A. Homepage (Calcolatore)
- **Header**: Logo visibile (immagine disegnata che richiama l'app) e il Titolo dell'app. In alto a sinistra, un'icona per il **Burger Menu**.
- **Body**: Form di inserimento chiaro per i Parametri di Ingresso.
- **Azione**: Tasto principare **"Impasta"**.

### B. Stato di Caricamento (Loader)
- Quando si preme "Impasta", appare un loader con **un'animazione a tema pizza che gira**.

### C. Schermata dei Risultati
- Mostra in modo pulito ed elegante tutti i Risultati di Output calcolati.
- **Azione Condivisione**: Tasto posizionato nei risultati che permette di condividere i dati come stringa/messaggio (es. su WhatsApp, SMS, o copia-incolla web).

### D. Burger Menu e Cronologia
- Menu a scorrimento laterale (Drawer) posizionato a sinistra.
- Contiene un link per la **Cronologia degli impasti**.
- **Scelta di un impasto cronologico**: Riprendendolo, fa visualizzare di nuovo i Parametri inseriti e i Risultati calcolati quel giorno.
- **Area Recensione (Note)**: In questa visualizzazione passata, l'app include un'area testuale in cui l'utente può inserire le sue valutazioni finali per quel preciso impasto (es. com'era il risultato, cosa mancava, cosa gli piaceva o non andava).

## 4. Motore Matematico e Chimico (Core AVPN)
A differenza dei calcolatori base, *pizzApp* incorpora un ecosistema validante di livello Master:
- **Scorporo Lievito Madre**: Idratazione ricalcolata al netto del 50% di acqua intrinseca contenuta nel lievito solido aggiunto all'impasto.
- **Formula Esponenziale Van't Hoff**: Il lievito scende o sale dinamicamente dimezzando ad ogni incrocio di temperature, e ha un "Cap" del 5% - 20% sulla farina per la pasta madre.
- **Gestore Frigorifero**: La cella (4°C) blocca la lievitazione (Lieviti) ma favorisce la Maturazione (Enzimi). L'app ci invia gli impasti quando i W sono massicci (>300) o i tempi eccessivi, calcolando anche le ore di estrazione prima dello staglio per far acclimatare.
- **Validazioni Cross-over**: Blocco totale e "Tips Educativi" se l'utente azzarda combinazioni aliene (es. 400W in 4h, Idratazioni del 90% su farina debole o caldo a 40°C).

---
*NOTA*: Questo design punta ad un'estetica premium e contemporanea: colori accesi (vibrant), modalità dark curata, micro-animazioni fluide. Nessun design "basic".
