---
description: Audit della parità fra la versione web e quella mobile
allowed-tools: Read, Grep, Glob, Bash(npm run typecheck)
---

Controlla che web e mobile si comportino allo stesso modo.

1. Elenca tutti i file con estensione di piattaforma (`*.web.tsx`, `*.ios.tsx`, `*.android.tsx`)
   e, per ognuno, il file "base" corrispondente.
2. Per ogni coppia, confronta **a parità di input visibili**:
   - quali campi esistono e quali no;
   - i valori di default (un campo "facoltativo" precompilato su una piattaforma e vuoto sull'altra
     manda il motore su rami di deduzione diversi — è un bug, non una differenza estetica);
   - i parametri passati a `calculateDough()`;
   - la gestione di loading, errori e validazioni.
3. Cerca i rami `Platform.OS === 'web'` sparsi nelle schermate condivise e valuta se siano ancora
   giustificati o se mascherino divergenze.
4. Verifica che non ci sia niente di dipendente dalla larghezza della finestra: le estensioni di
   piattaforma sono risolte a build time, **non** sono breakpoint responsive.
5. Produci una tabella `Aspetto | Mobile | Web | Divergenza?` e, in fondo, l'elenco ordinato per
   gravità delle divergenze che cambiano il risultato del calcolo.

Diagnosi, non correzione: non modificare file se non te lo chiedo esplicitamente.
