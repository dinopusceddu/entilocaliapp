import { describe, expect, it, vi } from 'vitest';
import {
  hasRecoverableWizardContext,
  isFondoPreviewPath,
  shouldDeferWizardAccessFallback,
  shouldReplaceWizardRoute,
  shouldSyncFondoPreviewRoute
} from '../App';
import { NavigationScope } from '../types';

const storageWith = (entries: Record<string, string | null>) => ({
  getItem: vi.fn((key: string) => entries[key] ?? null)
});

describe('App Wizard 2026 routing guards', () => {
  it('riconosce preview e subroute raccolta dati senza collassarle', () => {
    expect(isFondoPreviewPath('/configurazione-fondo-preview')).toBe(true);
    expect(isFondoPreviewPath('/configurazione-fondo-preview/raccolta-dati')).toBe(true);
    expect(isFondoPreviewPath('/configurazione-fondo-preview/altro')).toBe(true);
    expect(isFondoPreviewPath('/configurazione-fondo-preview-old')).toBe(false);
    expect(isFondoPreviewPath('/')).toBe(false);
  });

  it('riconosce un contesto Wizard recuperabile da fl_last_context utente', () => {
    const storage = storageWith({
      fl_last_context_u1: JSON.stringify({ entityId: 'e1', year: 2026 })
    });

    expect(hasRecoverableWizardContext('u1', storage)).toBe(true);
    expect(storage.getItem).toHaveBeenCalledWith('fl_last_context_u1');
  });

  it('non considera recuperabile un contesto assente o corrotto', () => {
    expect(hasRecoverableWizardContext('u1', storageWith({}))).toBe(false);
    expect(hasRecoverableWizardContext('u1', storageWith({ fl_last_context_u1: '{' }))).toBe(false);
    expect(hasRecoverableWizardContext(undefined, storageWith({}))).toBe(false);
  });

  it('evita il fallback a dashboard durante idratazione se il Wizard ha un contesto recuperabile', () => {
    const storage = storageWith({
      fl_last_context_u1: JSON.stringify({ entityId: 'e1', year: 2026 })
    });

    expect(shouldDeferWizardAccessFallback({
      activeTab: 'wizard2026Preview',
      pathname: '/configurazione-fondo-preview/raccolta-dati',
      hasEntity: false,
      userId: 'u1',
      storage
    })).toBe(true);
  });

  it('evita il fallback a dashboard durante il caricamento anche prima del ripristino ente', () => {
    expect(shouldDeferWizardAccessFallback({
      activeTab: 'wizard2026Preview',
      pathname: '/configurazione-fondo-preview/raccolta-dati',
      hasEntity: false,
      isLoading: true,
      userId: 'u1',
      storage: storageWith({})
    })).toBe(true);
  });

  it('non differisce il fallback fuori dalla route Wizard o quando lo stato e gia coerente', () => {
    const storage = storageWith({
      fl_last_context_u1: JSON.stringify({ entityId: 'e1', year: 2026 })
    });

    expect(shouldDeferWizardAccessFallback({
      activeTab: 'dashboard',
      pathname: '/configurazione-fondo-preview/raccolta-dati',
      hasEntity: false,
      userId: 'u1',
      storage
    })).toBe(false);

    expect(shouldDeferWizardAccessFallback({
      activeTab: 'wizard2026Preview',
      pathname: '/',
      hasEntity: false,
      userId: 'u1',
      storage
    })).toBe(false);

    expect(shouldDeferWizardAccessFallback({
      activeTab: 'wizard2026Preview',
      pathname: '/configurazione-fondo-preview/raccolta-dati',
      hasEntity: true,
      userId: 'u1',
      storage
    })).toBe(false);
  });

  it('sincronizza una subroute preview solo quando activeTab o scope non sono coerenti', () => {
    expect(shouldSyncFondoPreviewRoute({
      pathname: '/configurazione-fondo-preview/raccolta-dati',
      activeTab: 'dashboard',
      navigationScope: NavigationScope.DASHBOARD
    })).toBe(true);

    expect(shouldSyncFondoPreviewRoute({
      pathname: '/configurazione-fondo-preview/raccolta-dati',
      activeTab: 'wizard2026Preview',
      navigationScope: NavigationScope.FONDO
    })).toBe(false);
  });

  it('non richiede replaceState quando il path e gia sotto configurazione-fondo-preview', () => {
    expect(shouldReplaceWizardRoute({
      pathname: '/configurazione-fondo-preview/raccolta-dati',
      activeTab: 'wizard2026Preview'
    })).toBe(false);

    expect(shouldReplaceWizardRoute({
      pathname: '/',
      activeTab: 'wizard2026Preview'
    })).toBe(true);
  });
});
