import { presentArt23Verification } from '../domain/art23Verification';
import { CalculationResult, CalculationSection, DocumentMetadata, FundDocumentProjection, projectFundDocument } from '../domain';
import { formatCurrency } from '../utils/formatters';
import FinancialMath from '../utils/financialMath';

/**
 * AG-127 / Wave 3: ViewModel unificato per la modulistica amministrativa.
 * Garantisce che i documenti leggano solo dati formattati e pronti dal CanonicalFundLedger,
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
    finalTotal: number | null;
    subtotaleVerificato: string;
    isDetermined: boolean;
    revisoriAttestationText: string;
    gcAttestationText: string;
    importoStabileLordo: string;
    importoStabileNetto: string;
    riduzioneConglobamento: string;
    importoVariabileTotale: string;
    incrementoDl25: string;
    decurtazioneL147: string;
    importoEq: string;
    firmaDigitale: string;
    hasRevisoriParere?: boolean;
    hasDeliberaGC?: boolean;
    hasArt60?: boolean;
    exportReadiness?: 'DOCUMENT_DRAFT' | 'DOCUMENT_FINAL_READY';
  };
  projection?: FundDocumentProjection;
  isDraft?: boolean;
  unresolvedItems?: Array<{
    id: string;
    description: string;
    amount: number | null;
    formattedAmount: string;
    status: string;
    reason?: string;
  }>;
}

export interface FundViewModel {
  label: string;
  totale: number | null;
  formattedTotale: string;
  verifiedSubtotal: number;
  formattedVerifiedSubtotal: string;
  isDetermined: boolean;
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
 * Utilizza la proiezione canonica (projectFundDocument) per garantire
 * la perfetta riconciliazione tra componenti, subtotali e totale generale.
 */
export const createDocumentViewModel = (
  result: CalculationResult,
  denominazioneEnte: string,
  user: { name: string; role: string },
  docMeta?: DocumentMetadata
): DocumentViewModel => {
  const fondi = result.fondi || ({} as any);
  const dipendente = fondi.dipendente || { label: 'Fondo Risorse Decentrate (Dipendenti)', summary: { totaleFondo: 0 } };
  const eq = fondi.eq || { label: 'Fondo EQ', summary: { totaleFondo: 0 } };
  const segretario = fondi.segretario || { label: 'Fondo Segretario', summary: { totaleFondo: 0 } };
  const dirigenza = fondi.dirigenza || { label: 'Fondo Dirigenza', summary: { totaleFondo: 0 } };
  const art23 = result.compliance?.art23c2 ?? { limite: 0, valoreSoggetto: 0, delta: 0, isCompliant: false };
  const art23View = presentArt23Verification(result);
  const year = result.metadata?.annoRiferimento || new Date().getFullYear();

  const projection = projectFundDocument(result, denominazioneEnte, docMeta);
  const effectiveEnteName = projection.ente.denominazione;

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

  let sezioniDipendente: FundViewModel['sezioni'];

  if (result.canonicalFund && result.canonicalFund.entries.length > 0) {
    const stabiliSoggItems = projection.stableEntries
      .filter(e => e.art23Treatment === 'SUBJECT')
      .map(e => ({
        desc: e.description,
        norma: e.normativeRef || '',
        amount: e.amount,
        formattedAmount: e.formattedAmount,
        isSubtractor: false
      }));
    const totalStabiliSogg = stabiliSoggItems.reduce((acc, curr) => FinancialMath.addExact(acc, curr.amount), 0);

    const stabiliNonSoggItems = projection.stableEntries
      .filter(e => e.art23Treatment !== 'SUBJECT')
      .map(e => ({
        desc: e.description,
        norma: e.normativeRef || '',
        amount: e.amount,
        formattedAmount: e.formattedAmount,
        isSubtractor: false
      }));
    const totalStabiliNonSogg = stabiliNonSoggItems.reduce((acc, curr) => FinancialMath.addExact(acc, curr.amount), 0);

    const variabiliSoggItems = projection.variableEntries
      .filter(e => e.art23Treatment === 'SUBJECT')
      .map(e => ({
        desc: e.description,
        norma: e.normativeRef || '',
        amount: e.amount,
        formattedAmount: e.formattedAmount,
        isSubtractor: false
      }));
    const totalVariabiliSogg = variabiliSoggItems.reduce((acc, curr) => FinancialMath.addExact(acc, curr.amount), 0);

    const variabiliNonSoggItems = projection.variableEntries
      .filter(e => e.art23Treatment !== 'SUBJECT')
      .map(e => ({
        desc: e.description,
        norma: e.normativeRef || '',
        amount: e.amount,
        formattedAmount: e.formattedAmount,
        isSubtractor: false
      }));
    const totalVariabiliNonSogg = variabiliNonSoggItems.reduce((acc, curr) => FinancialMath.addExact(acc, curr.amount), 0);

    const decurtazioniItems = projection.deductions.map(e => ({
      desc: e.description,
      norma: e.normativeRef || '',
      amount: e.amount,
      formattedAmount: e.formattedAmount,
      isSubtractor: true
    }));
    const totalDecurtazioni = decurtazioniItems.reduce((acc, curr) => FinancialMath.addExact(acc, curr.amount), 0);

    sezioniDipendente = {
      stabiliSoggette: {
        title: "Risorse fisse e stabili soggette a limite",
        total: totalStabiliSogg,
        formattedTotal: formatCurrency(totalStabiliSogg),
        items: stabiliSoggItems
      },
      stabiliNonSoggette: {
        title: "Risorse fisse e stabili non soggette a limite",
        total: totalStabiliNonSogg,
        formattedTotal: formatCurrency(totalStabiliNonSogg),
        items: stabiliNonSoggItems
      },
      variabiliSoggette: {
        title: "Risorse variabili soggette a limite",
        total: totalVariabiliSogg,
        formattedTotal: formatCurrency(totalVariabiliSogg),
        items: variabiliSoggItems
      },
      variabiliNonSoggette: {
        title: "Risorse variabili non soggette a limite",
        total: totalVariabiliNonSogg,
        formattedTotal: formatCurrency(totalVariabiliNonSogg),
        items: variabiliNonSoggItems
      },
      decurtazioni: {
        title: "Decurtazioni e riduzioni stabili del fondo",
        total: totalDecurtazioni,
        formattedTotal: formatCurrency(totalDecurtazioni),
        items: decurtazioniItems
      }
    };
  } else {
    // Fallback per mock/test sintetici privi di canonicalFund
    sezioniDipendente = {
      stabiliSoggette: mapSection(dipendente.constitution?.sections.stabili),
      stabiliNonSoggette: mapSection(dipendente.constitution?.sections.stabili_non_soggette),
      variabiliSoggette: mapSection(dipendente.constitution?.sections.variabili_soggette),
      variabiliNonSoggette: mapSection(dipendente.constitution?.sections.variabili_non_soggette),
      decurtazioni: mapSection(dipendente.constitution?.sections.decurtazioni)
    };
  }

  const grossStabile = FinancialMath.addExact(
    sezioniDipendente.stabiliSoggette.total,
    sezioniDipendente.stabiliNonSoggette.total
  );
  const netStabile = FinancialMath.subtractExact(grossStabile, sezioniDipendente.decurtazioni.total);
  const totalVariabile = FinancialMath.addExact(
    sezioniDipendente.variabiliSoggette.total,
    sezioniDipendente.variabiliNonSoggette.total
  );

  const art60Entry = projection.deductions.find(d => d.id === 'ART60_CONSOLIDATION');
  const art60ReductionAmount = (year >= 2026 && art60Entry) ? art60Entry.amount : 0;

  const dl25Entry = projection.stableEntries.find(e => e.id === 'DL25_CURRENT' || e.id === 'DL25_CURRENT_LEGACY_ALIAS');
  const dl25Amount = dl25Entry ? dl25Entry.amount : 0;

  const l147Entry = projection.deductions.find(d => d.id.includes('ATA_PO_Esternalizzazioni'));
  const l147Amount = l147Entry ? l147Entry.amount : 0;

  const finalTotal = result.canonicalFund
    ? projection.finalTotal
    : (dipendente.summary?.totaleFondo ?? null);

  const formattedTotale = finalTotal !== null
    ? formatCurrency(finalTotal)
    : 'NON ANCORA DETERMINABILE';

  const verifiedSubtotal = projection.verifiedSubtotal;
  const formattedVerifiedSubtotal = formatCurrency(verifiedSubtotal);

  return {
    ente: {
      denominazione: effectiveEnteName,
      tipo: result.inputs?.tipologiaEnte || 'Comune',
      anno: year
    },
    currentUser: user,
    fondi: {
      dipendente: {
        label: dipendente.label,
        totale: finalTotal,
        formattedTotale,
        verifiedSubtotal,
        formattedVerifiedSubtotal,
        isDetermined: projection.isDetermined,
        sezioni: sezioniDipendente
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
        active: !!result.inputs?.hasDirigenza
      }
    },
    compliance: {
      art23c2: {
        limite: art23.limite,
        formattedLimite: art23View.formattedLimit,
        valoreSoggetto: art23.valoreSoggetto,
        formattedValoreSoggetto: formatCurrency(art23.valoreSoggetto),
        delta: art23.delta,
        formattedDelta: art23View.formattedMargin,
        isCompliant: art23View.isCompliant,
        esitoLabel: art23View.label
      }
    },
    metadati: {
      dataGenerazione: new Date().toLocaleDateString('it-IT'),
      versioneMotore: '2.0.0-Sprint6-canonical'
    },
    determina: {
      numeroDetermina: docMeta?.numeroDetermina || '{{NUMERO_DETERMINA}}',
      dataDetermina: docMeta?.dataDetermina || '{{DATA_DETERMINA}}',
      annoRiferimento: String(year),
      numDeliberaGC: docMeta?.numDeliberaGc || '{{NUM_DELIBERA_GC}}',
      dataDeliberaGC: docMeta?.dataDeliberaGc || '{{DATA_DELIBERA_GC}}',
      numVerbaleRevisori: docMeta?.numVerbaleRevisori || '{{NUM_VERBALE_REVISORI}}',
      dataVerbaleRevisori: docMeta?.dataVerbaleRevisori || '{{DATA_VERBALE_REVISORI}}',
      totaleFondo: formattedTotale,
      finalTotal,
      subtotaleVerificato: formattedVerifiedSubtotal,
      isDetermined: projection.isDetermined,
      revisoriAttestationText: projection.revisoriAttestationText,
      gcAttestationText: projection.gcAttestationText,
      importoStabileLordo: formatCurrency(grossStabile),
      importoStabileNetto: formatCurrency(netStabile),
      riduzioneConglobamento: formatCurrency(art60ReductionAmount),
      importoVariabileTotale: formatCurrency(totalVariabile),
      incrementoDl25: formatCurrency(dl25Amount),
      decurtazioneL147: formatCurrency(l147Amount),
      importoEq: formatCurrency(eq.summary.totaleFondo),
      firmaDigitale: docMeta?.firmaDigitale || '{{FIRMA_DIGITALE}}',
      hasRevisoriParere: projection.hasRevisoriParere,
      hasDeliberaGC: projection.hasDeliberaGC,
      hasArt60: year >= 2026 && art60ReductionAmount > 0,
      exportReadiness: projection.exportReadiness
    },
    projection,
    isDraft: projection.isDraft,
    unresolvedItems: projection.unresolvedItems
  };
};
