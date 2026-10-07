import { useReducer } from 'react';
import { act, fireEvent, render, screen, cleanup, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DistribuzioneRisorsePage } from '../DistribuzioneRisorsePage';
import { appReducer } from '../../contexts/AppContext';
import { useFundDataAutosave } from '../../hooks/useFundDataAutosave';
import { deriveCanonicalFundResult } from '../../logic/calculation/canonicalFundLedger';
import { resolveDistributionStatus } from '../../logic/cabina/resolveDistributionStatus';
import { INITIAL_ANNUAL_DATA, INITIAL_DISTRIBUZIONE_RISORSE_DATA,
  INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA, INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA,
  INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA, INITIAL_FONDO_DIRIGENZA_DATA, INITIAL_HISTORICAL_DATA } from '../../test/fixtures/legacyDemoFund';
import type { AppState, CanonicalFundResult, DistribuzioneRisorseData } from '../../domain';
import { formatCurrency } from '../../utils/formatters';
import normative from '../../../public/normativa.json';

const boundary = vi.hoisted(() => ({
  state: {} as AppState, dispatch: vi.fn(), saveState: vi.fn(),
}));
vi.mock('../../contexts/AppContext', async importOriginal => ({
  ...await importOriginal<typeof import('../../contexts/AppContext')>(),
  useAppContext: () => boundary,
}));
vi.mock('../../hooks/useNormativeData', () => ({ useNormativeData: () => ({ data: normative }) }));

const canonical = (amount = 10000) => deriveCanonicalFundResult([{
  id: 'BASE', amount, status: 'VALID', component: 'STABLE', operation: 'ADDITION',
  competenceYear: 2026, source: 'MANUAL', art23Treatment: 'EXCLUDED',
}]);
function setup(options: {
  canonicalFund?: CanonicalFundResult | null;
  personnel?: number | null;
  data?: Partial<DistribuzioneRisorseData>;
  closed?: boolean;
} = {}) {
  boundary.state = {
    currentYear: 2026,
    calculationResult: { canonicalFund: options.canonicalFund === null ? undefined : options.canonicalFund ?? canonical() },
    fundData: {
      historicalData: { ...INITIAL_HISTORICAL_DATA },
      annualData: { ...INITIAL_ANNUAL_DATA, annoRiferimento: 2026, ccnl2024: {
        // undefined/null are deliberately raw missing data, not normalized counts.
        personaleInServizio01012026: options.personnel,
      } },
      fondoAccessorioDipendenteData: { ...INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA },
      fondoElevateQualificazioniData: { ...INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA },
      fondoSegretarioComunaleData: { ...INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA },
      fondoDirigenzaData: { ...INITIAL_FONDO_DIRIGENZA_DATA },
      distribuzioneRisorseData: { ...INITIAL_DISTRIBUZIONE_RISORSE_DATA, ...options.data },
      personaleServizio: { dettagli: [] },
      metadata: { snapshotStatus: options.closed ? 'CLOSED' : 'OPEN' },
    },
  } as unknown as AppState;
}
const proposal = () => screen.getByTestId('distribution-proposal');
const apply = () => screen.getByRole('button', { name: 'Applica la proposta di riparto' });
const rawInput = (id: string) => document.getElementById(id) as HTMLInputElement;
const expandVariables = () => fireEvent.click(screen.getByRole('button', { name: /Utilizzi Parte Variabile/ }));

beforeEach(() => {
  boundary.dispatch.mockReset();
  boundary.saveState.mockReset().mockResolvedValue({ success: true });
  setup();
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('Distribution explicit draft: real page and external boundaries', () => {
  it('D1: OPEN authoritative proposal on mount writes nothing and does not start distribution', () => {
    const before = structuredClone(boundary.state);
    render(<DistribuzioneRisorsePage />);
    expect(proposal()).toHaveTextContent(formatCurrency(5000));
    expect(apply()).toBeEnabled();
    expect(boundary.dispatch).not.toHaveBeenCalled();
    expect(boundary.saveState).not.toHaveBeenCalled();
    expect(boundary.state).toEqual(before);
    expect(resolveDistributionStatus(boundary.state.fundData.distribuzioneRisorseData)).toBe('NOT_STARTED');
  });
  it('D2: VERIFIED_DRAFT shows an explicit BOZZA simulation without mutations', () => {
    setup({ canonicalFund: { ...canonical(3400), status: 'UNDETERMINED', total: null } });
    render(<DistribuzioneRisorsePage />);
    expect(screen.getByText('Proposta di riparto performance — simulazione BOZZA')).toBeInTheDocument();
    expect(proposal()).toHaveTextContent(formatCurrency(1700));
    expect(proposal()).toHaveTextContent('non attesta la costituzione definitiva');
    expect(boundary.dispatch).not.toHaveBeenCalled();
    fireEvent.click(apply());
    expect(boundary.dispatch).toHaveBeenCalledTimes(1);
    boundary.state = appReducer(boundary.state, boundary.dispatch.mock.calls[0][0]);
    expect(boundary.state.calculationResult?.canonicalFund).toMatchObject({ status: 'UNDETERMINED', total: null });
    expect(resolveDistributionStatus(boundary.state.fundData.distribuzioneRisorseData)).toBe('IN_PROGRESS');
  });
  it('an existing Cabina BLOCKING issue prevents applying the proposal without changing allocations', () => {
    boundary.state.complianceChecks = [{
      id: 'BLOCK', descrizione: 'Verifica non superata', isCompliant: false,
      messaggio: 'Verificare il dato', riferimentoNormativo: 'Norma', gravita: 'error',
      relatedPage: 'fundDetails',
    }];
    const before = structuredClone(boundary.state.fundData);
    render(<DistribuzioneRisorsePage />);
    expect(proposal()).toHaveTextContent(formatCurrency(5000));
    expect(apply()).toBeDisabled();
    expect(proposal()).toHaveTextContent('Risolvere le criticità bloccanti');
    fireEvent.click(apply());
    expect(boundary.dispatch).not.toHaveBeenCalled();
    expect(boundary.saveState).not.toHaveBeenCalled();
    expect(boundary.state.fundData).toEqual(before);
  });
  it('a WARNING alone does not prevent explicit application', () => {
    boundary.state.complianceChecks = [{
      id: 'WARN', descrizione: 'Avviso', isCompliant: false,
      messaggio: 'Verificare il dato', riferimentoNormativo: 'Norma', gravita: 'warning',
    }];
    render(<DistribuzioneRisorsePage />);
    expect(apply()).toBeEnabled();
    expect(boundary.dispatch).not.toHaveBeenCalled();
    fireEvent.click(apply());
    expect(boundary.dispatch).toHaveBeenCalledTimes(1);
  });
  it('D3: UNAVAILABLE shows no numerical proposal or apply action and preserves stored allocations', () => {
    setup({ canonicalFund: null, data: { p_performanceIndividuale: { stanziate: 777 } } });
    const before = structuredClone(boundary.state.fundData);
    render(<DistribuzioneRisorsePage />);
    expect(proposal()).toHaveTextContent('Proposta non disponibile: base canonica assente');
    expect(screen.queryByRole('button', { name: 'Applica la proposta di riparto' })).not.toBeInTheDocument();
    expect(boundary.dispatch).not.toHaveBeenCalled();
    expect(boundary.state.fundData).toEqual(before);
  });
  it('D4: explicit apply emits one update, preserves detail fields and follows the real reducer', () => {
    setup({ personnel: 10, data: {
      criteri_isConsuntivoMode: true,
      p_performanceIndividuale: { stanziate: 123, risparmi: 12, aBilancio: 111 },
      p_performanceOrganizzativa: { stanziate: 456, risparmi: 20 },
    } });
    const canonicalBefore = boundary.state.calculationResult?.canonicalFund;
    render(<DistribuzioneRisorsePage />);
    expect(boundary.dispatch).not.toHaveBeenCalled();
    fireEvent.click(apply());
    expect(boundary.dispatch).toHaveBeenCalledTimes(1);
    const action = boundary.dispatch.mock.calls[0][0];
    expect(action).toEqual({
      type: 'UPDATE_DISTRIBUZIONE_RISORSE_DATA',
      payload: {
        p_performanceIndividuale: { stanziate: 4950, risparmi: 12, aBilancio: 111 },
        p_performanceOrganizzativa: { stanziate: 4950, risparmi: 20 },
        p_maggiorazionePerformanceIndividuale: { stanziate: 100 },
      },
    });
    const next = appReducer(boundary.state, action);
    expect(next.fundData).not.toBe(boundary.state.fundData);
    expect(next.calculationResult?.canonicalFund).toBe(canonicalBefore);
    expect(boundary.saveState).not.toHaveBeenCalled();
  });
  it('D5/D6: manual values survive mount and recalculation while preview changes', () => {
    const data = { p_performanceIndividuale: { stanziate: 123 },
      p_performanceOrganizzativa: { stanziate: 456 }, p_maggiorazionePerformanceIndividuale: { stanziate: 100 } };
    setup({ data });
    const view = render(<DistribuzioneRisorsePage />);
    expandVariables();
    expect(rawInput('p_performanceIndividuale_stanziate')).toHaveValue('123');
    expect(rawInput('p_performanceOrganizzativa_stanziate')).toHaveValue('456');
    expect(proposal()).toHaveTextContent(formatCurrency(4950));
    boundary.state = { ...boundary.state, calculationResult: {
      ...boundary.state.calculationResult!, canonicalFund: canonical(12000),
    } };
    view.rerender(<DistribuzioneRisorsePage />);
    expect(proposal()).toHaveTextContent(formatCurrency(5950));
    expect(rawInput('p_performanceIndividuale_stanziate')).toHaveValue('123');
    expect(rawInput('p_performanceOrganizzativa_stanziate')).toHaveValue('456');
    expect(boundary.dispatch).not.toHaveBeenCalled();
    fireEvent.click(apply());
    expect(boundary.dispatch.mock.calls[0][0].payload.p_performanceIndividuale.stanziate).toBe(5950);
    expect(boundary.dispatch.mock.calls[0][0].payload).not.toHaveProperty('p_maggiorazionePerformanceIndividuale');
  });
  it('D7: CLOSED hides apply and proposal and invokes neither dispatch nor save', () => {
    setup({ closed: true, personnel: 10 });
    render(<DistribuzioneRisorsePage />);
    expect(screen.queryByTestId('distribution-proposal')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Applica la proposta di riparto' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Annualità Chiusa' })).toBeDisabled();
    expect(boundary.dispatch).not.toHaveBeenCalled();
    expect(boundary.saveState).not.toHaveBeenCalled();
  });
  it.each([undefined, null])('P1/P4: personnel %s is missing, not the <=5 band or a zero bonus', personnel => {
    setup({ personnel });
    render(<DistribuzioneRisorsePage />);
    expect(screen.getByTestId('distribution-personnel-missing')).toHaveTextContent('Inserire il dato');
    expect(screen.getByText('Personale mancante: applicabilità Art.48 non determinabile')).toBeInTheDocument();
    expect(screen.queryByText('Non applicabile per enti con dipendenti ≤ 5')).not.toBeInTheDocument();
    expect(within(proposal()).getByText('Non determinato')).toBeInTheDocument();
    expect(rawInput('criteri_percMaggiorazionePremio')).toHaveValue(20);
    expect(rawInput('criteri_percMaggiorazionePremio')).toBeDisabled();
    expect(boundary.dispatch).not.toHaveBeenCalled();
  });
  it('P2: explicit zero is known and uses the previous non-applicable band', () => {
    setup({ personnel: 0 });
    render(<DistribuzioneRisorsePage />);
    expect(screen.queryByTestId('distribution-personnel-missing')).not.toBeInTheDocument();
    expect(screen.getByText('Non applicabile per enti con dipendenti ≤ 5')).toBeInTheDocument();
    expect(rawInput('criteri_percMaggiorazionePremio')).toHaveValue(0);
    expect(proposal()).not.toHaveTextContent('Non determinato');
    expect(boundary.dispatch).not.toHaveBeenCalled();
  });
  it.each([[6, 25], [10, 25], [11, 30]])('P3: positive personnel %s retains minimum %s', (personnel, minimum) => {
    setup({ personnel });
    render(<DistribuzioneRisorsePage />);
    expect(rawInput('criteri_percMaggiorazionePremio')).toBeEnabled();
    expect(screen.getByText(`Il valore non può essere inferiore al ${minimum}% del valore medio pro capite.`)).toBeInTheDocument();
    expect(boundary.dispatch).not.toHaveBeenCalled();
  });
  it('preserves the existing 20% minimum when objectives are selected', () => {
    setup({ personnel: 6, data: { art48_applicaObiettiviEnte: true } });
    render(<DistribuzioneRisorsePage />);
    expect(screen.getByText('Il valore non può essere inferiore al 20% del valore medio pro capite.')).toBeInTheDocument();
    expect(boundary.dispatch).not.toHaveBeenCalled();
  });
  it('P5: later personnel updates only the preview, never existing allocations', () => {
    setup({ data: { p_maggiorazionePerformanceIndividuale: { stanziate: 777 } } });
    const view = render(<DistribuzioneRisorsePage />);
    const before = structuredClone(boundary.state.fundData.distribuzioneRisorseData);
    expect(proposal()).toHaveTextContent('Non determinato');
    boundary.state = { ...boundary.state, fundData: { ...boundary.state.fundData,
      annualData: { ...boundary.state.fundData.annualData, ccnl2024: { personaleInServizio01012026: 10 } },
    } };
    view.rerender(<DistribuzioneRisorsePage />);
    expect(screen.queryByTestId('distribution-personnel-missing')).not.toBeInTheDocument();
    expect(proposal()).toHaveTextContent(formatCurrency(100));
    expect(boundary.state.fundData.distribuzioneRisorseData).toEqual(before);
    expect(boundary.dispatch).not.toHaveBeenCalled();
  });
  it('criterion changes dispatch only the explicit criterion, never performance', () => {
    render(<DistribuzioneRisorsePage />);
    fireEvent.change(rawInput('criteri_percPerfIndividuale'), { target: { value: '30' } });
    expect(boundary.dispatch).toHaveBeenCalledTimes(1);
    expect(boundary.dispatch.mock.calls[0][0]).toEqual({
      type: 'UPDATE_DISTRIBUZIONE_RISORSE_DATA', payload: { criteri_percPerfIndividuale: 30 },
    });
  });
  it('preventivo preserves imported savings on mount; cleanup requires a mode choice', () => {
    setup({ data: { p_performanceIndividuale: { stanziate: 123, risparmi: 12, aBilancio: 111 } } });
    render(<DistribuzioneRisorsePage />);
    expect(boundary.dispatch).not.toHaveBeenCalled();
    const toggle = rawInput('isConsuntivoMode');
    fireEvent.click(toggle);
    expect(boundary.dispatch.mock.calls[0][0].payload).toEqual({ criteri_isConsuntivoMode: true });
    // Apply the explicit mode change using the production reducer, then return to preventivo.
    boundary.state = appReducer(boundary.state, boundary.dispatch.mock.calls[0][0]);
    cleanup();
    boundary.dispatch.mockClear();
    render(<DistribuzioneRisorsePage />);
    fireEvent.click(rawInput('isConsuntivoMode'));
    expect(boundary.dispatch).toHaveBeenCalledTimes(1);
    expect(boundary.dispatch.mock.calls[0][0].payload).toMatchObject({
      criteri_isConsuntivoMode: false,
      p_performanceIndividuale: { stanziate: 123, risparmi: undefined, aBilancio: undefined },
    });
  });

  it('unapplied preview stays clean for the real autosave hook; explicit apply follows normal save', async () => {
    vi.useFakeTimers();
    const initial = boundary.state;
    const before = JSON.stringify(initial.fundData);
    const user = { id: 'local-test' };
    const entity = { id: 'entity-test' };
    const localSources = { existingManualField: 'manual' as const };
    function WithAutosave() {
      const [state, dispatch] = useReducer(appReducer, initial);
      boundary.state = state;
      boundary.dispatch.mockImplementation(dispatch);
      useFundDataAutosave({
        user, currentEntity: entity, currentYear: 2026, fundData: state.fundData,
        hydratedSnapshotKey: 'entity-test:2026', localSources,
        hasPendingDraft: false, saveState: boundary.saveState, debounceMs: 50,
      });
      return <DistribuzioneRisorsePage />;
    }
    render(<WithAutosave />);
    await act(async () => { await vi.advanceTimersByTimeAsync(100); });
    expect(boundary.dispatch).not.toHaveBeenCalled();
    expect(boundary.saveState).not.toHaveBeenCalled();
    expect(JSON.stringify(boundary.state.fundData)).toBe(before);
    fireEvent.click(apply());
    expect(boundary.dispatch).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(boundary.state.fundData)).not.toBe(before);
    await act(async () => { await vi.advanceTimersByTimeAsync(100); });
    expect(boundary.saveState).toHaveBeenCalledTimes(1);
    expect(boundary.saveState.mock.calls[0][0].distribuzioneRisorseData.p_performanceIndividuale.stanziate).toBe(5000);
  });
});
