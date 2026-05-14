# Mapping Dati Lettera — Sprint C.3

Questo documento definisce la corrispondenza tra i dati presenti nel sistema (inseriti o importati via CSV) e i placeholder che verranno utilizzati nel generatore di lettere.

## 1. Intestazione e Mittente
| Placeholder | Campo Sorgente (State) | Note |
| :--- | :--- | :--- |
| `{{ente_denominazione}}` | `annualData.denominazioneEnte` | Es. Comune di Treviglio |
| `{{ente_tipologia}}` | `annualData.tipologiaEnte` | Es. Comune |
| `{{data_corrente}}` | `new Date()` | Data di generazione |
| `{{anno_riferimento}}` | `annualData.annoRiferimento` | Es. 2026 |

## 2. Riferimenti Normativi
| Placeholder | Riferimento Fisso | Note |
| :--- | :--- | :--- |
| `{{ccnl_vigenza}}` | CCNL Funzioni Locali 23.02.2026 | |
| `{{art_costituzione}}` | Art. 79, comma 1 | Fondo Risorse Decentrate |
| `{{norma_tetto}}` | Art. 23, comma 2, D.Lgs. 75/2017 | Limite 2016 |

## 3. Dati Tecnici Richiesti
| Sezione Lettera | Dati Collegati | Azione richiesta all'Ente |
| :--- | :--- | :--- |
| **Fondo 2016** | `historicalData.fondoSalarioAccessorio...` | Conferma certificazione organo di controllo. |
| **Personale FTE** | `annualData.manualDipendentiEquivalenti2018` | Trasmissione tabella 1 del Conto Annuale. |
| **RIA Cessati** | `annualData.ccnl2024.riaCessatiPrecedenti` | Elenco nominativo e decorrenze. |
| **Dirigenza** | `annualData.hasDirigenza` | Inclusione/Esclusione moduli specifici. |

## 4. Variabili Dinamiche di Testo
- **Se Ente ha Dirigenza**: Aggiungere paragrafo su Art. 56 e Art. 57 (Fondo Dirigenza).
- **Se Ente è Unione/Provincia**: Modificare riferimenti a "capacità assunzionale" e "personale trasferito".
