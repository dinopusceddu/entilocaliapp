import { 
  CalculationResult, 
  Tabella15Result, 
  Tabella15Entry, 
  NormativeData
} from '../../domain';
import { getFadFieldDefinitions } from '../fundFieldDefinitions';
import FinancialMath from '../../utils/financialMath';

/**
 * Mapper istituzionale per la Tabella 15 del Conto Annuale.
 * AG-126: Trasforma il CalculationResult in un dataset pronto per l'export.
 */
export const mapToTabella15 = (
  result: CalculationResult,
  norme: NormativeData
): Tabella15Result => {
  const definitions = getFadFieldDefinitions(norme);
  const dipResult = result.fondi.dipendente;
  const year = result.metadata.annoRiferimento;
  const entityName = result.metadata.denominazioneEnte || 'Ente';

  const stabileEntries: Tabella15Entry[] = [];
  const variabileEntries: Tabella15Entry[] = [];

  // 1. Mappatura Voci dalla Costituzione
  if (dipResult.constitution) {
    const allItems = Object.values(dipResult.constitution.sections)
      .flatMap(section => section.items.map(item => ({ ...item, sectionId: section.id })));

    for (const item of allItems) {
      const def = definitions.find(d => d.key === item.key);
      if (def && def.tabella15Column) {
        const entry: Tabella15Entry = {
          key: item.key,
          description: item.description,
          columnCode: def.tabella15Column,
          amount: item.amount,
          source: `Constitution/${item.sectionId}`
        };

        if (def.section === 'stabili') {
          stabileEntries.push(entry);
        } else {
          variabileEntries.push(entry);
        }
      }
    }
  }

  // 2. Calcolo Totali Sezione
  const totalStabile = stabileEntries.reduce((acc, curr) => FinancialMath.addExact(acc, curr.amount), 0);
  const totalVariabile = variabileEntries.reduce((acc, curr) => FinancialMath.addExact(acc, curr.amount), 0);

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
    grandTotal: FinancialMath.addExact(totalStabile, totalVariabile),
    metadata: {
      generatedAt: new Date().toISOString(),
      engineVersion: "1.0.0-canonico"
    }
  };
};
