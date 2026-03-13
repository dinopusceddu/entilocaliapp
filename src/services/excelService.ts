import * as XLSX from 'xlsx';
import { FundData } from '../types.ts';
import { TipologiaEnte } from '../enums.ts';

interface ExcelMapping {
  section: string;
  label: string;
  key: string; // path in FundData, e.g., 'annualData.denominazioneEnte'
  type: 'string' | 'number' | 'boolean' | 'select';
  options?: string[];
}

const EXCEL_MAPPING: ExcelMapping[] = [
  // --- DATI GENERALI ENTE ---
  { section: '1. Dati Generali', label: 'Denominazione Ente', key: 'annualData.denominazioneEnte', type: 'string' },
  { section: '1. Dati Generali', label: 'Tipologia Ente (Comune, Provincia, Unione dei Comuni, Comunità Montana, Altro)', key: 'annualData.tipologiaEnte', type: 'select', options: Object.values(TipologiaEnte) },
  { section: '1. Dati Generali', label: 'Numero Abitanti', key: 'annualData.numeroAbitanti', type: 'number' },
  { section: '1. Dati Generali', label: 'Ente in Dissesto (Sì/No)', key: 'annualData.isEnteDissestato', type: 'boolean' },
  { section: '1. Dati Generali', label: 'Ente Deficitario (Sì/No)', key: 'annualData.isEnteStrutturalmenteDeficitario', type: 'boolean' },
  { section: '1. Dati Generali', label: 'Ente in Riequilibrio (Sì/No)', key: 'annualData.isEnteRiequilibrioFinanziario', type: 'boolean' },
  { section: '1. Dati Generali', label: 'Personale Dirigente Presente (Sì/No)', key: 'annualData.hasDirigenza', type: 'boolean' },
  { section: '1. Dati Generali', label: 'Equilibrio di Bilancio Anno Prec. (Sì/No)', key: 'annualData.rispettoEquilibrioBilancioPrecedente', type: 'boolean' },
  { section: '1. Dati Generali', label: 'Rispetto Debito Commerciale (Sì/No)', key: 'annualData.rispettoDebitoCommercialePrecedente', type: 'boolean' },
  { section: '1. Dati Generali', label: 'Approvazione Rendiconto nei Termini (Sì/No)', key: 'annualData.approvazioneRendicontoPrecedente', type: 'boolean' },
  { section: '1. Dati Generali', label: 'Incidenza Salario Accessorio (%)', key: 'annualData.incidenzaSalarioAccessorioUltimoRendiconto', type: 'number' },

  // --- DATI STORICI E ART. 23 ---
  { section: '2. Dati Storici', label: 'Fondo 2016 - Personale non Dirigente', key: 'historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016', type: 'number' },
  { section: '2. Dati Storici', label: 'Fondo 2016 - Elevate Qualificazioni (ex PO)', key: 'historicalData.fondoElevateQualificazioni2016', type: 'number' },
  { section: '2. Dati Storici', label: 'Fondo 2016 - Dirigenza', key: 'historicalData.fondoDirigenza2016', type: 'number' },
  { section: '2. Dati Storici', label: 'Risorse 2016 - Segretario Comunale', key: 'historicalData.risorseSegretarioComunale2016', type: 'number' },
  { section: '2. Dati Storici', label: 'Fondo Straordinario Consolidato', key: 'annualData.fondoLavoroStraordinario', type: 'number' },
  { section: '2. Dati Storici', label: 'Override Manuale Limite 2016', key: 'historicalData.manualPersonalFundLimit2016', type: 'number' },
  { section: '2. Dati Storici', label: 'Fondo Personale 2018 (per Art. 23)', key: 'historicalData.fondoPersonaleNonDirEQ2018_Art23', type: 'number' },
  { section: '2. Dati Storici', label: 'Fondo EQ 2018 (per Art. 23)', key: 'historicalData.fondoEQ2018_Art23', type: 'number' },
  { section: '2. Dati Storici', label: 'Totale Dipendenti Equivalenti 2018 (Manuale)', key: 'annualData.manualDipendentiEquivalenti2018', type: 'number' },
  { section: '2. Dati Storici', label: 'Totale Dipendenti Equivalenti Anno Rif. (Manuale)', key: 'annualData.manualDipendentiEquivalentiAnnoRif', type: 'number' },

  // --- CCNL 2024-2026 ---
  { section: '3. Parametri CCNL 2024-26', label: 'Monte Salari 2021', key: 'annualData.ccnl2024.monteSalari2021', type: 'number' },
  { section: '3. Parametri CCNL 2024-26', label: 'Fondo Personale 2025 (Artr. 24 c.1)', key: 'annualData.ccnl2024.fondoPersonale2025', type: 'number' },
  { section: '3. Parametri CCNL 2024-26', label: 'Fondo EQ 2025 (Art. 24 c.1)', key: 'annualData.ccnl2024.fondoEQ2025', type: 'number' },
  { section: '3. Parametri CCNL 2024-26', label: 'Incr. Variabile dal 2026 (%)', key: 'annualData.ccnl2024.optionalIncreaseVariableFrom2026Percentage', type: 'number' },
  { section: '3. Parametri CCNL 2024-26', label: 'Incr. Una Tantum 2026 (%)', key: 'annualData.ccnl2024.optionalIncreaseVariable2026OnlyPercentage', type: 'number' },
  { section: '3. Parametri CCNL 2024-26', label: 'Incremento Straordinario (€)', key: 'annualData.incrementoFondoStraordinario', type: 'number' },
  { section: '3. Parametri CCNL 2024-26', label: 'Riduzione Stabile per Straordinario (Sì/No)', key: 'annualData.riduzioneFondoParteStabile', type: 'boolean' },

  // --- FONDO DIPENDENTI - RISORSE STABILI ---
  { section: '4. Fondo Dipendenti (Stabili)', label: 'Unico Importo 2017 (Art. 67 c.1)', key: 'fondoAccessorioDipendenteData.st_art79c1_art67c1_unicoImporto2017', type: 'number' },
  { section: '4. Fondo Dipendenti (Stabili)', label: 'Alte Professionalità non utilizzate', key: 'fondoAccessorioDipendenteData.st_art79c1_art67c1_alteProfessionalitaNonUtil', type: 'number' },
  { section: '4. Fondo Dipendenti (Stabili)', label: 'Incrementi 83,20€ (Art. 67 c.2a)', key: 'fondoAccessorioDipendenteData.st_art79c1_art67c2a_incr8320', type: 'number' },
  { section: '4. Fondo Dipendenti (Stabili)', label: 'Incrementi Stipendiali Differenziali (Art. 67 c.2b)', key: 'fondoAccessorioDipendenteData.st_art79c1_art67c2b_incrStipendialiDiff', type: 'number' },
  { section: '4. Fondo Dipendenti (Stabili)', label: 'RIA Personale Cessato (Art. 67 c.2c)', key: 'fondoAccessorioDipendenteData.st_art79c1_art4c2_art67c2c_integrazioneRIA', type: 'number' },
  { section: '4. Fondo Dipendenti (Stabili)', label: 'Risorse Riassorbite L. 165 (Art. 67 c.2d)', key: 'fondoAccessorioDipendenteData.st_art79c1_art67c2d_risorseRiassorbite165', type: 'number' },
  { section: '4. Fondo Dipendenti (Stabili)', label: 'Personale Trasferito (Art. 67 c.2e)', key: 'fondoAccessorioDipendenteData.st_art79c1_art15c1l_art67c2e_personaleTrasferito', type: 'number' },
  { section: '4. Fondo Dipendenti (Stabili)', label: 'Incremento 0,22% MS 2018 (Art. 79 c.1c)', key: 'fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers', type: 'number' },
  { section: '4. Fondo Dipendenti (Stabili)', label: 'Differenziali Stipendiali 2022 (Art. 79 c.1d)', key: 'fondoAccessorioDipendenteData.st_art79c1d_differenzialiStipendiali2022', type: 'number' },
  { section: '4. Fondo Dipendenti (Stabili)', label: 'Differenziali B3-D3 (Art. 79 c.1bis)', key: 'fondoAccessorioDipendenteData.st_art79c1bis_diffStipendialiB3D3', type: 'number' },
  { section: '4. Fondo Dipendenti (Stabili)', label: 'Taglio Fondo DL 78/2010', key: 'fondoAccessorioDipendenteData.st_taglioFondoDL78_2010', type: 'number' },
  { section: '4. Fondo Dipendenti (Stabili)', label: 'Decurtazione PO/Alta Prof. Enti Dirigenza', key: 'fondoAccessorioDipendenteData.st_art67c1_decurtazionePO_AP_EntiDirigenza', type: 'number' },
  { section: '4. Fondo Dipendenti (Stabili)', label: 'Riduzione per Incremento EQ', key: 'fondoAccessorioDipendenteData.st_riduzionePerIncrementoEQ', type: 'number' },
  { section: '4. Fondo Dipendenti (Stabili)', label: 'Decurtazione Indennità Comparto (Tab. C CCNL 2026)', key: 'fondoAccessorioDipendenteData.st_art60c2_CCNL2026_decurtazioneIndennitaComparto', type: 'number' },

  // --- FONDO DIPENDENTI - RISORSE VARIABILI ---
  { section: '5. Fondo Dipendenti (Variabili)', label: 'Recupero Evasione (Art. 67 c.3c)', key: 'fondoAccessorioDipendenteData.vs_art4c3_art15c1k_art67c3c_recuperoEvasione', type: 'number' },
  { section: '5. Fondo Dipendenti (Variabili)', label: 'Integrazione RIA Mensile (Art. 67 c.3d)', key: 'fondoAccessorioDipendenteData.vs_art4c2_art67c3d_integrazioneRIAMensile', type: 'number' },
  { section: '5. Fondo Dipendenti (Variabili)', label: 'Incremento 1,2% MS 1997 (Art. 79 c.2b)', key: 'fondoAccessorioDipendenteData.vs_art79c2b_max1_2MonteSalari1997', type: 'number' },
  { section: '5. Fondo Dipendenti (Variabili)', label: 'Risorse Scelte Organizzative (Art. 79 c.2c)', key: 'fondoAccessorioDipendenteData.vs_art79c2c_risorseScelteOrganizzative', type: 'number' },
  { section: '5. Fondo Dipendenti (Variabili)', label: 'Sponsor e Convenzioni (Art. 67 c.3a)', key: 'fondoAccessorioDipendenteData.vn_art15c1d_art67c3a_sponsorConvenzioni', type: 'number' },
  { section: '5. Fondo Dipendenti (Variabili)', label: 'Piani Razionalizzazione (Art. 67 c.3b)', key: 'fondoAccessorioDipendenteData.vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione', type: 'number' },
  { section: '5. Fondo Dipendenti (Variabili)', label: 'Incentivi Tecnici e Condoni (Art. 67 c.3c)', key: 'fondoAccessorioDipendenteData.vn_art15c1k_art67c3c_incentiviTecniciCondoni', type: 'number' },
  { section: '5. Fondo Dipendenti (Variabili)', label: 'Risparmi Straordinario (Art. 67 c.3e)', key: 'fondoAccessorioDipendenteData.vn_art15c1m_art67c3e_risparmiStraordinario', type: 'number' },
  { section: '5. Fondo Dipendenti (Variabili)', label: 'Somme non utilizzate anni precedenti (Art. 80 c.1)', key: 'fondoAccessorioDipendenteData.vn_art80c1_sommeNonUtilizzateStabiliPrec', type: 'number' },
  { section: '5. Fondo Dipendenti (Variabili)', label: 'Incremento 0,22% MS 2018 (Art. 79 c.3)', key: 'fondoAccessorioDipendenteData.vn_art79c3_022MonteSalari2018_da2022Proporzionale', type: 'number' },
  { section: '5. Fondo Dipendenti (Variabili)', label: 'Incremento 0,22% MS 2021 (Art. 58 c.2) - dal 2025', key: 'fondoAccessorioDipendenteData.vn_art58c2_incremento_max022_ms2021_anno2025', type: 'number' },
  { section: '5. Fondo Dipendenti (Variabili)', label: 'Incremento PNRR (Art. 8 c.3 DL 13/23)', key: 'fondoAccessorioDipendenteData.vn_dl13_art8c3_incrementoPNRR_max5stabile2016', type: 'number' },

  // --- ELEVATE QUALIFICAZIONI (EQ) ---
  { section: '6. Elevate Qualificazioni', label: 'Risorse Fondo PO/EQ 2017', key: 'fondoElevateQualificazioniData.ris_fondoPO2017', type: 'number' },
  { section: '6. Elevate Qualificazioni', label: 'Incr. con Riduzione Fondo Dipendenti', key: 'fondoElevateQualificazioniData.ris_incrementoConRiduzioneFondoDipendenti', type: 'number' },
  { section: '6. Elevate Qualificazioni', label: 'Incr. 0,22% MS 2018 (Art. 79 c.3)', key: 'fondoElevateQualificazioniData.ris_incremento022MonteSalari2018', type: 'number' },
  { section: '6. Elevate Qualificazioni', label: 'Incr. 0,22% MS 2021 (Art. 58 c.2)', key: 'fondoElevateQualificazioniData.va_incremento022_ms2021_eq', type: 'number' },
  { section: '6. Elevate Qualificazioni', label: 'Retribuzione di Posizione (Riparto)', key: 'fondoElevateQualificazioniData.st_art16c2_retribuzionePosizione', type: 'number' },
  { section: '6. Elevate Qualificazioni', label: 'Retribuzione di Risultato (Riparto)', key: 'fondoElevateQualificazioniData.va_art16c3_retribuzioneRisultato', type: 'number' },

  // --- SEGRETARIO COMUNALE ---
  { section: '7. Segretario Comunale', label: 'Retribuzione Posizione 2011 (Art. 3 c.6)', key: 'fondoSegretarioComunaleData.st_art3c6_CCNL2011_retribuzionePosizione', type: 'number' },
  { section: '7. Segretario Comunale', label: 'Differenziale Aumento (Art. 58 c.1)', key: 'fondoSegretarioComunaleData.st_art58c1_CCNL2024_differenzialeAumento', type: 'number' },
  { section: '7. Segretario Comunale', label: 'Retribuzione Posizione Classi (Art. 60 c.1)', key: 'fondoSegretarioComunaleData.st_art60c1_CCNL2024_retribuzionePosizioneClassi', type: 'number' },
  { section: '7. Segretario Comunale', label: 'Incr. Posizione CCNL 24-26 (Art. 36)', key: 'fondoSegretarioComunaleData.st_art36_CCNL2022_2024_incrementoRetribuzionePosizione', type: 'number' },
  { section: '7. Segretario Comunale', label: 'Maggiorazione Complessità (Art. 60 c.3)', key: 'fondoSegretarioComunaleData.st_art60c3_CCNL2024_maggiorazioneComplessita', type: 'number' },
  { section: '7. Segretario Comunale', label: 'Allineamento Dirig/EQ (Art. 60 c.5)', key: 'fondoSegretarioComunaleData.st_art60c5_CCNL2024_allineamentoDirigEQ', type: 'number' },
  { section: '7. Segretario Comunale', label: 'Retribuzione Risultato 15% (Art. 61 c.2bis)', key: 'fondoSegretarioComunaleData.va_art61c2bis_CCNL2024_retribuzioneRisultato15', type: 'number' },
  { section: '7. Segretario Comunale', label: 'Incr. 0,22% MS 2021 (Art. 40 c.2) - CCNL 24-26', key: 'fondoSegretarioComunaleData.va_art40c2_CCNL2022_2024_incremento0_22MonteSalari2021', type: 'number' },

  // --- SIMULATORE INCREMENTO ---
  { section: '8. Simulatore', label: 'Stipendi tabellari personale 2023', key: 'annualData.simulatoreInput.simStipendiTabellari2023', type: 'number' },
  { section: '8. Simulatore', label: 'Fondo Stabile Anno Applicazione', key: 'annualData.simulatoreInput.simFondoStabileAnnoApplicazione', type: 'number' },
  { section: '8. Simulatore', label: 'Risorse EQ Anno Applicazione', key: 'annualData.simulatoreInput.simRisorsePOEQAnnoApplicazione', type: 'number' },
  { section: '8. Simulatore', label: 'Spesa Personale Consuntivo 2023', key: 'annualData.simulatoreInput.simSpesaPersonaleConsuntivo2023', type: 'number' },
  { section: '8. Simulatore', label: 'Media Entrate Correnti 2021-23', key: 'annualData.simulatoreInput.simMediaEntrateCorrenti2021_2023', type: 'number' },
  { section: '8. Simulatore', label: 'Tetto Spesa Personale L. 296/06', key: 'annualData.simulatoreInput.simTettoSpesaPersonaleL296_06', type: 'number' },
  { section: '8. Simulatore', label: 'Costo Nuove Assunzioni PIAO', key: 'annualData.simulatoreInput.simCostoAnnuoNuoveAssunzioniPIAO', type: 'number' },
  { section: '8. Simulatore', label: 'Percentuale Oneri Incremento (%)', key: 'annualData.simulatoreInput.simPercentualeOneriIncremento', type: 'number' },
];

export const generateExcelTemplate = (data: FundData) => {
  const rows = EXCEL_MAPPING.map(m => {
    const value = getNestedValue(data, m.key);
    let displayValue = value;
    
    if (m.type === 'boolean') {
      displayValue = value === true ? 'Sì' : (value === false ? 'No' : '');
    }
    
    return {
      'Sezione': m.section,
      'Descrizione Campo': m.label,
      'Valore': displayValue ?? '',
      'Chiave Tecnica (NON MODIFICARE)': m.key
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 25 }, // Sezione
    { wch: 50 }, // Descrizione
    { wch: 20 }, // Valore
    { wch: 40 }, // Chiave Tecnica
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dati Fondo');
  
  // Create binary string and download
  XLSX.writeFile(workbook, 'Modello_Dati_Fondo.xlsx');
};

export const parseExcelData = async (file: File): Promise<Partial<FundData>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        
        const result: any = {
          annualData: {},
          historicalData: {},
          fondoAccessorioDipendenteData: {}
        };

        rows.forEach((row: any) => {
          const key = row['Chiave Tecnica (NON MODIFICARE)'];
          let value = row['Valore'];
          
          const mapping = EXCEL_MAPPING.find(m => m.key === key);
          if (!mapping) return;

          // Type conversion
          if (mapping.type === 'number') {
            value = value === '' || value === undefined ? undefined : Number(value);
          } else if (mapping.type === 'boolean') {
            value = value === 'Sì' || value === 'SÌ' || value === 'SI' || value === true;
          } else if (mapping.type === 'select') {
             // Basic validation for select?
          }

          setNestedValue(result, key, value);
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};

// Helper functions for nested objects
function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function setNestedValue(obj: any, path: string, value: any) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part]) current[part] = {};
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}
