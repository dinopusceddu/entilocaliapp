# Report Tecnico — MOD-037C7 — Cloud fonte primaria e autosave step-by-step

Il presente report descrive l'implementazione e i risultati del collaudo della policy di sincronizzazione "Cloud-Primary" e dell'autosave automatico step-by-step per le bozze remote del Wizard 2026.

## 1. Dettagli di Implementazione

### Causa dei Falsi Conflitti Storici
In precedenza, il client confrontava ad ogni boot il checksum locale con quello del cloud basandosi puramente sulla presenza di dati diversi in `localStorage`. Poiché il client memorizza sempre lo stato locale come cache per le sessioni (anche offline), al primo boot rilevava una differenza tra il cloud e la cache locale non modificata (pulita), generando erroneamente avvisi invasivi di "Conflitto di sincronizzazione".

### Nuova Policy Cloud-Primary
Con il nuovo approccio:
1. **Cloud come Fonte Primaria**: All'avvio del Wizard per un utente autorizzato, se esiste una bozza cloud valida e la cache locale **non è contrassegnata come dirty** (cioè non contiene modifiche locali esplicite non salvate), la bozza cloud viene importata e sovrascrive automaticamente la cache locale senza mostrare dialoghi o banner di blocco.
2. **Cache Locale come Fallback**: La cache locale funge da fallback offline.
3. **Conflitto solo se reale**: Il banner di conflitto viene mostrato solo se la bozza locale è esplicitamente `dirty === 'true'` **E** la bozza remota è cambiata rispetto all'ultimo checksum sincronizzato (`lastRemoteChecksum`) o all'ultimo timestamp noto (`lastRemoteUpdatedAt`).

### Gestione Dirty e Sincronizzazione dei Metadati
Per distinguere una cache locale pulita ma obsoleta da modifiche attive non salvate, abbiamo integrato i seguenti metadati locali nel `localStorage`:
- `dirty`: Indica se la sessione corrente contiene modifiche non sincronizzate con il cloud.
- `lastRemoteChecksum`: Memorizza il checksum dell'ultimo record salvato/ricevuto con successo dal cloud.
- `lastRemoteUpdatedAt`: Memorizza il timestamp dell'ultimo salvataggio remoto noto.
- `lastSuccessfulSyncAt`: Traccia il timestamp dell'ultima sincronizzazione riuscita (upload o download).
- `localDirtySince`: Indica il timestamp da cui la bozza locale è in stato "dirty" (azzerato al sync).
- `lastHydrationSource`: Indica la fonte dell'ultimo ripristino (`'cloud'`, `'local'`, o `'none'`).

### Prevenzione dell'Autosave di Rimbalzo
Quando carichiamo la bozza valida dal cloud all'apertura del Wizard, viene chiamato `onHydrate` che aggiorna lo stato React dell'applicazione. Questa mutazione dello stato locale normalmente innescherebbe l'effetto di autosave remoto. Per evitare questo "rimbalzo", abbiamo utilizzato un flag interno `isHydratingFromCloudRef` che disattiva temporaneamente il debounce dell'autosave per la prima transizione di stato post-idratazione. Inoltre, se all'avvio la cache locale pulita coincide con il cloud (o non vi è bozza cloud e la locale è pulita), allineiamo `remoteChecksumRef` con il checksum locale, azzerando qualsiasi trigger di salvataggio automatico improprio.

### Funzionamento del Flush al Cambio Step (Autosave Step-by-Step)
Durante la compilazione, le modifiche sui campi attivano l'autosave debounced (2 secondi). Al cambio step (`goNext`, `goPrevious`, `goToStep`), per evitare perdite di modifiche in caso di chiusura improvvisa o navigazione veloce, l'applicazione controlla se lo stato è `local_newer`. In caso positivo, esegue un **flush immediato** chiamando direttamente la funzione `uploadLocal` sincrona, cancellando qualsiasi timer pendente tramite `activeTimerRef` per prevenire chiamate duplicate sul server.

### Isolamento di user_app_state e Flusso di Trasferimento al Fondo
- **user_app_state**: È stato verificato che nessuna parte del modulo Wizard 2026 scrive in automatico su questa tabella.
- **Trasferimento Wizard → Costituzione Fondo**: Rimane un'operazione manuale e protetta che richiede il click esplicito dell'utente.

---

## 2. Esito dei Controlli Obbligatori

Tutti i controlli richiesti sono stati eseguiti con successo sulla macchina locale:

### Esito di TypeScript Compiler (`tsc`)
Il controllo statico dei tipi ha dato esito positivo:
```bash
npx tsc --noEmit
# Esito: Nessun errore rilevato (codice compilato correttamente)
```

### Esito Vitest
Tutte le suite di test sono passate correttamente:
```text
 Test Files  53 passed (53)
      Tests  411 passed (411)
   Duration  87.79s
```
Sono stati eseguiti e superati con successo anche i nuovi test specifici per:
- Idratazione cloud valida che non marca dirty.
- Idratazione cloud valida che non genera autosave immediato di rimbalzo.
- Cache locale diversa ma non dirty → cloud prevale senza conflitto.
- Locale dirty + cloud invariato → autosave locale verso cloud, nessun conflitto.
- Locale dirty + cloud modificato dopo ultimo sync → vero conflitto.
- Utente non autorizzato → zero chiamate Supabase.

### Esito della Build di Produzione
La build di produzione del frontend è andata a buon fine:
```bash
npm run build
# Esito: built in 18.46s (dist/assets/ generati correttamente)
```

---

## 3. Rischi Residui

1. **Connettività Instabile**: In caso di perdita intermittente di connettività proprio durante un cambio step ("flush"), l'applicazione imposta correttamente lo stato `isOffline` e mantiene la bozza in `localStorage` in stato `dirty`, ma il salvataggio remoto fallirà finché la rete non sarà ripristinata o l'utente non farà un refresh/salvataggio manuale.
2. **Accessi Multipli Simultanei**: Se lo stesso utente modifica la stessa bozza su due dispositivi diversi in parallelo senza mai sincronizzare (ad es. offline su entrambi), al ripristino della connettività si verificherà un conflitto reale che richiederà la risoluzione manuale da parte dell'utente.
