# Sprint C.4.5 — Verifica Coerenza Dati

Questo documento certifica che il motore di coerenza del Wizard Dati Generali (Step 9) soddisfa le regole di business descritte dal dominio normativo.

## Parametri di Test Implementati

| Regola Testata | Esito Simulatore (Status UI) | Trigger / Soglia |
| --- | --- | --- |
| **Completezza Anagrafica** | ✅ Successo / ❌ Errore | Assenza di campo `denominazioneEnte` o `annoRiferimento` lancia errore. |
| **Completezza Dati Storici 2016** | ✅ Successo / ❌ Errore | Assenza contemporanea di `fondoSalarioAccessorioPersonaleNonDirEQ2016` (calcolato/csv) e `manualPersonalFundLimit2016` (manuale). |
| **Completezza Dati Storici 2018** | ✅ Successo / ❌ Errore | Assenza di FTE 2018. |
| **Coerenza FTE 2018 / Attuale** | ✅ Successo / ⚠️ Warning | Se il rapporto di deviazione `Math.abs((currentFTE - fte2018) / fte2018)` supera lo `0.3` (> 30%). |
| **Incremento D.L. 25/2025** | ✅ Successo / ⚠️ Warning / ℹ️ Info | Se `monteSalari2021` > 0 ma l'incremento è mancante, viene emesso Warning. Se valorizzato, Success. Altrimenti Info (ignorato). |
| **Sostenibilità 48% (D.L. 25/2025)** | ✅ Successo / ⚠️ Warning / ℹ️ Info | Passa se il calcolatore `fase1_obiettivo48` certifica <= 48%. Se supera emette warning, ma non blocca l'operatività del fondo. |
| **Calcolo Conglobamento Art. 60** | ✅ Successo / ⚠️ Warning | Se la decurtazione restituita dal metodo canonico restituisce > 0 è Success, altrimenti avvisa. |

## Certificazione Sicurezza "Read-Only"
Tutti i test citati sopra, orchestrati in `WizardStepCoerenzaDati`, vengono eseguiti internamente ad un hook React (`useMemo`). Nessun middleware Redux/Context viene chiamato. Le istanze di check restano isolate e svaniscono al dismount del componente, per evitare che un errore validato in bozza impedisca all'utente di passare a schermate tecniche.
