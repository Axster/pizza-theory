---
description: Aggiorna stato-dei-lavori.md con quanto fatto e quanto emerso
allowed-tools: Read, Edit, Bash(git log:*), Bash(git status:*), Bash(git diff:*)
---

Aggiorna `stato-dei-lavori.md` (file privato, non versionato).

1. Leggi `stato-dei-lavori.md` e guarda `git log --oneline -15` e `git status`.
2. Sposta in "✅ Fatto" i punti effettivamente completati — verificandoli nel codice,
   non fidandoti del messaggio di commit.
3. Aggiungi i punti nuovi emersi nella sessione, nella sezione giusta:
   🎨 Design · ⚙️ Business logic · ✨ Nuove funzionalità · 🐛 Bug.
4. Mantieni il formato esistente: ID stabile (`BUG-07`, `FEAT-03`…), priorità, file coinvolti,
   descrizione in una o due righe. Non rinumerare gli ID già assegnati.
5. Se un punto riguarda il motore di calcolo, ricorda nel testo che va aggiornato anche
   `docs/ALGORITHM.md`.

$ARGUMENTS
