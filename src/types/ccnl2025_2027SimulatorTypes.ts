import type { ContractualArea, HistoricalLevelCode, RegimeEpoch, SpecialSectionKey } from '../data/ccnl2025_2027Tables';

export type RateEpoch = RegimeEpoch | 'PRE_RINNOVO_2025' | 'PRE_RINNOVO_2026' | 'ARRETRATI_2025';
export type IvcDeductionMode = 'CONGUAGLIO_ESATTO_CEDOLINO' | 'STIMA_SINDACALE_SLIDE' | 'LORDO_SENZA_SCORPORO';
export type MonthlyViewMode = 'SOLO_ORARIE' | 'COMPLETA_CON_PRESENZA' | 'SOLO_PRESENZA';
export type RateKey = 'RB_Art26' | 'RBO' | 'RT' | 'ROG';
export type TerminationReason = 'PENSIONAMENTO' | 'DIMISSIONI' | 'DECESSO' | 'MOBILITA_ESODO' | 'LICENZIAMENTO_CON_PREAVVISO' | 'ALTRO';
export interface UsefulBaseItems {
  apnrArt29: number;
  adPersonamArt13: number;
  ria: number;
  otherContinuousC: number;
  vigilanceEducatorsD: number;
  otherFixedD: number;
  otherVariableD: number;
}
/** All additional monthly inputs are full-time equivalents, before PT proration. */
export interface SimulatorProfile {
  area: ContractualArea;
  historicalLevel: HistoricalLevelCode;
  newDifferentialsCount: number;
  specialSection: SpecialSectionKey;
  isTitolareEQ: boolean;
  entityWithoutFunzionari: boolean;
  retribuzionePosizioneEQAnnuoLordo: number;
  workTimeRegime: 'FULL_TIME_36H' | 'FULL_TIME_35H_TURNO' | 'PART_TIME';
  partTimeType: 'HORIZONTAL' | 'VERTICAL' | 'MIXED';
  partTimePercentage: number;
  weeklyWorkingDays: '5_DAYS' | '6_DAYS';
  usefulBaseItems: UsefulBaseItems;
}
export interface ServiceStatusInput {
  serviceStatus: 'ACTIVE' | 'TERMINATED';
  terminationDate: string;
  terminationReason: TerminationReason;
  partialMonthRule: 'THIRTIETHS' | 'FIFTEEN_DAYS';
  unusedVacationDays: number;
}
export type HourKey = 'overtime15' | 'overtime30' | 'overtime50'
  | 'bankRest15' | 'bankRest30' | 'bankRest50' | 'bankPaid15' | 'bankPaid30' | 'bankPaid50'
  | 'shift10' | 'shift30' | 'shift50' | 'shift100'
  | 'art26Rest50' | 'art26Night20' | 'art26NightHoliday30' | 'art26Holiday130' | 'art26Holiday150'
  | 'supplementary15' | 'supplementary25';
export type AccessoryHours = Record<HourKey, number>;
export interface CareerTranche {
  id: string;
  dateFrom: string;
  dateTo: string;
  profile: SimulatorProfile;
  hours2025: AccessoryHours;
  hours2026: AccessoryHours;
}
export interface ArrearsInput extends ServiceStatusInput {
  payrollAdjustmentMonth2026: '2026-11' | '2026-12';
  ivcDeductionMode: IvcDeductionMode;
  hasCareerChanges: boolean;
  careerTranches: CareerTranche[];
  hours2025: AccessoryHours;
  hours2026: AccessoryHours;
}
export interface VacationAllowanceInput {
  previousYearShift: number;
  previousYearExternalService: number;
  previousYearWorkingConditions: number;
  vacationDays: number;
  prorateThresholdForPartTime: boolean;
}
export interface PresenceAllowances extends VacationAllowanceInput {
  workingConditionsDays: number;
  workingConditionsDailyRate: number;
  externalServiceDays: number;
  externalServiceDailyRate: number;
  availabilityWeekdayShifts: number;
  availabilityHolidayShifts: number;
  availability12hRate: number;
  cashHandlingDays: number;
  cashHandlingDailyRate: number;
}
export interface MonthlyInput {
  month: number;
  hours: AccessoryHours;
  overtimeReason: 'ORDINARIO' | 'ELETTORALE' | 'CALAMITA' | 'SICUREZZA_URBANA_PL';
  monthlyViewMode: MonthlyViewMode;
  includePresenceAllowances: boolean;
  contractualMonthlyHoursPartTime: number;
  supplementaryHoursTotal: number;
  supplementaryManualOverride: boolean;
  presence: PresenceAllowances;
}
export interface SimulatorInput {
  profile: SimulatorProfile;
  arrears: ArrearsInput;
  monthly: MonthlyInput;
  regimeEpoch: RegimeEpoch;
}
export interface DifferentialBreakdownResult {
  historicalLevelCode: HistoricalLevelCode;
  historicalMonthlyAmount13m: number;
  historicalMonthlyEffective: number;
  newDifferentialsCount: number;
  maxAllowedCount: number;
  singleNewDifferentialAnnualBase: number;
  specialSectionAddonAnnual: number;
  singleNewDifferentialAnnualTotal: number;
  singleNewDifferentialMonthly13m: number;
  totalNewDifferentialsAnnual13m: number;
  totalNewDifferentialsMonthly13m: number;
  totalNewDifferentialsMonthlyEffective: number;
  combinedDifferentialsMonthlyEffective: number;
}
export interface PayslipLine {
  key: string;
  label: string;
  base?: RateKey;
  quantity: number;
  unitRate: number;
  multiplier: number;
  amount: number;
}
export interface RatesResult {
  epoch: RateEpoch;
  partTimeRatio: number;
  hourlyDivisor: number;
  effectiveHourlyDivisor: number;
  dailyDivisor: number;
  differentials: DifferentialBreakdownResult;
  fixedLines: PayslipLine[];
  RBM: number;
  RBM_con13: number;
  RIM: number;
  RGF: number;
  rates: Record<RateKey, number>;
  fixedMonthlyTotal: number;
}
export interface ArrearsYearResult {
  trancheId: string;
  year: 2025 | 2026;
  area: ContractualArea;
  dateFrom: string;
  dateTo: string;
  ordinaryMonths: number;
  thirteenthFraction: number;
  ivcOrdinaryMonths: number;
  partTimeRatio: number;
  monthlyIncrement: number;
  ivcMonthly: number;
  grossOrdinary: number;
  grossThirteenth: number;
  ivcDeducted: number;
  netTabular: number;
  oldRates: Record<RateKey, number>;
  newRates: Record<RateKey, number>;
  deltaRates: Record<RateKey, number>;
  accessoryLines: PayslipLine[];
  accessoryTotal: number;
  total: number;
}
export interface ArrearsResult {
  cutoffDate: string;
  rows: ArrearsYearResult[];
  tabularTotal: number;
  accessoryTotal: number;
  ivcTotal: number;
  total: number;
  unusedVacationCompensation: number;
}
export interface VacationAllowanceResult {
  isInForce: boolean;
  eligible: boolean;
  previousYearTotal: number;
  dailyAmount: number;
  threshold: number;
  amount: number;
  message: string;
}
export interface MonthlyResult {
  rates: RatesResult;
  fixedLines: PayslipLine[];
  hourlyLines: PayslipLine[];
  presenceLines: PayslipLine[];
  vacationAllowance: VacationAllowanceResult;
  supplementaryThreshold: number;
  supplementaryWithin: number;
  supplementaryBeyond: number;
  fixedTotal: number;
  hourlyTotal: number;
  presenceTotal: number;
  accessoryTotal: number;
  total: number;
}
