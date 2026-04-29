import { describe, it, expect } from 'vitest';
import { UserRole } from '../../types';
import { 
    isGlobalAdmin, 
    canAccessAdminArea, 
    canSeeModule, 
    resolveRoleOnStateLoad,
    shouldFilterByOwner
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
});
