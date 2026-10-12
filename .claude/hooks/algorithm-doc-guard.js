#!/usr/bin/env node
/**
 * algorithm-doc-guard — hook PostToolUse (non bloccante).
 *
 * Il motore di calcolo di Pizza Theory è specificato in docs/ALGORITHM.md.
 * La regola di progetto (AGENTS.md §1) è che codice e ontologia viaggino insieme.
 *
 * Questo hook si limita a RICORDARLO quando viene toccato un file del motore:
 * non blocca nulla, non modifica nulla, stampa solo un promemoria nel contesto.
 */

const WATCHED = ['utils/calculator.ts', 'utils/validators.ts'];

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let filePath = '';
  try {
    filePath = JSON.parse(raw)?.tool_input?.file_path ?? '';
  } catch {
    process.exit(0);
  }

  const normalized = String(filePath).replace(/\\/g, '/');
  const hit = WATCHED.find((w) => normalized.endsWith(w));
  if (!hit) process.exit(0);

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext:
          `⚠️  Hai modificato ${hit}, che implementa il modello descritto in docs/ALGORITHM.md.\n` +
          `Regola di progetto (AGENTS.md §1): aggiorna docs/ALGORITHM.md nello stesso commit —\n` +
          `equazioni, domini delle variabili, invarianti e changelog in fondo al documento.\n` +
          `Verifica inoltre che gli invarianti di §7 reggano ancora.`,
      },
    })
  );
});
