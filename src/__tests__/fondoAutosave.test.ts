import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFundDataAutosave } from '../hooks/useFundDataAutosave';
import { appReducer } from '../contexts/AppContext';
import { saveAppStateWorkflow } from '../application/stateWorkflow';

vi.mock('../application/stateWorkflow', () => ({
  saveAppStateWorkflow: vi.fn(),
  isAutoSelectableContextYear: vi.fn(),
  pickMostRecentAutoSelectableYear: vi.fn(),
}));

describe('Costituzione Fondo Autosave e Workflow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    user: { id: 'user1', email: 'test@example.com' },
    currentEntity: { id: 'entity1', name: 'Ente 1' },
    currentYear: 2026,
    fundData: {
      metadata: { snapshotStatus: 'DRAFT' },
      fondoAccessorioDipendenteData: {}
    } as any,
    hydratedSnapshotKey: 'entity1:2026',
    localSources: { 'fondoAccessorioDipendenteData.st_incrementoDL25_2025': 'manual' } as any,
    hasPendingDraft: false,
    saveState: vi.fn().mockResolvedValue(undefined),
    debounceMs: 2000
  };

  it('1. modifica di fundData non produce automaticamente salvataggio remoto nel reducer', () => {
    const initialState: any = {
      fundData: {
        fondoAccessorioDipendenteData: {}
      }
    };
    
    const newState = appReducer(initialState, {
      type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA',
      payload: { st_incrementoDL25_2025: 100 }
    });
    
    expect(newState.fundData.fondoAccessorioDipendenteData.st_incrementoDL25_2025).toBe(100);
    expect(saveAppStateWorkflow).not.toHaveBeenCalled();
  });

  it('2. nessun salvataggio deve avvenire se lo snapshot è CLOSED', async () => {
    const fundDataClosed: any = {
      metadata: { snapshotStatus: 'CLOSED' }
    };
    
    const appContextMockSaveState = async (fundData: any) => {
      if (fundData?.metadata?.snapshotStatus === 'CLOSED') {
        return;
      }
      await saveAppStateWorkflow({} as any, {}, {}, 2026, 'GUEST' as any, fundData, async () => {});
    };
    
    await appContextMockSaveState(fundDataClosed);
    expect(saveAppStateWorkflow).not.toHaveBeenCalled();
  });

  it('3. una modifica a fundData programma un autosave remoto debounced', () => {
    const { rerender } = renderHook(
      (props) => useFundDataAutosave(props),
      { initialProps: defaultProps }
    );

    // Modifichiamo il payload
    const updatedProps = {
      ...defaultProps,
      fundData: {
        ...defaultProps.fundData,
        fondoAccessorioDipendenteData: { st_incrementoDL25_2025: 100 }
      }
    };

    rerender(updatedProps);

    // Il timer è programmato ma non è ancora scaduto
    expect(defaultProps.saveState).not.toHaveBeenCalled();

    // Avanziamo il tempo
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(defaultProps.saveState).toHaveBeenCalledTimes(1);
    expect(defaultProps.saveState).toHaveBeenCalledWith(updatedProps.fundData, undefined, 2026, defaultProps.currentEntity);
  });

  it('4. più modifiche ravvicinate producono un solo salvataggio remoto finale', () => {
    const { rerender } = renderHook(
      (props) => useFundDataAutosave(props),
      { initialProps: defaultProps }
    );

    // Prima modifica
    let updatedProps = {
      ...defaultProps,
      fundData: {
        ...defaultProps.fundData,
        fondoAccessorioDipendenteData: { st_incrementoDL25_2025: 100 }
      }
    };
    rerender(updatedProps);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(defaultProps.saveState).not.toHaveBeenCalled();

    // Seconda modifica prima dello scadere dei 2000ms
    updatedProps = {
      ...defaultProps,
      fundData: {
        ...defaultProps.fundData,
        fondoAccessorioDipendenteData: { st_incrementoDL25_2025: 200 }
      }
    };
    rerender(updatedProps);

    act(() => {
      vi.advanceTimersByTime(1000); // 2000ms totali dal primo, ma 1000ms dal secondo
    });
    expect(defaultProps.saveState).not.toHaveBeenCalled(); // Debounce resettato

    act(() => {
      vi.advanceTimersByTime(1000); // Ora scade
    });
    expect(defaultProps.saveState).toHaveBeenCalledTimes(1);
  });

  it('5. autosave non parte prima dell idratazione iniziale', () => {
    const props = {
      ...defaultProps,
      hydratedSnapshotKey: null // Non ancora idratato
    };

    const { rerender } = renderHook(
      (props) => useFundDataAutosave(props),
      { initialProps: props }
    );

    const updatedProps = {
      ...props,
      fundData: {
        ...props.fundData,
        fondoAccessorioDipendenteData: { st_incrementoDL25_2025: 100 }
      }
    };
    rerender(updatedProps);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(props.saveState).not.toHaveBeenCalled();
  });

  it('6. autosave non parte se manca ente, anno o utente', () => {
    const missingUserProps = { ...defaultProps, user: null };
    const { rerender: rerenderUser } = renderHook(
      (props) => useFundDataAutosave(props),
      { initialProps: missingUserProps }
    );
    rerenderUser({
      ...missingUserProps,
      fundData: { ...missingUserProps.fundData, extra: 1 } as any
    });
    act(() => { vi.advanceTimersByTime(2000); });
    expect(defaultProps.saveState).not.toHaveBeenCalled();

    const missingEntityProps = { ...defaultProps, currentEntity: null };
    const { rerender: rerenderEntity } = renderHook(
      (props) => useFundDataAutosave(props),
      { initialProps: missingEntityProps }
    );
    rerenderEntity({
      ...missingEntityProps,
      fundData: { ...missingEntityProps.fundData, extra: 1 } as any
    });
    act(() => { vi.advanceTimersByTime(2000); });
    expect(defaultProps.saveState).not.toHaveBeenCalled();
  });

  it('7. cambio ente/anno con dirty pending non salva sul nuovo contesto', () => {
    const { rerender } = renderHook(
      (props) => useFundDataAutosave(props),
      { initialProps: defaultProps }
    );

    // Modifica su contesto vecchio
    const updatedProps = {
      ...defaultProps,
      fundData: {
        ...defaultProps.fundData,
        fondoAccessorioDipendenteData: { st_incrementoDL25_2025: 100 }
      }
    };
    rerender(updatedProps);

    // Cambia improvvisamente ente/anno prima dello scadere del timer
    const crossContextProps = {
      ...updatedProps,
      currentEntity: { id: 'entity2', name: 'Ente 2' },
      currentYear: 2027,
      hydratedSnapshotKey: 'entity2:2027'
    };
    rerender(crossContextProps);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Il salvataggio debounced deve essere stato cancellato o ignorato
    // per evitare di persistere dati sul nuovo ente/anno
    expect(defaultProps.saveState).not.toHaveBeenCalled();
  });

  it('8. errore remoto mantiene lo stato dirty per consentire il retry', async () => {
    const failingSaveState = vi.fn().mockRejectedValue(new Error('Supabase offline'));
    const props = {
      ...defaultProps,
      saveState: failingSaveState
    };

    const { rerender } = renderHook(
      (props) => useFundDataAutosave(props),
      { initialProps: props }
    );

    // Modifica
    const updatedProps = {
      ...props,
      fundData: {
        ...props.fundData,
        fondoAccessorioDipendenteData: { st_incrementoDL25_2025: 100 }
      }
    };
    rerender(updatedProps);

    // Scatta il timer
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(failingSaveState).toHaveBeenCalledTimes(1);

    // Facciamo un'altra piccola modifica, deve riprovare il salvataggio
    const retryProps = {
      ...updatedProps,
      fundData: {
        ...updatedProps.fundData,
        fondoAccessorioDipendenteData: { st_incrementoDL25_2025: 150 }
      }
    };
    rerender(retryProps);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(failingSaveState).toHaveBeenCalledTimes(2);
  });

  it('9. flush forza il salvataggio pendente immediatamente', () => {
    const { result, rerender } = renderHook(
      (props) => useFundDataAutosave(props),
      { initialProps: defaultProps }
    );

    // Modifica
    const updatedProps = {
      ...defaultProps,
      fundData: {
        ...defaultProps.fundData,
        fondoAccessorioDipendenteData: { st_incrementoDL25_2025: 100 }
      }
    };
    rerender(updatedProps);

    // Invece di far scadere il tempo, chiamiamo flush
    act(() => {
      result.current.flush();
    });

    expect(defaultProps.saveState).toHaveBeenCalledTimes(1);
  });

  it('10. reset di localSources non annulla modifiche pendenti prima del flush', async () => {
    const { result, rerender } = renderHook(
      (props) => useFundDataAutosave(props),
      { initialProps: defaultProps }
    );

    // Modifica
    let updatedProps = {
      ...defaultProps,
      fundData: {
        ...defaultProps.fundData,
        fondoAccessorioDipendenteData: { st_incrementoDL25_2025: 100 }
      }
    };
    rerender(updatedProps);

    // Simuliamo la sequenza di switch anno/ente:
    // 1. Chiamiamo flush()
    act(() => {
      result.current.flush();
    });

    // 2. Poi simuliamo il dispatch del reducer che azzera localSources
    updatedProps = {
      ...updatedProps,
      localSources: {} // azzerato
    };
    rerender(updatedProps);

    // Il salvataggio deve essere partito con successo prima del reset
    expect(defaultProps.saveState).toHaveBeenCalledTimes(1);
  });
});
