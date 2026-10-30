import { presentArt23Verification } from '../domain/art23Verification';
import { CalculationResult, FundResult, CalculationSection } from '../domain';
import { formatCurrency } from '../utils/formatters';
import { projectFadReport, type FadReportReadModel } from '../domain/documentProjection';
import { projectProvenance, type ProvenanceReadModel, type ProvenanceContext } from '../domain/provenance';
import type { FundData } from '../domain/types';

export interface ReportViewModel {
  provenance: ProvenanceReadModel;
  /** Qualification metadata only; canonical economics remain exclusively in fadCanonical. */
  art23Verification?: Pick<ReturnType<typeof presentArt23Verification>, 'status' | 'label' | 'guidance'>;
  fadCanonical: FadReportReadModel;
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
      guidance?: string;
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
  denominazioneEnte: string,
  explanation?: { fundData: FundData; context?: ProvenanceContext }
): ReportViewModel => {
  const { dipendente } = result.fondi;
  const art23 = result.compliance.art23c2;
  const art23View = presentArt23Verification(result);

  const getSectionsArray = (fond: FundResult, type: 'constitution' | 'utilization'): CalculationSection[] => {
    const sections = fond[type]?.sections;
    return sections ? Object.values(sections) : [];
  };

  return {
    art23Verification: { status: art23View.status, label: art23View.label, guidance: art23View.guidance },
    provenance: projectProvenance(result, explanation?.fundData, explanation?.context),
    fadCanonical: projectFadReport(result.canonicalFund),
    denominazioneEnte,
    annoRiferimento: result.metadata.annoRiferimento,
    fondoDipendenti: {
      totaleDisponibile: formatCurrency(dipendente.summary.totaleFondo),
      costituzione: getSectionsArray(dipendente, 'constitution'),
      utilizzi: getSectionsArray(dipendente, 'utilization'),
      limiteArt23: {
        limite: art23View.formattedLimit,
        valoreSoggetto: formatCurrency(art23.valoreSoggetto),
        delta: art23View.formattedMargin,
        isCompliant: art23View.isCompliant,
        esitoLabel: art23View.label
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
