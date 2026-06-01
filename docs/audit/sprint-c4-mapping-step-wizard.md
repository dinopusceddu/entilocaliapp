# Mapping Step Wizard — Sprint C.4

Questo documento mappa ogni step del wizard ai campi corrispondenti dell'oggetto `FundData`.

| Step | Nome | Campi `FundData` / `EntityData` |
| :--- | :--- | :--- |
| 1 | Anagrafica | `nomeEnte`, `tipologiaEnte` |
| 2 | Anno | `annoRiferimento` |
| 3 | Import CSV | Funzionalità `importDatiGeneraliService` |
| 4 | Storici | `fondo2016`, `parametriArt23` |
| 5 | Personale | `personaleFTE`, `mediaPersonaleTriennale` |
| 6 | CCNL 2026 | `parametriCCNL2026`, `indennitaCompartoTabellaC` |
| 7 | Compliance | `monteSalari2021`, `limitiSpesaPersonale` |
| 8 | Opzionali | `note`, `altriParametri` |
| 9 | Lettera | Funzionalità `letterRequestDataGenerator` |
| 10 | Riepilogo | Commit finale su `fundData` |

## Note Tecniche
Ogni step deve essere atomico: la validazione di uno step impedisce l'avanzamento al successivo se i dati obbligatori mancano o sono errati.
