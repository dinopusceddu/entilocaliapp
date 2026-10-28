import { FundData } from '../../../domain';

export interface FundDataPresencePreview {
  hasFondoAccessorioDipendenteData: boolean;
  hasFondoElevateQualificazioniData: boolean;
  hasFondoSegretarioComunaleData: boolean;
  hasFondoDirigenzaData: boolean;
  hasHistoricalData: boolean;
  hasAnnualData: boolean;
  hasAnyUsefulFundData: boolean;
  summary: string[];
}

function isMeaningfulNumericOrValue(val: any): boolean {
  if (val === undefined || val === null || val === '' || val === false) return false;
  if (typeof val === 'number') return !Number.isNaN(val) && val > 0;
  if (typeof val === 'string') {
    const num = parseFloat(val);
    return !Number.isNaN(num) && num > 0;
  }
  return false;
}

function hasMeaningfulObjectEntries(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return false;
  return Object.values(obj).some(v => {
    if (typeof v === 'object' && v !== null) {
      return hasMeaningfulObjectEntries(v);
    }
    return isMeaningfulNumericOrValue(v);
  });
}

/**
 * Rileva in modo deterministico e rigoroso la presenza di importi significativi
 * all'interno dei dati del Fondo (sub-fondi, storici, annuali, totali).
 */
export function hasMeaningfulFundAmounts(fundData?: any): boolean {
  if (!fundData || typeof fundData !== 'object') return false;

  // 1. Totale calcolato > 0
  if (typeof fundData.totals?.totaleFondo === 'number' && fundData.totals.totaleFondo > 0) {
    return true;
  }

  // 2. Sub-fondo Dipendenti (Personale)
  if (hasMeaningfulObjectEntries(fundData.fondoAccessorioDipendenteData)) {
    return true;
  }

  // 3. Sub-fondo Elevate Qualificazioni (EQ)
  if (hasMeaningfulObjectEntries(fundData.fondoElevateQualificazioniData)) {
    return true;
  }

  // 4. Sub-fondo Segretario Comunale
  if (hasMeaningfulObjectEntries(fundData.fondoSegretarioComunaleData)) {
    return true;
  }

  // 5. Sub-fondo Dirigenza
  if (hasMeaningfulObjectEntries(fundData.fondoDirigenzaData)) {
    return true;
  }

  // 6. Dati storici
  if (hasMeaningfulObjectEntries(fundData.historicalData)) {
    return true;
  }

  // 7. Dati annuali
  if (fundData.annualData) {
    if (Array.isArray(fundData.annualData.personaleServizioAttuale)) {
      const hasEmployees = fundData.annualData.personaleServizioAttuale.some((emp: any) => isMeaningfulNumericOrValue(emp?.count));
      if (hasEmployees) return true;
    }
    if (Array.isArray(fundData.annualData.proventiSpecifici) && fundData.annualData.proventiSpecifici.length > 0) {
      const hasProventi = fundData.annualData.proventiSpecifici.some((p: any) => isMeaningfulNumericOrValue(p?.importo) || isMeaningfulNumericOrValue(p?.amount));
      if (hasProventi) return true;
    }
    if (isMeaningfulNumericOrValue(fundData.annualData.spesaPersonaleAttuale) ||
        isMeaningfulNumericOrValue(fundData.annualData.mediaEntrateCorrenti) ||
        isMeaningfulNumericOrValue(fundData.annualData.spesaStipendiTabellariAnnoApplicazione)) {
      return true;
    }
  }

  // 8. Personale in servizio dettagliato o modalità manuale
  if (fundData.personaleServizio) {
    if (Array.isArray(fundData.personaleServizio.dettagli) && fundData.personaleServizio.dettagli.length > 0) {
      return true;
    }
    if (isMeaningfulNumericOrValue(fundData.personaleServizio.manualProgressioni) ||
        isMeaningfulNumericOrValue(fundData.personaleServizio.manualIndennita) ||
        isMeaningfulNumericOrValue(fundData.personaleServizio.manualDipendentiEquivalenti)) {
      return true;
    }
  }

  // 9. Distribuzione risorse
  if (hasMeaningfulObjectEntries(fundData.distribuzioneRisorseData)) {
    return true;
  }

  return false;
}

export function detectFundDataPresence(fundData?: FundData): FundDataPresencePreview {
  const result: FundDataPresencePreview = {
    hasFondoAccessorioDipendenteData: false,
    hasFondoElevateQualificazioniData: false,
    hasFondoSegretarioComunaleData: false,
    hasFondoDirigenzaData: false,
    hasHistoricalData: false,
    hasAnnualData: false,
    hasAnyUsefulFundData: false,
    summary: [],
  };

  if (!fundData) {
    result.summary.push("Nessun dato del fondo rilevato.");
    return result;
  }

  // 1. Verifica FondoAccessorioDipendenteData
  if (hasMeaningfulObjectEntries(fundData.fondoAccessorioDipendenteData)) {
    result.hasFondoAccessorioDipendenteData = true;
    result.summary.push("Risorse Fondo Personale configurate.");
  }

  // 2. Verifica FondoElevateQualificazioniData
  if (hasMeaningfulObjectEntries(fundData.fondoElevateQualificazioniData)) {
    result.hasFondoElevateQualificazioniData = true;
    result.summary.push("Risorse Fondo EQ configurate.");
  }

  // 3. Verifica FondoSegretarioComunaleData
  if (hasMeaningfulObjectEntries(fundData.fondoSegretarioComunaleData)) {
    result.hasFondoSegretarioComunaleData = true;
    result.summary.push("Risorse Segretario Comunale configurate.");
  }

  // 4. Verifica FondoDirigenzaData
  if (hasMeaningfulObjectEntries(fundData.fondoDirigenzaData)) {
    result.hasFondoDirigenzaData = true;
    result.summary.push("Risorse Dirigenza configurate.");
  }

  // 5. Verifica HistoricalData
  if (hasMeaningfulObjectEntries(fundData.historicalData)) {
    result.hasHistoricalData = true;
    result.summary.push("Dati storici dell'Ente configurati.");
  }

  // 6. Verifica AnnualData
  if (fundData.annualData) {
    const hasEmployeeCounts = fundData.annualData.personaleServizioAttuale?.some((emp: any) => isMeaningfulNumericOrValue(emp?.count));
    const hasProventi = fundData.annualData.proventiSpecifici?.length > 0;
    if (hasEmployeeCounts || hasProventi || isMeaningfulNumericOrValue(fundData.annualData.fondoLavoroStraordinario)) {
      result.hasAnnualData = true;
      result.summary.push("Personale in servizio o proventi specifici inseriti.");
    }
  }

  result.hasAnyUsefulFundData = hasMeaningfulFundAmounts(fundData);
  
  if (!result.hasAnyUsefulFundData) {
    result.summary.push("Nessun dato inserito nella Costituzione Fondo per l'anno in corso.");
  }

  return result;
}
