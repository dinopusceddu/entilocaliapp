import { describe, it, expect, vi, beforeEach } from 'vitest';
import { switchActiveYear } from '../snapshots/snapshotWorkflow';
import { UserRole } from '../../domain';

describe('AG-122C: Hardening Contestuale - Hostile Race & Keyed Guard', () => {
    let mockDeps: any;
    const user = { id: 'u1', email: 'test@test.com' };
    const entityA = { id: 'ente-A', name: 'Comune A' };
    const entityB = { id: 'ente-B', name: 'Comune B' };
    const defaultData = { default: true };
    const draftData = { dirty: true };

    beforeEach(() => {
        mockDeps = {
            stateRepository: {
                upsertState: vi.fn().mockResolvedValue({ error: null }),
                getState: vi.fn(),
                createState: vi.fn().mockResolvedValue({ error: null })
            },
            entityRepository: {
                update: vi.fn().mockResolvedValue({ error: null })
            },
            userRepository: {
                getUserRole: vi.fn().mockResolvedValue({ data: UserRole.GUEST })
            }
        };
    });

    it('1. Salva SOLO se la chiave di idratazione corrisponde (Hardening Keyed)', async () => {
        // SCENARIO: 
        // - L'app ha idratato l'Ente A per il 2024 (chiave: ente-A:2024).
        // - L'utente cambia velocemente all'Ente B.
        // - Lo switchYearAtomic (B) viene chiamato.
        // - Dobbiamo simulare che se la chiave passata è SBAGLIATA rispetto al contesto attuale, il save viene saltato.

        const hydratedKey = 'ente-A:2024' as string;
        const currentContextKey = 'ente-A:2024' as string;
        const wrongContextKey = 'ente-B:2024' as string;

        // Caso A: Chiave corretta -> Save permesso
        const canSave_OK = hydratedKey === currentContextKey;
        await switchActiveYear(
            mockDeps, user, entityA, 2024, 2025, UserRole.ADMIN, draftData, defaultData, canSave_OK
        );
        expect(mockDeps.stateRepository.upsertState).toHaveBeenCalledTimes(1);

        // Caso B: Chiave scorretta (Race Condition) -> Save BLOCCATO
        mockDeps.stateRepository.upsertState.mockClear();
        const canSave_FAIL = hydratedKey === wrongContextKey; // Corrisponde allo stato in mezzo a uno switch
        
        const result = await switchActiveYear(
            mockDeps, user, entityB, 2024, 2025, UserRole.ADMIN, draftData, defaultData, canSave_FAIL
        );

        // Non deve aver chiamato upsertState perché canSave era false
        expect(mockDeps.stateRepository.upsertState).not.toHaveBeenCalled();
        expect(result.savedPreviousYear).toBe(false);
    });

    it('2. Double Switch Race: il secondo switch non deve essere "sporcato" dal primo', async () => {
        // Questo test simula la logica che andremo a verificare in AppContext
        // dove hydratedSnapshotKey impedisce sovrascritture incrociate.
        
        let hydratedKey: string | null = 'ente-A:2024';

        // 1. Inizia switch da A a B. 
        // 2. Prima che finisca, cambia hydratedKey a null (SET_CURRENT_ENTITY B)
        hydratedKey = null;

        // 3. Il workflow di switch (che era stato triggerato per A) ora vede che non può più salvare A
        // perché la chiave non coincide più con (ente-A:2024)
        const canSave = hydratedKey === 'ente-A:2024';
        
        expect(canSave).toBe(false);
        
        await switchActiveYear(
            mockDeps, user, entityA, 2024, 2025, UserRole.ADMIN, draftData, defaultData, canSave
        );

        expect(mockDeps.stateRepository.upsertState).not.toHaveBeenCalled();
    });
});
