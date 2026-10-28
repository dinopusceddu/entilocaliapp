import { describe, it, expect } from 'vitest';

/**
 * Simulazione fedele al 100% della logica delle Policy RLS definite nella migrazione:
 * 20260921000000_fix_user_app_state_ownership_rls.sql
 *
 * Verifiche per tre attori:
 * - USER_A (owner dell'ente)
 * - ADMIN_B (amministratore con is_admin() = true)
 * - USER_C (utente terzo, non proprietario né admin)
 */

interface MockEntity {
  id: string;
  user_id: string; // Owner dell'ente
  name: string;
}

interface MockUserState {
  entity_id: string;
  current_year: number;
  user_id: string; // Denormalizzato, deve corrispondere a entity.user_id
  fund_data: any;
}

interface AuthContext {
  uid: string;
  isAdmin: boolean;
}

class MockRlsEngine {
  entities: MockEntity[] = [];
  userAppState: MockUserState[] = [];

  // Helper SQL: public.is_admin()
  isAdmin(auth: AuthContext): boolean {
    return auth.isAdmin;
  }

  // Helper SQL: EXISTS (SELECT 1 FROM entities e WHERE e.id = uas.entity_id AND e.user_id = auth.uid())
  isEntityOwner(auth: AuthContext, entityId: string): boolean {
    return this.entities.some(e => e.id === entityId && e.user_id === auth.uid);
  }

  // RLS SELECT on user_app_state
  select(auth: AuthContext, entityId: string, year: number): MockUserState[] {
    return this.userAppState.filter(uas => {
      if (uas.entity_id !== entityId || uas.current_year !== year) return false;

      // Policy 1: user_app_state_select_owner
      const ownerPass = this.isEntityOwner(auth, uas.entity_id);
      // Policy 2: user_app_state_select_admin
      const adminPass = this.isAdmin(auth);

      return ownerPass || adminPass;
    });
  }

  // RLS INSERT on user_app_state
  insert(auth: AuthContext, newRow: MockUserState): { success: boolean; error?: string } {
    // Check PK conflict first
    const exists = this.userAppState.some(
      uas => uas.entity_id === newRow.entity_id && uas.current_year === newRow.current_year
    );
    if (exists) {
      return { success: false, error: 'duplicate key value violates unique constraint "user_app_state_pkey"' };
    }

    const entity = this.entities.find(e => e.id === newRow.entity_id);
    if (!entity) {
      return { success: false, error: 'foreign key violation: entity does not exist' };
    }

    // Policy 1: user_app_state_insert_owner
    // WITH CHECK (e.id = entity_id AND e.user_id = auth.uid() AND e.user_id = user_id)
    const ownerPass = entity.user_id === auth.uid && entity.user_id === newRow.user_id;

    // Policy 2: user_app_state_insert_admin
    // WITH CHECK (is_admin() AND e.id = entity_id AND e.user_id = user_id)
    const adminPass = this.isAdmin(auth) && entity.user_id === newRow.user_id;

    if (ownerPass || adminPass) {
      this.userAppState.push(newRow);
      return { success: true };
    }

    return { success: false, error: 'new row violates row-level security policy for table "user_app_state"' };
  }

  // RLS UPDATE on user_app_state
  update(
    auth: AuthContext,
    entityId: string,
    year: number,
    updatedValues: Partial<MockUserState>
  ): { success: boolean; error?: string } {
    const index = this.userAppState.findIndex(
      uas => uas.entity_id === entityId && uas.current_year === year
    );
    if (index === -1) {
      return { success: false, error: 'record not found' };
    }

    const existingRow = this.userAppState[index];
    const entity = this.entities.find(e => e.id === existingRow.entity_id);
    if (!entity) {
      return { success: false, error: 'entity not found' };
    }

    // USING checks
    const ownerUsing = this.isEntityOwner(auth, existingRow.entity_id);
    const adminUsing = this.isAdmin(auth);

    if (!ownerUsing && !adminUsing) {
      return { success: false, error: 'target row violates row-level security policy for table "user_app_state"' };
    }

    // Proposed new row
    const candidateRow: MockUserState = { ...existingRow, ...updatedValues };

    // WITH CHECK
    const ownerWithCheck = entity.user_id === auth.uid && entity.user_id === candidateRow.user_id;
    const adminWithCheck = this.isAdmin(auth) && entity.user_id === candidateRow.user_id;

    if (ownerWithCheck || adminWithCheck) {
      this.userAppState[index] = candidateRow;
      return { success: true };
    }

    return { success: false, error: 'new row violates row-level security policy for table "user_app_state"' };
  }

  // RLS DELETE on user_app_state
  delete(auth: AuthContext, entityId: string, year: number): { success: boolean; error?: string } {
    const index = this.userAppState.findIndex(
      uas => uas.entity_id === entityId && uas.current_year === year
    );
    if (index === -1) {
      return { success: true }; // SQL delete on non-existent is 0 rows affected, no error
    }

    const existingRow = this.userAppState[index];
    const ownerUsing = this.isEntityOwner(auth, existingRow.entity_id);
    const adminUsing = this.isAdmin(auth);

    if (ownerUsing || adminUsing) {
      this.userAppState.splice(index, 1);
      return { success: true };
    }

    return { success: false, error: 'delete violates row-level security policy for table "user_app_state"' };
  }
}

describe('FASE 9 — Test di Risoluzione RLS Matrix (Owner, Admin, Terzo)', () => {
  const userA: AuthContext = { uid: 'user-a', isAdmin: false };
  const adminB: AuthContext = { uid: 'admin-b', isAdmin: true };
  const userC: AuthContext = { uid: 'user-c', isAdmin: false };

  const entityA: MockEntity = {
    id: 'ent-a',
    user_id: userA.uid,
    name: 'Comune di Alfa'
  };

  const initialRow2026: MockUserState = {
    entity_id: entityA.id,
    current_year: 2026,
    user_id: userA.uid,
    fund_data: { totale: 100000 }
  };

  const setupEngine = () => {
    const engine = new MockRlsEngine();
    engine.entities = [{ ...entityA }];
    engine.userAppState = [{ ...initialRow2026 }];
    return engine;
  };

  it('A SELECT proprio: PASS', () => {
    const engine = setupEngine();
    const rows = engine.select(userA, entityA.id, 2026);
    expect(rows).toHaveLength(1);
    expect(rows[0].entity_id).toBe(entityA.id);
  });

  it('A INSERT proprio: PASS', () => {
    const engine = setupEngine();
    const res = engine.insert(userA, {
      entity_id: entityA.id,
      current_year: 2027,
      user_id: userA.uid,
      fund_data: { totale: 0 }
    });
    expect(res.success).toBe(true);
  });

  it('A UPDATE proprio: PASS', () => {
    const engine = setupEngine();
    const res = engine.update(userA, entityA.id, 2026, {
      fund_data: { totale: 120000 }
    });
    expect(res.success).toBe(true);
    expect(engine.userAppState[0].fund_data.totale).toBe(120000);
  });

  it('A DELETE proprio: PASS', () => {
    const engine = setupEngine();
    const res = engine.delete(userA, entityA.id, 2026);
    expect(res.success).toBe(true);
    expect(engine.userAppState).toHaveLength(0);
  });

  it('B SELECT di A: PASS', () => {
    const engine = setupEngine();
    const rows = engine.select(adminB, entityA.id, 2026);
    expect(rows).toHaveLength(1);
    expect(rows[0].user_id).toBe(userA.uid);
  });

  it('B INSERT annualità A: PASS quando user_id coincide con owner di A', () => {
    const engine = setupEngine();
    const res = engine.insert(adminB, {
      entity_id: entityA.id,
      current_year: 2027,
      user_id: userA.uid, // Admin rispetta l'owner canonico
      fund_data: { totale: 0 }
    });
    expect(res.success).toBe(true);
    expect(engine.userAppState.find(u => u.current_year === 2027)?.user_id).toBe(userA.uid);
  });

  it('B UPDATE di A: PASS e preserva ownership', () => {
    const engine = setupEngine();
    const res = engine.update(adminB, entityA.id, 2026, {
      fund_data: { totale: 150000 }
    });
    expect(res.success).toBe(true);
    expect(engine.userAppState[0].user_id).toBe(userA.uid); // Ownership intatta!
    expect(engine.userAppState[0].fund_data.totale).toBe(150000);
  });

  it('B DELETE di A: PASS', () => {
    const engine = setupEngine();
    const res = engine.delete(adminB, entityA.id, 2026);
    expect(res.success).toBe(true);
    expect(engine.userAppState).toHaveLength(0);
  });

  it('C SELECT di A: DENIED / 0 rows', () => {
    const engine = setupEngine();
    const rows = engine.select(userC, entityA.id, 2026);
    expect(rows).toHaveLength(0);
  });

  it('C INSERT su A: DENIED', () => {
    const engine = setupEngine();
    const res = engine.insert(userC, {
      entity_id: entityA.id,
      current_year: 2027,
      user_id: userC.uid,
      fund_data: {}
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('violates row-level security policy');
  });

  it('C UPDATE su A: DENIED', () => {
    const engine = setupEngine();
    const res = engine.update(userC, entityA.id, 2026, {
      fund_data: { totale: 999999 }
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('violates row-level security policy');
  });

  it('C DELETE su A: DENIED', () => {
    const engine = setupEngine();
    const res = engine.delete(userC, entityA.id, 2026);
    expect(res.success).toBe(false);
    expect(res.error).toContain('violates row-level security policy');
  });

  it('Admin B tentato furto di ownership (user_id = B per ente di A): RIGOROSAMENTE RESPINTO DA RLS', () => {
    const engine = setupEngine();

    // 1. Tentativo in INSERT
    const insertRes = engine.insert(adminB, {
      entity_id: entityA.id,
      current_year: 2028,
      user_id: adminB.uid, // Tentativo malevolo/errato di impostare user_id = Admin
      fund_data: {}
    });
    expect(insertRes.success).toBe(false);
    expect(insertRes.error).toContain('violates row-level security policy');

    // 2. Tentativo in UPDATE
    const updateRes = engine.update(adminB, entityA.id, 2026, {
      user_id: adminB.uid // Tentativo di sovrascrivere l'owner
    });
    expect(updateRes.success).toBe(false);
    expect(updateRes.error).toContain('violates row-level security policy');
    // Il record originale resta invariato
    expect(engine.userAppState[0].user_id).toBe(userA.uid);
  });
});
