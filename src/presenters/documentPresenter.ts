import { CalculationResult, CalculationSection, DocumentMetadata } from '../domain';
import { formatCurrency } from '../utils/formatters';

/**
 * AG-127: ViewModel unificato per la modulistica amministrativa.
 * Garantisce che i documenti leggano solo dati formattati e pronti, 
 * senza ricalcolare business logic.
 */
export interface DocumentViewModel {
  ente: {
    denominazione: string;
    tipo: string;
    anno: number;
    cf?: string;
  };
  currentUser: {
    name: string;
    role: string;
  };
  fondi: {
    dipendente: FundViewModel;
    eq: { label: string; totale: number; formatted: string };
    segretario: { label: string; totale: number; formatted: string };
    dirigenza: { label: string; totale: number; formatted: string; active: boolean };
  };
  compliance: {
    art23c2: {
      limite: number;
      formattedLimite: string;
      valoreSoggetto: number;
      formattedValoreSoggetto: string;
      delta: number;
      formattedDelta: string;
      isCompliant: boolean;
      esitoLabel: string;
    };
  };
  metadati: {
    dataGenerazione: string;
    versioneMotore: string;
  };
  determina?: {
    numeroDetermina: string;
    dataDetermina: string;
    annoRiferimento: string;
    numDeliberaGC: string;
    dataDeliberaGC: string;
    numVerbaleRevisori: string;
    dataVerbaleRevisori: string;
    totaleFondo: string;
    importoStabileLordo: string;
    riduzioneConglobamento: string;
    importoVariabileTotale: string;
    incrementoDl25: string;
    decurtazioneL147: string;
    importoEq: string;
    firmaDigitale: string;
  };
}

export interface FundViewModel {
  label: string;
  totale: number;
  formattedTotale: string;
  sezioni: {
    stabiliSoggette: SectionViewModel;
    stabiliNonSoggette: SectionViewModel;
    variabiliSoggette: SectionViewModel;
    variabiliNonSoggette: SectionViewModel;
    decurtazioni: SectionViewModel;
  };
}

export interface SectionViewModel {
  title: string;
  total: number;
  formattedTotal: string;
  items: {
    desc: string;
    norma: string;
    amount: number;
    formattedAmount: string;
    isSubtractor: boolean;
  }[];
}

/**
 * Trasforma il CalculationResult nel ViewModel per la modulistica.
 */
export const createDocumentViewModel = (
  result: CalculationResult,
  denominazioneEnte: string,
  user: { name: string; role: string },
  docMeta?: DocumentMetadata
): DocumentViewModel => {
  const { dipendente, eq, segretario, dirigenza } = result.fondi;
  const art23 = result.compliance.art23c2;

  const mapSection = (sec?: CalculationSection): SectionViewModel => ({
    title: sec?.title || '',
    total: sec?.total || 0,
    formattedTotal: formatCurrency(sec?.total || 0),
    items: (sec?.items || []).map(i => ({
      desc: i.description,
      norma: i.riferimentoNormativo || '',
      amount: i.amount,
      formattedAmount: formatCurrency(i.amount),
      isSubtractor: !!i.isSubtractor
    }))
  });

  return {
    ente: {
      denominazione: denominazioneEnte,
      tipo: result.inputs.tipologiaEnte || 'Comune',
      anno: result.metadata.annoRiferimento
    },
    currentUser: user,
    fondi: {
      dipendente: {
        label: dipendente.label,
        totale: dipendente.summary.totaleFondo,
        formattedTotale: formatCurrency(dipendente.summary.totaleFondo),
        sezioni: {
          stabiliSoggette: mapSection(dipendente.constitution?.sections.stabili),
          stabiliNonSoggette: mapSection(dipendente.constitution?.sections.stabili_non_soggette),
          variabiliSoggette: mapSection(dipendente.constitution?.sections.variabili_soggette),
          variabiliNonSoggette: mapSection(dipendente.constitution?.sections.variabili_non_soggette),
          decurtazioni: mapSection(dipendente.constitution?.sections.decurtazioni)
        }
      },
      eq: {
        label: eq.label,
        totale: eq.summary.totaleFondo,
        formatted: formatCurrency(eq.summary.totaleFondo)
      },
      segretario: {
        label: segretario.label,
        totale: segretario.summary.totaleFondo,
        formatted: formatCurrency(segretario.summary.totaleFondo)
      },
      dirigenza: {
        label: dirigenza.label,
        totale: dirigenza.summary.totaleFondo,
        formatted: formatCurrency(dirigenza.summary.totaleFondo),
        active: result.inputs.hasDirigenza
      }
    },
    compliance: {
      art23c2: {
        limite: art23.limite,
        formattedLimite: formatCurrency(art23.limite),
        valoreSoggetto: art23.valoreSoggetto,
        formattedValoreSoggetto: formatCurrency(art23.valoreSoggetto),
        delta: art23.delta,
        formattedDelta: formatCurrency(art23.delta),
        isCompliant: art23.isCompliant,
        esitoLabel: art23.isCompliant ? 'CONFORME' : 'NON CONFORME'
      }
    },
    metadati: {
      dataGenerazione: new Date().toLocaleDateString('it-IT'),
      versioneMotore: '2.0.0-Sprint6'
    },
    determina: {
      numeroDetermina: docMeta?.numeroDetermina || '{{NUMERO_DETERMINA}}',
      dataDetermina: docMeta?.dataDetermina || '{{DATA_DETERMINA}}',
      annoRiferimento: String(result.metadata.annoRiferimento),
      numDeliberaGC: docMeta?.numDeliberaGc || '{{NUM_DELIBERA_GC}}',
      dataDeliberaGC: docMeta?.dataDeliberaGc || '{{DATA_DELIBERA_GC}}',
      numVerbaleRevisori: docMeta?.numVerbaleRevisori || '{{NUM_VERBALE_REVISORI}}',
      dataVerbaleRevisori: docMeta?.dataVerbaleRevisori || '{{DATA_VERBALE_REVISORI}}',
      totaleFondo: formatCurrency(dipendente.summary.totaleFondo),
      importoStabileLordo: (() => {
        const dRed = result.reductions?.details?.fad;
        const stableReductionsSum = dRed ? (
          (dRed.taglioDL78_2010 || 0) +
          (dRed.riduzioniPersonaleATA_PO_Esternalizzazioni || 0) +
          (dRed.decurtazionePO_AP || 0) +
          (dRed.riduzionePerIncrementoEQ || 0) +
          (dRed.riduzioneFondoStraordinario || 0) +
          (dRed.decurtazioneIndennitaComparto2026 || 0)
        ) : 0;
        return formatCurrency(dipendente.summary.totaleStabile + stableReductionsSum);
      })(),
      riduzioneConglobamento: formatCurrency(Math.abs(
        result.reductions?.details?.fad?.decurtazioneIndennitaComparto2026 ||
        dipendente.constitution?.sections.stabili?.items.find(i => i.key === 'st_art60c2_CCNL2026_decurtazioneIndennitaComparto')?.amount || 0
      )),
      importoVariabileTotale: formatCurrency(dipendente.summary.totaleVariabile),
      incrementoDl25: formatCurrency(
        dipendente.constitution?.sections.stabili?.items.find(i => i.key === 'st_incrementoDL25_2025')?.amount || 0
      ),
      decurtazioneL147: formatCurrency(Math.abs(
        result.reductions?.details?.fad?.riduzioniPersonaleATA_PO_Esternalizzazioni ||
        dipendente.constitution?.sections.stabili?.items.find(i => i.key === 'st_riduzioniPersonaleATA_PO_Esternalizzazioni')?.amount || 0
      )),
      importoEq: formatCurrency(eq.summary.totaleFondo),
      firmaDigitale: docMeta?.firmaDigitale || '{{FIRMA_DIGITALE}}'
    }

  };
};
