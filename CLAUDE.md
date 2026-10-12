# Pizza Theory

@AGENTS.md

## Specifico per Claude Code

- **Avvio dell'app**: usa sempre `npm run run-dev -- --web|--android|--ios`.
  Non lanciare `expo start --android`/`--ios` a mano: farebbe partire un emulatore.
- **Comandi disponibili**: `/calcolo` (verifica del motore), `/componente` (nuovo componente
  Atomic Design), `/parita` (audit web ↔ mobile), `/stato` (aggiorna le note di lavoro).
- **`stato-dei-lavori.md`** è privato e non versionato: è lì che vivono backlog e note interne.
  Quando chiudi un punto, spuntalo lì.
  ⚠️ Essendo gitignorato, **i grep ricorsivi non lo vedono** (lo strumento di ricerca rispetta
  `.gitignore`). Per cercarci dentro, nominalo esplicitamente come file.
- Toccando `utils/calculator.ts` un hook ti ricorderà di aggiornare `docs/ALGORITHM.md`:
  non è un capriccio, è la regola §1 di `AGENTS.md`.
