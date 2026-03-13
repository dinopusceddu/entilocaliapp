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
  { section: 'Dati Generali', label: 'Denominazione Ente', key: 'annualData.denominazioneEnte', type: 'string' },
  { section: 'Dati Generali', label: 'Tipologia Ente (Comune, Provincia, Unione dei Comuni, Comunità Montana, Altro)', key: 'annualData.tipologiaEnte', type: 'select', options: Object.values(TipologiaEnte) },
  { section: 'Dati Generali', label: 'Numero Abitanti (solo per Comuni/Province)', key: 'annualData.numeroAbitanti', type: 'number' },
  { section: 'Dati Generali', label: 'Ente in Dissesto (Sì/No)', key: 'annualData.isEnteDissestato', type: 'boolean' },
  { section: 'Dati Generali', label: 'Ente Deficitario (Sì/No)', key: 'annualData.isEnteStrutturalmenteDeficitario', type: 'boolean' },
  { section: 'Dati Generali', label: 'Ente in Riequilibrio (Sì/No)', key: 'annualData.isEnteRiequilibrioFinanziario', type: 'boolean' },
  { section: 'Dati Generali', label: 'Personale Dirigente Presente (Sì/No)', key: 'annualData.hasDirigenza', type: 'boolean' },

  // --- DATI STORICI ---
  { section: 'Dati Storici', label: 'Fondo 2016 - Personale non Dirigente', key: 'historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016', type: 'number' },
  { section: 'Dati Storici', label: 'Fondo 2016 - Elevate Qualificazioni (ex PO)', key: 'historicalData.fondoElevateQualificazioni2016', type: 'number' },
  { section: 'Dati Storici', label: 'Fondo 2016 - Dirigenza', key: 'historicalData.fondoDirigenza2016', type: 'number' },
  { section: 'Dati Storici', label: 'Risorse 2016 - Segretario Comunale', key: 'historicalData.risorseSegretarioComunale2016', type: 'number' },
  { section: 'Dati Storici', label: 'Personale in Servizio al 2018 (per limite Art. 23)', key: 'historicalData.personaleServizio2018', type: 'number' },

  // --- RISORSE STABILI (Fondo Dipendenti) ---
  { section: 'Risorse Stabili (Dipendenti)', label: 'Unico Importo 2017 (Art. 67 c.1)', key: 'fondoAccessorioDipendenteData.st_art79c1_art67c1_unicoImporto2017', type: 'number' },
  { section: 'Risorse Stabili (Dipendenti)', label: 'Incrementi 83,20€ (Art. 67 c.2a)', key: 'fondoAccessorioDipendenteData.st_art79c1_art67c2a_incr8320', type: 'number' },
  { section: 'Risorse Stabili (Dipendenti)', label: 'Incrementi Stipendiali Differenziali', key: 'fondoAccessorioDipendenteData.st_art79c1_art67c2b_incrStipendialiDiff', type: 'number' },
  { section: 'Risorse Stabili (Dipendenti)', label: 'RIA Personale Cessato (Art. 67 c.2c)', key: 'fondoAccessorioDipendenteData.st_art79c1_art4c2_art67c2c_integrazioneRIA', type: 'number' },
  { section: 'Risorse Stabili (Dipendenti)', label: 'Incremento 0,22% MS 2018 (Art. 79 c.1c)', key: 'fondoAccessorioDipendenteData.st_art79c1c_incrementoStabileConsistenzaPers', type: 'number' },
  { section: 'Risorse Stabili (Dipendenti)', label: 'Taglio Fondo DL 78/2010', key: 'fondoAccessorioDipendenteData.st_taglioFondoDL78_2010', type: 'number' },

  // --- RISORSE VARIABILI (Fondo Dipendenti) ---
  { section: 'Risorse Variabili (Dipendenti)', label: 'Recupero Evasione (Art. 67 c.3c)', key: 'fondoAccessorioDipendenteData.vs_art4c3_art15c1k_art67c3c_recuperoEvasione', type: 'number' },
  { section: 'Risorse Variabili (Dipendenti)', label: 'Risorse Scelte Organizzative (Max 1.2% MS)', key: 'fondoAccessorioDipendenteData.vs_art79c2c_risorseScelteOrganizzative', type: 'number' },
  { section: 'Risorse Variabili (Dipendenti)', label: 'Somme non utilizzate anni precedenti', key: 'fondoAccessorioDipendenteData.vn_art80c1_sommeNonUtilizzateStabiliPrec', type: 'number' },
  { section: 'Risorse Variabili (Dipendenti)', label: 'Incentivi Funzioni Tecniche', key: 'fondoAccessorioDipendenteData.vn_art15c1k_art67c3c_incentiviTecniciCondoni', type: 'number' },
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
