import { describe, it, expect, vi, beforeEach } from 'vitest';
import { switchActiveYear } from '../snapshots/snapshotWorkflow';
import { UserRole } from '../../domain';


describe('snapshotWorkflow - switchActiveYear', () => {
    let mockDeps: any;
    const user = { id: 'u1', email: 'test@test.com' };
    const adminUser = { id: 'u1', email: 'test@test.com', role: UserRole.ADMIN };
    const entity = { id: 'e1', name: 'Entity 1' };
    const defaultFundData = { default: true };
    const draftFundData = { testData: 123 };

    beforeEach(() => {
        mockDeps = {
            stateRepository: {
                upsertState: vi.fn(),
                getState: vi.fn().mockResolvedValue({ data: null, error: null }),
                createState: vi.fn()
            },
            entityRepository: {
                update: vi.fn()
            },
            userRepository: {
                getUserRole: vi.fn().mockResolvedValue({ data: UserRole.GUEST })
            }
        };
    });

    it('1. save fallisce → switch bloccato', async () => {
        mockDeps.stateRepository.upsertState.mockResolvedValueOnce({ error: { message: 'DB Down' } });

        const result = await switchActiveYear(
            mockDeps, user, entity, 2024, 2025, UserRole.ADMIN, draftFundData, defaultFundData
        );

        expect(result.success).toBe(false);
        expect(result.targetYear).toBe(2024); // Rimanere nell'anno corrente
        expect(result.savedPreviousYear).toBe(false);
        expect(result.error).toContain('DB Down');
        // Senza ruolo, shouldFilterByOwner è true
        expect(mockDeps.stateRepository.getState).toHaveBeenCalledWith(user.id, entity.id, 2024);
    });

    it('2. target year assente → inizializzazione corretta', async () => {
        mockDeps.stateRepository.upsertState.mockResolvedValueOnce({ error: null }); // save current ok
        mockDeps.stateRepository.getState.mockResolvedValueOnce({ data: null, error: null }); // target not found
        mockDeps.stateRepository.createState.mockResolvedValueOnce({ error: null });

        const result = await switchActiveYear(
            mockDeps, user, entity, 2024, 2025, UserRole.ADMIN, draftFundData, defaultFundData
        );

        expect(result.success).toBe(true);
        expect(result.targetYear).toBe(2025);
        expect(result.savedPreviousYear).toBe(true);
        expect(result.newSnapshot).toBeDefined();
        expect(result.newSnapshot?.year).toBe(2025);
        expect(mockDeps.stateRepository.createState).toHaveBeenCalled();
    });

    it('3. switch riuscito → currentYear aggiornato solo alla fine', async () => {
        const fakeSnapshot = {
            entity_id: 'e1',
            current_year: 2023,
            user_id: 'u1',
            role: 'admin',
            fund_data: { loaded: true },
            updated_at: '2026-01-01'
        };
        mockDeps.stateRepository.upsertState.mockResolvedValueOnce({ error: null }); // save current ok
        // Il primo getState è per l'anno corrente (save), il secondo per il target
        mockDeps.stateRepository.getState
            .mockResolvedValueOnce({ data: null, error: null }) // current state not closed
            .mockResolvedValueOnce({ data: fakeSnapshot, error: null }); // target found

        const result = await switchActiveYear(
            mockDeps, user, entity, 2024, 2023, UserRole.ADMIN, draftFundData, defaultFundData
        );

        expect(result.success).toBe(true);
        expect(result.targetYear).toBe(2023);
        expect(result.newSnapshot?.fundData).toEqual({ loaded: true });
        expect(mockDeps.stateRepository.createState).not.toHaveBeenCalled();
    });

    it('4. draft corrente non perso in caso di errore load', async () => {
        mockDeps.stateRepository.upsertState.mockResolvedValueOnce({ error: null }); 
        mockDeps.stateRepository.getState.mockResolvedValueOnce({ error: { message: 'Network fails' } }); 

        const result = await switchActiveYear(
            mockDeps, user, entity, 2024, 2025, UserRole.ADMIN, draftFundData, defaultFundData
        );

        expect(result.success).toBe(false);
        expect(result.targetYear).toBe(2024); // remains on 2024 due to load error
        expect(result.savedPreviousYear).toBe(true); // but the save was successful!
    });

    it('5. AG-125: se anno corrente è CLOSED, salta salvataggio preventivo', async () => {
        const closedDraftData = { 
            ...draftFundData, 
            metadata: { snapshotStatus: 'CLOSED' } 
        };
        
        // Target non trovato -> Inizializzazione
        mockDeps.stateRepository.getState.mockResolvedValueOnce({ data: null, error: null });
        mockDeps.stateRepository.createState.mockResolvedValueOnce({ error: null });

        const result = await switchActiveYear(
            mockDeps, adminUser, entity, 2024, 2025, UserRole.ADMIN, closedDraftData, defaultFundData
        );

        expect(result.success).toBe(true);
        expect(result.targetYear).toBe(2025);
        // upsertState NON deve essere stato chiamato
        expect(mockDeps.stateRepository.upsertState).not.toHaveBeenCalled();
        // getState deve essere chiamato con undefined per l'ID utente (admin bypass) per il target
        expect(mockDeps.stateRepository.getState).toHaveBeenCalledWith(undefined, entity.id, 2025);
    });

    it('6. AG-125: se anno corrente è DRAFT, esegue salvataggio preventivo', async () => {
        const openDraftData = { 
            ...draftFundData, 
            metadata: { snapshotStatus: 'DRAFT' } 
        };
        
        mockDeps.stateRepository.upsertState.mockResolvedValueOnce({ error: null });
        // Target non trovato -> Inizializzazione
        mockDeps.stateRepository.getState.mockResolvedValueOnce({ data: null, error: null });
        mockDeps.stateRepository.createState.mockResolvedValueOnce({ error: null });

        const result = await switchActiveYear(
            mockDeps, adminUser, entity, 2024, 2025, UserRole.ADMIN, openDraftData, defaultFundData
        );

        if (!result.success) {
            throw new Error('TEST 6 FAILED WITH ERROR: ' + result.error);
        }
        expect(result.success).toBe(true);
        expect(result.targetYear).toBe(2025);
        // upsertState DEVE essere stato chiamato
        expect(mockDeps.stateRepository.upsertState).toHaveBeenCalled();
        // getState deve essere chiamato con undefined per l'ID utente (admin bypass) per il target
        expect(mockDeps.stateRepository.getState).toHaveBeenCalledWith(undefined, entity.id, 2025);
    });
    it('7. PGRST116 sul target assente inizializza l annualita senza fallire', async () => {
        mockDeps.stateRepository.upsertState.mockResolvedValueOnce({ error: null });
        mockDeps.stateRepository.getState
            .mockResolvedValueOnce({ data: null, error: null })
            .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'No rows found' } });
        mockDeps.stateRepository.createState.mockResolvedValueOnce({ error: null });

        const result = await switchActiveYear(
            mockDeps, user, entity, 2025, 2026, UserRole.ADMIN, draftFundData, defaultFundData
        );

        expect(result.success).toBe(true);
        expect(result.targetYear).toBe(2026);
        expect(mockDeps.stateRepository.createState).toHaveBeenCalledWith(expect.objectContaining({
            entity_id: entity.id,
            current_year: 2026
        }));
    });

    it('8. non salva l anno precedente 2030 sul nuovo ente quando lo switch cross-ente disabilita il salvataggio', async () => {
        const oldEntity = { id: 'old-entity', name: 'Old Entity' };
        const newEntity = { id: 'new-entity', name: 'New Entity' };
        mockDeps.stateRepository.getState.mockResolvedValueOnce({ data: null, error: null });
        mockDeps.stateRepository.createState.mockResolvedValueOnce({ error: null });

        const result = await switchActiveYear(
            mockDeps,
            user,
            newEntity,
            2030,
            2026,
            UserRole.ADMIN,
            draftFundData,
            defaultFundData,
            false,
            oldEntity
        );

        expect(result.success).toBe(true);
        expect(result.savedPreviousYear).toBe(false);
        expect(mockDeps.stateRepository.upsertState).not.toHaveBeenCalled();
        expect(mockDeps.stateRepository.createState).toHaveBeenCalledWith(expect.objectContaining({
            entity_id: newEntity.id,
            current_year: 2026
        }));
        expect(mockDeps.stateRepository.createState).not.toHaveBeenCalledWith(expect.objectContaining({
            entity_id: newEntity.id,
            current_year: 2030
        }));
    });
});
