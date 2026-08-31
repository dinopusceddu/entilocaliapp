import { describe, it, expect } from 'vitest';
import { calculateArt23Limit, validateArt23Limit } from '../wizard2026/art23Limit';
import { calculateFundCompletely } from '../calculation/fundEngine';
import { calculateArt23c2Adjustment } from '../calculation/fundCalculations';
import { TipologiaEnte } from '../../domain';
import {
  mockNormativeData,
  createCharacterizationFundInput,
  fixture01_limiteCertificatoPrevalente,
  fixture02_limiteRicostruitoAnalitico,
  fixture03_dirigenzaPresenzaAssenza,
  fixture04_adeguamentoFteMaggiore,
  fixture05_adeguamentoFteMinore,
  fixture06_fteFrazionariECedolini,
  fixture07_arrotondamentoPeriodico,
  fixture08_inputNegativoValidazione,
  fixture09_fallbackStraordinarioStorico,
  fixture10_incrementoStraordinarioGiaIncluso,
  fixture11_overrideManualeTotaleSoggetto,
  fixture12_computoFigurativoArt60,
  fixture13_risorseEscluseDalLimite,
  fixture14_derogaDl19Segretario,
  fixture15_soglieDeltaTolleranza
} from './fixtures/limite2016CharacterizationFixtures';

describe('PR #22 — Test Differenziali di Caratterizzazione Limite 2016', () => {

  // ---------------------------------------------------------------------------
  // A. COMPORTAMENTI COMUNI E COMPARABILI
  // ---------------------------------------------------------------------------
  describe('A. Comportamenti Comuni (Allineamento tra Wizard e Costituzione Fondo)', () => {

    it('Caso 01: Limite Certificato Prevalente sulla Somma Analitica', () => {
      const fix = fixture01_limiteCertificatoPrevalente;

      // 1. Wizard Engine
      const wizardRes = calculateArt23Limit(fix.wizardInput!);
      expect(wizardRes.limite2016Base).toBe(fix.expectedWizard.limite2016Base);
      expect(wizardRes.fonteLimite2016).toBe(fix.expectedWizard.fonteLimite2016);
      expect(wizardRes.limiteArt23Attualizzato).toBe(fix.expectedWizard.limiteArt23Attualizzato);

      // 2. Fund Engine
      const fundRes = calculateFundCompletely(fix.fundInput!, mockNormativeData);
      const art23 = fundRes.compliance.art23c2;
      const art23Comp = fundRes.compliance.art23Compliance;

      expect(art23.limite).toBe(fix.expectedFund.limiteAttualizzato);
      expect(art23.valoreSoggetto).toBe(fix.expectedFund.valoreSoggetto);
      expect(art23Comp?.margineResiduo).toBe(fix.expectedFund.margineResiduo);
      expect(art23.isCompliant).toBe(fix.expectedFund.isCompliant);

      // 3. Verifica Uguaglianza sui Valori Comparabili (Limite Attualizzato = 150.000 €)
      expect(wizardRes.limiteArt23Attualizzato).toBe(art23.limite);
    });

    it('Caso 02: Ricostruzione Analitica del Limite 2016 (Dipendenti + EQ + Straordinario + Segretario)', () => {
      const fix = fixture02_limiteRicostruitoAnalitico;

      // 1. Wizard Engine
      const wizardRes = calculateArt23Limit(fix.wizardInput!);
      expect(wizardRes.limite2016Base).toBe(fix.expectedWizard.limite2016Base);
      expect(wizardRes.fonteLimite2016).toBe(fix.expectedWizard.fonteLimite2016);
      expect(wizardRes.totaleVoci2016Ricostruite).toBe(fix.expectedWizard.totaleVoci2016Ricostruite);
      expect(wizardRes.limiteArt23Attualizzato).toBe(fix.expectedWizard.limiteArt23Attualizzato);

      // 2. Fund Engine
      const fundRes = calculateFundCompletely(fix.fundInput!, mockNormativeData);
      expect(fundRes.compliance.art23c2.limite).toBe(fix.expectedFund.limiteAttualizzato);
      expect(fundRes.compliance.art23c2.valoreSoggetto).toBe(fix.expectedFund.valoreSoggetto);
      expect(Math.abs(fundRes.compliance.art23Compliance?.margineResiduo || 0)).toBe(0);

      // 3. Confronto di parità
      expect(wizardRes.limiteArt23Attualizzato).toBe(fundRes.compliance.art23c2.limite);
    });

    it('Caso 03: Adeguamento Art. 33 D.L. 34/2019 con Variazione Personale Positiva (+2 FTE)', () => {
      const fix = fixture04_adeguamentoFteMaggiore;

      // 1. Wizard Engine
      const wizardRes = calculateArt23Limit(fix.wizardInput!);
      expect(wizardRes.valoreMedioProCapite2018).toBe(fix.expectedWizard.valoreMedioProCapite2018);
      expect(wizardRes.differenzaPersonale).toBe(fix.expectedWizard.differenzaPersonale);
      expect(wizardRes.incrementoProCapiteLimite).toBe(fix.expectedWizard.incrementoProCapiteLimite);
      expect(wizardRes.limiteArt23Attualizzato).toBe(fix.expectedWizard.limiteArt23Attualizzato);

      // 2. Fund Calculations & Engine
      const adj = calculateArt23c2Adjustment(
        fix.fundInput!.historicalData,
        fix.fundInput!.annualData,
        12,
        true,
        mockNormativeData.riferimenti_normativi
      );
      expect(adj.importo).toBe(fix.expectedFund.importoAdeguamento);

      const fundRes = calculateFundCompletely(fix.fundInput!, mockNormativeData);
      expect(fundRes.compliance.art23c2.limite).toBe(fix.expectedFund.limiteAttualizzato);

      // 3. Parità
      expect(wizardRes.limiteArt23Attualizzato).toBe(fundRes.compliance.art23c2.limite);
    });

    it('Caso 04: Adeguamento Art. 33 D.L. 34/2019 con Variazione Personale Negativa (-2 FTE)', () => {
      const fix = fixture05_adeguamentoFteMinore;

      // 1. Wizard Engine: nessun decremento del limite
      const wizardRes = calculateArt23Limit(fix.wizardInput!);
      expect(wizardRes.differenzaPersonale).toBe(fix.expectedWizard.differenzaPersonale);
      expect(wizardRes.incrementoProCapiteLimite).toBe(fix.expectedWizard.incrementoProCapiteLimite);
      expect(wizardRes.limiteArt23Attualizzato).toBe(fix.expectedWizard.limiteArt23Attualizzato);

      // 2. Fund Calculations & Engine
      const adj = calculateArt23c2Adjustment(
        fix.fundInput!.historicalData,
        fix.fundInput!.annualData,
        8,
        true,
        mockNormativeData.riferimenti_normativi
      );
      expect(adj.importo).toBe(fix.expectedFund.importoAdeguamento);

      const fundRes = calculateFundCompletely(fix.fundInput!, mockNormativeData);
      expect(fundRes.compliance.art23c2.limite).toBe(fix.expectedFund.limiteAttualizzato);

      // 3. Parità
      expect(wizardRes.limiteArt23Attualizzato).toBe(fundRes.compliance.art23c2.limite);
    });

    it('Caso 05: FTE Frazionari con Part-Time e Ponderazione Cedolini', () => {
      const fix = fixture06_fteFrazionariECedolini;

      const wizardRes = calculateArt23Limit(fix.wizardInput!);
      expect(wizardRes.dipendentiEquivalenti2026).toBe(fix.expectedWizard.dipendentiEquivalenti2026);

      const adj = calculateArt23c2Adjustment(
        fix.fundInput!.historicalData,
        fix.fundInput!.annualData,
        0,
        false,
        mockNormativeData.riferimenti_normativi
      );
      expect(adj.importo).toBe(0);
      expect(wizardRes.dipendentiEquivalenti2026).toBe(fix.expectedFund.fteCalcolato);
    });

    it('Caso 06: FTE Corrente Uguale a FTE 2018 (Delta = 0)', () => {
      const wizardRes = calculateArt23Limit({
        fondoPersonaleDipendente2016: 100000,
        fondoDipendenti2018Soggetto: 100000,
        risorsePoEq2018Soggette: 0,
        usaCalcoloManualePersonaleArt23: true,
        manualDipendentiEquivalenti2018: 10,
        manualDipendentiEquivalenti2026: 10
      });
      expect(wizardRes.differenzaPersonale).toBe(0);
      expect(wizardRes.incrementoProCapiteLimite).toBe(0);
      expect(wizardRes.limiteArt23Attualizzato).toBe(100000);

      const fundRes = calculateFundCompletely(createCharacterizationFundInput({
        historicalData: {
          fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
          fondoPersonaleNonDirEQ2018_Art23: 100000
        },
        annualData: {
          manualDipendentiEquivalenti2018: 10,
          manualDipendentiEquivalentiAnnoRif: 10
        },
        calculatedInputs: {
          isManualMode: true,
          dipendentiEquivalentiAnnoRif: 10
        }
      }), mockNormativeData);
      expect(fundRes.compliance.art23c2.limite).toBe(100000);
      expect(wizardRes.limiteArt23Attualizzato).toBe(fundRes.compliance.art23c2.limite);
    });

    it('Caso 07: Gestione Valori Default e Dati Assenti (Payload Vuoto)', () => {
      const wizardEmpty = calculateArt23Limit({});
      expect(wizardEmpty.limite2016Base).toBe(0);
      expect(wizardEmpty.fonteLimite2016).toBe('RICOSTRUITO');
      expect(wizardEmpty.limiteArt23Attualizzato).toBe(0);

      const fundEmpty = calculateFundCompletely(createCharacterizationFundInput({}), mockNormativeData);
      expect(fundEmpty.compliance.art23c2.limite).toBe(0);
      expect(fundEmpty.compliance.art23c2.valoreSoggetto).toBe(0);
      expect(fundEmpty.compliance.art23c2.isCompliant).toBe(true);
    });

    it('Caso 08: Zero Esplicito vs Campo Assente nel Limite Certificato', () => {
      const checksZero = validateArt23Limit({ limite2016CertificatoEnte: 0 });
      const certZeroWarning = checksZero.find(c => c.id === 'ART23-CERT-ZERO');
      expect(certZeroWarning).toBeDefined();
      expect(certZeroWarning?.severity).toBe('warning');

      const checksUndefined = validateArt23Limit({ limite2016CertificatoEnte: undefined });
      const certUndefinedWarning = checksUndefined.find(c => c.id === 'ART23-CERT-ZERO');
      expect(certUndefinedWarning).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------------------
  // B. DIVERGENZE INTENZIONALI ATTUALI TRA WIZARD E COSTITUZIONE FONDO
  // ---------------------------------------------------------------------------
  describe('B. Divergenze Intenzionali Attuali', () => {

    it('Divergenza 09 [Dirigenza]: Wizard include fondoDirigenza2016 solo con hasDirigenza=true; fundEngine somma historicalData.fondoDirigenza2016 alla base storica', () => {
      const fix = fixture03_dirigenzaPresenzaAssenza;

      // 1. Con Dirigenza: entrambi includono la dirigenza sia nel limite (140k) che nelle risorse correnti (140k)
      const wizardCon = calculateArt23Limit({
        fondoPersonaleDipendente2016: 100000,
        fondoDirigenza2016: 40000,
        hasDirigenza: true,
        usaCalcoloManualePersonaleArt23: true,
        manualDipendentiEquivalenti2018: 10,
        manualDipendentiEquivalenti2026: 10
      });
      expect(wizardCon.limite2016Base).toBe(fix.expectedWizard.conDirigenza.limite2016Base);

      const fundCon = calculateFundCompletely(createCharacterizationFundInput({
        historicalData: {
          fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
          fondoDirigenza2016: 40000
        },
        annualData: { hasDirigenza: true },
        fondi: {
          dipendente: { st_art79c1_art67c1_unicoImporto2017: 100000 },
          dirigenza: { lim_totaleParzialeRisorseConfrontoTetto2016: 40000 }
        }
      }), mockNormativeData);
      expect(fundCon.compliance.art23c2.limite).toBe(fix.expectedFund.conDirigenza.limiteAttualizzato);

      // 2. Senza Dirigenza: Wizard azzera dirigenza a monte (limite = 100k); fundEngine somma historicalData.fondoDirigenza2016 se presente (limite = 140k) azzerando solo il corrente (valoreSoggetto = 100k)
      const wizardSenza = calculateArt23Limit({
        fondoPersonaleDipendente2016: 100000,
        fondoDirigenza2016: 40000,
        hasDirigenza: false,
        usaCalcoloManualePersonaleArt23: true,
        manualDipendentiEquivalenti2018: 10,
        manualDipendentiEquivalenti2026: 10
      });
      expect(wizardSenza.limite2016Base).toBe(fix.expectedWizard.senzaDirigenza.limite2016Base);

      const fundSenza = calculateFundCompletely(createCharacterizationFundInput({
        historicalData: {
          fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
          fondoDirigenza2016: 40000
        },
        annualData: { hasDirigenza: false },
        fondi: {
          dipendente: { st_art79c1_art67c1_unicoImporto2017: 100000 },
          dirigenza: { lim_totaleParzialeRisorseConfrontoTetto2016: 40000 }
        }
      }), mockNormativeData);
      expect(fundSenza.compliance.art23c2.limite).toBe(fix.expectedFund.senzaDirigenza.limiteAttualizzato);
      expect(fundSenza.compliance.art23c2.valoreSoggetto).toBe(fix.expectedFund.senzaDirigenza.valoreSoggetto);

      // Asserzione esplicita della divergenza storica:
      expect(fundSenza.compliance.art23c2.limite).toBeGreaterThan(wizardSenza.limite2016Base);
    });

    it('Divergenza 10 [Fallback Straordinario]: fundEngine usa in fallback lo straordinario corrente, Wizard richiede dato isolato', () => {
      const fix = fixture09_fallbackStraordinarioStorico;

      // Wizard: non applica fallback automatico dall'anno corrente, fondoStraordinario2016 assente vale 0
      const wizardRes = calculateArt23Limit({
        fondoPersonaleDipendente2016: 100000,
        fondoStraordinario2016: undefined
      });
      expect(wizardRes.limite2016Base).toBe(100000);

      // Fund Engine: attiva il fallback su annualData.fondoLavoroStraordinario (12.000 €) emettendo warning
      const fundRes = calculateFundCompletely(fix.fundInput!, mockNormativeData);
      expect(fundRes.compliance.art23c2.limite).toBe(fix.expectedFund.limiteAttualizzato);
      expect(fundRes.compliance.art23Compliance?.showWarningStraordinario2016).toBe(fix.expectedFund.showWarningStraordinario2016);

      // Asserzione esplicita della divergenza
      expect(fundRes.compliance.art23c2.limite).toBeGreaterThan(wizardRes.limite2016Base);
    });

    it('Divergenza 11 [Override Manuale]: cl_totaleParzialeRisorsePerConfrontoTetto2016 sovrascrive il FAD rilevante nel Fondo', () => {
      const fix = fixture11_overrideManualeTotaleSoggetto;

      const fundRes = calculateFundCompletely(fix.fundInput!, mockNormativeData);
      expect(fundRes.compliance.art23c2.valoreSoggetto).toBe(fix.expectedFund.valoreSoggetto);

      const wizardRes = calculateArt23Limit({
        limite2016CertificatoEnte: 100000
      });
      expect(wizardRes.risorseSoggetteAttuali).toBe(0);
    });

    it('Divergenza 12 [Computo Figurativo Art. 60]: gestito nel runtime del Fondo, assente in Step 2 del Wizard', () => {
      const fix = fixture12_computoFigurativoArt60;

      const fundRes = calculateFundCompletely(fix.fundInput!, mockNormativeData);
      const art23Comp = fundRes.compliance.art23Compliance;

      expect(fundRes.fondi.dipendente.summary.totaleFondo).toBe(fix.expectedFund.fondoCostituitoTotale);
      expect(art23Comp?.computoFigurativoArt60).toBe(fix.expectedFund.computoFigurativoArt60);
      expect(fundRes.compliance.art23c2.valoreSoggetto).toBe(fix.expectedFund.risorseRilevantiArt23);
    });
  });

  // ---------------------------------------------------------------------------
  // C. CASI SPECIFICI DI DOMINIO (WIZARD ONLY & FUND ENGINE ONLY)
  // ---------------------------------------------------------------------------
  describe('C. Casi Specifici di Dominio', () => {

    it('Caso 13 [notApplicableToFundEngine]: Arrotondamento con Frazione Periodica (1/3) in Art. 79 c.1c', () => {
      const fix = fixture07_arrotondamentoPeriodico;
      const wizardRes = calculateArt23Limit(fix.wizardInput!);
      expect(wizardRes.incrementoStabileAumentoPersonale).toBe(fix.expectedWizard.incrementoStabileAumentoPersonale);
    });

    it('Caso 14 [notApplicableToFundEngine]: Validazione Check di Errore su Input Negativo', () => {
      const fix = fixture08_inputNegativoValidazione;
      const checks = validateArt23Limit(fix.wizardInput!);
      const negCheck = checks.find(c => c.id === fix.expectedWizard.errorCheckId);
      expect(negCheck).toBeDefined();
      expect(negCheck?.severity).toBe(fix.expectedWizard.severity);
    });

    it('Caso 15 [notApplicableToWizard]: Rilevamento Incremento Straordinario Già Compreso nello Stanziamento Corrente', () => {
      const fix = fixture10_incrementoStraordinarioGiaIncluso;
      const fundRes = calculateFundCompletely(fix.fundInput!, mockNormativeData);
      expect(fundRes.compliance.art23Compliance?.art23Componenti?.straordinario).toBe(fix.expectedFund.straordinarioRilevato);
    });

    it('Caso 16 [notApplicableToWizard]: Incremento Straordinario Separato (Sommato Correttamente)', () => {
      const input = createCharacterizationFundInput({
        historicalData: {
          fondoSalarioAccessorioPersonaleNonDirEQ2016: 100000,
          fondoStraordinario2016: 10000
        },
        annualData: {
          fondoLavoroStraordinario: 10000,
          incrementoFondoStraordinario: 2000
        },
        fondi: {
          dipendente: { st_art79c1_art67c1_unicoImporto2017: 100000 }
        }
      });
      const fundRes = calculateFundCompletely(input, mockNormativeData);
      expect(fundRes.compliance.art23Compliance?.art23Componenti?.straordinario).toBe(12000);
    });

    it('Caso 17 [notApplicableToWizard]: Esclusione Voci Contrattuali e di Legge dal Limite 2016 (0.14%, DL 25, Incentivi Tecnici)', () => {
      const fix = fixture13_risorseEscluseDalLimite;
      const fundRes = calculateFundCompletely(fix.fundInput!, mockNormativeData);
      expect(fundRes.compliance.art23Compliance?.risorseEscluseArt23).toBe(fix.expectedFund.risorseEscluseArt23);
      expect(fundRes.compliance.art23c2.valoreSoggetto).toBe(fix.expectedFund.risorseRilevantiArt23);
    });

    it('Caso 18 [notApplicableToWizard]: D.L. 19/2026 Segretario — Modalità Solo Corrente vs Doppia Neutralizzazione', () => {
      const fix = fixture14_derogaDl19Segretario;

      // 1. Solo Corrente: limite a 166.000 €, segretario rilevante = 0
      const fundSoloCorrente = calculateFundCompletely(createCharacterizationFundInput({
        annualData: {
          numeroAbitanti: 2500,
          tipologiaEnte: TipologiaEnte.COMUNE
        },
        historicalData: {
          manualPersonalFundLimit2016: 166000
        },
        fondi: {
          dipendente: { st_art79c1_art67c1_unicoImporto2017: 100000 },
          eq: { ris_fondoPO2017: 15000 },
          segretario: {
            segretarioDerogaMode: 'dl19_2026_solo_corrente',
            st_art3c6_CCNL2011_retribuzionePosizione: 8000,
            st_art60c1_CCNL2024_retribuzionePosizioneClassi: 2000,
            va_art61c2_CCNL2024_retribuzioneRisultato10: 1000
          }
        }
      }), mockNormativeData);
      expect(fundSoloCorrente.compliance.art23c2.limite).toBe(fix.expectedFund.soloCorrente.limiteAttualizzato);
      expect(fundSoloCorrente.compliance.art23Compliance?.art23Componenti?.segretario).toBe(fix.expectedFund.soloCorrente.segretarioRilevante);
      expect(fundSoloCorrente.compliance.art23Compliance?.art23Componenti?.segretarioQuotaEsclusaDL19_2026).toBe(fix.expectedFund.soloCorrente.segretarioEscluso);

      // 2. Doppia Neutralizzazione: limite ridotto a 155.000 € (166k - 11k)
      const fundDoppiaNeutr = calculateFundCompletely(createCharacterizationFundInput({
        annualData: {
          numeroAbitanti: 2500,
          tipologiaEnte: TipologiaEnte.COMUNE
        },
        historicalData: {
          manualPersonalFundLimit2016: 166000
        },
        fondi: {
          dipendente: { st_art79c1_art67c1_unicoImporto2017: 100000 },
          eq: { ris_fondoPO2017: 15000 },
          segretario: {
            segretarioDerogaMode: 'dl19_2026_doppia_neutralizzazione',
            quotaSegretario2016Neutralizzabile: 11000,
            st_art3c6_CCNL2011_retribuzionePosizione: 8000,
            st_art60c1_CCNL2024_retribuzionePosizioneClassi: 2000,
            va_art61c2_CCNL2024_retribuzioneRisultato10: 1000
          }
        }
      }), mockNormativeData);
      expect(fundDoppiaNeutr.compliance.art23c2.limite).toBe(fix.expectedFund.doppiaNeutralizzazione.limiteAttualizzato);
      expect(fundDoppiaNeutr.compliance.art23Compliance?.art23Componenti?.segretario).toBe(fix.expectedFund.doppiaNeutralizzazione.segretarioRilevante);
      expect(fundDoppiaNeutr.compliance.art23Compliance?.art23Componenti?.segretarioQuotaEsclusaDL19_2026).toBe(fix.expectedFund.doppiaNeutralizzazione.segretarioEscluso);
    });

    it('Caso 19 [notApplicableToWizard]: Soglia di Tolleranza Delta Esattamente Pari a 0.01 € (Conforme)', () => {
      const fix = fixture15_soglieDeltaTolleranza;
      const input = createCharacterizationFundInput({
        historicalData: { manualPersonalFundLimit2016: 100000 },
        fondi: {
          dipendente: { cl_totaleParzialeRisorsePerConfrontoTetto2016: 100000.01 }
        }
      });
      const fundRes = calculateFundCompletely(input, mockNormativeData);
      expect(fundRes.compliance.art23c2.isCompliant).toBe(fix.expectedFund.esattamenteUnCentesimo.isCompliant);
      expect(fundRes.compliance.art23c2.delta).toBeCloseTo(fix.expectedFund.esattamenteUnCentesimo.delta, 6);
      expect(fundRes.compliance.art23Compliance?.isSforamento).toBe(fix.expectedFund.esattamenteUnCentesimo.isSforamento);
      expect(fundRes.alerts.find(a => a.id === 'alert_art23c2')).toBeUndefined();
    });

    it('Caso 20 [notApplicableToWizard]: Soglia di Tolleranza con Input di 0,005 € Arrotondato al Centesimo dal Motore (Conforme)', () => {
      const fix = fixture15_soglieDeltaTolleranza;
      const input = createCharacterizationFundInput({
        historicalData: { manualPersonalFundLimit2016: 100000 },
        fondi: {
          dipendente: { cl_totaleParzialeRisorsePerConfrontoTetto2016: 100000.005 }
        }
      });
      const fundRes = calculateFundCompletely(input, mockNormativeData);
      expect(fundRes.compliance.art23c2.isCompliant).toBe(fix.expectedFund.sottoUnCentesimo.isCompliant);
      expect(fundRes.compliance.art23c2.delta).toBeCloseTo(fix.expectedFund.sottoUnCentesimo.delta, 6);
      expect(fundRes.compliance.art23Compliance?.isSforamento).toBe(fix.expectedFund.sottoUnCentesimo.isSforamento);
      expect(fundRes.alerts.find(a => a.id === 'alert_art23c2')).toBeUndefined();
    });

    it('Caso 21 [notApplicableToWizard]: Soglia di Tolleranza Delta Superiore a 0.01 € (0.02 € - Non Conforme / Sforamento)', () => {
      const fix = fixture15_soglieDeltaTolleranza;
      const input = createCharacterizationFundInput({
        historicalData: { manualPersonalFundLimit2016: 100000 },
        fondi: {
          dipendente: { cl_totaleParzialeRisorsePerConfrontoTetto2016: 100000.02 }
        }
      });
      const fundRes = calculateFundCompletely(input, mockNormativeData);
      expect(fundRes.compliance.art23c2.isCompliant).toBe(fix.expectedFund.sopraUnCentesimo.isCompliant);
      expect(fundRes.compliance.art23c2.delta).toBeCloseTo(fix.expectedFund.sopraUnCentesimo.delta, 6);
      expect(fundRes.compliance.art23Compliance?.isSforamento).toBe(fix.expectedFund.sopraUnCentesimo.isSforamento);
      const alert = fundRes.alerts.find(a => a.id === fix.expectedFund.sopraUnCentesimo.alertId);
      expect(alert).toBeDefined();
      expect(alert?.severity).toBe('error');
    });
  });
});
