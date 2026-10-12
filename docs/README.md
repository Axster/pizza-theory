# Documentazione di Pizza Theory

| Documento | Risponde a | Quando aggiornarlo |
|---|---|---|
| [`ALGORITHM.md`](ALGORITHM.md) | Come funziona la matematica dell'impasto? | 🔴 **Obbligatorio** a ogni modifica di `utils/calculator.ts` o `utils/validators.ts`, nello stesso commit |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Com'è strutturato il codice? Dove metto una cosa nuova? | Quando cambiano stack, cartelle o convenzioni |
| [`SPECIFICATIONS.md`](SPECIFICATIONS.md) | Cosa deve fare il prodotto? | Quando cambiano requisiti funzionali o linee guida di design |
| [`BACKEND.md`](BACKEND.md) | Come introdurremmo server e database? | Quando si decide qualcosa sull'infrastruttura |

## Fuori da questa cartella

| File | Contenuto |
|---|---|
| [`../README.md`](../README.md) | Presentazione del progetto e guida all'avvio |
| [`../AGENTS.md`](../AGENTS.md) | Brief per gli agenti AI — **file canonico** delle regole di progetto |
| [`../CLAUDE.md`](../CLAUDE.md) | Istruzioni specifiche per Claude Code (importa `AGENTS.md`) |
| `../stato-dei-lavori.md` | Backlog e note interne — **privato, non versionato** |

## La regola che conta

> `ALGORITHM.md` è **normativo**, non descrittivo: definisce il modello, e `utils/calculator.ts`
> ne è l'implementazione. Se i due divergono, è il codice a essere sbagliato.
> Prima si aggiorna il documento, poi il codice.
