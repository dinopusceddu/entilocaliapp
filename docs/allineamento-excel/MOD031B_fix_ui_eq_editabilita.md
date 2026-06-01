# Report Tecnico — MOD-031B-FIX — Verifica editabilità e binding UI delle voci EQ

Questo report documenta le verifiche e le correzioni apportate per garantire la completa editabilità manuale e il corretto aggiornamento locale dei totali delle tre voci EQ aggiunte al Fondo Elevate Qualificazioni (EQ), nel rispetto del vincolo **"nessuna scrittura su Supabase/database"**.

---

## 1. Causa del Problema Originale

Nel collaudo manuale, le tre chiavi di finanziamento EQ inserite a livello di motore backend nel MOD-031B non consentivano un corretto aggiornamento reattivo dei totali nel cruscotto/HomePage. Le cause principali:

1. **Mancanza di ricalcolo all'uscita della pagina**: Modificando i campi nella pagina EQ, i valori venivano aggiornati nel Context state locale, ma il motore backend non ricalcolava automaticamente `calculationResult`. Di conseguenza, i totali centrali non riflettevano le modifiche senza forzare manualmente il pulsante "Calcola".

---

## 2. Prima Correzione (MOD-031B-FIX Iter 1 — sostituita)

Nella prima versione del fix era stata aggiunta una chiamata a `performFundCalculation()` all'unmount della pagina EQ.

**Problema identificato**: `performFundCalculation` chiama internamente `saveState` che invoca `SupabaseStateRepository.upsertState`, producendo una scrittura su Supabase. Questo viola il vincolo operativo del progetto.

---

## 3. Correzione Definitiva (MOD-031B-FIX Iter 2)

### 3.1 Modifica a `fundWorkflow.ts`

Aggiunto il parametro opzionale `skipPersistence?: boolean` a `performFundCalculationWorkflow`.

```typescript
// src/application/fundWorkflow.ts
export const performFundCalculationWorkflow = async (
  deps, state, dispatch, normativeData,
  saveState,
  skipPersistence?: boolean  // <-- NUOVO
) => {
  // ...validazione e calcolo...
  dispatch({ type: 'CALCULATE_FUND_SUCCESS', payload: { result, checks } });

  // 5. Persist the updated state (skipped in local-only calculation mode)
  if (!skipPersistence) {
    await saveState(deps);
  }
};
```

Quando `skipPersistence = true`, il workflow esegue: validazione → normalizzazione → calcolo → dispatch `CALCULATE_FUND_SUCCESS`, ma **non chiama mai `saveState`**.

### 3.2 Modifica a `AppContext.tsx`

Aggiunta la funzione `performLocalCalculation` al context (firma, implementazione, valore provider):

```typescript
/**
 * Calcolo locale: esegue validazione + calcolo motore e aggiorna lo stato React,
 * ma NON chiama saveState e NON scrive su Supabase.
 */
const performLocalCalculation = useCallback(async () => {
  await performFundCalculationWorkflow(
    deps,
    state,
    dispatch,
    normativeData,
    () => Promise.resolve(), // saveState no-op: non verrà mai chiamata
    true // skipPersistence = true
  );
}, [deps, state, dispatch, normativeData]);
```

### 3.3 Modifica a `FondoElevateQualificazioniPage.tsx`

L'`useEffect` di unmount ora usa `performLocalCalculation` invece di `performFundCalculation`:

```typescript
// Prima (violava il vincolo DB):
const { state, dispatch, performFundCalculation } = useAppContext();
useEffect(() => {
  return () => { performFundCalculation(); };
}, [performFundCalculation]);

// Dopo (conforme al vincolo DB):
const { state, dispatch, performLocalCalculation } = useAppContext();
// Ricalcolo locale all'uscita dalla pagina: aggiorna i totali nel contesto React
// senza scrivere su Supabase (usa performLocalCalculation, non performFundCalculation).
useEffect(() => {
  return () => { performLocalCalculation(); };
}, [performLocalCalculation]);
```

---

## 4. Audit del Flusso di Esecuzione

| Step | Funzione | Scrive su Supabase? |
|---|---|---|
| Editing campo EQ | `dispatch(UPDATE_FONDO_ELEVATE_QUALIFICAZIONI_DATA)` | ❌ No |
| Calcolo totali in-render | Computed direttamente nel JSX | ❌ No |
| Unmount pagina (auto) | `performLocalCalculation()` → `performFundCalculationWorkflow(skipPersistence=true)` | ❌ No |
| Salvataggio manuale utente | `performFundCalculation()` → `performFundCalculationWorkflow(skipPersistence=false)` | ✅ Sì (solo on demand) |

---

## 5. Tabella Audit UI / Stato / Motore

| Chiave | Campo visibile | Campo editabile | Handler onChange | Aggiorna stato | Sovrascritto da wizard | Scrive su DB all'unmount |
|---|---|---|---|---|---|---|
| `va_art18c5_CCNL2026_maggiorazioneSediLavoro` | Sì | Sì | `handleChange` | Sì (dispatch) | No | ❌ No |
| `va_art16c5_CCNL2026_maggiorazioneInterim` | Sì | Sì | `handleChange` | Sì (dispatch) | No | ❌ No |
| `va_dl25_2025_armonizzazione` | Sì | Sì | `handleChange` | Sì (dispatch) | No | ❌ No |

---

## 6. Distinzione Limite Art. 23 (Quota EQ Invariata)

- **Totale Disponibile EQ**: Aumenta del valore delle tre voci.
- **Quota EQ Soggetta Art. 23** (`eq_soggette`): Rimane invariata — le tre chiavi sono escluse dal calcolo di compliance (test di regressione MOD-031B).
- **Ammontare Corrente Art. 23 Complessivo & Margine Art. 23**: Restano del tutto invariati.

---

## 7. Conformità ai Vincoli Operativi

- ✅ **Nessuna scrittura su Supabase** nel ciclo di vita della pagina EQ.
- ✅ **Nessuna migrazione** eseguita.
- ✅ **Nessun commit/push/pull/rebase** eseguito.
- ✅ **Calcolo locale garantito** via `performLocalCalculation` (flag `skipPersistence=true`).
- ✅ **Salvataggio remoto ancora disponibile** su richiesta esplicita dell'utente (pulsante "Calcola").

---

## 8. Esito Verifiche Tecniche

1. **Controllo dei Tipi TypeScript**: `npx tsc --noEmit` → **✅ Successo** (0 errori).
2. **Test Unitari**: `npx vitest run` → **✅ Successo** (311/311 test passati, inclusa la suite MOD-031B).
3. **Build di Produzione**: `npm run build` → **✅ Successo** (2763 moduli trasformati, bundle generato in `dist/`).

