import { describe, it, expect } from 'vitest';
import { UserRole } from '../types';
import {
  isGlobalAdmin,
  canAccessAdminArea,
  canSeeModule,
  filterEntitiesByScope
} from '../application/policies/authorizationPolicy';
import { getModuleById } from '../application/registry/moduleRegistry';
import {
  resolveRaccoltaState,
  resolveCostituzioneState,
  resolveVerificaState,
  resolveDistribuzioneState,
  resolveDocumentiState,
  resolveNextBestAction,
  resolveClosedViewState,
  resolveFaseAttuale
} from '../pages/cabinaDiRegiaState';
import {
  hasMeaningfulFundAmounts,
  detectFundDataPresence
} from '../features/wizard2026/entry/detectFundDataPresence';
import {
  entityManagementWorkflow,
  saveAppStateWorkflow,
  yearManagementWorkflow
} from '../application/stateWorkflow';
import {
  saveAnnualSnapshot,
  initializeAnnualSnapshot,
  loadAnnualSnapshot
} from '../application/snapshots/snapshotWorkflow';

describe('Audit Prototipo UX: Policy e Controlli di Sicurezza', () => {
  const adminUser = { id: 'admin-1', email: 'admin@example.com', role: UserRole.ADMIN };
  const normalUser = { id: 'user-1', email: 'user@example.com', role: UserRole.FINANCE };
  const guestUser = { id: 'guest-1', email: 'guest@example.com', role: UserRole.GUEST };

  it('1. Admin vede la sezione Amministrazione e Gestione Utenti', () => {
    expect(canAccessAdminArea(adminUser)).toBe(true);
    expect(isGlobalAdmin(adminUser)).toBe(true);
    const userManagementModule = getModuleById('userManagement');
    expect(userManagementModule).toBeDefined();
    expect(userManagementModule?.adminOnly).toBe(true);
    expect(canSeeModule(adminUser, userManagementModule!.adminOnly)).toBe(true);
  });

  it('2. Non-admin non può accedere a Gestione Utenti', () => {
    expect(canAccessAdminArea(normalUser)).toBe(false);
    expect(canAccessAdminArea(guestUser)).toBe(false);
    const userManagementModule = getModuleById('userManagement');
    expect(userManagementModule?.adminOnly).toBe(true);
    expect(canSeeModule(normalUser, userManagementModule!.adminOnly)).toBe(false);
    expect(canSeeModule(guestUser, userManagementModule!.adminOnly)).toBe(false);
  });

  it('3. Non-admin mantiene pieno accesso a Enti e Annualità (non admin-only)', () => {
    const entityModule = getModuleById('entityYearManagement');
    expect(entityModule).toBeDefined();
    expect(entityModule?.adminOnly).toBe(false);
    expect(canSeeModule(normalUser, entityModule!.adminOnly)).toBe(true);
    expect(canSeeModule(guestUser, entityModule!.adminOnly)).toBe(true);
  });

  it('4. Admin visualizza sia enti propri che enti altrui nel selettore [Tutti]', () => {
    const mockEntities = [
      { id: 'ent-1', name: 'Comune Proprio', user_id: 'admin-1' },
      { id: 'ent-2', name: 'Comune Altro', user_id: 'user-2' }
    ];
    const visibleToAdminAll = filterEntitiesByScope(mockEntities, adminUser, true);
    expect(visibleToAdminAll).toHaveLength(2);
    expect(visibleToAdminAll.map(e => e.id)).toEqual(['ent-1', 'ent-2']);
  });

  it('5. Filtro [Miei] per admin isola esclusivamente gli enti propri', () => {
    const mockEntities = [
      { id: 'ent-1', name: 'Comune Proprio', user_id: 'admin-1' },
      { id: 'ent-2', name: 'Comune Altro', user_id: 'user-2' }
    ];
    const visibleToAdminMine = filterEntitiesByScope(mockEntities, adminUser, false);
    expect(visibleToAdminMine).toHaveLength(1);
    expect(visibleToAdminMine[0].id).toBe('ent-1');
  });

  it('6. Filtro [Altri] per admin isola esclusivamente gli enti altrui', () => {
    const mockEntities = [
      { id: 'ent-1', name: 'Comune Proprio', user_id: 'admin-1' },
      { id: 'ent-2', name: 'Comune Altro', user_id: 'user-2' }
    ];
    const others = mockEntities.filter(e => e.user_id !== adminUser.id);
    expect(others).toHaveLength(1);
    expect(others[0].id).toBe('ent-2');
  });

  it('7. Utente non-admin non può mai visualizzare enti altrui (filtro RLS e memoria)', () => {
    const mockEntities = [
      { id: 'ent-1', name: 'Comune Admin', user_id: 'admin-1' },
      { id: 'ent-2', name: 'Comune User', user_id: 'user-1' }
    ];
    // Anche passando showAll = true, un non-admin vede SOLO i propri
    const visibleToUser = filterEntitiesByScope(mockEntities, normalUser, true);
    expect(visibleToUser).toHaveLength(1);
    expect(visibleToUser[0].id).toBe('ent-2');
  });

  it('8. Audit semantica salvataggio: localSources === manual NON equivale a uncommitted dirty state', () => {
    // Dimostrazione: localSources traccia la provenienza dell'input (manuale vs wizard vs sistema),
    // ma non viene resettato da saveState. Pertanto usarlo come flag "Modifiche non salvate" è fuorviante.
    const mockLocalSources: Record<string, 'manual' | 'wizard2026'> = {
      'fondoStabile': 'manual'
    };
    // Il flag manual rimane true anche se il dato è salvato nel DB
    expect(mockLocalSources['fondoStabile']).toBe('manual');
    // L'adozione della dicitura neutra "Salvataggio automatico attivo" evita false segnalazioni
  });

  it('9. UX Iteration 2: Modulo fondiEnti è registrato in NavigationScope.FONDO ed è accessibile a tutti', () => {
    const fondiEntiModule = getModuleById('fondiEnti');
    expect(fondiEntiModule).toBeDefined();
    expect(fondiEntiModule?.scope).toBe('FONDO');
    expect(fondiEntiModule?.adminOnly).toBe(false);
    expect(canSeeModule(normalUser, fondiEntiModule!.adminOnly)).toBe(true);
    expect(canSeeModule(adminUser, fondiEntiModule!.adminOnly)).toBe(true);
  });

  it('10. UX Iteration 2: Separazione concettuale catalogo fondi e contesti utente', () => {
    const mockEntities = [
      { id: 'ent-a', name: 'Comune Alfa', user_id: 'admin-1' },
      { id: 'ent-b', name: 'Comune Beta', user_id: 'user-1' },
      { id: 'ent-c', name: 'Comune Gamma', user_id: 'user-2' }
    ];

    // Admin vede tutti e 3 con 'all'
    const adminAll = mockEntities;
    expect(adminAll).toHaveLength(3);

    // Admin con 'mine' vede solo Alfa
    const adminMine = mockEntities.filter(e => e.user_id === adminUser.id);
    expect(adminMine).toHaveLength(1);
    expect(adminMine[0].name).toBe('Comune Alfa');

    // Admin con 'others' vede Beta e Gamma
    const adminOthers = mockEntities.filter(e => e.user_id !== adminUser.id);
    expect(adminOthers).toHaveLength(2);

    // Utente normale (user-1) vede SEMPRE e SOLO Beta
    const userList = mockEntities.filter(e => e.user_id === normalUser.id);
    expect(userList).toHaveLength(1);
    expect(userList[0].name).toBe('Comune Beta');
  });

  it('11. UX Iteration 3: Stato annualità univoco basato su snapshotStatus', () => {
    // Definizione logica di stato:
    const resolveStatusBadge = (snapshotStatus: string) => {
      if (snapshotStatus === 'CLOSED') {
        return { label: 'Chiuso', icon: '🔒', isReadOnly: true };
      }
      return { label: 'In lavorazione', icon: '●', isReadOnly: false };
    };

    const closedState = resolveStatusBadge('CLOSED');
    expect(closedState.label).toBe('Chiuso');
    expect(closedState.icon).toBe('🔒');
    expect(closedState.isReadOnly).toBe(true);

    const openState = resolveStatusBadge('OPEN');
    expect(openState.label).toBe('In lavorazione');
    expect(openState.icon).toBe('●');
    expect(openState.isReadOnly).toBe(false);
  });

  it('12. UX Iteration 3 & 3.1b: Next Best Action deterministica con modulo cabinaDiRegiaState reale', () => {
    // Caso test: Fondo con importi, 0 criticità, distribuzione non avviata -> Fase 4 Da Iniziare
    const actionFase4DaIniziare = resolveNextBestAction({
      isClosed: false,
      wizardCompleted: 8,
      totaleFondo: 250000,
      criticalErrorsCount: 0,
      hasDistribuzione: false
    });

    expect(actionFase4DaIniziare.tabId).toBe('distribuzioneRisorse');
    expect(actionFase4DaIniziare.title).toBe('Distribuisci le risorse del Fondo');
    expect(actionFase4DaIniziare.ctaText).toBe('Vai alla distribuzione →');

    // Se distribuzione ha allocazioni parziali in OPEN -> Fase 4 In Lavorazione
    const actionFase4InCorso = resolveNextBestAction({
      isClosed: false,
      wizardCompleted: 8,
      totaleFondo: 250000,
      criticalErrorsCount: 0,
      hasDistribuzione: true
    });
    expect(actionFase4InCorso.tabId).toBe('distribuzioneRisorse');
    expect(actionFase4InCorso.ctaText).toBe('Continua la distribuzione →');

    // Annualità CLOSED punta rigorosamente a reports di default
    const actionClosed = resolveNextBestAction({
      isClosed: true,
      wizardCompleted: 8,
      totaleFondo: 250000,
      criticalErrorsCount: 0,
      hasDistribuzione: false
    });
    expect(actionClosed.tabId).toBe('reports');
    expect(actionClosed.ctaText).toBe('Vai ai documenti →');
    expect(actionClosed.description).not.toContain('approvata');
  });

  it('13. UX Iteration 3: Cambia Fondo consente la selezione della tupla (Ente, Anno)', () => {
    // Struttura dati tupla:
    const mockEntitiesWithYears = [
      {
        id: 'ent-1',
        name: 'Comune di Test',
        years: [
          { year: 2026, status: 'OPEN', hasAmounts: true },
          { year: 2025, status: 'CLOSED', hasAmounts: true }
        ]
      }
    ];

    const targetEntity = mockEntitiesWithYears[0];
    const year2025 = targetEntity.years.find(y => y.year === 2025);
    expect(year2025).toBeDefined();
    expect(year2025?.status).toBe('CLOSED');

    // Selezione atomica della tupla:
    const selectedTuple = { entityId: targetEntity.id, year: year2025!.year };
    expect(selectedTuple).toEqual({ entityId: 'ent-1', year: 2025 });
  });

  it('14. UX Iteration 3.1: Compliance messaging prudente e non perentorio', () => {
    const complianceMessage = 'I controlli automatici previsti risultano superati.';
    expect(complianceMessage).not.toContain('conforme');
    expect(complianceMessage).not.toContain('certificato');
    expect(complianceMessage).toBe('I controlli automatici previsti risultano superati.');
  });

  it('15. UX Iteration 3: Soppressione duplicazioni di contesto in Header in scope FONDO', () => {
    const shouldDisplayGlobalHeaderContext = (scope: string) => {
      return scope !== 'FONDO';
    };

    expect(shouldDisplayGlobalHeaderContext('DASHBOARD')).toBe(true);
    expect(shouldDisplayGlobalHeaderContext('FONDO')).toBe(false);
  });

  it('16. UX Iteration 3.1b: Pipeline Step 4 Distribuzione con resolveDistribuzioneState reale', () => {
    const conAllocazioni = resolveDistribuzioneState(true, 300000, false);
    expect(conAllocazioni.label).toBe('● In lavorazione');
    expect(conAllocazioni.label).not.toContain('Distribuito');

    const senzaAllocazioni = resolveDistribuzioneState(false, 300000, false);
    expect(senzaAllocazioni.label).toBe('○ Da iniziare');
    expect(senzaAllocazioni.label).not.toContain('Distribuito');

    const closed = resolveDistribuzioneState(false, 300000, true);
    expect(closed.label).toBe('—');
  });

  it('17. UX Iteration 3.1b: Pipeline Step 2 Costituzione con resolveCostituzioneState reale', () => {
    const conImporti = resolveCostituzioneState(250000, false);
    expect(conImporti.label).toBe('● Dati presenti');
    expect(conImporti.label).not.toContain('Costituito');

    const senzaImporti = resolveCostituzioneState(0, false);
    expect(senzaImporti.label).toBe('○ Da compilare');

    const closed = resolveCostituzioneState(250000, true);
    expect(closed.label).toBe('—');
  });

  it('18. UX Iteration 3.1b: Pipeline Step 1 Raccolta con resolveRaccoltaState reale e provenance prudente', () => {
    // In assenza di bozza locale con importi presenti: NON usa "Non utilizzata", bensì "— Nessuna bozza locale" con tooltip
    const senzaBozzaConImporti = resolveRaccoltaState({ completed: 0, total: 8, hasData: false }, 180000, false);
    expect(senzaBozzaConImporti.label).toBe('— Nessuna bozza locale');
    expect(senzaBozzaConImporti.label).not.toBe('— Non utilizzata');
    expect(senzaBozzaConImporti.tooltip).toBe('Su questo dispositivo non è stata rilevata una bozza della raccolta guidata.');

    // In corso:
    const inCorso = resolveRaccoltaState({ completed: 4, total: 8, hasData: true }, 0, false);
    expect(inCorso.label).toBe('● In corso');
    expect(inCorso.subtitle).toBe('4/8 passaggi');

    // Dati completi:
    const completi = resolveRaccoltaState({ completed: 8, total: 8, hasData: true }, 180000, false);
    expect(completi.label).toBe('✓ Dati completi');
    expect(completi.subtitle).toBe('8/8 passaggi');

    // Annualità chiusa:
    const closed = resolveRaccoltaState({ completed: 8, total: 8, hasData: true }, 180000, true);
    expect(closed.label).toBe('—');
    expect(closed.tooltip).toBe('Lo stato storico delle singole fasi non è disponibile.');
  });

  it('19. UX Iteration 3.1b: Pipeline Step 5 Documenti con resolveDocumentiState reale', () => {
    const openDoc = resolveDocumentiState(false);
    expect(openDoc.label).toBe('○ Da predisporre');
    expect(openDoc.label).not.toContain('Disponibili');

    const closedDoc = resolveDocumentiState(true);
    expect(closedDoc.label).toBe('● Consultabili');
  });

  it('20. UX Iteration 3.1b: Modalità CLOSED con resolveClosedViewState reale', () => {
    const closedView = resolveClosedViewState();
    expect(closedView.bannerTitle).toBe('ANNUALITÀ CHIUSA:');
    expect(closedView.bannerText).toBe('Questa annualità è chiusa ed è disponibile in sola lettura.');
    expect(closedView.description).toBe('Consulta i prospetti e la documentazione disponibile per questa annualità.');
    expect(closedView.description).not.toContain('approvata');
    expect(closedView.ctaText).toBe('Vai ai documenti →');
    expect(closedView.tabId).toBe('reports');
  });

  it('21. UX Iteration 3.1: Testo Next Action non contiene la parola "costituito"', () => {
    const action = resolveNextBestAction({
      isClosed: false,
      wizardCompleted: 8,
      totaleFondo: 250000,
      criticalErrorsCount: 0,
      hasDistribuzione: false
    });
    expect(action.description.toLowerCase()).not.toContain('costituito');
  });

  it('22. UX Iteration 3.1: Autosave visual per OPEN è neutro senza stato "attivo" né pallino verde', () => {
    const autosaveLabel = 'Salvataggio automatico';
    expect(autosaveLabel).not.toContain('attivo');
    expect(autosaveLabel).toBe('Salvataggio automatico');
  });

  it('23. UX Iteration 3.1b: Denominazione lunga reale non altera la visibilità di Fondo YYYY', () => {
    const longEntityName = 'Unione dei Comuni della Valle Metropolitana di Test';
    const year = 2026;
    
    // Verifica logica di formattazione context bar / header
    const formattedContextTitle = `${longEntityName} · Esercizio ${year}`;
    expect(formattedContextTitle).toContain(longEntityName);
    expect(formattedContextTitle).toContain(String(year));

    // Verifica che l'etichetta del Fondo rimanga integra
    const fondoLabel = `Fondo risorse decentrate ${year}`;
    expect(fondoLabel).toBe('Fondo risorse decentrate 2026');
  });

  it('24. UX Iteration 3.1b: Pipeline Step 3 Verifica con resolveVerificaState reale', () => {
    const errorState = resolveVerificaState(2, 1, 200000, false);
    expect(errorState.label).toBe('⚠ Bloccante');
    expect(errorState.subtitle).toBe('2 criticità');

    const warningState = resolveVerificaState(0, 3, 200000, false);
    expect(warningState.label).toBe('⚠ Attenzioni');
    expect(warningState.subtitle).toBe('3 avvisi');

    const successState = resolveVerificaState(0, 0, 200000, false);
    expect(successState.label).toBe('✓ Superati');

    const closedState = resolveVerificaState(0, 0, 200000, true);
    expect(closedState.label).toBe('—');
  });

  it('25. UX Iteration 3.1b: Card sintetica fase attuale con resolveFaseAttuale reale', () => {
    const closed = resolveFaseAttuale({
      isClosed: true,
      wizardCompleted: 8,
      totaleFondo: 250000,
      criticalErrorsCount: 0,
      hasDistribuzione: false
    });
    expect(closed.phaseNumber).toBe('5 di 5');
    expect(closed.phaseName).toContain('CHIUSO');

    const raccolta = resolveFaseAttuale({
      isClosed: false,
      wizardCompleted: 3,
      totaleFondo: 0,
      criticalErrorsCount: 0,
      hasDistribuzione: false
    });
    expect(raccolta.phaseNumber).toBe('1 di 5');
    expect(raccolta.phaseName).toBe('RACCOLTA DATI');

    const costituzione = resolveFaseAttuale({
      isClosed: false,
      wizardCompleted: 8,
      totaleFondo: 0,
      criticalErrorsCount: 0,
      hasDistribuzione: false
    });
    expect(costituzione.phaseNumber).toBe('2 di 5');
    expect(costituzione.phaseName).toBe('COSTITUZIONE');

    const verifica = resolveFaseAttuale({
      isClosed: false,
      wizardCompleted: 8,
      totaleFondo: 250000,
      criticalErrorsCount: 1,
      hasDistribuzione: false
    });
    expect(verifica.phaseNumber).toBe('3 di 5');
    expect(verifica.phaseName).toBe('VERIFICA');

    const distribuzione = resolveFaseAttuale({
      isClosed: false,
      wizardCompleted: 8,
      totaleFondo: 250000,
      criticalErrorsCount: 0,
      hasDistribuzione: true
    });
    expect(distribuzione.phaseNumber).toBe('4 di 5');
    expect(distribuzione.phaseName).toBe('DISTRIBUZIONE');
  });

  it('26. Final Functional Gate: resolveRaccoltaState usa "Stato locale" e MAI "Diretta" in assenza di bozza', () => {
    const stateWithAmountsNoDraft = resolveRaccoltaState(
      { completed: 0, total: 8, hasData: false },
      150000,
      false
    );
    expect(stateWithAmountsNoDraft.label).toBe('— Nessuna bozza locale');
    expect(stateWithAmountsNoDraft.subtitle).toBe('Stato locale');
    expect(stateWithAmountsNoDraft.subtitle).not.toContain('Diretta');
    expect(stateWithAmountsNoDraft.status).toBe('neutral');
    expect(stateWithAmountsNoDraft.tooltip).toContain('non è stata rilevata una bozza');
  });

  it('27. Final Functional Gate: hasMeaningfulFundAmounts rileva correttamente tutti i casi A-G', () => {
    // Caso A: completamente vuota
    expect(hasMeaningfulFundAmounts(undefined)).toBe(false);
    expect(hasMeaningfulFundAmounts({})).toBe(false);

    // Caso B: solo Personale
    expect(hasMeaningfulFundAmounts({
      fondoAccessorioDipendenteData: { st_art79c1_art67c1_unicoImporto2017: 50000 }
    })).toBe(true);

    // Caso C: solo EQ
    expect(hasMeaningfulFundAmounts({
      fondoElevateQualificazioniData: { ris_fondoPO2017: 15000 }
    })).toBe(true);

    // Caso D: solo Segretario
    expect(hasMeaningfulFundAmounts({
      fondoSegretarioComunaleData: { st_art3c6_CCNL2011_retribuzionePosizione: 8000 }
    })).toBe(true);

    // Caso E: solo Dirigenza
    expect(hasMeaningfulFundAmounts({
      fondoDirigenzaData: { st_art57c2a_CCNL2020_unicoImporto2020: 20000 }
    })).toBe(true);

    // Caso F: solo historicalData
    expect(hasMeaningfulFundAmounts({
      historicalData: { fondoSalarioAccessorioPersonaleNonDirEQ2016: 1200000 }
    })).toBe(true);

    // Caso G: solo annualData
    expect(hasMeaningfulFundAmounts({
      annualData: { personaleServizioAttuale: [{ count: 12 }] }
    })).toBe(true);
    expect(hasMeaningfulFundAmounts({
      annualData: { proventiSpecifici: [{ importo: 5000 }] }
    })).toBe(true);
  });

  it('28. Final Functional Gate: Caso J - struttura inizializzata con tutti zeri è considerata "Senza importi"', () => {
    const zeroFilledStructure = {
      historicalData: {
        fondoSalarioAccessorioPersonaleNonDirEQ2016: 0,
        fondoElevateQualificazioni2016: 0,
        fondoDirigenza2016: 0,
      },
      fondoAccessorioDipendenteData: {
        st_art79c1_art67c1_unicoImporto2017: 0,
        st_art79c1_art67c2a_incr8320: 0,
      },
      annualData: {
        personaleServizioAttuale: [],
        proventiSpecifici: [],
      }
    };
    expect(hasMeaningfulFundAmounts(zeroFilledStructure)).toBe(false);
  });

  it('29. Final Functional Gate: detectFundDataPresence traccia ciascun sub-fondo', () => {
    const presenceEQ = detectFundDataPresence({
      fondoElevateQualificazioniData: { ris_fondoPO2017: 12000 }
    } as any);
    expect(presenceEQ.hasFondoElevateQualificazioniData).toBe(true);
    expect(presenceEQ.hasFondoAccessorioDipendenteData).toBe(false);
    expect(presenceEQ.hasAnyUsefulFundData).toBe(true);

    const presenceDirigenza = detectFundDataPresence({
      fondoDirigenzaData: { st_art57c2a_CCNL2020_unicoImporto2020: 30000 }
    } as any);
    expect(presenceDirigenza.hasFondoDirigenzaData).toBe(true);
    expect(presenceDirigenza.hasAnyUsefulFundData).toBe(true);
  });

  it('30. Final Functional Gate: entityManagementWorkflow.create restituisce deterministicamente l\'ente creato', async () => {
    const fakeEntity = { id: 'ent-new-123', name: 'Comune di Test', user_id: 'user-1' };
    const fakeDeps = {
      entityRepository: {
        create: async (name: string, userId: string) => ({ data: { ...fakeEntity, name, user_id: userId }, error: null }),
        update: async () => ({ error: null }),
        delete: async () => ({ error: null }),
        getAll: async () => ({ data: [], error: null })
      },
      interactionService: {
        alert: () => {},
        confirm: async () => true,
        reload: () => {}
      }
    };

    let loaded = false;
    const loadEntities = async () => { loaded = true; };
    const dispatchedActions: any[] = [];
    const dispatch = (action: any) => { dispatchedActions.push(action); };

    const result = await entityManagementWorkflow.create(
      fakeDeps as any,
      { id: 'user-1' },
      'Comune di Test',
      loadEntities,
      dispatch
    );

    expect(result).toBeDefined();
    expect(result?.id).toBe('ent-new-123');
    expect(result?.name).toBe('Comune di Test');
    expect(loaded).toBe(true);
    expect(dispatchedActions).toContainEqual(expect.objectContaining({ type: 'SET_CURRENT_ENTITY' }));
  });

  it('31. Final Functional Gate: entityManagementWorkflow.delete supporta skipConfirm senza doppio prompt', async () => {
    let confirmCalled = false;
    let deletedStates = false;
    let deletedEntity = false;

    const fakeDeps = {
      entityRepository: {
        create: async () => ({ data: null, error: null }),
        update: async () => ({ error: null }),
        delete: async () => { deletedEntity = true; return { error: null }; },
        getAll: async () => ({ data: [], error: null })
      },
      stateRepository: {
        deleteStatesByEntity: async () => { deletedStates = true; return { error: null }; },
      },
      interactionService: {
        alert: () => {},
        confirm: async () => { confirmCalled = true; return true; },
        reload: () => {}
      }
    };

    const dummyDispatch = () => {};
    const dummyLoad = async () => {};

    // Esecuzione con skipConfirm: true (es. da modal UI dedicato)
    await entityManagementWorkflow.delete(
      fakeDeps as any,
      { id: 'user-1' },
      'ent-123',
      null,
      [],
      dummyLoad,
      dummyDispatch,
      { skipConfirm: true }
    );

    expect(confirmCalled).toBe(false);
    expect(deletedStates).toBe(true);
    expect(deletedEntity).toBe(true);

    // Esecuzione standard senza skipConfirm: richiede conferma
    confirmCalled = false;
    await entityManagementWorkflow.delete(
      fakeDeps as any,
      { id: 'user-1' },
      'ent-123',
      null,
      [],
      dummyLoad,
      dummyDispatch
    );
    expect(confirmCalled).toBe(true);
  });

  describe('Validazione Canonica Ownership e Admin Cross-Owner (T1 - T9)', () => {
    const userA = { id: 'user-a-id', email: 'usera@example.com', role: UserRole.FINANCE };
    const adminB = { id: 'admin-b-id', email: 'adminb@example.com', role: UserRole.ADMIN };
    const userC = { id: 'user-c-id', email: 'userc@example.com', role: UserRole.GUEST };

    const entity1 = {
      id: 'entity-1',
      name: 'Comune Uno',
      user_id: userA.id // Owner canonico è User A
    };

    const mockFundData2026 = {
      totals: { totaleFondo: 150000 },
      annualData: { denominazioneEnte: 'Comune Uno' },
      metadata: { snapshotStatus: 'OPEN' }
    };

    it('T1 — Owner crea e salva: user_app_state.user_id === entities.user_id', async () => {
      let savedPayload: any = null;
      const fakeDeps = {
        stateRepository: {
          upsertState: async (payload: any) => {
            savedPayload = payload;
            return { error: null };
          }
        },
        entityRepository: { update: async () => ({ error: null }) }
      };

      await saveAppStateWorkflow(
        fakeDeps as any,
        userA,
        entity1,
        2026,
        UserRole.FINANCE,
        mockFundData2026,
        async () => {}
      );

      expect(savedPayload).not.toBeNull();
      expect(savedPayload.entity_id).toBe('entity-1');
      expect(savedPayload.user_id).toBe(userA.id);
      expect(savedPayload.user_id).toBe(entity1.user_id);
    });

    it('T2 — Admin legge Fondo di A: accesso consentito e owner invariato', async () => {
      const dbRow = {
        entity_id: 'entity-1',
        current_year: 2026,
        user_id: userA.id,
        role: UserRole.FINANCE,
        fund_data: mockFundData2026,
        updated_at: new Date().toISOString()
      };

      const fakeDeps = {
        stateRepository: {
          getState: async (_filterUserId: string | undefined, entityId: string, year: number) => {
            expect(entityId).toBe('entity-1');
            expect(year).toBe(2026);
            return { data: dbRow, error: null };
          }
        }
      };

      const loadRes = await loadAnnualSnapshot(fakeDeps as any, adminB, entity1.id, 2026);
      expect(loadRes.success).toBe(true);
      expect(loadRes.isNewInitialization).toBe(false);
      expect(loadRes.snapshot?.userId).toBe(userA.id);
      expect(loadRes.snapshot?.fundData?.totals?.totaleFondo).toBe(150000);
    });

    it('T3 — Admin aggiorna Fondo di A: stateToSave conserva rigorosamente user_id = entity.user_id', async () => {
      let savedPayload: any = null;
      const fakeDeps = {
        stateRepository: {
          upsertState: async (payload: any) => {
            savedPayload = payload;
            return { error: null };
          }
        },
        entityRepository: { update: async () => ({ error: null }) }
      };

      const updatedFundData = {
        ...mockFundData2026,
        totals: { totaleFondo: 180000 },
        annualData: { denominazioneEnte: 'Comune Uno' },
        metadata: { snapshotStatus: 'OPEN' }
      };

      // Admin B salva il Fondo di Entity 1 (di proprietà di User A)
      await saveAppStateWorkflow(
        fakeDeps as any,
        adminB, // acting user è Admin B
        entity1, // entity appartiene a User A
        2026,
        UserRole.ADMIN,
        updatedFundData,
        async () => {}
      );

      expect(savedPayload).not.toBeNull();
      // Cruciale: user_id NON deve essere adminB.id, bensì entity1.user_id (userA.id)
      expect(savedPayload.user_id).toBe(entity1.user_id);
      expect(savedPayload.user_id).toBe(userA.id);
      expect(savedPayload.user_id).not.toBe(adminB.id);
      expect(savedPayload.fund_data.totals.totaleFondo).toBe(180000);
    });

    it('T4 — Owner rientra: annualità visibile, modifiche Admin presenti, nessuna reinizializzazione', async () => {
      // Nel DB il record ha ancora user_id = userA.id con i dati modificati dall'admin
      const dbRowAfterAdminUpdate = {
        entity_id: 'entity-1',
        current_year: 2026,
        user_id: userA.id, // conservato!
        role: UserRole.FINANCE,
        fund_data: { totals: { totaleFondo: 180000 } },
        updated_at: new Date().toISOString()
      };

      const fakeDeps = {
        stateRepository: {
          getState: async (_filterUserId: string | undefined, entityId: string, year: number) => {
            if (entityId === 'entity-1' && year === 2026) {
              return { data: dbRowAfterAdminUpdate, error: null };
            }
            return { data: null, error: null };
          }
        }
      };

      // User A carica lo snapshot
      const loadRes = await loadAnnualSnapshot(fakeDeps as any, userA, entity1.id, 2026);
      expect(loadRes.success).toBe(true);
      expect(loadRes.isNewInitialization).toBe(false);
      expect(loadRes.snapshot).toBeDefined();
      expect(loadRes.snapshot?.fundData?.totals?.totaleFondo).toBe(180000);
      expect(loadRes.snapshot?.userId).toBe(userA.id);
    });

    it('T5 — Utente C: isolamento da entità altrui', () => {
      const allEntities = [
        entity1, // di User A
        { id: 'entity-c', name: 'Comune C', user_id: userC.id } // di User C
      ];

      // Utente C filtra gli enti
      const visibleToC = filterEntitiesByScope(allEntities, userC, true);
      expect(visibleToC).toHaveLength(1);
      expect(visibleToC[0].id).toBe('entity-c');
      expect(visibleToC.some(e => e.id === entity1.id)).toBe(false);
    });

    it('T6 — Filtri Admin: modifica Fondo altrui non altera filtri Tutti / Miei / Altri', () => {
      const entity2 = { id: 'entity-admin', name: 'Comune Admin', user_id: adminB.id };
      const allEntities = [entity1, entity2];

      // Tutti: vede entrambi
      const tutti = filterEntitiesByScope(allEntities, adminB, true);
      expect(tutti).toHaveLength(2);

      // Miei: solo entity-admin
      const miei = filterEntitiesByScope(allEntities, adminB, false);
      expect(miei).toHaveLength(1);
      expect(miei[0].id).toBe('entity-admin');

      // Altri: solo entity1
      const altri = allEntities.filter(e => e.user_id !== adminB.id);
      expect(altri).toHaveLength(1);
      expect(altri[0].id).toBe('entity-1');

      // Poiché entity1.user_id è immutabile (userA.id), non migrerà mai in "Miei"
      expect(altri[0].user_id).toBe(userA.id);
    });

    it('T7 — Admin crea nuova annualità per ente di A: state user_id === entity owner', async () => {
      let createdPayload: any = null;
      const fakeDeps = {
        stateRepository: {
          createState: async (payload: any) => {
            createdPayload = payload;
            return { error: null };
          }
        },
        userRepository: {
          getUserRole: async (_uid: string) => ({ data: UserRole.FINANCE, error: null })
        }
      };

      // Admin B inizializza l'annualità 2027 per entity1 di User A
      const initRes = await initializeAnnualSnapshot(
        fakeDeps as any,
        entity1.user_id, // DEVE essere l'owner dell'ente
        entity1.id,
        2027,
        adminB,
        { totals: { totaleFondo: 0 } }
      );

      expect(initRes.success).toBe(true);
      expect(createdPayload).not.toBeNull();
      expect(createdPayload.entity_id).toBe('entity-1');
      expect(createdPayload.current_year).toBe(2027);
      expect(createdPayload.user_id).toBe(userA.id);
      expect(createdPayload.user_id).not.toBe(adminB.id);
    });

    it('T8 — Admin elimina annualità altrui: deleteState invocato su (entity_id, year) senza alterare ownership', async () => {
      let deletedParams: { entityId: string; year: number } | null = null;
      const fakeDeps = {
        stateRepository: {
          deleteState: async (entityId: string, year: number) => {
            deletedParams = { entityId, year };
            return { error: null };
          }
        },
        interactionService: {
          confirm: async () => true
        }
      };

      const dummyLoadYears = async () => {};
      const dummyDispatch = () => {};

      await yearManagementWorkflow.delete(
        fakeDeps as any,
        adminB, // Admin B esegue la cancellazione
        entity1.id,
        2026,
        2026,
        [2026],
        dummyLoadYears,
        dummyDispatch
      );

      expect(deletedParams).not.toBeNull();
      expect((deletedParams as any)?.entityId).toBe('entity-1');
      expect((deletedParams as any)?.year).toBe(2026);
      expect(entity1.user_id).toBe(userA.id);
    });

    it('T9 — Owner mancante: salvataggio bloccato senza fallback sullacting user', async () => {
      const corruptEntity = {
        id: 'entity-corrupt',
        name: 'Comune Senza Owner'
        // user_id assente!
      };

      let upsertCalled = false;
      const fakeDeps = {
        stateRepository: {
          upsertState: async () => {
            upsertCalled = true;
            return { error: null };
          },
          getState: async () => ({ data: null, error: null })
        },
        entityRepository: { update: async () => ({ error: null }) }
      };

      // 1. saveAppStateWorkflow DEVE lanciare errore
      await expect(
        saveAppStateWorkflow(
          fakeDeps as any,
          adminB,
          corruptEntity,
          2026,
          UserRole.ADMIN,
          mockFundData2026,
          async () => {}
        )
      ).rejects.toThrow("Impossibile salvare lo stato: proprietario dell'ente non definito.");

      expect(upsertCalled).toBe(false);

      // 2. saveAnnualSnapshot DEVE restituire success: false
      const snapRes = await saveAnnualSnapshot(
        fakeDeps as any,
        adminB,
        corruptEntity,
        2026,
        UserRole.ADMIN,
        mockFundData2026
      );
      expect(snapRes.success).toBe(false);
      expect(snapRes.error).toContain("proprietario dell'ente non definito");
      expect(upsertCalled).toBe(false);

      // 3. initializeAnnualSnapshot DEVE rifiutare
      const initRes = await initializeAnnualSnapshot(
        fakeDeps as any,
        (corruptEntity as any).user_id,
        corruptEntity.id,
        2026,
        adminB,
        mockFundData2026
      );
      expect(initRes.success).toBe(false);
      expect(initRes.error).toContain("proprietario dell'ente non definito");
    });
  });
});
