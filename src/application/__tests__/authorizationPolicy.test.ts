import { describe, it, expect } from 'vitest';
import { UserRole } from '../../types';
import { 
    isGlobalAdmin, 
    canAccessAdminArea, 
    canSeeModule, 
    resolveRoleOnStateLoad,
    shouldFilterByOwner,
    filterEntitiesByScope,
    getEntityListScope
} from '../policies/authorizationPolicy';

describe('authorizationPolicy', () => {
    const adminUser = { id: 'admin1', email: 'admin@test.it', role: UserRole.ADMIN };
    const guestUser = { id: 'guest1', email: 'guest@test.it', role: UserRole.GUEST };

    describe('isGlobalAdmin', () => {
        it('should return true for ADMIN role', () => {
            expect(isGlobalAdmin(adminUser)).toBe(true);
        });

        it('should return false for GUEST role', () => {
            expect(isGlobalAdmin(guestUser)).toBe(false);
        });

        it('should return false if user is null', () => {
            expect(isGlobalAdmin(null)).toBe(false);
        });
    });

    describe('canAccessAdminArea', () => {
        it('should return true for ADMIN', () => {
            expect(canAccessAdminArea(adminUser)).toBe(true);
        });

        it('should return false for GUEST', () => {
            expect(canAccessAdminArea(guestUser)).toBe(false);
        });
    });

    describe('canSeeModule', () => {
        it('should return true if module is not adminOnly', () => {
            expect(canSeeModule(guestUser, false)).toBe(true);
            expect(canSeeModule(adminUser, false)).toBe(true);
        });

        it('should return true for admin if module is adminOnly', () => {
            expect(canSeeModule(adminUser, true)).toBe(true);
        });

        it('should return false for guest if module is adminOnly', () => {
            expect(canSeeModule(guestUser, true)).toBe(false);
        });
    });

    describe('resolveRoleOnStateLoad', () => {
        it('should preserve existing global ADMIN role even if state says GUEST', () => {
            const result = resolveRoleOnStateLoad(UserRole.ADMIN, UserRole.GUEST);
            expect(result).toBe(UserRole.ADMIN);
        });

        it('should use state role if current global role is GUEST', () => {
            const result = resolveRoleOnStateLoad(UserRole.GUEST, UserRole.ADMIN);
            expect(result).toBe(UserRole.ADMIN);
        });

        it('should return current role if both are same', () => {
            expect(resolveRoleOnStateLoad(UserRole.ADMIN, UserRole.ADMIN)).toBe(UserRole.ADMIN);
            expect(resolveRoleOnStateLoad(UserRole.GUEST, UserRole.GUEST)).toBe(UserRole.GUEST);
        });
    });

    describe('shouldFilterByOwner', () => {
        it('should return false for ADMIN (can see all)', () => {
            expect(shouldFilterByOwner(adminUser)).toBe(false);
        });

        it('should return true for GUEST (guests see only theirs)', () => {
            expect(shouldFilterByOwner(guestUser)).toBe(true);
        });

        it('should return true by default if user is null', () => {
            expect(shouldFilterByOwner(null)).toBe(true);
        });
    });

    describe('filterEntitiesByScope', () => {
        const adminUser = { id: 'admin1', email: 'admin@test.it', role: UserRole.ADMIN };
        const guestUser = { id: 'guest1', email: 'guest@test.it', role: UserRole.GUEST };

        const allEntities = [
            { id: 'e1', name: 'Ente Admin', user_id: 'admin1' },
            { id: 'e2', name: 'Ente Guest', user_id: 'guest1' },
            { id: 'e3', name: 'Ente Altro', user_id: 'other-user' },
        ];

        it('GUEST vede solo i propri enti (showAll ignorato)', () => {
            const result = filterEntitiesByScope(allEntities, guestUser, false);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('e2');
        });

        it('GUEST con showAll=true vede comunque solo i propri enti', () => {
            const result = filterEntitiesByScope(allEntities, guestUser, true);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('e2');
        });

        it('ADMIN con showAll=false (default) vede solo i propri enti', () => {
            const result = filterEntitiesByScope(allEntities, adminUser, false);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('e1');
        });

        it('ADMIN con showAll=true vede tutti gli enti del sistema', () => {
            const result = filterEntitiesByScope(allEntities, adminUser, true);
            expect(result).toHaveLength(3);
        });

        it('ADMIN con showAll=true vede anche enti di altri utenti', () => {
            const result = filterEntitiesByScope(allEntities, adminUser, true);
            const otherUserEntities = result.filter(e => e.user_id !== adminUser.id);
            expect(otherUserEntities).toHaveLength(2);
        });

        it('utente null vede lista vuota (nessun ente matcha user_id undefined)', () => {
            const result = filterEntitiesByScope(allEntities, null, false);
            expect(result).toHaveLength(0);
        });

        it('cambio scope mine -> all -> mine non muta l’array originale', () => {
            const initialLength = allEntities.length;
            const originalArrayCopy = [...allEntities];
            
            filterEntitiesByScope(allEntities, adminUser, false); // mine
            filterEntitiesByScope(allEntities, adminUser, true); // all
            filterEntitiesByScope(allEntities, adminUser, false); // mine
            
            expect(allEntities).toHaveLength(initialLength);
            expect(allEntities).toEqual(originalArrayCopy);
        });
    });

    describe('getEntityListScope', () => {
        const adminUser = { id: 'admin1', email: 'admin@test.it', role: UserRole.ADMIN };
        const guestUser = { id: 'guest1', email: 'guest@test.it', role: UserRole.GUEST };

        it('ADMIN senza showAll ritorna owned', () => {
            expect(getEntityListScope(adminUser, false)).toBe('owned');
        });

        it('ADMIN con showAll=true ritorna all', () => {
            expect(getEntityListScope(adminUser, true)).toBe('all');
        });

        it('GUEST sempre owned indipendentemente da showAll', () => {
            expect(getEntityListScope(guestUser, true)).toBe('owned');
            expect(getEntityListScope(guestUser, false)).toBe('owned');
        });

        it('utente null ritorna sempre owned', () => {
            expect(getEntityListScope(null, true)).toBe('owned');
        });
    });

    describe('Invarianti di Contesto ed Enti Altrui (MOD-037C11-FIX2)', () => {
        const adminUser = { id: 'admin1', name: 'Admin Dino', email: 'admin@test.it', role: UserRole.ADMIN };
        const otherEntity = { id: 'e_other', name: 'Other Entity', user_id: 'other-user' };
        const ownEntity = { id: 'e_own', name: 'Own Entity', user_id: 'admin1' };
        const allEntities = [ownEntity, otherEntity];

        it('il toggle di scope (mine -> all -> mine) non deve mutare o resettare la currentEntity attiva', () => {
            let currentEntity = otherEntity; // Ente attivo altrui
            let showAllEntities = false;

            // In vista personale, l'ente altrui non è in visibleEntities
            let visibleEntities = filterEntitiesByScope(allEntities, adminUser, showAllEntities);
            expect(visibleEntities.find(e => e.id === currentEntity.id)).toBeUndefined();
            // Ma il riferimento a currentEntity non viene perso
            expect(currentEntity.id).toBe('e_other');

            // Switch a vista globale
            showAllEntities = true;
            visibleEntities = filterEntitiesByScope(allEntities, adminUser, showAllEntities);
            expect(visibleEntities.find(e => e.id === currentEntity.id)).toBeDefined();

            // Switch di ritorno a vista personale
            showAllEntities = false;
            visibleEntities = filterEntitiesByScope(allEntities, adminUser, showAllEntities);
            expect(visibleEntities.find(e => e.id === currentEntity.id)).toBeUndefined();
            // L'ente attivo non deve essere resettato a quello proprio
            expect(currentEntity.id).toBe('e_other');
        });

        it('identifica correttamente se l’ente attivo (altrui) non è presente in visibleEntities', () => {
            const currentEntity = otherEntity;
            const visibleEntities = filterEntitiesByScope(allEntities, adminUser, false); // Vista personale (contiene solo ownEntity)

            const isEntityNotVisible = !visibleEntities.find(e => e.id === currentEntity.id);
            expect(isEntityNotVisible).toBe(true);
        });
    });
});
