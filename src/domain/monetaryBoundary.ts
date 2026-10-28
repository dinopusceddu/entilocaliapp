import Big from 'big.js';
import { monetaryPolicies } from './monetaryPolicies';

export type MonetarySignPolicy = 'NONNEGATIVE_RESOURCE' | 'NONNEGATIVE_DEDUCTION_MAGNITUDE' | 'SIGNED_ADJUSTMENT' | 'DERIVED_ONLY';
export interface MonetaryPolicy { readonly path: string; readonly root: 'fund' | 'wizard' | 'compensatore'; readonly scale: number | null; readonly sign: MonetarySignPolicy }
export interface MonetaryIssue { readonly path: string; readonly code: 'MONEY_MALFORMED' | 'MONEY_NOT_FINITE' | 'MONEY_NEGATIVE_NOT_ALLOWED' | 'MONEY_INVALID_PRECISION' | 'MONEY_OUT_OF_SAFE_RANGE' | 'MONEY_AGGREGATE_OUT_OF_SAFE_RANGE'; readonly message: string }
export type MonetaryParseResult = { status: 'MISSING'; value: undefined } | { status: 'VALID'; value: number } | { status: 'INVALID'; issue: MonetaryIssue };
const maxMinorUnits = new Big(Number.MAX_SAFE_INTEGER.toString());
const issue = (path: string, code: MonetaryIssue['code'], message: string): MonetaryParseResult => ({ status: 'INVALID', issue: { path, code, message } });

/** Optional money only. No generic Number coercion, repair, clamp or input rounding. */
export function parseMonetaryValue(raw: unknown, policy: Pick<MonetaryPolicy, 'scale' | 'sign'>, path = ''): MonetaryParseResult {
  if (raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '')) return { status: 'MISSING', value: undefined };
  if (typeof raw !== 'number' && typeof raw !== 'string') return issue(path, 'MONEY_MALFORMED', 'Inserire un importo valido.');
  if ((typeof raw === 'number' && !Number.isFinite(raw)) || (typeof raw === 'string' && /^[+-]?(?:Infinity|NaN)$/i.test(raw.trim()))) return issue(path, 'MONEY_NOT_FINITE', 'Inserire un importo finito valido.');
  const text = String(raw).trim();
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return issue(path, 'MONEY_MALFORMED', 'Inserire un importo valido.');
  let decimal: Big;
  try { decimal = new Big(text.startsWith('+') ? text.slice(1) : text); } catch { return issue(path, 'MONEY_MALFORMED', 'Inserire un importo valido.'); }
  if (policy.sign !== 'SIGNED_ADJUSTMENT' && policy.sign !== 'DERIVED_ONLY' && decimal.lt(0)) return issue(path, 'MONEY_NEGATIVE_NOT_ALLOWED', "L'importo non può essere negativo.");
  const scale = policy.scale ?? 2;
  const minor = decimal.times(new Big(10).pow(scale));
  // Compare before Number conversion, including scientific notation and enormous exponents.
  if (minor.abs().gt(maxMinorUnits)) return issue(path, policy.scale === null ? 'MONEY_AGGREGATE_OUT_OF_SAFE_RANGE' : 'MONEY_OUT_OF_SAFE_RANGE', 'Importo fuori dal range tecnico di rappresentazione sicura.');
  if (policy.scale !== null && !minor.eq(minor.round(0))) return issue(path, 'MONEY_INVALID_PRECISION', `Inserire un importo con al massimo ${scale} cifre decimali, senza arrotondamento automatico.`);
  const value = Number(decimal.toString());
  if (!Number.isFinite(value) || (policy.scale !== null && !new Big(value.toString()).eq(decimal))) return issue(path, 'MONEY_OUT_OF_SAFE_RANGE', 'Importo non rappresentabile in sicurezza senza perdita di precisione.');
  return { status: 'VALID', value };
}

/** Adapter for the locale formats already supported by CSV. Full-string syntax only. */
export function monetaryLocaleDecimal(raw: unknown): unknown {
  if (typeof raw !== 'string') return raw;
  const text = raw.trim().replace(/\s/g, '');
  if (/^[+-]?\d{1,3}(?:\.\d{3})+,\d+(?:e[+-]?\d+)?$/i.test(text)) return text.replace(/\./g, '').replace(',', '.');
  if (/^[+-]?\d{1,3}(?:,\d{3})+\.\d+(?:e[+-]?\d+)?$/i.test(text)) return text.replace(/,/g, '');
  if (/^[+-]?\d+,\d+(?:e[+-]?\d+)?$/i.test(text)) return text.replace(',', '.');
  return text;
}

export const defaultMonetaryPolicy = { scale: 2, sign: 'NONNEGATIVE_RESOURCE' } as const;
export function monetaryPolicyForControl(key?: string): MonetaryPolicy | undefined {
  if (!key) return undefined;
  const normalized = key.replace(/_(stanziate|risparmi|aBilancio)$/, '.$1');
  return monetaryPolicies.find(p => p.path === normalized || p.path.endsWith('.' + normalized));
}

function visit(data: unknown, parts: string[], path: string[], visitor: (parent: Record<string, unknown>, key: string, path: string) => void) {
  if (!data || typeof data !== 'object') return;
  const obj = data as Record<string, unknown>;
  const [key, ...rest] = parts;
  for (const actual of key === '*' ? Object.keys(obj) : [key]) {
    if (!Object.prototype.hasOwnProperty.call(obj, actual)) continue;
    if (rest.length) visit(obj[actual], rest, [...path, actual], visitor);
    else visitor(obj, actual, [...path, actual].join('.'));
  }
}

function malformedContainers(data: unknown, parts: string[], path: string[] = []): string[] {
  if (data === undefined || data === null || parts.length === 0) return [];
  if (typeof data !== 'object' || (Array.isArray(data) && parts[0] !== '*')) return [path.join('.')];
  const obj = data as Record<string, unknown>;
  const [key, ...rest] = parts;
  if (!rest.length) return [];
  return (key === '*' ? Object.keys(obj) : [key]).flatMap(actual => Object.prototype.hasOwnProperty.call(obj, actual)
    ? malformedContainers(obj[actual], rest, [...path, actual]) : []);
}

/** Validates every known property. Unknown compatibility metadata survives untouched. */
export function validateMonetaryData(data: unknown, root: MonetaryPolicy['root'] = 'fund'): MonetaryIssue[] {
  const issues: MonetaryIssue[] = [];
  const structuralPaths = new Set(monetaryPolicies.filter(p => p.root === root).flatMap(p => malformedContainers(data, p.path.split('.'))));
  for (const path of structuralPaths) issues.push({ path, code: 'MONEY_MALFORMED', message: 'Sezione monetaria non valida.' });
  for (const policy of monetaryPolicies.filter(p => p.root === root)) visit(data, policy.path.split('.'), [], (parent, key, path) => {
    const parsed = parseMonetaryValue(parent[key], policy, path);
    if (parsed.status === 'INVALID') issues.push(parsed.issue);
  });
  if (root === 'fund' && data && typeof data === 'object') {
    const snapshot = (data as Record<string, unknown>).wizard2026TransferSnapshot;
    if (snapshot && typeof snapshot === 'object') {
      const s = snapshot as Record<string, unknown>;
      for (const key of ['input', 'computed'] as const) {
        const values = s[key];
        if (values && typeof values === 'object') {
          for (const [field, value] of Object.entries(values)) {
            const policy = transferSnapshotPolicies[field];
            if (!policy) continue;
            const parsed = parseMonetaryValue(value, snapshotAliasPolicy(key, field), `wizard2026TransferSnapshot.${key}.${field}`);
            if (parsed.status === 'INVALID') issues.push(parsed.issue);
          }
        }
      }
      const input = s.input as Record<string, unknown> | undefined;
      if (input) for (const [field, step] of Object.entries({ datiArt60: 'conglobamentoArt60', datiStraordinario: 'straordinario', datiDL25: 'dl25', datiPNRR: 'pnrr' })) {
        issues.push(...validateMonetaryData({ [step]: input[field] }, 'wizard').map(i => ({ ...i, path: `wizard2026TransferSnapshot.input.${field}.${i.path.slice(step.length + 1)}` })));
      }
      if (s.destination) issues.push(...validateMonetaryData(s.destination).map(i => ({ ...i, path: `wizard2026TransferSnapshot.destination.${i.path}` })));
      if (Array.isArray(s.transferPlan)) s.transferPlan.forEach((row, index) => {
        const policy = transferPlanMonetaryPolicy(row?.destinationPath);
        if (policy) for (const key of ['currentValue', 'proposedValue']) {
          const parsed = parseMonetaryValue(row[key], policy, `wizard2026TransferSnapshot.transferPlan.${index}.${key}`);
          if (parsed.status === 'INVALID') issues.push(parsed.issue);
        }
      });
    }
  }
  return issues;
}

/** Known snapshot DTO aliases; counts/FTE/regime and unknown metadata are not money. */
export const transferSnapshotPolicies: Readonly<Record<string, Pick<MonetaryPolicy, 'scale' | 'sign'>>> = Object.fromEntries([
  'monteSalari2021', 'limiteArt23Storico2016', 'limiteArt23Comma2Attualizzato', 'fondoRisorseDecentrate2024', 'risorseEQ2024',
  'incrementoEffettivo022', 'fondoCertificatoParteStabile2018', 'incremento014Fondo', 'incremento014EQ', 'incremento022Fondo', 'incremento022EQ',
  'art60Decurtazione', 'fondoStraordinarioCorrente', 'incrementoStabileAumentoPersonale', 'legacyArt79c1cEstimate', 'limiteArt23Attualizzato',
  'dl25MassimoTeorico', 'dl25ImportoApplicato', 'dl25PriorCumulativeApplied', 'dl25CurrentYearDelta', 'dl25RequestedCurrentYearDelta',
  'dl25RemainingCapacity', 'dl25RemainingAfterApplication', 'pnrrMassimoFondoDipendenti', 'pnrrMassimoFondoDirigenza', 'pnrrMassimoTeorico', 'pnrrImportoApplicato',
  'incremento014Stabile', 'arretrati014', 'quota014Fondo', 'quota014EQ', 'arretrati014Fondo', 'arretrati014EQ',
  'limiteMassimo022', 'quota022Fondo', 'quota022EQ',
].map(key => [key, { scale: null, sign: 'DERIVED_ONLY' }]));

/** The input group also contains a calculated Art23 alias: retain its internal precision. */
export function snapshotAliasPolicy(group: 'input' | 'computed', field: string): Pick<MonetaryPolicy, 'scale' | 'sign'> {
  return group === 'input' && field !== 'limiteArt23Comma2Attualizzato' ? defaultMonetaryPolicy : transferSnapshotPolicies[field];
}

/** CONTROL_ONLY plan rows have structured monetary destinations, too. */
export function transferPlanMonetaryPolicy(path?: string): Pick<MonetaryPolicy, 'scale' | 'sign'> | undefined {
  if (!path) return undefined;
  if (['simulato.art79c1c.stimaLegacy', 'simulato.dl25.limiteMassimoDL25', 'simulato.pnrr.totaleLimiteMassimoPnrr', 'simulato.limiteArt23Attualizzato'].includes(path)) return { scale: null, sign: 'DERIVED_ONLY' };
  return monetaryPolicyForControl(path);
}

/** Persisted Wizard diagnostics must not disappear when an unsafe result was withheld. */
export function wizardMonetaryFailureIssues(data: unknown): MonetaryIssue[] {
  if (!data || typeof data !== 'object') return [];
  const state = data as Record<string, unknown>;
  const meta = state.meta as { monetaryIssues?: MonetaryIssue[] } | undefined;
  const issues = [...(Array.isArray(meta?.monetaryIssues) ? meta.monetaryIssues : [])];
  for (const [step, value] of Object.entries(state)) {
    if (!value || typeof value !== 'object') continue;
    const checks = (value as { checks?: { id?: string; severity?: string; message?: string }[] }).checks;
    if (Array.isArray(checks)) for (const check of checks) {
      if (check.severity === 'error' && check.id?.startsWith('MONEY_')) issues.push({
        path: step, code: 'MONEY_AGGREGATE_OUT_OF_SAFE_RANGE', message: check.message ?? 'Risultato monetario non rappresentabile in sicurezza.',
      });
    }
  }
  return issues;
}

export class MonetaryBoundaryError extends Error {
  constructor(readonly issues: readonly MonetaryIssue[]) { super(issues.map(i => `${i.path}: ${i.message}`).join('\n')); this.name = 'MonetaryBoundaryError'; }
}

/** Calculation-only quarantine with explicit issues. Never used for save/hydration. */
export function quarantineInvalidMonetaryData<T>(data: T, issues: readonly MonetaryIssue[]): T {
  const result = structuredClone(data);
  for (const issue of issues) {
    const parts = issue.path.split('.');
    const key = parts.pop()!;
    const parent = parts.reduce<unknown>((obj, part) => obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[part] : undefined, result);
    if (parent && typeof parent === 'object') delete (parent as Record<string, unknown>)[key];
  }
  return result;
}

/** Converts only owned valid properties; never materializes absent atomic fields. */
export function normalizeMonetaryData<T>(data: T, root: MonetaryPolicy['root'] = 'fund'): T {
  const issues = validateMonetaryData(data, root);
  if (issues.length) throw new MonetaryBoundaryError(issues);
  let changed = false;
  for (const policy of monetaryPolicies.filter(p => p.root === root)) visit(data, policy.path.split('.'), [], (parent, key, path) => {
    const parsed = parseMonetaryValue(parent[key], policy, path);
    if (parsed.status !== 'INVALID' && !Object.is(parent[key], parsed.value)) changed = true;
  });
  const snapshot = root === 'fund' && data && typeof data === 'object' ? (data as Record<string, unknown>).wizard2026TransferSnapshot : undefined;
  if (!changed && !snapshot) return data;
  const result = structuredClone(data);
  for (const policy of monetaryPolicies.filter(p => p.root === root)) visit(result, policy.path.split('.'), [], (parent, key, path) => {
    const parsed = parseMonetaryValue(parent[key], policy, path);
    if (parsed.status !== 'INVALID') parent[key] = parsed.value;
  });
  if (snapshot && typeof snapshot === 'object') {
    const s = (result as Record<string, unknown>).wizard2026TransferSnapshot as Record<string, unknown>;
    for (const group of ['input', 'computed'] as const) {
      const values = s[group];
      if (values && typeof values === 'object') for (const [key, value] of Object.entries(values)) {
        const policy = transferSnapshotPolicies[key];
        if (policy) {
          const parsed = parseMonetaryValue(value, snapshotAliasPolicy(group, key));
          if (parsed.status !== 'INVALID') (values as Record<string, unknown>)[key] = parsed.value;
        }
      }
    }
    const input = s.input as Record<string, unknown> | undefined;
    if (input) for (const [field, step] of Object.entries({ datiArt60: 'conglobamentoArt60', datiStraordinario: 'straordinario', datiDL25: 'dl25', datiPNRR: 'pnrr' })) {
      if (input[field]) input[field] = normalizeMonetaryData({ [step]: input[field] }, 'wizard')[step];
    }
    if (s.destination) s.destination = normalizeMonetaryData(s.destination);
    if (Array.isArray(s.transferPlan)) for (const row of s.transferPlan) {
      const policy = transferPlanMonetaryPolicy(row?.destinationPath);
      if (policy) for (const key of ['currentValue', 'proposedValue']) {
        const parsed = parseMonetaryValue(row[key], policy);
        if (parsed.status !== 'INVALID' && Object.prototype.hasOwnProperty.call(row, key)) row[key] = parsed.value;
      }
    }
  }
  return result;
}

/** Output conversion guard: no precision restriction or new rounding for intermediates. */
export function checkedMonetaryOutput(decimal: Big, path = 'calculation', outputScale = 2): MonetaryParseResult {
  const minor = decimal.times(new Big(10).pow(outputScale));
  if (minor.abs().gt(maxMinorUnits)) return issue(path, 'MONEY_AGGREGATE_OUT_OF_SAFE_RANGE', 'Aggregato fuori dal range tecnico di rappresentazione sicura.');
  const value = Number(decimal.toString());
  if (!Number.isFinite(value) || (minor.eq(minor.round(0)) && !new Big(value.toString()).eq(decimal))) return issue(path, 'MONEY_AGGREGATE_OUT_OF_SAFE_RANGE', 'Aggregato non rappresentabile in sicurezza alla scala di output.');
  return { status: 'VALID', value };
}

/** Safety of an already numeric DTO, including native-number arithmetic producers. */
export function validateMonetaryOutputTree(value: unknown, path = 'calculation'): MonetaryIssue[] {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return [{ path, code: 'MONEY_AGGREGATE_OUT_OF_SAFE_RANGE', message: 'Risultato monetario non finito.' }];
    const checked = checkedMonetaryOutput(new Big(value.toString()), path);
    return checked.status === 'INVALID' ? [checked.issue] : [];
  }
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) => /(?:year$|^annoRiferimento$|^timestamp$|percentuale|percentage|^ore$|fte|^numero|^conteggio|^dipendentiEquivalenti|aliquota)/i.test(key) ? [] : validateMonetaryOutputTree(child, `${path}.${key}`));
}

export function monetaryIssueMessages(issues: readonly MonetaryIssue[]): Record<string, string> {
  return Object.fromEntries(issues.map(i => [i.path, i.message]));
}
