import { describe, it, expect } from 'vitest';
import { 
  getModuleAccessInfo, 
  getVisibleModules, 
  getAccessibleModuleOrFallback,
  getModuleById
} from '../registry/moduleRegistry';
import { UserRole, User } from '../../types';

describe('Matrice Accesso Moduli (Regression Guard)', () => {
  const adminUser: User = { id: 'admin-1', name: 'Admin', role: UserRole.ADMIN };
  const guestUser: User = { id: 'guest-1', name: 'Guest', role: UserRole.GUEST };

  describe('Visible Modules (GUEST)', () => {
    it('deve includere "messages" (Comunicazioni) per GUEST', () => {
      const visible = getVisibleModules(guestUser);
      const hasMessages = visible.some(m => m.id === 'messages');
      expect(hasMessages).toBe(true);
    });

    it('NON deve includere "userManagement" per GUEST', () => {
      const visible = getVisibleModules(guestUser);
      const hasUserMgmt = visible.some(m => m.id === 'userManagement');
      expect(hasUserMgmt).toBe(false);
    });

    it('NON deve includere "dataEntry" legacy', () => {
      const visible = getVisibleModules(guestUser, { hasEntity: true });
      const dataEntry = visible.find(m => m.id === 'dataEntry');
      expect(dataEntry).toBeUndefined();
    });

    it('deve includere "wizard2026Preview" (Configurazione fondo)', () => {
      const visible = getVisibleModules(guestUser, { hasEntity: true });
      const wizard = visible.find(m => m.id === 'wizard2026Preview');
      expect(wizard).toBeDefined();
    });

    it('NON deve includere "fondoDirigenza" se hasDirigenza è false', () => {
      const visible = getVisibleModules(guestUser, { hasDirigenza: false });
      const hasDirigenzaMod = visible.some(m => m.id === 'fondoDirigenza');
      expect(hasDirigenzaMod).toBe(false);
    });
  });

  describe('Module State (Access Info)', () => {
    const userManagement = getModuleById('userManagement')!;
    const wizard2026 = getModuleById('wizard2026Preview')!;

    it('wizard2026Preview deve essere disabled se manca ente', () => {
      const info = getModuleAccessInfo(wizard2026, guestUser, { hasEntity: false });
      expect(info.isVisible).toBe(true);
      expect(info.isAccessible).toBe(false);
      expect(info.isDisabled).toBe(true);
      expect(info.disabledReason).toBeDefined();
    });

    it('wizard2026Preview deve essere abilitato se ente presente', () => {
      const info = getModuleAccessInfo(wizard2026, guestUser, { hasEntity: true });
      expect(info.isAccessible).toBe(true);
      expect(info.isDisabled).toBe(false);
    });

    it('userManagement deve essere nascosto per GUEST', () => {
      const info = getModuleAccessInfo(userManagement, guestUser);
      expect(info.isVisible).toBe(false);
      expect(info.isAccessible).toBe(false);
    });

    it('userManagement deve essere visibile e accessibile per ADMIN', () => {
      const info = getModuleAccessInfo(userManagement, adminUser);
      expect(info.isVisible).toBe(true);
      expect(info.isAccessible).toBe(true);
    });
  });

  describe('Fallback Logic (Security)', () => {
    const userManagement = getModuleById('userManagement')!;
    const messages = getModuleById('messages')!;

    it('restituisce dashboard se il modulo è null', () => {
      const fallback = getAccessibleModuleOrFallback(undefined, guestUser);
      expect(fallback.id).toBe('dashboard');
    });

    it('restituisce dashboard se GUEST tenta di accedere a userManagement', () => {
      const fallback = getAccessibleModuleOrFallback(userManagement, guestUser);
      expect(fallback.id).toBe('dashboard');
    });

    it('restituisce il modulo stesso se GUEST accede a messages', () => {
      const fallback = getAccessibleModuleOrFallback(messages, guestUser);
      expect(fallback.id).toBe('messages');
    });
  });
});
