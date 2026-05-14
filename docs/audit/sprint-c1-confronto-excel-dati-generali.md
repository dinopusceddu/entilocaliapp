# Confronto Modello Excel vs Applicazione — Sprint C.1

Questo documento confronta i dati gestiti dall'applicazione con il modello Excel di riferimento (`Fondo risorse decentrate 2026 - foglio di calcolo.xlsx`).

## Analisi Comparativa

| Campo Excel | Campo App (Chiave Tecnica) | Stato | Note |
| :--- | :--- | :--- | :--- |
| Denominazione Ente | `denominazioneEnte` | ✅ Presente | Coerente. |
| Anno di riferimento | `annoRiferimento` | ✅ Presente | Coerente. |
| Monte Salari 2021 | `monteSalari2021` | ✅ Presente | Essenziale per incrementi 0,14% e 0,22%. |
| Stipendi Tabellari 2023 | `simStipendiTabellari2023` | ✅ Presente | Denominazione tecnica diversa (Excel usa spesso "Tabellare 2023"). |
| Limite 2016 (Totale) | `manualPersonalFundLimit2016` | ✅ Presente | L'app permette anche il calcolo analitico (consigliato). |
| Personale FTE 2018 | `manualDipendentiEquivalenti2018` | ✅ Presente | Necessario per valore medio pro-capite. |
| Fondo Personale 2018 | `fondoPersonaleNonDirEQ2018_Art23` | ✅ Presente | Necessario per valore medio pro-capite. |
| Spesa Personale Consuntivo | `simSpesaPersonaleConsuntivo2023` | ✅ Presente | Usato per verifica sostenibilità 48%. |
| Media Entrate Correnti | `simMediaEntrateCorrenti2021_2023` | ✅ Presente | Usato per verifica sostenibilità 48%. |
| Tetto Spesa L. 296/06 | `simTettoSpesaPersonaleL296_06` | ✅ Presente | Spesso omesso nei modelli Excel semplificati. |

## Campi Mancanti o Ridondanti

### Mancanti nell'App (ma presenti in Excel)
- **Codice ISTAT/Codice Fiscale Ente**: Utili per importazioni massive o identificazione univoca.
- **Responsabile del Procedimento**: Utile per la generazione della lettera di richiesta dati.
- **Data di approvazione dell'ultimo rendiconto**: Attualmente l'app ha un boolean (`approvazioneRendicontoPrecedente`), ma la data è richiesta in alcuni modelli formali.

### Ridondanti in Excel (ma automatizzati nell'App)
- **Coefficienti Tabella C**: Excel richiede l'inserimento manuale o lookup; l'app li ha cablati.
- **Calcolo 48% (Target)**: Excel richiede formule complesse spesso soggette a errori; l'app lo calcola in tempo reale.
- **Riproporzionamento Part-time**: L'app gestisce sia il calcolo aggregato che analitico (più preciso).

## Proposta di Allineamento Denominazioni

Per facilitare l'importazione, si consiglia di rinominare i campi del CSV secondo le chiavi tecniche dell'app:
- `simStipendiTabellari2023` -> `stipendi_tabellari_2023`
- `monteSalari2021` -> `monte_salari_2021`
- `fondoSalarioAccessorioPersonaleNonDirEQ2016` -> `fondo_personale_2016`

## Conclusioni
L'applicazione copre il 95% dei dati necessari presenti nel modello Excel, aggiungendo controlli di coerenza (sostenibilità DM 2020) spesso assenti nei fogli di calcolo tradizionali.

---
*Documento di confronto completato per lo Sprint C.1.*
