import type { AccessoryHours, HourKey, SimulatorInput, SimulatorProfile } from '../types/ccnl2025_2027SimulatorTypes';
import type { RateKey } from '../types/ccnl2025_2027SimulatorTypes';

export const HOUR_DEFINITIONS: readonly { key: HourKey; label: string; base: RateKey; multiplier: string; group: string }[] = [
  { key: 'overtime15', label: 'Straordinario diurno +15%', base: 'RBO', multiplier: '1.15', group: 'Straordinario · Art. 32' },
  { key: 'overtime30', label: 'Straordinario notturno/festivo +30%', base: 'RBO', multiplier: '1.30', group: 'Straordinario · Art. 32' },
  { key: 'overtime50', label: 'Straordinario notturno festivo +50%', base: 'RBO', multiplier: '1.50', group: 'Straordinario · Art. 32' },
  { key: 'bankRest15', label: 'Banca ore a riposo: sola maggiorazione 15%', base: 'RBO', multiplier: '.15', group: 'Banca ore · Art. 33' },
  { key: 'bankRest30', label: 'Banca ore a riposo: sola maggiorazione 30%', base: 'RBO', multiplier: '.30', group: 'Banca ore · Art. 33' },
  { key: 'bankRest50', label: 'Banca ore a riposo: sola maggiorazione 50%', base: 'RBO', multiplier: '.50', group: 'Banca ore · Art. 33' },
  { key: 'bankPaid15', label: 'Banca ore monetizzata 115%', base: 'RBO', multiplier: '1.15', group: 'Banca ore · Art. 33' },
  { key: 'bankPaid30', label: 'Banca ore monetizzata 130%', base: 'RBO', multiplier: '1.30', group: 'Banca ore · Art. 33' },
  { key: 'bankPaid50', label: 'Banca ore monetizzata 150%', base: 'RBO', multiplier: '1.50', group: 'Banca ore · Art. 33' },
  { key: 'shift10', label: 'Turno diurno 10%', base: 'RT', multiplier: '.10', group: 'Turni · Art. 25' },
  { key: 'shift30', label: 'Turno notturno/festivo 30%', base: 'RT', multiplier: '.30', group: 'Turni · Art. 25' },
  { key: 'shift50', label: 'Turno festivo notturno 50%', base: 'RT', multiplier: '.50', group: 'Turni · Art. 25' },
  { key: 'shift100', label: 'Turno festivo infrasettimanale 100%', base: 'RT', multiplier: '1', group: 'Turni · Art. 25' },
  { key: 'art26Rest50', label: 'Riposo settimanale lavorato 50%', base: 'RB_Art26', multiplier: '.50', group: 'Maggiorazioni · Art. 26' },
  { key: 'art26Night20', label: 'Ordinario notturno/festivo fuori turno 20%', base: 'RB_Art26', multiplier: '.20', group: 'Maggiorazioni · Art. 26' },
  { key: 'art26NightHoliday30', label: 'Ordinario notturno festivo fuori turno 30%', base: 'RB_Art26', multiplier: '.30', group: 'Maggiorazioni · Art. 26' },
  { key: 'art26Holiday130', label: 'Festivo/feriale non lavorativo non turnista 130%', base: 'RBO', multiplier: '1.30', group: 'Maggiorazioni · Art. 26' },
  { key: 'art26Holiday150', label: 'Festivo notturno non turnista 150%', base: 'RBO', multiplier: '1.50', group: 'Maggiorazioni · Art. 26' },
  { key: 'supplementary15', label: 'Supplementare entro soglia 115%', base: 'ROG', multiplier: '1.15', group: 'Supplementare PT · Art. 55' },
  { key: 'supplementary25', label: 'Supplementare oltre soglia 125%', base: 'ROG', multiplier: '1.25', group: 'Supplementare PT · Art. 55' },
];
export const emptyHours = (): AccessoryHours => Object.fromEntries(HOUR_DEFINITIONS.map(d => [d.key, 0])) as AccessoryHours;
export const createDefaultProfile = (): SimulatorProfile => ({
  area: 'ISTRUTTORI', historicalLevel: 'C1', newDifferentialsCount: 0, specialSection: 'NONE',
  isTitolareEQ: false, entityWithoutFunzionari: false, retribuzionePosizioneEQAnnuoLordo: 0,
  workTimeRegime: 'FULL_TIME_36H', partTimeType: 'HORIZONTAL', partTimePercentage: 100, weeklyWorkingDays: '5_DAYS',
  usefulBaseItems: { apnrArt29: 0, adPersonamArt13: 0, ria: 0, otherContinuousC: 0, vigilanceEducatorsD: 0, otherFixedD: 0, otherVariableD: 0 },
});
export const createDefaultSimulatorInput = (): SimulatorInput => ({
  profile: createDefaultProfile(), regimeEpoch: 'NOV_DEC_2026_REGIME',
  arrears: {
    serviceStatus: 'ACTIVE', terminationDate: '', terminationReason: 'PENSIONAMENTO', partialMonthRule: 'THIRTIETHS', unusedVacationDays: 0,
    payrollAdjustmentMonth2026: '2026-11', ivcDeductionMode: 'CONGUAGLIO_ESATTO_CEDOLINO', hasCareerChanges: false,
    careerTranches: [], hours2025: emptyHours(), hours2026: emptyHours(),
  },
  monthly: {
    month: 11, hours: emptyHours(), overtimeReason: 'ORDINARIO', monthlyViewMode: 'COMPLETA_CON_PRESENZA', includePresenceAllowances: true,
    contractualMonthlyHoursPartTime: 78, supplementaryHoursTotal: 0, supplementaryManualOverride: false,
    presence: {
      workingConditionsDays: 0, workingConditionsDailyRate: 2, externalServiceDays: 0, externalServiceDailyRate: 2,
      availabilityWeekdayShifts: 0, availabilityHolidayShifts: 0, availability12hRate: 10.33,
      cashHandlingDays: 0, cashHandlingDailyRate: 0, previousYearShift: 0, previousYearExternalService: 0,
      previousYearWorkingConditions: 0, vacationDays: 0, prorateThresholdForPartTime: false,
    },
  },
});
export function createPreset(index: number): SimulatorInput {
  const value = createDefaultSimulatorInput();
  value.profile.historicalLevel = 'C4';
  value.profile.newDifferentialsCount = 2;
  if (index === 1) {
    value.profile.specialSection = 'POLIZIA_LOCALE_COORDINAMENTO_ART96';
    value.profile.workTimeRegime = 'FULL_TIME_35H_TURNO';
    value.profile.usefulBaseItems.vigilanceEducatorsD = 115.97;
    value.monthly.hours.shift10 = 80; value.monthly.hours.shift30 = 24;
    value.monthly.presence.externalServiceDays = 20; value.monthly.presence.externalServiceDailyRate = 5;
  }
  if (index === 2) {
    value.profile.workTimeRegime = 'PART_TIME'; value.profile.partTimePercentage = 50;
    value.monthly.supplementaryHoursTotal = 25;
  }
  return value;
}
export const REGIME_LABELS = {
  NOV_DEC_2026_REGIME: 'Nov–Dic 2026', DAL_GEN_2027_REGIME: 'Dal 01.01.2027', DAL_LUG_2027_REGIME: 'Dal 01.07.2027',
} as const;
export const SIMULATOR_STORAGE_KEY = 'fl_simulatore_ccnl_2025_2027_v1';
