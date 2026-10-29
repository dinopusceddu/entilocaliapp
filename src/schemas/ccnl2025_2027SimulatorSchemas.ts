import { z } from 'zod';
import { HISTORICAL_LEVELS_MAP, NEW_DIFFERENTIALS_RULES } from '../data/ccnl2025_2027Tables';
import { HOUR_DEFINITIONS } from '../logic/ccnl2025_2027Defaults';
import type { HistoricalLevelCode } from '../data/ccnl2025_2027Tables';
import type { AccessoryHours } from '../types/ccnl2025_2027SimulatorTypes';

const amount = z.number().finite().min(0).max(1_000_000).multipleOf(.01);
const hours = z.number().finite().min(0).max(100_000);
const days = z.number().finite().min(0).max(31);
const date = z.string().regex(/^202[56]-\d{2}-\d{2}$/, 'Data nel 2025–2026 richiesta').refine(value => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, 'Data non valida');
export const AccessoryHoursSchema = z.object(Object.fromEntries(HOUR_DEFINITIONS.map(d => [d.key, hours])) as Record<keyof AccessoryHours, typeof hours>);
export const SimulatorProfileSchema = z.object({
  area: z.enum(['OPERATORI', 'OPERATORI_ESPERTI', 'ISTRUTTORI', 'FUNZIONARI_EQ']),
  historicalLevel: z.enum(Object.keys(HISTORICAL_LEVELS_MAP) as [HistoricalLevelCode, ...HistoricalLevelCode[]]),
  newDifferentialsCount: z.number().int().min(0).max(6),
  specialSection: z.enum(['NONE', 'EDUCATORI_INSEGNANTI_ART92', 'POLIZIA_LOCALE_COORDINAMENTO_ART96', 'ALBI_ORDINI_SANITARI_ART102_106']),
  isTitolareEQ: z.boolean(), entityWithoutFunzionari: z.boolean(), retribuzionePosizioneEQAnnuoLordo: amount,
  workTimeRegime: z.enum(['FULL_TIME_36H', 'FULL_TIME_35H_TURNO', 'PART_TIME']),
  partTimeType: z.enum(['HORIZONTAL', 'VERTICAL', 'MIXED']), partTimePercentage: z.number().finite().min(1).max(100),
  weeklyWorkingDays: z.enum(['5_DAYS', '6_DAYS']),
  usefulBaseItems: z.object({ apnrArt29: amount, adPersonamArt13: amount, ria: amount, otherContinuousC: amount, vigilanceEducatorsD: amount, otherFixedD: amount, otherVariableD: amount }),
}).superRefine((p, ctx) => {
  const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
  const rule = NEW_DIFFERENTIALS_RULES[p.area];
  if (HISTORICAL_LEVELS_MAP[p.historicalLevel].area !== p.area) issue('historicalLevel', 'Livello storico non coerente con l’Area');
  if (p.newDifferentialsCount > rule.maxAllowedCount) issue('newDifferentialsCount', `Massimo ${rule.maxAllowedCount} differenziali`);
  if (p.specialSection !== 'NONE' && !rule.specialAddonsAnnual13m[p.specialSection]) issue('specialSection', 'Sezione speciale non prevista per questa Area');
  if (p.workTimeRegime === 'PART_TIME' && p.partTimePercentage > 99.99) issue('partTimePercentage', 'Part-time: da 1 a 99,99%');
  if (p.workTimeRegime !== 'PART_TIME' && p.partTimePercentage !== 100) issue('partTimePercentage', 'Tempo pieno: 100%');
  if (p.isTitolareEQ) {
    const standard = p.area === 'FUNZIONARI_EQ';
    const reduced = ['ISTRUTTORI', 'OPERATORI_ESPERTI'].includes(p.area) && p.entityWithoutFunzionari;
    if (!standard && !reduced) issue('isTitolareEQ', 'Incarico EQ non ammesso: verificare Area ed ente privo di Funzionari');
    if (p.retribuzionePosizioneEQAnnuoLordo < (standard ? 5000 : 3000) || p.retribuzionePosizioneEQAnnuoLordo > (standard ? 22000 : 9500))
      issue('retribuzionePosizioneEQAnnuoLordo', standard ? 'Posizione EQ: 5.000–22.000 €/anno' : 'Posizione EQ: 3.000–9.500 €/anno');
  }
});
export const CareerTrancheSchema = z.object({
  id: z.string().min(1), dateFrom: date, dateTo: date, profile: SimulatorProfileSchema,
  hours2025: AccessoryHoursSchema, hours2026: AccessoryHoursSchema,
}).refine(t => t.dateFrom <= t.dateTo, { path: ['dateTo'], message: 'Fine tranche anteriore all’inizio' });
export const ArrearsInputSchema = z.object({
  serviceStatus: z.enum(['ACTIVE', 'TERMINATED']), terminationDate: z.union([z.literal(''), date]),
  terminationReason: z.enum(['PENSIONAMENTO', 'DIMISSIONI', 'DECESSO', 'MOBILITA_ESODO', 'LICENZIAMENTO_CON_PREAVVISO', 'ALTRO']),
  partialMonthRule: z.enum(['THIRTIETHS', 'FIFTEEN_DAYS']), unusedVacationDays: hours,
  payrollAdjustmentMonth2026: z.enum(['2026-11', '2026-12']),
  ivcDeductionMode: z.enum(['CONGUAGLIO_ESATTO_CEDOLINO', 'STIMA_SINDACALE_SLIDE', 'LORDO_SENZA_SCORPORO']),
  hasCareerChanges: z.boolean(), careerTranches: z.array(CareerTrancheSchema).max(100),
  hours2025: AccessoryHoursSchema, hours2026: AccessoryHoursSchema,
}).superRefine((a, ctx) => {
  if (a.serviceStatus === 'TERMINATED' && !a.terminationDate) ctx.addIssue({ code: 'custom', path: ['terminationDate'], message: 'Data di cessazione richiesta' });
  if (!a.hasCareerChanges) return;
  const tranches = [...a.careerTranches].sort((x, y) => x.dateFrom.localeCompare(y.dateFrom));
  if (new Set(tranches.map(t => t.id)).size !== tranches.length) ctx.addIssue({ code: 'custom', path: ['careerTranches'], message: 'Identificativi delle tranche duplicati' });
  const cutoff = a.payrollAdjustmentMonth2026 === '2026-11' ? '2026-10-31' : '2026-11-30';
  const end = a.serviceStatus === 'TERMINATED' && a.terminationDate ? a.terminationDate : cutoff;
  let next = '2025-01-01';
  for (const t of tranches) {
    if (t.dateFrom !== next) ctx.addIssue({ code: 'custom', path: ['careerTranches'], message: 'Le tranche devono coprire il servizio dal 01.01.2025 senza vuoti o sovrapposizioni' });
    const endTime = Date.parse(`${t.dateTo}T00:00:00Z`);
    if (!Number.isFinite(endTime)) return;
    next = new Date(endTime + 86400000).toISOString().slice(0, 10);
    for (const year of [2025, 2026] as const) {
      if ((t.dateFrom > `${year}-12-31` || t.dateTo < `${year}-01-01`) && Object.values(t[year === 2025 ? 'hours2025' : 'hours2026']).some(n => n > 0))
        ctx.addIssue({ code: 'custom', path: ['careerTranches'], message: `Ore ${year} inserite fuori dal periodo della tranche` });
    }
  }
  if (!tranches.length || tranches[tranches.length - 1].dateTo < end) ctx.addIssue({ code: 'custom', path: ['careerTranches'], message: 'Timeline incompleta fino alla fine del periodo utile' });
});
export const MonthlyInputSchema = z.object({
  month: z.number().int().min(1).max(12), hours: AccessoryHoursSchema,
  overtimeReason: z.enum(['ORDINARIO', 'ELETTORALE', 'CALAMITA', 'SICUREZZA_URBANA_PL']),
  monthlyViewMode: z.enum(['SOLO_ORARIE', 'COMPLETA_CON_PRESENZA', 'SOLO_PRESENZA']), includePresenceAllowances: z.boolean(),
  contractualMonthlyHoursPartTime: z.number().finite().positive().max(156), supplementaryHoursTotal: hours, supplementaryManualOverride: z.boolean(),
  presence: z.object({
    workingConditionsDays: days, workingConditionsDailyRate: amount.max(15), externalServiceDays: days, externalServiceDailyRate: amount,
    availabilityWeekdayShifts: days, availabilityHolidayShifts: days, availability12hRate: amount.min(10.33).max(13),
    cashHandlingDays: days, cashHandlingDailyRate: amount, previousYearShift: amount, previousYearExternalService: amount,
    previousYearWorkingConditions: amount, vacationDays: days, prorateThresholdForPartTime: z.boolean(),
  }),
});
export const SimulatorInputSchema = z.object({
  profile: SimulatorProfileSchema, arrears: ArrearsInputSchema, monthly: MonthlyInputSchema,
  regimeEpoch: z.enum(['NOV_DEC_2026_REGIME', 'DAL_GEN_2027_REGIME', 'DAL_LUG_2027_REGIME']),
}).superRefine((s, ctx) => {
  const m = s.monthly;
  const is2027 = s.regimeEpoch !== 'NOV_DEC_2026_REGIME';
  if ((s.regimeEpoch === 'NOV_DEC_2026_REGIME' && m.month < 11) || (s.regimeEpoch === 'DAL_GEN_2027_REGIME' && m.month > 6) || (s.regimeEpoch === 'DAL_LUG_2027_REGIME' && m.month < 7))
    ctx.addIssue({ code: 'custom', path: ['monthly', 'month'], message: 'Mese non coerente con l’epoca selezionata' });
  if (s.profile.isTitolareEQ && m.overtimeReason === 'ORDINARIO' && m.monthlyViewMode !== 'SOLO_PRESENZA' && HOUR_DEFINITIONS.some(d => (d.key.startsWith('overtime') || d.key.startsWith('bank')) && m.hours[d.key] > 0))
    ctx.addIssue({ code: 'custom', path: ['monthly', 'overtimeReason'], message: 'EQ: scegliere una causale ammessa (elettorale, calamità, sicurezza urbana PL)' });
  if (is2027 && m.includePresenceAllowances && m.monthlyViewMode !== 'SOLO_ORARIE') {
    for (const [quantity, rate] of [['workingConditionsDays', 'workingConditionsDailyRate'], ['externalServiceDays', 'externalServiceDailyRate']] as const)
      if (m.presence[quantity] > 0 && m.presence[rate] < 2) ctx.addIssue({ code: 'custom', path: ['monthly', 'presence', rate], message: 'Minimo dal 2027: 2,00 €/giorno' });
  }
});
