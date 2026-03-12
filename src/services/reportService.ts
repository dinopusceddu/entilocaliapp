// services/reportService.ts
import jsPDF from 'jspdf';
import { buildDetermina } from './determinaTemplate.ts';
import type {
    CalculatedFund,
    FundData,
    User,
    FondoAccessorioDipendenteData,
    ComplianceCheck,
    SimulatoreIncrementoRisultati,
    NormativeData,
    DistribuzioneRisorseData
} from '../types.ts';

import { generateFondoDipendenteXLS } from './xlsReportService.ts';



// --- Main PDF Generation Functions ---

import {
    buildCover, buildDatiEnte, buildRisultati, buildFondoDipendente, addFooters
} from './pdfReportService.ts';
import {
    buildAltriCondi, buildSimulatore, buildConformita, buildNote
} from './pdfReportService2.ts';

export const generateFullSummaryPDF = (
    calculatedFund: CalculatedFund,
    fundData: FundData,
    currentUser: User,
    complianceChecks: ComplianceCheck[]
): void => {
    const doc = new jsPDF();
    const { annualData } = fundData;
    const anno = annualData.annoRiferimento;
    const ente = annualData.denominazioneEnte || 'Ente';

    // Pagina 1 — Copertina
    buildCover(doc, calculatedFund, fundData, currentUser, complianceChecks);

    // Pagina 2 — Dati Ente e Input
    buildDatiEnte(doc, calculatedFund, fundData);

    // Pagina 3 — Risultati Fondo
    buildRisultati(doc, calculatedFund, fundData);

    // Pagina 4 — Dettaglio Fondo Dipendente
    buildFondoDipendente(doc, fundData);

    // Pagina 5 — Dettaglio EQ / Segretario / Dirigenza
    buildAltriCondi(doc, calculatedFund, fundData);

    // Pagina 6 — Simulatore (se dati presenti)
    buildSimulatore(doc, fundData);

    // Pagina 7 — Controlli di Conformità
    buildConformita(doc, complianceChecks, anno);

    // Pagina 8 — Note e Firma
    buildNote(doc, fundData, currentUser.name);

    // Footer su tutte le pagine
    addFooters(doc, ente, anno);

    doc.save(`Riepilogo_Generale_${ente}_${anno}.pdf`);
};




export const generateDeterminazioneTXT = (
    calculatedFund: CalculatedFund,
    fundData: FundData,
    currentUser: User
): void => {
    const anno = fundData.annualData.annoRiferimento;
    const content = buildDetermina(calculatedFund, fundData, currentUser);

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Determinazione_Fondo_${anno}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const generateFADXLS = async (
    fadData: FondoAccessorioDipendenteData,
    annoRiferimento: number,
    simulatoreRisultati: SimulatoreIncrementoRisultati | undefined,
    isEnteInCondizioniSpeciali: boolean,
    incrementoEQconRiduzioneDipendenti: number | undefined,
    normativeData: NormativeData,
    calculatedFund: CalculatedFund,
    denominazioneEnte: string,
    distribuzioneData: DistribuzioneRisorseData
): Promise<void> => {
    await generateFondoDipendenteXLS(
        fadData,
        annoRiferimento,
        simulatoreRisultati,
        isEnteInCondizioniSpeciali,
        incrementoEQconRiduzioneDipendenti,
        normativeData,
        calculatedFund,
        denominazioneEnte,
        distribuzioneData
    );
};
