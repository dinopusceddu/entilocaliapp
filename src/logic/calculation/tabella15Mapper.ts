import { 
  CalculationResult, 
  Tabella15Result, 
  Tabella15Entry, 
  NormativeData
} from '../../domain';
import { getFadFieldDefinitions } from '../fundFieldDefinitions';
import FinancialMath from '../../utils/financialMath';

const CANONICAL_COLUMN_MAPPING: Record<string, { columnCode: string; description: string }> = {
  CCNL_014_CURRENT: {
    columnCode: 'S614',
    description: 'Incremento stabile 0,14% Monte Salari 2021 (Art. 58 c. 1 CCNL 2026)'
  },
  OVERTIME_STABLE_TRANSFER: {
    columnCode: 'S615',
    description: 'Riduzione stabile straordinario (Art. 79 c. 1 lett. b/ex 67 c. 2g)'
  },
  RIA: {
    columnCode: 'S613',
    description: 'Integrazione RIA personale cessato'
  },
  DL25_CURRENT: {
    columnCode: 'S615',
    description: 'Incremento D.L. 25/2025 (Limite 48%)'
  },
  DL25_CURRENT_LEGACY_ALIAS: {
    columnCode: 'S615',
    description: 'Incremento D.L. 25/2025 (Limite 48%) [alias]'
  },
  ART60_CONSOLIDATION: {
    columnCode: 'S616',
    description: 'Decurtazione stabile per conglobamento indennità comparto (Art. 60 c. 2 CCNL 2026)'
  },
  CCNL_022_CURRENT: {
    columnCode: 'V623',
    description: 'Incremento 0,22% Monte Salari 2021 (Art. 58 c. 2 CCNL 2026)'
  },
  CCNL_014_RECOVERY_LEGACY_2024_2025: {
    columnCode: 'V624',
    description: 'Arretrati 0,14% 2024-2025 (Art. 58 c. 1 CCNL 2026)'
  }
};

/**
 * Mapper istituzionale per la Tabella 15 del Conto Annuale.
 * AG-126 / Wave 3: Alimentato direttamente dal Canonical Fund Ledger.
 * Risolve DOC-01: riconciliazione esatta, preservazione del segno delle decurtazioni,
 * esclusione di movimenti figurativi e voci non determinate, propagazione nome ente.
 */
export const mapToTabella15 = (
  result: CalculationResult,
  norme: NormativeData
): Tabella15Result => {
  const definitions = getFadFieldDefinitions(norme);
  const dipResult = result.fondi?.dipendente;
  const year = result.metadata?.annoRiferimento ?? 2026;
  const entityName = result.metadata?.denominazioneEnte || 'Ente';

  const stabileEntries: Tabella15Entry[] = [];
  const variabileEntries: Tabella15Entry[] = [];
  const unresolvedClassifications: any[] = [];
  const warnings: string[] = [];

  if (result.canonicalFund && result.canonicalFund.entries.length > 0) {
    // 1. Mappatura da Canonical Fund Ledger (Sorgente primaria e autoritativa)
    for (const entry of result.canonicalFund.entries) {
      // Escludi movimenti figurativi (ad es. ART60_ART23_FIGURATIVE, DL25_ART23_EXCLUSION)
      if (entry.economicEffect === false) {
        continue;
      }

      // Voci non determinate (es. arretrati senza istruttoria) non entrano nel totale certificato Tabella 15
      if (entry.status !== 'VALID' || entry.amount === null) {
        continue;
      }

      // Ometti voci a importo zero (es. Art. 60 negli anni < 2026)
      if (entry.amount === 0) {
        continue;
      }

      const absAmount = Math.abs(entry.amount);
      const signedRaw = entry.operation === 'DEDUCTION' ? -absAmount : absAmount;
      const signedAmount = FinancialMath.roundTo2DP(signedRaw);

      let columnCode: string | null = null;
      let description = entry.id;
      let unmappedReason: string | null = null;

      if (CANONICAL_COLUMN_MAPPING[entry.id]) {
        columnCode = CANONICAL_COLUMN_MAPPING[entry.id].columnCode;
        description = CANONICAL_COLUMN_MAPPING[entry.id].description;
      } else if (entry.id.startsWith('LEGACY_FAD_RESOURCE:')) {
        const legacyKey = entry.id.replace('LEGACY_FAD_RESOURCE:', '');
        const def = definitions.find(d => d.key === legacyKey);
        if (def) {
          description = def.description;
          if (def.tabella15Column) {
            columnCode = def.tabella15Column;
          } else {
            columnCode = 'RGS_MAPPING_UNRESOLVED';
            unmappedReason = `Definizione legacy '${legacyKey}' priva di colonna Tabella 15 ministeriale`;
          }
        } else {
          columnCode = 'RGS_MAPPING_UNRESOLVED';
          unmappedReason = `Chiave risorsa legacy '${legacyKey}' non riconosciuta nelle definizioni FAD`;
        }
      } else {
        columnCode = 'RGS_MAPPING_UNRESOLVED';
        unmappedReason = `Voce di ledger '${entry.id}' priva di mapping Tabella 15`;
      }

      if (columnCode === 'RGS_MAPPING_UNRESOLVED') {
        unresolvedClassifications.push({
          key: entry.id,
          description,
          amount: signedAmount,
          reason: unmappedReason || 'Voce priva di classificazione ministeriale Tabella 15'
        });
        warnings.push(`[TABELLA 15 UNRESOLVED] Voce non classificata ${entry.id} (${description}): importo ${signedAmount} assegnato a RGS_MAPPING_UNRESOLVED.`);
      }

      const tabellaEntry: Tabella15Entry = {
        key: entry.id,
        description,
        columnCode,
        amount: signedAmount,
        source: `CanonicalLedger/${entry.id}`
      };

      if (entry.component === 'STABLE') {
        stabileEntries.push(tabellaEntry);
      } else {
        variabileEntries.push(tabellaEntry);
      }
    }
  } else if (dipResult?.constitution) {
    // Fallback per mock/test senza canonicalFund
    warnings.push('[LEGACY PREVIEW] Risultato privo di CanonicalFundLedger. Export ufficiale SICO e certificazione disabilitati.');
    const allItems = Object.values(dipResult.constitution.sections)
      .flatMap(section => section.items.map(item => ({ ...item, sectionId: section.id })));

    for (const item of allItems) {
      if (!item.amount) continue;
      const def = definitions.find(d => d.key === item.key);
      const isDeduction = !!def?.isSubtractor || (item as any).operator === '-';
      const signedRaw = isDeduction ? -Math.abs(item.amount) : item.amount;
      const signed = FinancialMath.roundTo2DP(signedRaw);

      let columnCode: string;
      if (def && def.tabella15Column) {
        columnCode = def.tabella15Column;
      } else {
        columnCode = 'RGS_MAPPING_UNRESOLVED';
        unresolvedClassifications.push({
          key: item.key,
          description: item.description,
          amount: signed,
          reason: 'Voce legacy priva di colonna Tabella 15'
        });
      }

      const entry: Tabella15Entry = {
        key: item.key,
        description: item.description,
        columnCode,
        amount: signed,
        source: `Constitution/${item.sectionId}`
      };

      if (def?.section === 'stabili') {
        stabileEntries.push(entry);
      } else {
        variabileEntries.push(entry);
      }
    }
  }

  // Calcolo Totali Sezione con precisione contabile unificata
  const totalStabile = FinancialMath.roundTo2DP(stabileEntries.reduce((acc, curr) => FinancialMath.addExact(acc, curr.amount), 0));
  const totalVariabile = FinancialMath.roundTo2DP(variabileEntries.reduce((acc, curr) => FinancialMath.addExact(acc, curr.amount), 0));
  const verifiedSubtotal = FinancialMath.roundTo2DP(FinancialMath.addExact(totalStabile, totalVariabile));

  const cFund = result.canonicalFund;
  const overallStatus = cFund ? cFund.status : (result.canonicalFund ? 'VALID' : 'UNDETERMINED');

  let grandTotal: number | null;
  if (cFund) {
    if (cFund.total !== null && cFund.status === 'VALID' && unresolvedClassifications.length === 0) {
      grandTotal = FinancialMath.roundTo2DP(FinancialMath.addExact(totalStabile, totalVariabile));
    } else {
      grandTotal = null;
    }
  } else {
    // W3-WB-001: No canonicalFund → no definitive total; legacy result must never emit TOTALE GENERALE.
    grandTotal = null;
  }

  // W3-RGS-001: Separate arithmetic readiness (quadratura) from schema verification (SICO conformity).
  const isArithmeticExportReady = !!cFund && overallStatus === 'VALID' && grandTotal !== null && unresolvedClassifications.length === 0;
  // isSicoExportReady remains false until an authoritative annual RGS schema check is performed externally.
  const isSicoExportReady = false;

  return {
    year,
    entityName,
    sections: {
      stabile: {
        title: "Risorse a carattere stabile",
        entries: stabileEntries,
        total: totalStabile
      },
      variabile: {
        title: "Risorse a carattere variabile",
        entries: variabileEntries,
        total: totalVariabile
      }
    },
    grandTotal,
    verifiedSubtotal,
    overallStatus,
    schemaVerificationStatus: 'RGS_SCHEMA_UNVERIFIED',
    unresolvedClassifications,
    warnings,
    isExportReady: isSicoExportReady,
    isArithmeticExportReady,
    isSicoExportReady,
    metadata: {
      generatedAt: new Date().toISOString(),
      engineVersion: "2.0.0-canonical"
    }
  };
};
