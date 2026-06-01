import { FundData } from '../../../domain';

export interface FundDataPresencePreview {
  hasFondoAccessorioDipendenteData: boolean;
  hasHistoricalData: boolean;
  hasAnnualData: boolean;
  hasAnyUsefulFundData: boolean;
  summary: string[];
}

function isPresent(val: any): boolean {
  return val !== undefined && val !== null && !Number.isNaN(val) && val !== '';
}

export function detectFundDataPresence(fundData?: FundData): FundDataPresencePreview {
  const result: FundDataPresencePreview = {
    hasFondoAccessorioDipendenteData: false,
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
  if (fundData.fondoAccessorioDipendenteData) {
    const keys = Object.keys(fundData.fondoAccessorioDipendenteData) as Array<keyof typeof fundData.fondoAccessorioDipendenteData>;
    const presentKeys = keys.filter(k => isPresent(fundData.fondoAccessorioDipendenteData[k]));
    if (presentKeys.length > 0) {
      result.hasFondoAccessorioDipendenteData = true;
      result.summary.push(`${presentKeys.length} risorse/voci configurate nel fondo.`);
    }
  }

  // 2. Verifica HistoricalData
  if (fundData.historicalData) {
    const keys = Object.keys(fundData.historicalData) as Array<keyof typeof fundData.historicalData>;
    const presentKeys = keys.filter(k => isPresent(fundData.historicalData[k]));
    if (presentKeys.length > 0) {
      result.hasHistoricalData = true;
      result.summary.push("Dati storici dell'Ente configurati.");
    }
  }

  // 3. Verifica AnnualData
  if (fundData.annualData) {
    const hasEmployeeCounts = fundData.annualData.personaleServizioAttuale?.some(emp => isPresent(emp.count));
    const hasProventi = fundData.annualData.proventiSpecifici?.length > 0;
    if (hasEmployeeCounts || hasProventi) {
      result.hasAnnualData = true;
      result.summary.push("Personale in servizio o proventi specifici inseriti.");
    }
  }

  result.hasAnyUsefulFundData = 
    result.hasFondoAccessorioDipendenteData || 
    result.hasHistoricalData || 
    result.hasAnnualData;
  
  if (!result.hasAnyUsefulFundData) {
    result.summary.push("Nessun dato inserito nella Costituzione Fondo per l'anno in corso.");
  }

  return result;
}
