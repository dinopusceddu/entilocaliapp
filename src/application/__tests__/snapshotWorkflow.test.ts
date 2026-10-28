import { fixtureBaseline, confirmedFixtureWrite } from '../../test/fixtures/b1Persistence';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { switchActiveYear } from '../snapshots/snapshotWorkflow';
import { UserRole } from '../../domain';


describe('snapshotWorkflow - switchActiveYear', () => {
    let mockDeps: any;
    const user = { id: 'u1', email: 'test@test.com' };
    const adminUser = { id: 'u1', email: 'test@test.com', role: UserRole.ADMIN };
    const entity = { id: 'e1', name: 'Entity 1', user_id: 'u1' };
    const defaultFundData = { default: true, metadata: { snapshotStatus: 'OPEN' } };
    const draftFundData = { testData: 123, metadata: { snapshotStatus: 'OPEN' } };
    const loaded = (actor: any, year: number) => fixtureBaseline(actor, entity, year, { metadata: { snapshotStatus: 'OPEN' }, previous: true });

    beforeEach(() => {
        mockDeps = {
            stateRepository: {
                upsertState: vi.fn(async (row: any) => confirmedFixtureWrite(row)),
                getState: vi.fn().mockResolvedValue({ data: null, error: null }),
                createState: vi.fn(async (row: any) => confirmedFixtureWrite(row))
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
            mockDeps, user, entity, 2024, 2025, UserRole.ADMIN, draftFundData, defaultFundData, true, entity, loaded(user, 2024)
        );

        expect(result.success).toBe(false);
        expect(result.targetYear).toBe(2024); // Rimanere nell'anno corrente
        expect(result.savedPreviousYear).toBe(false);
        expect(result.error).toContain('Salvataggio non confermato');
        // Senza ruolo, shouldFilterByOwner è true
        expect(mockDeps.stateRepository.getState).not.toHaveBeenCalled();
        expect(mockDeps.stateRepository.upsertState.mock.calls[0][0].b1i4_expected).toBe(loaded(user, 2024).version);
    });

    it('2. target year assente → inizializzazione corretta', async () => {
        mockDeps.stateRepository.upsertState.mockImplementationOnce(async (row: any) => confirmedFixtureWrite(row)); // save current ok
        mockDeps.stateRepository.getState.mockResolvedValueOnce({ data: null, error: null }); // target not found
        mockDeps.stateRepository.createState.mockImplementationOnce(async (row: any) => confirmedFixtureWrite(row));

        const result = await switchActiveYear(
            mockDeps, user, entity, 2024, 2025, UserRole.ADMIN, draftFundData, defaultFundData, true, entity, loaded(user, 2024)
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
        mockDeps.stateRepository.upsertState.mockImplementationOnce(async (row: any) => confirmedFixtureWrite(row)); // save current ok
        // Il primo getState è per l'anno corrente (save), il secondo per il target
        mockDeps.stateRepository.getState
            .mockResolvedValueOnce({ data: { ...fakeSnapshot, b1i4_version: loaded(user, 2024).version }, error: null }); // target found

        const result = await switchActiveYear(
            mockDeps, user, entity, 2024, 2023, UserRole.ADMIN, draftFundData, defaultFundData, true, entity, loaded(user, 2024)
        );

        expect(result.success).toBe(true);
        expect(result.targetYear).toBe(2023);
        expect(result.newSnapshot?.fundData).toEqual({ loaded: true });
        expect(mockDeps.stateRepository.createState).not.toHaveBeenCalled();
    });

    it('4. draft corrente non perso in caso di errore load', async () => {
        mockDeps.stateRepository.upsertState.mockImplementationOnce(async (row: any) => confirmedFixtureWrite(row)); 
        mockDeps.stateRepository.getState
            .mockResolvedValueOnce({ error: { message: 'Network fails' } }); // target load fails

        const result = await switchActiveYear(
            mockDeps, user, entity, 2024, 2025, UserRole.ADMIN, draftFundData, defaultFundData, true, entity, loaded(user, 2024)
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
        mockDeps.stateRepository.createState.mockImplementationOnce(async (row: any) => confirmedFixtureWrite(row));

        const result = await switchActiveYear(
            mockDeps, adminUser, entity, 2024, 2025, UserRole.ADMIN, closedDraftData, defaultFundData, true, entity, loaded(adminUser, 2024)
        );

        expect(result.success).toBe(true);
        expect(result.targetYear).toBe(2025);
        // upsertState NON deve essere stato chiamato
        expect(mockDeps.stateRepository.upsertState).not.toHaveBeenCalled();
        // getState deve essere chiamato con undefined per l'ID utente (admin bypass) per il target
        expect(mockDeps.stateRepository.getState).toHaveBeenCalledWith(undefined, entity.id, 2025);
    });

    it('6. bozza locale su annualita OPEN esegue salvataggio preventivo', async () => {
        const openDraftData = { 
            ...draftFundData, 
            metadata: { snapshotStatus: 'OPEN' } 
        };
        
        mockDeps.stateRepository.upsertState.mockImplementationOnce(async (row: any) => confirmedFixtureWrite(row));
        // Target non trovato -> Inizializzazione
        mockDeps.stateRepository.getState.mockResolvedValueOnce({ data: null, error: null });
        mockDeps.stateRepository.createState.mockImplementationOnce(async (row: any) => confirmedFixtureWrite(row));

        const result = await switchActiveYear(
            mockDeps, adminUser, entity, 2024, 2025, UserRole.ADMIN, openDraftData, defaultFundData, true, entity, loaded(adminUser, 2024)
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
    it('7. PGRST116 non riconosciuto sul target blocca lo switch senza creare annualita', async () => {
        mockDeps.stateRepository.upsertState.mockImplementationOnce(async (row: any) => confirmedFixtureWrite(row));
        mockDeps.stateRepository.getState
            .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'No rows found' } });
        mockDeps.stateRepository.createState.mockImplementationOnce(async (row: any) => confirmedFixtureWrite(row));

        const result = await switchActiveYear(
            mockDeps, user, entity, 2025, 2026, UserRole.ADMIN, draftFundData, defaultFundData
        );

        expect(result.success).toBe(false);
        expect(result.targetYear).toBe(2025);
        expect(result.error).toContain('No rows found');
        expect(mockDeps.stateRepository.createState).not.toHaveBeenCalled();
    });

    it('8. non salva l anno precedente 2030 sul nuovo ente quando lo switch cross-ente disabilita il salvataggio', async () => {
        const oldEntity = { id: 'old-entity', name: 'Old Entity', user_id: 'u-old' };
        const newEntity = { id: 'new-entity', name: 'New Entity', user_id: 'u-new' };
        mockDeps.stateRepository.getState.mockResolvedValueOnce({ data: null, error: null });
        mockDeps.stateRepository.createState.mockImplementationOnce(async (row: any) => confirmedFixtureWrite(row));

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
