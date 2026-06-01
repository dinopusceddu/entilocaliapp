import { Wizard2026DraftState } from './types';
import { selectWizard2026BlockingErrors, selectWizard2026Warnings } from './selectors';

export interface Wizard2026LegacyMappingPreviewItem {
  sourceStep: string;
  sourceField: string;
  targetLegacyField: string;
  value: number | string | boolean | null;
  status: 'READY' | 'MISSING' | 'NOT_APPLICABLE' | 'REQUIRES_REVIEW';
  note?: string;
}

export interface Wizard2026LegacyMappingPreview {
  items: Wizard2026LegacyMappingPreviewItem[];
  hasBlockingIssues: boolean;
  warningCount: number;
}

export function buildWizard2026LegacyMappingPreview(state: Wizard2026DraftState): Wizard2026LegacyMappingPreview {
  const items: Wizard2026LegacyMappingPreviewItem[] = [];

  const dl25Res = state.dl25.result;
  if (dl25Res?.applicabilityStatus === 'DIRECTLY_APPLICABLE') {
    items.push({
      sourceStep: 'Step 3 — D.L. 25/2025',
      sourceField: 'dl25.result.limiteMassimoDL25',
      targetLegacyField: 'istruttorio.limiteMassimoIncrementoDL25_2025',
      value: dl25Res.limiteMassimoDL25 ?? null,
      status: dl25Res.limiteMassimoDL25 !== undefined ? 'READY' : 'MISSING',
      note: 'Limite massimo teorico calcolato ai sensi del D.L. 25/2025',
    });
    items.push({
      sourceStep: 'Step 3 — D.L. 25/2025',
      sourceField: 'N/A',
      targetLegacyField: 'fondoAccessorioDipendenteData.st_incrementoDL25_2025',
      value: null,
      status: 'NOT_APPLICABLE',
      note: 'L\'incremento effettivo non viene alimentato dal wizard. Sarà inserito nella Costituzione Fondo.',
    });
  } else if (dl25Res?.applicabilityStatus === 'TRANSFER_ONLY') {
    items.push({
      sourceStep: 'Step 3 — D.L. 25/2025',
      sourceField: 'dl25.result.limiteMassimoDL25',
      targetLegacyField: 'istruttorio.limiteMassimoIncrementoDL25_2025',
      value: dl25Res.limiteMassimoDL25 ?? null,
      status: dl25Res.limiteMassimoDL25 !== undefined ? 'READY' : 'MISSING',
      note: 'Limite massimo trasferibile (somma quote validate degli enti aderenti)',
    });
    items.push({
      sourceStep: 'Step 3 — D.L. 25/2025',
      sourceField: 'dl25.result.quotaTrasferitaAderenti',
      targetLegacyField: 'nuovo.quotaTrasferitaAderentiDL25_2025',
      value: dl25Res.quotaTrasferitaAderenti ?? null,
      status: dl25Res.quotaTrasferitaAderenti !== undefined ? 'READY' : 'MISSING',
      note: 'Quota trasferita dagli enti aderenti per l\'unione',
    });
    items.push({
      sourceStep: 'Step 3 — D.L. 25/2025',
      sourceField: 'N/A',
      targetLegacyField: 'fondoAccessorioDipendenteData.st_incrementoDL25_2025',
      value: null,
      status: 'NOT_APPLICABLE',
      note: 'L\'incremento effettivo non viene alimentato dal wizard. Sarà inserito nella Costituzione Fondo.',
    });
  }

  const ccnlRes = state.ccnl2026.result;
  // 1. Incremento stabile 0,14% — parte stabile
  items.push({
    sourceStep: 'Step 4 — CCNL 2026',
    sourceField: 'ccnl2026.result.incrementoStabile014',
    targetLegacyField: 'nuovo.incremento014_CCNL2026_parteStabile',
    value: ccnlRes?.incrementoStabile014 ?? null,
    status: ccnlRes?.isCalcolabile ? 'READY' : 'MISSING',
    note: 'Incremento stabile 0,14% CCNL 2026 — parte stabile. Andrà in futuro alla parte stabile del Fondo risorse decentrate.',
  });

  // 2. Arretrati 0,14% — parte variabile
  items.push({
    sourceStep: 'Step 4 — CCNL 2026',
    sourceField: 'ccnl2026.result.arretrati014',
    targetLegacyField: 'nuovo.arretrati014_CCNL2026_parteVariabile',
    value: ccnlRes?.arretrati014 ?? null,
    status: ccnlRes?.isCalcolabile ? 'READY' : 'MISSING',
    note: 'Arretrati 0,14% CCNL 2026 — parte variabile una tantum. Andrà in futuro alla parte variabile del Fondo risorse decentrate.',
  });

  // 3. Limite massimo 0,22%
  items.push({
    sourceStep: 'Step 4 — CCNL 2026',
    sourceField: 'ccnl2026.result.limiteMassimo022',
    targetLegacyField: 'nuovo.limiteMassimo022_CCNL2026',
    value: ccnlRes?.limiteMassimo022 ?? null,
    status: ccnlRes?.isCalcolabile ? 'READY' : 'MISSING',
    note: 'Limite massimo quota 0,22% CCNL 2026. Dato istruttorio calcolato dal wizard — non trasferito automaticamente.',
  });

  // 4. Incremento 0,22% scelto per l'anno
  items.push({
    sourceStep: 'Step 4 — CCNL 2026',
    sourceField: 'ccnl2026.result.incremento022Anno',
    targetLegacyField: 'nuovo.incremento022Anno_CCNL2026',
    value: ccnlRes?.incremento022Anno ?? null,
    status: ccnlRes?.incremento022Anno !== undefined ? 'READY' : 'MISSING',
    note: 'Incremento 0,22% inserito per l\'anno. Non trasferito automaticamente: la scelta definitiva avviene nella Costituzione Fondo.',
  });

  // 5. Quota 0,22% → Fondo
  items.push({
    sourceStep: 'Step 4 — CCNL 2026',
    sourceField: 'ccnl2026.result.incremento022Fondo',
    targetLegacyField: 'nuovo.incremento022Fondo_CCNL2026',
    value: ccnlRes?.incremento022Fondo ?? null,
    status: ccnlRes?.incremento022Fondo !== undefined ? 'READY' : 'MISSING',
    note: 'Quota 0,22% destinata al Fondo risorse decentrate. Andrà in futuro alla Costituzione Fondo.',
  });

  // 6. Quota 0,22% → EQ
  items.push({
    sourceStep: 'Step 4 — CCNL 2026',
    sourceField: 'ccnl2026.result.incremento022EQ',
    targetLegacyField: 'nuovo.incremento022EQ_CCNL2026',
    value: ccnlRes?.incremento022EQ ?? null,
    status: ccnlRes?.incremento022EQ !== undefined ? 'READY' : 'MISSING',
    note: 'Quota 0,22% destinata alle risorse Elevate Qualificazioni. Andrà in futuro alle risorse EQ.',
  });

  const art60Res = state.conglobamentoArt60.result;
  const isPost2026 = (state.ente.annoRiferimento ?? 2026) > 2026;
  const isManual = state.conglobamentoArt60.mode === 'manual';

  let art60Value: number | string | null = art60Res?.riduzioneTotale ?? null;
  let art60Status: 'READY' | 'MISSING' | 'NOT_APPLICABLE' | 'REQUIRES_REVIEW' = art60Res?.riduzioneTotale !== undefined ? 'READY' : 'MISSING';
  let art60Note = 'Decurtazione stabile per conglobamento indennità comparto';
  let art60SourceStep = 'Step 5 — Conglobamento Art. 60';

  if (isPost2026) {
    art60SourceStep = 'Step 5 — Conglobamento Art. 60';
    if (art60Res?.riduzioneTotale === undefined) {
      art60Value = 'Dato consolidato 2026 mancante';
      art60Status = 'MISSING';
      art60Note = 'Dato consolidato 2026 mancante - Valore non ricalcolato sull\'anno corrente';
    } else {
      art60Note = isManual
        ? 'Valore inserito manualmente (correzione del dato consolidato 2026)'
        : 'Riduzione Art. 60 consolidata dal 2026 (Valore non ricalcolato sull\'anno corrente)';
    }
  } else {
    art60Note = isManual
      ? 'Decurtazione stabile inserita manualmente'
      : 'Decurtazione stabile calcolata per il 2026 (Valore consolidato dal 2026)';
  }

  items.push({
    sourceStep: art60SourceStep,
    sourceField: 'conglobamentoArt60.result.riduzioneTotale',
    targetLegacyField: 'fondoAccessorioDipendenteData.st_art60c2_CCNL2026_decurtazioneIndennitaComparto',
    value: art60Value,
    status: art60Status,
    note: art60Note,
  });

  const strRes = state.straordinario.result;
  items.push({
    sourceStep: 'Step 6 — Straordinario',
    sourceField: 'straordinario.result.economieDaTrasferireVariabileUnaTantum',
    targetLegacyField: 'fondoAccessorioDipendenteData.vn_art15c1m_art67c3e_risparmiStraordinario',
    value: strRes?.economieDaTrasferireVariabileUnaTantum ?? null,
    status: strRes && strRes.economieDaTrasferireVariabileUnaTantum > 0 ? 'READY' : 'NOT_APPLICABLE',
    note: 'Economie straordinario trasferite a risorse variabili una tantum',
  });

  items.push({
    sourceStep: 'Step 6 — Straordinario',
    sourceField: 'straordinario.result.incrementoParteStabileDaRiduzioneStraordinario',
    targetLegacyField: 'fondoAccessorioDipendenteData.st_art79c1_art14c3_art67c2g_riduzioneStraordinario',
    value: strRes?.incrementoParteStabileDaRiduzioneStraordinario ?? null,
    status: strRes?.incrementoParteStabileDaRiduzioneStraordinario !== undefined ? 'READY' : 'MISSING',
    note: 'Riduzione stabile straordinario (Art. 67 CCNL 21.5.2018) destinata ad incrementare stabilmente il Fondo.',
  });

  items.push({
    sourceStep: 'Step 6 — Straordinario',
    sourceField: 'straordinario.result.incrementoAmmesso',
    targetLegacyField: 'ambiguo.fondoStraordinarioIncremento',
    value: strRes?.incrementoAmmesso ?? null,
    status: 'REQUIRES_REVIEW',
    note: 'Incremento fondo straordinario: richiede mappatura controllata su campo canonico',
  });

  items.push({
    sourceStep: 'Step 6 — Straordinario',
    sourceField: 'straordinario.result.straordinarioOrdinarioSoggettoArt23',
    targetLegacyField: 'nuovo.straordinarioOrdinarioSoggettoArt23',
    value: strRes?.straordinarioOrdinarioSoggettoArt23 ?? null,
    status: strRes?.straordinarioOrdinarioSoggettoArt23 !== undefined ? 'READY' : 'MISSING',
    note: 'Fondo lavoro straordinario ordinario soggetto al limite art. 23 c. 2',
  });

  items.push({
    sourceStep: 'Step 6 — Straordinario',
    sourceField: 'straordinario.result.incrementoStraordinarioOrdinarioSoggettoArt23',
    targetLegacyField: 'nuovo.incrementoStraordinarioOrdinarioSoggettoArt23',
    value: strRes?.incrementoStraordinarioOrdinarioSoggettoArt23 ?? null,
    status: strRes?.incrementoStraordinarioOrdinarioSoggettoArt23 !== undefined ? 'READY' : 'MISSING',
    note: 'Incremento ordinario dello straordinario previsto dal CCNL 23.02.2026',
  });

  items.push({
    sourceStep: 'Step 6 — Straordinario',
    sourceField: 'straordinario.result.riduzioneFondoDecentratoPerStraordinario',
    targetLegacyField: 'nuovo.riduzioneFondoDecentratoPerStraordinario',
    value: strRes?.riduzioneFondoDecentratoPerStraordinario ?? null,
    status: strRes?.riduzioneFondoDecentratoPerStraordinario !== undefined ? 'READY' : 'MISSING',
    note: 'Quota finanziata mediante riduzione del Fondo risorse decentrate',
  });

  items.push({
    sourceStep: 'Step 6 — Straordinario',
    sourceField: 'straordinario.result.economieStraordinarioAnnoPrecedenteDaRiversare',
    targetLegacyField: 'nuovo.economieStraordinarioAnnoPrecedenteDaRiversare',
    value: strRes?.economieStraordinarioAnnoPrecedenteDaRiversare ?? null,
    status: strRes?.economieStraordinarioAnnoPrecedenteDaRiversare !== undefined ? 'READY' : 'MISSING',
    note: 'Economie dello straordinario ordinario dell\'anno precedente da riversare nel Fondo',
  });

  items.push({
    sourceStep: 'Step 6 — Straordinario',
    sourceField: 'straordinario.result.totaleStraordinarioEsclusoArt23',
    targetLegacyField: 'nuovo.totaleStraordinarioEsclusoArt23',
    value: strRes?.totaleStraordinarioEsclusoArt23 ?? null,
    status: strRes?.totaleStraordinarioEsclusoArt23 !== undefined ? 'READY' : 'MISSING',
    note: 'Totale risorse per straordinario escluse o in deroga al limite art. 23',
  });

  items.push({
    sourceStep: 'Step 6 — Straordinario',
    sourceField: 'straordinario.result.straordinarioEsclusoArt23Elezioni',
    targetLegacyField: 'nuovo.straordinarioEsclusoArt23Elezioni',
    value: strRes?.straordinarioEsclusoArt23Elezioni ?? null,
    status: strRes?.straordinarioEsclusoArt23Elezioni !== undefined ? 'READY' : 'MISSING',
    note: 'Straordinario escluso art. 23 per consultazioni elettorali e referendum',
  });

  items.push({
    sourceStep: 'Step 6 — Straordinario',
    sourceField: 'straordinario.result.straordinarioEsclusoArt23Calamita',
    targetLegacyField: 'nuovo.straordinarioEsclusoArt23Calamita',
    value: strRes?.straordinarioEsclusoArt23Calamita ?? null,
    status: strRes?.straordinarioEsclusoArt23Calamita !== undefined ? 'READY' : 'MISSING',
    note: 'Straordinario escluso art. 23 per calamità naturali ed eventi straordinari',
  });

  items.push({
    sourceStep: 'Step 6 — Straordinario',
    sourceField: 'straordinario.result.straordinarioEsclusoArt23Istat',
    targetLegacyField: 'nuovo.straordinarioEsclusoArt23Istat',
    value: strRes?.straordinarioEsclusoArt23Istat ?? null,
    status: strRes?.straordinarioEsclusoArt23Istat !== undefined ? 'READY' : 'MISSING',
    note: 'Straordinario escluso art. 23 per censimenti ed attività ISTAT',
  });

  items.push({
    sourceStep: 'Step 6 — Straordinario',
    sourceField: 'straordinario.result.straordinarioEsclusoArt23PoliziaLocaleDeroga',
    targetLegacyField: 'nuovo.straordinarioEsclusoArt23PoliziaLocaleDeroga',
    value: strRes?.straordinarioEsclusoArt23PoliziaLocaleDeroga ?? null,
    status: strRes?.straordinarioEsclusoArt23PoliziaLocaleDeroga !== undefined ? 'READY' : 'MISSING',
    note: 'Straordinario escluso art. 23 per Polizia Locale in deroga',
  });

  const pnrrRes = state.pnrr.result;
  const isPnrrApplicabile = pnrrRes?.isApplicabile ?? false;

  if (isPnrrApplicabile) {
    items.push({
      sourceStep: 'Step 7 — PNRR',
      sourceField: 'pnrr.result.limiteMassimoPnrrFondoDipendenti',
      targetLegacyField: 'istruttorio.limiteMassimoPnrrFondoDipendenti',
      value: pnrrRes?.limiteMassimoPnrrFondoDipendenti ?? null,
      status: pnrrRes?.limiteMassimoPnrrFondoDipendenti !== undefined ? 'READY' : 'MISSING',
      note: 'Limite massimo teorico PNRR per il Fondo dipendenti (5% componente stabile 2016). Risorsa esclusa dal limite art. 23, comma 2, D.Lgs. 75/2017.',
    });

    if (state.ente.hasDirigenza) {
      items.push({
        sourceStep: 'Step 7 — PNRR',
        sourceField: 'pnrr.result.limiteMassimoPnrrFondoDirigenza',
        targetLegacyField: 'istruttorio.limiteMassimoPnrrFondoDirigenza',
        value: pnrrRes?.limiteMassimoPnrrFondoDirigenza ?? null,
        status: pnrrRes?.limiteMassimoPnrrFondoDirigenza !== undefined ? 'READY' : 'MISSING',
        note: 'Limite massimo teorico PNRR per il Fondo dirigenza (5% componente stabile 2016). Risorsa esclusa dal limite art. 23, comma 2, D.Lgs. 75/2017.',
      });
    }

    items.push({
      sourceStep: 'Step 7 — PNRR',
      sourceField: 'pnrr.result.totaleLimiteMassimoPnrr',
      targetLegacyField: 'istruttorio.totaleLimiteMassimoPnrr',
      value: pnrrRes?.totaleLimiteMassimoPnrr ?? null,
      status: pnrrRes?.totaleLimiteMassimoPnrr !== undefined ? 'READY' : 'MISSING',
      note: 'Totale istruttorio limite massimo PNRR (somma dipendenti e dirigenza). Risorsa esclusa dal limite art. 23, comma 2, D.Lgs. 75/2017.',
    });

    items.push({
      sourceStep: 'Step 7 — PNRR',
      sourceField: 'N/A',
      targetLegacyField: 'fondoAccessorioDipendenteData.vn_dl13_art8c3_incrementoPNRR_max5stabile2016',
      value: null,
      status: 'NOT_APPLICABLE',
      note: "L'incremento effettivo non viene alimentato dal wizard. Sarà inserito nella Costituzione Fondo.",
    });

    if (state.ente.hasDirigenza) {
      items.push({
        sourceStep: 'Step 7 — PNRR',
        sourceField: 'N/A',
        targetLegacyField: 'fondoDirigenzaData.va_dl13_2023_art8c3_incrementoPNRR',
        value: null,
        status: 'NOT_APPLICABLE',
        note: "L'incremento effettivo non viene alimentato dal wizard. Sarà inserito nella Costituzione Fondo.",
      });
    }
  } else {
    items.push({
      sourceStep: 'Step 7 — PNRR',
      sourceField: 'N/A',
      targetLegacyField: 'istruttorio.limiteMassimoPnrrFondoDipendenti',
      value: null,
      status: 'NOT_APPLICABLE',
      note: 'Fondo dipendenti PNRR non applicabile (l\'ente non è soggetto attuatore PNRR).',
    });
    if (state.ente.hasDirigenza) {
      items.push({
        sourceStep: 'Step 7 — PNRR',
        sourceField: 'N/A',
        targetLegacyField: 'istruttorio.limiteMassimoPnrrFondoDirigenza',
        value: null,
        status: 'NOT_APPLICABLE',
        note: 'Fondo dirigenza PNRR non applicabile (l\'ente non è soggetto attuatore PNRR).',
      });
    }
  }

  const art23Res = state.art23.result;
  if (art23Res) {
    items.push({
      sourceStep: 'Step 2 — Limite art. 23',
      sourceField: 'art23.result.limite2016Base',
      targetLegacyField: 'simulato.limite2016Base',
      value: art23Res.limite2016Base,
      status: 'READY',
      note: `Base 2016 (${art23Res.fonteLimite2016})`,
    });
    items.push({
      sourceStep: 'Step 2 — Limite art. 23',
      sourceField: 'art23.result.totaleVoci2016Ricostruite',
      targetLegacyField: 'simulato.totaleVoci2016Ricostruite',
      value: art23Res.totaleVoci2016Ricostruite,
      status: 'READY',
      note: 'Totale voci 2016 ricostruite',
    });
    items.push({
      sourceStep: 'Step 2 — Limite art. 23',
      sourceField: 'art23.result.valoreMedioProCapite2018',
      targetLegacyField: 'simulato.valoreMedioProCapite2018',
      value: art23Res.valoreMedioProCapite2018,
      status: 'READY',
      note: 'Valore medio pro capite 2018',
    });
    items.push({
      sourceStep: 'Step 2 — Limite art. 23',
      sourceField: 'art23.result.incrementoProCapiteLimite',
      targetLegacyField: 'simulato.incrementoProCapiteLimite',
      value: art23Res.incrementoProCapiteLimite,
      status: 'READY',
      note: 'Incremento pro capite per invarianza',
    });
    items.push({
      sourceStep: 'Step 2 — Limite art. 23',
      sourceField: 'art23.result.limiteArt23Attualizzato',
      targetLegacyField: 'simulato.limiteArt23Attualizzato',
      value: art23Res.limiteArt23Attualizzato,
      status: 'READY',
      note: 'Limite globale Art. 23 attualizzato finale',
    });
  }

  const blockingErrors = selectWizard2026BlockingErrors(state);
  const warnings = selectWizard2026Warnings(state);

  return {
    items,
    hasBlockingIssues: blockingErrors.length > 0,
    warningCount: warnings.length,
  };
}
