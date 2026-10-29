import { describe, expect, it } from 'vitest';
import Big from 'big.js';
import { HISTORICAL_LEVELS_MAP, TABELLA_A_INCREMENTI_MENSILI, TABELLA_C_INDENNITA_COMPARTO } from '../../data/ccnl2025_2027Tables';
import { calculateDifferentialsBreakdown } from '../ccnl2025_2027DifferentialEngine';
import { calculateRates } from '../ccnl2025_2027RatesEngine';
import { calculateArrears } from '../ccnl2025_2027ArrearsEngine';
import { calculateMonthlyPayslip, calculateVacationAccessoryDailyAllowance } from '../ccnl2025_2027PayslipEngine';
import { createDefaultSimulatorInput, createDefaultProfile, createPreset, emptyHours, HOUR_DEFINITIONS } from '../ccnl2025_2027Defaults';
import { ArrearsInputSchema, SimulatorInputSchema, SimulatorProfileSchema } from '../../schemas/ccnl2025_2027SimulatorSchemas';
import type { ContractualArea } from '../../data/ccnl2025_2027Tables';
import type { CareerTranche } from '../../types/ccnl2025_2027SimulatorTypes';

describe('CCNL 2025–2027 · tabelle e differenziali', () => {
  it('contiene tutti i 27 livelli, con annuali coerenti', () => {
    expect(Object.keys(HISTORICAL_LEVELS_MAP)).toHaveLength(27);
    Object.values(HISTORICAL_LEVELS_MAP).forEach(l => expect(new Big(l.monthlyDifferential13m).times(13).round(2).toNumber()).toBe(l.annualDifferential13m));
  });
  it('Istruttore C4 + 2 differenziali; arrotonda il totale annuo / 13 (§3.1)', () => {
    const p = createPreset(0).profile;
    const d = calculateDifferentialsBreakdown(p);
    expect(d.historicalMonthlyAmount13m).toBe(146.52);
    expect(d.totalNewDifferentialsMonthly13m).toBe(115.38);
    expect(d.combinedDifferentialsMonthlyEffective).toBe(261.90);
    for (const specialSection of ['EDUCATORI_INSEGNANTI_ART92', 'POLIZIA_LOCALE_COORDINAMENTO_ART96'] as const)
      expect(calculateDifferentialsBreakdown({ ...p, specialSection }).totalNewDifferentialsMonthly13m).toBe(169.23);
    expect(calculateDifferentialsBreakdown({ ...p, specialSection: 'ALBI_ORDINI_SANITARI_ART102_106' }).totalNewDifferentialsMonthly13m).toBe(138.46);
    expect(calculateDifferentialsBreakdown({ ...p, partTimePercentage: 50 }).combinedDifferentialsMonthlyEffective).toBe(130.95);
  });
  it('valida limiti, sezione non cumulabile, percentuale e posizione EQ', () => {
    const p = createDefaultProfile();
    expect(SimulatorProfileSchema.safeParse({ ...p, newDifferentialsCount: 6 }).success).toBe(false);
    expect(SimulatorProfileSchema.safeParse({ ...p, area: 'FUNZIONARI_EQ', historicalLevel: 'D1', newDifferentialsCount: 6 }).success).toBe(true);
    expect(SimulatorProfileSchema.safeParse({ ...p, historicalLevel: 'D1' }).success).toBe(false);
    expect(SimulatorProfileSchema.safeParse({ ...p, workTimeRegime: 'PART_TIME', partTimePercentage: 100 }).success).toBe(false);
    expect(SimulatorProfileSchema.safeParse({ ...p, workTimeRegime: 'PART_TIME', partTimePercentage: 99.99 }).success).toBe(true);
    expect(SimulatorProfileSchema.safeParse({ ...p, isTitolareEQ: true, entityWithoutFunzionari: true, retribuzionePosizioneEQAnnuoLordo: 9500 }).success).toBe(true);
    expect(SimulatorProfileSchema.safeParse({ ...p, isTitolareEQ: true, entityWithoutFunzionari: true, retribuzionePosizioneEQAnnuoLordo: 9500.01 }).success).toBe(false);
    expect(SimulatorProfileSchema.safeParse({ ...p, isTitolareEQ: true, retribuzionePosizioneEQAnnuoLordo: 5000 }).success).toBe(false);
    const eq = { ...p, area: 'FUNZIONARI_EQ', historicalLevel: 'D1', isTitolareEQ: true };
    for (const n of [5000, 22000]) expect(SimulatorProfileSchema.safeParse({ ...eq, retribuzionePosizioneEQAnnuoLordo: n }).success).toBe(true);
    for (const n of [4999, 22001]) expect(SimulatorProfileSchema.safeParse({ ...eq, retribuzionePosizioneEQAnnuoLordo: n }).success).toBe(false);
  });
});
describe('Quattro basi retributive', () => {
  it('include EQ e RIA solo nelle basi c/d e comparto solo in d', () => {
    const p = createDefaultProfile();
    const base = calculateRates(p, 'NOV_DEC_2026_REGIME');
    const rich = calculateRates({ ...p, isTitolareEQ: true, entityWithoutFunzionari: true, retribuzionePosizioneEQAnnuoLordo: 6500,
      usefulBaseItems: { ...p.usefulBaseItems, ria: 30, otherContinuousC: 40, vigilanceEducatorsD: 50, otherFixedD: 60, otherVariableD: 70 } }, 'NOV_DEC_2026_REGIME');
    expect(rich.RBM).toBe(base.RBM); expect(rich.rates.RBO).toBe(base.rates.RBO);
    expect(rich.RIM).toBe(new Big(base.RIM).plus(570).toNumber());
    expect(rich.RGF).toBe(new Big(base.RIM).plus(570).times(13).div(12).plus(32.06).plus(180).round(2).toNumber());
  });
  for (const area of Object.keys(TABELLA_A_INCREMENTI_MENSILI) as ContractualArea[]) {
    it(`${area}: gennaio adegua tutte le tariffe, luglio solo ROG`, () => {
      const p = { ...createDefaultProfile(), area, historicalLevel: Object.values(HISTORICAL_LEVELS_MAP).find(l => l.area === area)!.code };
      const nov = calculateRates(p, 'NOV_DEC_2026_REGIME'), jan = calculateRates(p, 'DAL_GEN_2027_REGIME'), jul = calculateRates(p, 'DAL_LUG_2027_REGIME');
      for (const key of ['RB_Art26', 'RBO', 'RT', 'ROG'] as const) expect(jan.rates[key]).toBeGreaterThan(nov.rates[key]);
      for (const key of ['RB_Art26', 'RBO', 'RT'] as const) expect(jul.rates[key]).toBe(jan.rates[key]);
      expect(jul.rates.ROG - jan.rates.ROG).toBeCloseTo(TABELLA_C_INDENNITA_COMPARTO[area].incremento_dal_2027_07_01 / 156, 10);
      for (const percentage of [1, 33.33, 50, 99.99]) {
        const pt = calculateRates({ ...p, workTimeRegime: 'PART_TIME', partTimePercentage: percentage }, 'DAL_LUG_2027_REGIME');
        expect(pt.rates).toEqual(jul.rates);
      }
    });
  }
  it('usa il divisore convenzionale 151,66 per i turnisti a 35 ore', () => {
    expect(calculateRates(createPreset(1).profile, 'NOV_DEC_2026_REGIME').hourlyDivisor).toBe(151.66);
  });
});
describe('Arretrati · formule analitiche §3.3 confermate dall’utente', () => {
  it('novembre: 2025 = 468,30 e 2026 = 715,20, totale 1.183,50', () => {
    const s = createDefaultSimulatorInput(), result = calculateArrears(s.profile, s.arrears);
    expect(result.rows.map(r => r.netTabular)).toEqual([468.30, 715.20]);
    expect(result.tabularTotal).toBe(1183.50);
    expect(result.rows[0].ivcDeducted).toBe(119.30);
    expect(result.rows[1].thirteenthFraction).toBe(0);
  });
  it('dicembre: esatto 1.255,02; slide analitica 1.115,88; lordo 1.593,00', () => {
    const s = createDefaultSimulatorInput(); s.arrears.payrollAdjustmentMonth2026 = '2026-12';
    expect(calculateArrears(s.profile, s.arrears).tabularTotal).toBe(1255.02);
    expect(calculateArrears(s.profile, { ...s.arrears, ivcDeductionMode: 'STIMA_SINDACALE_SLIDE' }).tabularTotal).toBe(1115.88);
    expect(calculateArrears(s.profile, { ...s.arrears, ivcDeductionMode: 'LORDO_SENZA_SCORPORO' }).tabularTotal).toBe(1593);
  });
  it('cessazione 2026: ratei 13ª fino alla cessazione, anche dopo cutoff ordinario', () => {
    const s = createDefaultSimulatorInput();
    s.arrears.serviceStatus = 'TERMINATED'; s.arrears.terminationDate = '2026-12-31';
    const row = calculateArrears(s.profile, s.arrears).rows[1];
    expect(row.ordinaryMonths).toBe(10); expect(row.thirteenthFraction).toBe(1);
    expect(row.grossThirteenth).toBe(91.4); expect(row.netTabular).toBe(786.72);
    s.arrears.terminationDate = '2026-06-15'; s.arrears.unusedVacationDays = 5;
    const mid = calculateArrears(s.profile, s.arrears);
    expect(mid.rows[1].ordinaryMonths).toBe(5.5); expect(mid.rows[1].thirteenthFraction).toBeCloseTo(5.5 / 12);
    expect(mid.unusedVacationCompensation).toBe(new Big(2019.63).div(22).times(5).round(2).toNumber());
    s.arrears.partialMonthRule = 'FIFTEEN_DAYS';
    expect(calculateArrears(s.profile, s.arrears).rows[1].ordinaryMonths).toBe(6);
    s.arrears.terminationDate = '2026-06-14';
    expect(calculateArrears(s.profile, s.arrears).rows[1].ordinaryMonths).toBe(5);
  });
  it('cessazione 2025: nessuna riga 2026 e febbraio intero vale un mese', () => {
    const s = createDefaultSimulatorInput(); s.arrears.serviceStatus = 'TERMINATED'; s.arrears.terminationDate = '2025-02-28';
    const r = calculateArrears(s.profile, s.arrears); expect(r.rows).toHaveLength(1); expect(r.rows[0].ordinaryMonths).toBe(2);
  });
  it('multi-tranche: aggrega periodi FT/PT, area e profilo specifici', () => {
    const s = createDefaultSimulatorInput();
    const make = (id: string, dateFrom: string, dateTo: string, percentage: number): CareerTranche => ({ id, dateFrom, dateTo,
      profile: { ...s.profile, workTimeRegime: percentage === 100 ? 'FULL_TIME_36H' : 'PART_TIME', partTimePercentage: percentage }, hours2025: emptyHours(), hours2026: emptyHours() });
    s.arrears.hasCareerChanges = true;
    s.arrears.careerTranches = [make('uno', '2025-01-01', '2025-12-31', 100), make('due', '2026-01-01', '2026-12-31', 50)];
    expect(calculateArrears(s.profile, s.arrears).tabularTotal).toBe(825.90);
    const other = s.arrears.careerTranches[1]; other.profile.area = 'FUNZIONARI_EQ'; other.profile.historicalLevel = 'D1'; other.profile.newDifferentialsCount = 3;
    expect(calculateArrears(s.profile, s.arrears).rows[1].netTabular).toBe(388.15);
    s.arrears.careerTranches[1].dateFrom = '2025-12-31';
    expect(ArrearsInputSchema.safeParse(s.arrears).success).toBe(false);
    s.arrears.careerTranches[1].dateTo = '2026-99-99';
    expect(() => ArrearsInputSchema.safeParse(s.arrears)).not.toThrow();
  });
  it('split inframensile conserva la somma dei mesi senza duplicare ratei', () => {
    const s = createDefaultSimulatorInput(); s.arrears.hasCareerChanges = true;
    s.arrears.careerTranches = [['1', '2025-01-01', '2025-01-14'], ['2', '2025-01-15', '2026-12-31']].map(([id, dateFrom, dateTo]) => ({ id, dateFrom, dateTo, profile: s.profile, hours2025: emptyHours(), hours2026: emptyHours() }));
    const r = calculateArrears(s.profile, s.arrears);
    expect(r.rows.filter(row => row.year === 2025).reduce((n, row) => n + row.ordinaryMonths, 0)).toBe(12);
  });
  it('usa la base e il moltiplicatore specifici per tutti gli accessori arretrati', () => {
    const s = createPreset(2);
    HOUR_DEFINITIONS.forEach(d => { s.arrears.hours2025[d.key] = 10; });
    const result = calculateArrears(s.profile, s.arrears).rows[0];
    for (const d of HOUR_DEFINITIONS) {
      const expectedDelta = new Big(45.2).div(156).times(d.base === 'RBO' || d.base === 'ROG' ? new Big(13).div(12) : 1);
      expect(result.accessoryLines.find(l => l.key === d.key)!.amount).toBe(expectedDelta.times(d.multiplier).times(10).round(2).toNumber());
    }
    expect(result.accessoryLines.find(l => l.key === 'bankRest15')!.amount).toBeLessThan(result.accessoryLines.find(l => l.key === 'bankPaid15')!.amount);
  });
});
describe('Cedolino, supplementare e ferie', () => {
  it('split automatico 25%, override e 13ª solo a dicembre', () => {
    const s = createPreset(2); const r = calculateMonthlyPayslip(s);
    expect(r.supplementaryThreshold).toBe(19.5); expect(r.supplementaryWithin).toBe(19.5); expect(r.supplementaryBeyond).toBe(5.5);
    expect(r.hourlyLines[0].amount).toBe(new Big(r.rates.rates.ROG).times(1.15).round(2).times(19.5).round(2).toNumber());
    s.monthly.supplementaryManualOverride = true; s.monthly.hours.supplementary15 = 5; s.monthly.hours.supplementary25 = 2;
    expect(calculateMonthlyPayslip(s).supplementaryWithin).toBe(5);
    s.monthly.month = 12;
    expect(calculateMonthlyPayslip(s).fixedTotal).toBe(new Big(r.fixedTotal).plus(r.rates.RIM).toNumber());
  });
  it('blocca ferie nel 2026 e attiva nel 2027 con soglia inclusiva di 3 €', () => {
    const p = { ...createDefaultSimulatorInput().monthly.presence, previousYearShift: 936, vacationDays: 5 };
    expect(calculateVacationAccessoryDailyAllowance(p, 'NOV_DEC_2026_REGIME')).toMatchObject({ isInForce: false, eligible: false, amount: 0 });
    expect(calculateVacationAccessoryDailyAllowance(p, 'DAL_GEN_2027_REGIME')).toMatchObject({ isInForce: true, eligible: true, dailyAmount: 3, amount: 15 });
    expect(calculateVacationAccessoryDailyAllowance({ ...p, previousYearShift: 933 }, 'DAL_LUG_2027_REGIME').amount).toBe(0);
    expect(calculateVacationAccessoryDailyAllowance({ ...p, previousYearShift: 468, prorateThresholdForPartTime: true }, 'DAL_GEN_2027_REGIME', 50).amount).toBe(7.5);
  });
  it('switch di vista/presenza escludono i rispettivi importi e raddoppia reperibilità festiva', () => {
    const s = createDefaultSimulatorInput(); s.monthly.hours.shift100 = 10; s.monthly.presence.availabilityHolidayShifts = 2;
    const full = calculateMonthlyPayslip(s);
    expect(full.presenceTotal).toBe(41.32);
    s.monthly.monthlyViewMode = 'SOLO_PRESENZA'; expect(calculateMonthlyPayslip(s).hourlyTotal).toBe(0);
    s.monthly.monthlyViewMode = 'SOLO_ORARIE'; expect(calculateMonthlyPayslip(s).presenceTotal).toBe(0);
    s.monthly.monthlyViewMode = 'COMPLETA_CON_PRESENZA'; s.monthly.includePresenceAllowances = false;
    expect(calculateMonthlyPayslip(s).presenceTotal).toBe(0);
  });
  it('rifiuta straordinario EQ ordinario e indennità sotto minimo dal 2027', () => {
    const s = createDefaultSimulatorInput(); s.profile.isTitolareEQ = true; s.profile.entityWithoutFunzionari = true; s.profile.retribuzionePosizioneEQAnnuoLordo = 5000;
    s.monthly.hours.overtime15 = 1; expect(SimulatorInputSchema.safeParse(s).success).toBe(false);
    s.monthly.overtimeReason = 'ELETTORALE'; expect(SimulatorInputSchema.safeParse(s).success).toBe(true);
    s.regimeEpoch = 'DAL_GEN_2027_REGIME'; s.monthly.month = 1; s.monthly.presence.workingConditionsDays = 1; s.monthly.presence.workingConditionsDailyRate = 1.99;
    expect(SimulatorInputSchema.safeParse(s).success).toBe(false);
    s.monthly.presence.workingConditionsDailyRate = 2; expect(SimulatorInputSchema.safeParse(s).success).toBe(true);
    s.monthly.hours.overtime15 = Infinity; expect(SimulatorInputSchema.safeParse(s).success).toBe(false);
  });
});
