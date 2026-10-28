import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { it, expect, vi, afterEach, beforeEach } from 'vitest';
import { Step3Dl25 } from '../Step3Dl25';
import { Step8RiepilogoPreview } from '../Step8RiepilogoPreview';
import { SimulatoreIncrementoForm } from '../../../../components/dataInput/SimulatoreIncrementoForm';
import { dl25Draft, dl25Fund } from '../../__tests__/dl25TestData';
import { applyWizard2026Transfer } from '../../transfer/applyWizard2026Transfer';
import { calculateSimulazione } from '../../../../logic/calculation/fundEngine';
import type { FundData } from '../../../../domain/types';

let fund: FundData;
const dispatch = vi.fn();
vi.mock('../../../../contexts/AppContext', () => ({ useAppContext: () => ({
  state: { fundData: fund, validationErrors: {}, currentYear: fund.annualData.annoRiferimento }, dispatch,
  saveState: vi.fn(), setScopeAndTab: vi.fn(),
}) }));
vi.mock('../../../../hooks/useNormativeData', () => ({ useNormativeData: () => ({ data: { riferimenti_normativi: {} } }) }));
beforeEach(() => { fund = dl25Fund(); dispatch.mockClear(); });
afterEach(cleanup);

it.each([2025, 2026, 2027])('NORM04 fixed baseline labels in year%s, denominator2023 and no active4.8 label', year => {
  const d = dl25Draft(year, year === 2025 ? 0 : 4000, 1000);
  const r = render(<Step3Dl25 state={d.dl25} enteState={d.ente} entityType="COMUNE" onChange={vi.fn()} />);
  expect(screen.getByLabelText(/Fondo Stabile 2025 Certificato/i)).toHaveValue('100000');
  expect(screen.getByLabelText(/Budget Elevate Qualificazioni.*2025/i)).toHaveValue('20000');
  expect(screen.getByLabelText(/Stipendi Tabellari 2023/i)).toHaveValue('300000');
  expect(r.container.textContent).not.toMatch(/4[,.]8\s*%/);
  r.unmount();
  fund = dl25Fund(year);
  const v = render(<Step8RiepilogoPreview state={d} />);
  expect(v.container.textContent).toContain('48% stipendi 2023');
  expect(v.container.textContent).toContain('Risorse 2025 da sottrarre');
  expect(v.container.textContent).not.toMatch(/4[,.]8\s*%/);
});

it('same dataset in Step3, Step8, simulator and transferred fund gives24000/4000/20000/15000/19000/5000', () => {
  const d = dl25Draft();
  const a = render(<Step3Dl25 state={d.dl25} enteState={d.ente} entityType="COMUNE" onChange={vi.fn()} />);
  const stockText = screen.getByTestId('dl25-carry-summary').textContent;
  const financeText = screen.getByTestId('dl25-financial-summary').textContent;
  for (const amount of ['24.000,00', '4.000,00', '20.000,00', '15.000,00', '19.000,00', '5.000,00']) expect(stockText).toContain(amount);
  expect(financeText).toContain('Non applicabile dal 08/08/2026');
  expect(financeText).toContain('20.000,00');
  expect(screen.queryByText(/Spesa ante-incremento conforme al tetto storico/)).not.toBeInTheDocument();
  a.unmount();
  const b = render(<Step8RiepilogoPreview state={d} />);
  expect(screen.getByTestId('dl25-carry-summary').textContent).toBe(stockText);
  expect(screen.getByTestId('dl25-financial-summary').textContent).toBe(financeText);
  const legacy = structuredClone(d);
  Object.assign(legacy.dl25, { currentYearDelta: undefined, legacyStoredAmount: 19000, legacyQualification: 'CUMULATIVE_STOCK' });
  b.rerender(<Step8RiepilogoPreview state={legacy} />);
  expect(screen.getByTestId('dl25-carry-summary').textContent).toBe(stockText);
  expect(screen.getByText('Nuovo incremento DL25 deciso nell’anno:').parentElement).toHaveTextContent('15.000,00');
  b.unmount();
  fund = applyWizard2026Transfer(d, fund);
  fund.annualData.simulatoreRisultati = calculateSimulazione(fund.annualData.simulatoreInput, fund.annualData.numeroAbitanti, fund.annualData.tipologiaEnte, fund.annualData);
  render(<SimulatoreIncrementoForm />);
  fireEvent.click(screen.getByRole('button', { name: 'Simulatore Incremento Potenziale Fondo Salario Accessorio' }));
  expect(screen.getByTestId('dl25-carry-summary').textContent).toBe(stockText);
  expect(screen.getByTestId('dl25-financial-summary').textContent).toBe(financeText);
  expect(fund.fondoAccessorioDipendenteData.st_incrementoDL25_2025).toBe(19000);
});

it('Step3 collects delta, prior, business provenance, date and explicit legacy qualification', () => {
  const d = dl25Draft(); d.dl25.legacyStoredAmount = 19000;
  const onChange = vi.fn();
  render(<Step3Dl25 state={d.dl25} enteState={d.ente} entityType="COMUNE" onChange={onChange} />);
  fireEvent.change(screen.getByLabelText('Stock DL25 precedente'), { target: { value: '5000' } });
  fireEvent.change(screen.getByLabelText('Fonte dello stock DL25 precedente'), { target: { value: 'Determina 123' } });
  fireEvent.change(screen.getByLabelText('Nuovo incremento DL25 dell’anno'), { target: { value: '10000' } });
  fireEvent.change(screen.getByLabelText('Data business DL25'), { target: { value: '2026-08-07' } });
  fireEvent.change(screen.getByLabelText('Significato dell’importo DL25 legacy'), { target: { value: 'CUMULATIVE_STOCK' } });
  expect(onChange.mock.calls.map(c => c[0])).toEqual([{ priorCumulativeApplied: 5000 }, { priorStockProvenance: 'Determina 123' }, { currentYearDelta: 10000 }, { regimeDate: '2026-08-07' }, { legacyQualification: 'CUMULATIVE_STOCK' }]);
});

it('Step8 blocks a material missing date and labels undecided stock as undetermined', () => {
  const d = dl25Draft(); d.dl25.regimeDate = undefined;
  d.dl25.simulationInput!.simTettoSpesaPersonaleL296_06 = 6370;
  render(<Step8RiepilogoPreview state={d} />);
  expect(screen.getByTestId('dl25-financial-summary')).toHaveTextContent('Da determinare');
  expect(screen.getByRole('button', { name: /Trasferisci i dati alla costituzione/ })).toBeDisabled();
});

it('simulator CLOSED inputs are disabled, no calculation dispatch and source unchanged', () => {
  fund = applyWizard2026Transfer(dl25Draft(), fund);
  fund.metadata!.snapshotStatus = 'CLOSED' as any;
  const before = JSON.stringify(fund);
  render(<SimulatoreIncrementoForm />);
  fireEvent.click(screen.getByRole('button', { name: 'Simulatore Incremento Potenziale Fondo Salario Accessorio' }));
  expect(screen.getByLabelText('Stock DL25 precedente')).toBeDisabled();
  expect(screen.getByLabelText('Nuovo incremento DL25 dell’anno')).toBeDisabled();
  expect(dispatch).not.toHaveBeenCalled();
  expect(JSON.stringify(fund)).toBe(before);
});

it('exhausted plafond is explicit and no previous stock is assumed from a blank field', () => {
  const d = dl25Draft(2027, 24000, 0);
  const r = render(<Step3Dl25 state={d.dl25} enteState={d.ente} entityType="COMUNE" onChange={vi.fn()} />);
  expect(screen.getByTestId('dl25-carry-summary')).toHaveTextContent('Plafond DL25 già integralmente utilizzato');
  r.unmount(); d.dl25.priorCumulativeApplied = undefined;
  render(<Step3Dl25 state={d.dl25} enteState={d.ente} entityType="COMUNE" onChange={vi.fn()} />);
  expect(screen.getByLabelText('Stock DL25 precedente')).toHaveValue('');
  expect(screen.getByTestId('dl25-carry-summary')).toHaveTextContent('Indicare lo stock DL25');
});
