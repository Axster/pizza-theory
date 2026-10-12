---
description: Verifica il motore di calcolo contro l'ontologia e la matrice di regressione
allowed-tools: Read, Grep, Bash(node:*), Bash(npm run typecheck)
---

Verifica la coerenza fra il motore di calcolo e la sua specifica.

1. Leggi `docs/ALGORITHM.md` (l'ontologia formale) e `utils/calculator.ts` + `utils/validators.ts`
   (l'implementazione).
2. Per ogni equazione e invariante dichiarato nel documento, controlla che il codice lo rispetti.
   Segnala esplicitamente ogni divergenza: documento che descrive qualcosa che il codice non fa,
   o codice che fa qualcosa che il documento non descrive.
3. Esegui la matrice di regressione e commenta gli output anomali:
   ```bash
   node --experimental-strip-types utils/tests/expert_matrix.ts
   ```
4. Controlla in particolare gli invarianti di §7 di `docs/ALGORITHM.md`:
   - bilancio di massa (farina + acqua + sale + madre = peso richiesto);
   - scorporo del lievito madre;
   - cap 5%–20% del madre sul peso farina;
   - **monotonia**: più ore ⇒ meno lievito; più caldo ⇒ meno lievito.
     Verifica numericamente che non ci siano discontinuità alle soglie (24h, 34 °C).
5. Riporta i risultati come elenco puntato: ✅ conforme / ⚠️ divergenza / 🐛 bug.

Non modificare codice senza che te lo chieda: questo comando è una diagnosi.

$ARGUMENTS
