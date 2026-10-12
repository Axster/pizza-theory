# Specifiche di prodotto

Cosa deve fare Pizza Theory, dal punto di vista dell'utente.
Per *come* è implementato vedi `ARCHITECTURE.md`; per la matematica, `ALGORITHM.md`.

---

## 1. Il prodotto in una frase

Un calcolatore di impasti diretti per pizza napoletana che **completa da solo i parametri che
l'utente non conosce**, spiegando perché, invece di pretendere che li sappia tutti.

### 1.1 Principi di prodotto

1. **Nessun campo obbligatorio oltre il minimo.** Peso, temperatura e tipo di lievito bastano.
   Tutto il resto è facoltativo e viene dedotto.
2. **L'app è un tutor, non una calcolatrice.** Quando blocca una combinazione impossibile, spiega
   la ragione chimica. L'errore è un'occasione didattica.
3. **Funziona in cucina.** Offline, su schermo piccolo, con le mani sporche di farina.
4. **Rigore prima di tutto.** I valori AVPN sono il riferimento; se ne esce solo quando l'utente
   lo chiede esplicitamente, e in modo motivato.

---

## 2. Funzionalità

### 2.1 Parametri d'ingresso

| Campo | Obbligatorio | Controllo UI | Dominio |
|---|---|---|---|
| Quantità impasto | ✅ | Campo numerico | 200 g – 20 kg |
| Temperatura ambiente | ✅ | Slider a gradiente caldo | 0 – 45 °C |
| Tipo di lievito | ✅ | Segmented: Birra / Secco / Madre | — |
| Ore di lievitazione | ⬜ | Campo numerico | 2 – 96 h |
| Idratazione | ⬜ | Slider + toggle, azzurro acqua | 50 – 90 % |
| Forza farina W | ⬜ | Slider + toggle, rosso brand | 160 – 500 |

> I campi facoltativi **non compilati vengono dedotti** secondo `ALGORITHM.md` §3.
> Per questo il loro stato "spento" deve essere visibilmente diverso da "zero": il toggle spento
> significa *"decidi tu"*, non *"metti il minimo"*.

### 2.2 Risultati

- Farina (g) e forza W consigliata
- Acqua (g) e idratazione risultante
- Sale (g)
- Lievito (g), del tipo scelto
- Ore a temperatura ambiente
- Ore in frigorifero (possono essere 0)
- Ore di estrazione dal frigo prima dell'uso
- Consigli contestuali dell'esperto

---

## 3. Schermate

### 3.1 Home — il calcolatore

- **Header:** titolo e logo. **Burger menu volutamente triangolare ▽**, a richiamare il trancio.
- **Albert:** il personaggio in alto dà un consiglio tramite una **vignetta da fumetto**
  (non un riquadro con bordi arrotondati — vedi `DESIGN-01` in `stato-dei-lavori.md`).
- **Sfondo:** trama di pizze (`bg-light-outline` / `bg-dark-outline`) dietro le card, in secondo piano.
- **Form:** i parametri di §2.1.
- **CTA:** bottone **"Impasta!"**.

### 3.2 Loader

Animazione a tema pizza che gira. Nessuna libreria pesante: è un'emoji animata (`PizzaLoader`).

### 3.3 Risultati

Ricetta completa, leggibile, con un bottone **Condividi** che genera un messaggio testuale
(WhatsApp, SMS, appunti sul web).

### 3.4 Drawer, Cronologia e Preferiti

- Drawer a sinistra con: Calcolatore · Cronologia · Preferiti.
- **Cronologia:** ultimi 30 impasti. Ogni voce si espande sui dettagli e offre un'**area note**
  ("com'è venuta la pizza?").
- **Preferiti:** gli impasti marcati ♥, conservati anche oltre i 30.

---

## 4. Linee guida di design

| Aspetto | Specifica |
|---|---|
| Estetica | Premium e contemporanea. Nessun look "basic" o da template. |
| Colori | Vivaci, richiamo alla pizza: rosso carminio `#C62828`, arancio `#FF8A65` |
| Dark mode | Curata quanto la light, non un ripiego |
| Animazioni | Micro-interazioni fluide (apertura slider, loader) |
| Campi facoltativi | Dicitura **"(facoltativo)"** accanto alla label |
| Slider temperatura | Traccia a gradiente giallo → rosso |
| Slider idratazione | Azzurro acqua; icone 💧 a sinistra, 💧💧💧 a destra |
| Slider forza W | Rosso brand; icone braccio in outline → braccio pieno |
| Slider spenti | Grigi, senza cursore, con "(facoltativo)" al posto del valore |

---

## 5. Vincoli tecnici

- **Cross-platform reale:** stessa UI e stessi componenti su iOS, Android e Web.
- **Nessun CSS/SCSS:** solo `StyleSheet` di React Native e i token della UI library.
- **Offline-first:** il calcolo non richiede rete, mai.
- **Lingua:** italiano. Inglese previsto, non ancora implementato.

---

## 6. Fuori perimetro (al 2026-10-12)

Impasti indiretti (biga, poolish) · pizza in teglia · multi-farina · account e sincronizzazione ·
calcolo del tempo di cottura · glossario · impostazioni utente (lingua, tema, unità di misura).

Tutte queste voci sono pianificate e tracciate in `stato-dei-lavori.md`.
