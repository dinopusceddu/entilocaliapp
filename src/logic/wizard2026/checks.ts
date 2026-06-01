export type Wizard2026CheckSeverity = 'error' | 'warning' | 'info';

export interface Wizard2026Check {
  id: string;
  severity: Wizard2026CheckSeverity;
  step: string;
  message: string;
  norma?: string;
  field?: string;
  currentValue?: number | string | boolean | null;
  expectedValue?: number | string | boolean | null;
}
