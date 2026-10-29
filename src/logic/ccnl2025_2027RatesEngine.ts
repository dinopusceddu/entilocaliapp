import Big from 'big.js';
import { TABELLA_B_STIPENDI_TABELLARI, TABELLA_C_INDENNITA_COMPARTO, CONTRACTUAL_ALLOWANCE_CONSTANTS as C } from '../data/ccnl2025_2027Tables';
import type { PayslipLine, RateEpoch, RatesResult, SimulatorProfile } from '../types/ccnl2025_2027SimulatorTypes';
import { SimulatorProfileSchema } from '../schemas/ccnl2025_2027SimulatorSchemas';
import { calculateDifferentialsBreakdown } from './ccnl2025_2027DifferentialEngine';
import { money, ratioFor, sumMoney } from './ccnl2025_2027Math';

export function calculateRates(profile: SimulatorProfile, epoch: RateEpoch): RatesResult {
  const p = SimulatorProfileSchema.parse(profile);
  const ratio = ratioFor(p);
  const differentials = calculateDifferentialsBreakdown({ ...p, partTimePercentage: ratio.times(100).toNumber() });
  const b = TABELLA_B_STIPENDI_TABELLARI[p.area];
  const c = TABELLA_C_INDENNITA_COMPARTO[p.area];
  const tabular = epoch === 'PRE_RINNOVO_2025' ? b.mensile_base_2025_pre_rinnovo
    : epoch === 'PRE_RINNOVO_2026' ? b.mensile_base_2026_pre_rinnovo
      : epoch === 'ARRETRATI_2025' ? b.mensile_dal_2025_01_01
        : epoch === 'NOV_DEC_2026_REGIME' ? b.mensile_dal_2026_01_01 : b.mensile_dal_2027_01_01;
  const compartment = epoch === 'DAL_LUG_2027_REGIME' ? c.mensile_dal_2027_07_01
    : epoch === 'PRE_RINNOVO_2025' || epoch === 'ARRETRATI_2025' ? c.mensile_2025 : c.mensile_dal_2026_01_01;
  const items = p.usefulBaseItems;
  const position = p.isTitolareEQ ? money(new Big(p.retribuzionePosizioneEQAnnuoLordo).div(13)) : 0;
  const baseB = new Big(tabular).plus(differentials.historicalMonthlyAmount13m).plus(differentials.totalNewDifferentialsMonthly13m)
    .plus(items.apnrArt29).plus(items.adPersonamArt13);
  const baseB13 = baseB.times(13).div(12);
  const baseC = baseB.plus(items.ria).plus(position).plus(items.otherContinuousC);
  const baseD = baseC.times(13).div(12).plus(compartment).plus(items.vigilanceEducatorsD).plus(items.otherFixedD).plus(items.otherVariableD);
  const divisor = p.workTimeRegime === 'FULL_TIME_35H_TURNO' ? C.DIVISORE_ORARIO_35H : C.DIVISORE_ORARIO_36H;
  const values: [string, string, number][] = [
    ['tabular', 'Stipendio tabellare', tabular], ['historical', 'Differenziale storico ex ' + p.historicalLevel, differentials.historicalMonthlyAmount13m],
    ['newDifferentials', 'Nuovi differenziali e sezione speciale', differentials.totalNewDifferentialsMonthly13m],
    ['apnr', 'APNR · Art. 29', items.apnrArt29], ['adPersonam', 'Assegno ad personam · Art. 13', items.adPersonamArt13],
    ['ria', 'RIA', items.ria], ['positionEQ', 'Retribuzione di posizione EQ', position], ['continuousC', 'Altri assegni continuativi · lett. c', items.otherContinuousC],
    ['compartment', 'Indennità di comparto', compartment], ['vigilanceEducators', 'Vigilanza PL / educatori', items.vigilanceEducatorsD],
    ['otherFixedD', 'Altre indennità fisse · lett. d', items.otherFixedD], ['otherVariableD', 'Altre voci variabili utili · lett. d', items.otherVariableD],
  ];
  const fixedLines: PayslipLine[] = values.map(([key, label, value]) => ({ key, label, quantity: 1, unitRate: money(new Big(value).times(ratio)), multiplier: 1, amount: money(new Big(value).times(ratio)) }));
  return {
    epoch, partTimeRatio: ratio.toNumber(), hourlyDivisor: divisor, effectiveHourlyDivisor: new Big(divisor).times(ratio).toNumber(),
    dailyDivisor: p.weeklyWorkingDays === '5_DAYS' ? C.DIVISORE_GIORNALIERO_5GG : C.DIVISORE_GIORNALIERO_6GG,
    differentials, fixedLines,
    RBM: money(baseB.times(ratio)), RBM_con13: money(baseB13.times(ratio)), RIM: money(baseC.times(ratio)), RGF: money(baseD.times(ratio)),
    // Calculate on full-time values: avoids cent rounding drift in PT hourly rates.
    rates: { RB_Art26: baseB.div(divisor).toNumber(), RBO: baseB13.div(divisor).toNumber(), RT: baseC.div(divisor).toNumber(), ROG: baseD.div(divisor).toNumber() },
    fixedMonthlyTotal: sumMoney(fixedLines.map(l => l.amount)),
  };
}
