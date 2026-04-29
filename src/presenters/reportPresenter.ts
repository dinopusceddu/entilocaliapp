import { CalculationResult, FundResult, CalculationSection } from '../domain';
import { formatCurrency } from '../utils/formatters';

export interface ReportViewModel {
  denominazioneEnte: string;
  annoRiferimento: number;
  fondoDipendenti: {
    totaleDisponibile: string;
    costituzione: CalculationSection[];
    utilizzi: CalculationSection[];
    limiteArt23: {
      limite: string;
      valoreSoggetto: string;
      delta: string;
      isCompliant: boolean;
      esitoLabel: string;
    };
  };
  altriFondi: {
    eq: { label: string; totale: string; };
    segretario: { label: string; totale: string; };
    dirigenza: { label: string; totale: string; hasDirigenza: boolean; };
  };
}

/**
 * Presenter che trasforma il DTO canonico CalculationResult in un ViewModel
 * pronto per la visualizzazione o la generazione di documenti (Excel/PDF).
 */
export const createReportViewModel = (
  result: CalculationResult,
  denominazioneEnte: string
): ReportViewModel => {
  const { dipendente } = result.fondi;
  const art23 = result.compliance.art23c2;

  const getSectionsArray = (fond: FundResult, type: 'constitution' | 'utilization'): CalculationSection[] => {
    const sections = fond[type]?.sections;
    return sections ? Object.values(sections) : [];
  };

  return {
    denominazioneEnte,
    annoRiferimento: result.metadata.annoRiferimento,
    fondoDipendenti: {
      totaleDisponibile: formatCurrency(dipendente.summary.totaleFondo),
      costituzione: getSectionsArray(dipendente, 'constitution'),
      utilizzi: getSectionsArray(dipendente, 'utilization'),
      limiteArt23: {
        limite: formatCurrency(art23.limite),
        valoreSoggetto: formatCurrency(art23.valoreSoggetto),
        delta: formatCurrency(art23.delta),
        isCompliant: art23.isCompliant,
        esitoLabel: art23.isCompliant ? 'CONFORME' : 'NON CONFORME'
      }
    },
    altriFondi: {
      eq: { 
        label: result.fondi.eq.label, 
        totale: formatCurrency(result.fondi.eq.summary.totaleFondo) 
      },
      segretario: { 
        label: result.fondi.segretario.label, 
        totale: formatCurrency(result.fondi.segretario.summary.totaleFondo) 
      },
      dirigenza: { 
        label: result.fondi.dirigenza.label, 
        totale: formatCurrency(result.fondi.dirigenza.summary.totaleFondo),
        hasDirigenza: result.inputs.hasDirigenza
      }
    }
  };
};
