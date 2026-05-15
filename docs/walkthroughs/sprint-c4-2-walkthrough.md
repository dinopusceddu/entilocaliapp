# Sprint C.4.2 — Walkthrough

## Obiettivo dello Sprint
Riprogettazione dell'esperienza di ingresso nella sezione **Configurazione Fondo**, introducendo una Landing Page decisionale e un layout "focalizzato" per il Wizard (senza sidebar).

## Modifiche Principali

### 1. Landing Page
Quando si accede a "Configurazione Fondo", l'utente visualizza ora una schermata con:
- Sintesi dello stato dei dati (Dati Ente, Storici, CCNL, ecc.).
- Due percorsi chiari: Wizard Guidato o Costituzione Analitica.

### 2. Layout Focalizzato (Wizard)
L'apertura del wizard nasconde automaticamente la barra laterale dell'app. L'interfaccia è stata pulita per permettere all'utente di concentrarsi esclusivamente sulla configurazione.
- Aggiunti pulsanti per tornare alla Landing Page o passare direttamente alla Costituzione Fondo.

### 3. Sicurezza e Continuità
- **Modal di conferma**: Se si tenta di accedere alla Costituzione Fondo con dati mancanti, il sistema mostra un avviso non bloccante.
- **Accesso Avanzato**: La vista tecnica a 5 step è rimasta intatta e accessibile per gli utenti esperti.
- **Strumenti**: Import CSV e Backup Excel rimangono disponibili nella vista tecnica.

## Verifiche Eseguite

### Test Tecnici
- **TypeScript**: 0 errori (fixati tipi mancanti in `WizardDataStatusPanel`).
- **Unit Test**: 97/97 PASS.
- **Regressioni**: 8/8 PASS.
- **Fixtures**: 8/8 PASS.
- **Build**: Successo.

### Test Funzionali (Browser)
- Verificato che il clic su "Inizia Wizard" nasconda la sidebar.
- Verificato che il ritorno alla Landing Page ripristini la sidebar (tramite scope FONDO).
- Verificato che la navigazione tra le modalità non comporti perdita di dati (`draftData` e global state sincronizzati).

## Prossimi Passi (Sprint C.4.3)
- Implementazione degli Step 3 e 4 (Dati Storici 2016 e 2018) nel Wizard.
- Validazione dei calcoli automatici basati sugli input del wizard.
