# Verifica Compatibilità CSV e Backup Excel — Sprint C.4.0

Questo documento analizza la compatibilità del nuovo wizard con gli strumenti di importazione CSV e backup Excel esistenti.

## CSV Dati Ente
**Scopo**: Configurazione iniziale rapida.
**Fase Wizard**: Collocato negli step iniziali (Step 2: Strumenti di raccolta iniziale).

### Campi Coperti nel CSV
Il CSV attuale (`ImportDatiGeneraliRowSchema`) copre i seguenti blocchi:
- Identificazione Ente (Anno, Denominazione, Tipologia, Abitanti, Dirigenza).
- Dati Storici 2016 (Personale, EQ, Dirigenza, Segretario, Straordinario).
- Dati Storici 2018 (Personale, EQ, FTE).
- Simulatore DL 25/2025 (Tabellari 2023, Spesa 2023, Entrate, Tetto L. 296, PIAO).
- Parametri CCNL 2026 (Monte Salari 2021).

### Allineamento Wizard
Il wizard deve permettere l'importazione CSV nello **Step 2**. Una volta importato il CSV, i campi negli step successivi (3, 4, 5, 8) risulteranno pre-compilati, consentendo all'utente una semplice verifica e integrazione.

## Backup Excel Completo
**Scopo**: Salvataggio e ripristino dell'intero stato del fondo (tutte le sezioni).
**Fase Wizard**: Collocato negli strumenti avanzati o nello step finale (Step 10: Conferma).

### Differenze Critiche
| Caratteristica | CSV Dati Ente | Backup Excel |
| :--- | :--- | :--- |
| **Completezza** | Parziale (solo Dati Generali) | Totale (tutto `FundData`) |
| **Utilizzo** | Setup iniziale / Import massivo | Backup di sicurezza / Portabilità |
| **Formato** | CSV (testo delimitato) | JSON (scaricabile come file o Excel simulato) |
| **Modificabilità** | Facile via Excel/Text editor | Difficile (struttura complessa) |

## Manutenibilità nel Wizard
1. **Integrazione CSV**: Il wizard NON deve sostituire il CSV, ma usarlo come acceleratore.
2. **Persistenza**: Il wizard deve operare su una copia temporanea dello stato (`wizardState`) e fare il commit nel reducer globale solo alla fine, garantendo che un backup Excel scaricato a metà wizard non contenga dati inconsistenti (o contenga i dati pre-wizard).
3. **Punto di accesso Backup**: Il pulsante per il backup Excel completo deve restare accessibile anche fuori dal wizard per utenti esperti che preferiscono la vista classica.

## Conclusioni
Il nuovo wizard a 10 step mantiene la piena compatibilità con entrambi gli strumenti. Il CSV alimenterà i singoli step in modo trasparente, mentre il backup Excel continuerà a rappresentare l'istantanea finale del lavoro svolto.
