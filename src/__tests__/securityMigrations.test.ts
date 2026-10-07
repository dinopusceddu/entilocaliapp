import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = (name: string) =>
  readFileSync(resolve(process.cwd(), 'supabase', 'migrations', name), 'utf8');

const a = migration('20260928000000_harden_user_app_state_closed_boundary.sql');
const b = migration('20260928000001_restrict_atomic_closure_execute.sql');
const c = migration('20260928000002_quarantine_registrazioni_calcolo_fondo.sql');
const roleFixName = '20261002000000_harden_auth_profile_role_source.sql';
const roleFix = migration(roleFixName);

const withoutComments = (sql: string) => sql.replace(/--[^\r\n]*/g, '');
const statements = (sql: string) => withoutComments(sql).split(';').map(part => part.trim()).filter(Boolean);

// Match the entire dollar-quoted definition, not semicolon-separated body
// fragments. Any additional migration statement makes this match fail.
const roleFixDefinition = withoutComments(roleFix).trim().match(
  /^(CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.handle_new_user_profile\(\)\s+RETURNS\s+TRIGGER\s+LANGUAGE\s+plpgsql\s+SECURITY\s+DEFINER\s+SET\s+search_path\s*=\s*public\s+AS)\s+(\$[A-Za-z_0-9]*\$)([\s\S]*?)\2\s*;$/i,
);
const roleFixBody = roleFixDefinition?.[3] ?? '';
// Static lexical comparison ignores formatting and keyword case while keeping
// string literals exact. This is not a PostgreSQL runtime simulation.
const sqlTokens = (sql: string) =>
  (withoutComments(sql).match(/'(?:''|[^'])*'|[A-Za-z_][A-Za-z_0-9]*|\S/g) ?? [])
    .map(token => token.startsWith("'") ? token : token.toLowerCase());
const conflictAssignments = roleFixBody.match(/ON\s+CONFLICT\s*\(id\)\s+DO\s+UPDATE\s+SET\s+([^;]+);/i)?.[1] ?? '';

describe('auth profile role source hardening (static contracts)', () => {
  it('T-STATIC-01: the new forward migration exists', () => {
    expect(roleFix.trim()).not.toBe('');
    expect(roleFixName.slice(0, 14) > '20260928000002').toBe(true);
  });

  it('T-STATIC-02: replaces only the exact profile trigger function', () => {
    expect(roleFixDefinition).not.toBeNull();
    expect(roleFixBody).not.toBe('');
    expect(roleFixBody).not.toMatch(/\b(?:CREATE|ALTER|DROP|GRANT|REVOKE|EXECUTE)\b/i);
  });

  it('T-STATIC-03: leaves the existing trigger unchanged', () => {
    expect(withoutComments(roleFix)).not.toMatch(/\b(?:CREATE|ALTER|DROP)\s+TRIGGER\b|on_auth_user_created_profile/i);
  });

  it('T-STATIC-04: reads no user or app metadata for authorization', () => {
    expect(roleFixBody).not.toMatch(/raw_user_meta_data|raw_app_meta_data|user_metadata|app_metadata/i);
  });

  it('T-STATIC-05: new profiles receive only the literal GUEST role', () => {
    const insert = roleFixBody.match(/INSERT\s+INTO\s+public\.profiles\s*\(([^)]+)\)\s+VALUES\s*\(([\s\S]+?)\)\s+ON\s+CONFLICT/i);
    expect(sqlTokens(insert?.[1] ?? '')).toEqual(sqlTokens('id, email, role, updated_at'));
    expect(sqlTokens(insert?.[2] ?? '')).toEqual(sqlTokens("NEW.id, NEW.email, 'GUEST', NOW()"));
  });

  it('T-STATIC-06: conflict updates preserve USER, ADMIN, GUEST and NULL exactly', () => {
    expect(sqlTokens(conflictAssignments)).toEqual(sqlTokens('email = EXCLUDED.email, updated_at = NOW()'));
    expect(conflictAssignments).not.toMatch(/\brole\b/i);
    expect(roleFixBody).not.toMatch(/\bCOALESCE\b/i);
  });

  it('T-STATIC-07: retains email synchronization on profile id conflict', () => {
    expect(conflictAssignments).toMatch(/\bemail\s*=\s*EXCLUDED\.email/i);
  });

  it('T-STATIC-08: retains the conflict timestamp update', () => {
    expect(conflictAssignments).toMatch(/\bupdated_at\s*=\s*NOW\(\)/i);
  });

  it('T-STATIC-09: installs only a function and confines DML to its runtime upsert', () => {
    expect(roleFixDefinition).not.toBeNull();
    expect(sqlTokens(roleFixBody)).toEqual(sqlTokens(`
      BEGIN
        INSERT INTO public.profiles (id, email, role, updated_at)
        VALUES (NEW.id, NEW.email, 'GUEST', NOW())
        ON CONFLICT (id) DO UPDATE
        SET email = EXCLUDED.email, updated_at = NOW();
        RETURN NEW;
      END;
    `));
  });

  it('T-STATIC-10: preserves the frozen applied profile and A/B/C migrations byte for byte', () => {
    const frozen = {
      '20260220000001_init_user_profiles.sql': 'CF63DDE75A0EAE4F8929CFCB9EE27E588F12AE0B3AFDA33129DCF0B33DCFE8A6',
      '20260220000004_fix_profiles_recursion.sql': '73D58EBC0C606BF178D9A24EEE9D5063C349C7DDF209C84841B6FB7C1BCA2124',
      '20260928000000_harden_user_app_state_closed_boundary.sql': '89726EA86CC5032729C5E2ECB0B5D8882973BB3797F7EFCA3437254C8DD4A454',
      '20260928000001_restrict_atomic_closure_execute.sql': '3A5A569F502A62698256B7E0810EDFECAB9F42E69E261387C15999A4DB73D23D',
      '20260928000002_quarantine_registrazioni_calcolo_fondo.sql': '3A239DB6383D12AC38A4AA054053D6A6A01C9B0CE0184D30D908DABC1D20621D',
    };
    for (const [name, expectedHash] of Object.entries(frozen)) {
      const bytes = readFileSync(resolve(process.cwd(), 'supabase', 'migrations', name));
      expect(createHash('sha256').update(bytes).digest('hex').toUpperCase()).toBe(expectedHash);
    }
  });

  it('preserves SECURITY DEFINER, search_path, signature and existing owner/ACL', () => {
    expect(roleFixDefinition).not.toBeNull();
    expect(withoutComments(roleFix)).not.toMatch(/\b(?:GRANT|REVOKE)\b|ALTER\s+(?:FUNCTION|OWNER)|OWNER\s+TO/i);
  });
});

describe('forward-only database security migrations (static contracts)', () => {
  it('DB-MIG-A-01: runs the immutability trigger before INSERT, UPDATE and DELETE', () => {
    expect(a).toMatch(/BEFORE\s+INSERT\s+OR\s+UPDATE\s+OR\s+DELETE\s+ON\s+public\.user_app_state/i);
    expect(a).toMatch(/EXECUTE\s+FUNCTION\s+public\.check_user_app_state_immutability\(\)/i);
  });

  it('DB-MIG-A-02: rejects INSERT CLOSED', () => {
    const insertBranch = a.split("IF TG_OP = 'INSERT' THEN")[1]?.split("IF TG_OP = 'DELETE' THEN")[0];
    expect(insertBranch).toMatch(/NEW\.fund_data->'metadata'->>'snapshotStatus'\s*=\s*'CLOSED'/i);
    expect(insertBranch).toMatch(/RAISE\s+EXCEPTION\s+'CANNOT_INSERT_CLOSED/i);
  });

  it('DB-MIG-A-03: has no atomic-closure or admin bypass for INSERT CLOSED', () => {
    const insertBranch = a.split("IF TG_OP = 'INSERT' THEN")[1]?.split("IF TG_OP = 'DELETE' THEN")[0];
    expect(insertBranch).not.toMatch(/app\.in_atomic_closure|app\.allow_admin_cleanup|is_admin/i);
  });

  it('DB-MIG-A-04: DELETE CLOSED needs the session flag and is_admin', () => {
    const deleteBranch = a.split("IF TG_OP = 'DELETE' THEN")[1]?.split("IF TG_OP = 'UPDATE' THEN")[0];
    expect(deleteBranch).toMatch(/current_setting\('app\.allow_admin_cleanup',\s*true\)\s+IS\s+DISTINCT\s+FROM\s+'true'/i);
    expect(deleteBranch).toMatch(/OR\s+public\.is_admin\(\)\s+IS\s+DISTINCT\s+FROM\s+true/i);
    expect(deleteBranch).toMatch(/RAISE\s+EXCEPTION\s+'CANNOT_DELETE_CLOSED/i);
  });

  it('DB-MIG-A-05: authenticated UPDATE has a restrictive CLOSED check', () => {
    expect(a).toMatch(/CREATE\s+POLICY\s+"user_app_state_update_no_direct_closed"\s+ON\s+public\.user_app_state\s+AS\s+RESTRICTIVE\s+FOR\s+UPDATE\s+TO\s+authenticated/i);
    expect(a).toMatch(/WITH\s+CHECK\s*\(\s*\(fund_data->'metadata'->>'snapshotStatus'\)\s+IS\s+DISTINCT\s+FROM\s+'CLOSED'\s*\)/i);
  });

  it('DB-MIG-A-06: does not rewrite existing snapshots', () => {
    expect(withoutComments(a)).not.toMatch(/\b(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM|TRUNCATE(?:\s+TABLE)?)\s+public\.user_app_state\b/i);
  });

  it('DB-MIG-A-07: removes client TRUNCATE privilege independently of RLS', () => {
    const truncateDcl = statements(a).filter(statement => /^(?:REVOKE|GRANT)\s+TRUNCATE\b/i.test(statement));
    expect(truncateDcl).toEqual([
      'REVOKE TRUNCATE ON TABLE public.user_app_state FROM PUBLIC, anon, authenticated',
    ]);
  });

  it('DB-MIG-A-08: removes client TRIGGER and REFERENCES without changing service_role', () => {
    const triggerReferencesDcl = statements(a).filter(statement =>
      /^(?:REVOKE|GRANT)\s+(?:TRIGGER|REFERENCES)\b/i.test(statement),
    );
    expect(triggerReferencesDcl).toEqual([
      'REVOKE TRIGGER, REFERENCES ON TABLE public.user_app_state FROM PUBLIC, anon, authenticated',
    ]);
  });

  it('DB-MIG-B-01/02: revokes EXECUTE from PUBLIC and anon on the exact RPC', () => {
    expect(b).toMatch(/REVOKE\s+EXECUTE\s+ON\s+FUNCTION\s+public\.close_annual_snapshot_atomic\(uuid,\s*integer,\s*jsonb,\s*jsonb\)\s+FROM\s+PUBLIC/i);
    expect(b).toMatch(/REVOKE\s+EXECUTE\s+ON\s+FUNCTION\s+public\.close_annual_snapshot_atomic\(uuid,\s*integer,\s*jsonb,\s*jsonb\)\s+FROM\s+anon/i);
  });

  it('DB-MIG-B-03: grants authenticated and service_role EXECUTE directly', () => {
    expect(b).toMatch(/GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.close_annual_snapshot_atomic\(uuid,\s*integer,\s*jsonb,\s*jsonb\)\s+TO\s+authenticated/i);
    expect(b).toMatch(/GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.close_annual_snapshot_atomic\(uuid,\s*integer,\s*jsonb,\s*jsonb\)\s+TO\s+service_role/i);
  });

  it('DB-MIG-B-04: does not revoke service_role or alter the RPC', () => {
    expect(statements(b)).toEqual([
      'REVOKE EXECUTE ON FUNCTION public.close_annual_snapshot_atomic(uuid, integer, jsonb, jsonb) FROM PUBLIC',
      'REVOKE EXECUTE ON FUNCTION public.close_annual_snapshot_atomic(uuid, integer, jsonb, jsonb) FROM anon',
      'GRANT EXECUTE ON FUNCTION public.close_annual_snapshot_atomic(uuid, integer, jsonb, jsonb) TO authenticated',
      'GRANT EXECUTE ON FUNCTION public.close_annual_snapshot_atomic(uuid, integer, jsonb, jsonb) TO service_role',
    ]);
  });

  it('DB-MIG-C-01: disables the historical Make trigger without dropping it', () => {
    expect(c).toMatch(/ALTER\s+TABLE\s+public\.registrazioni_calcolo_fondo\s+DISABLE\s+TRIGGER\s+"Make"/i);
    expect(withoutComments(c)).not.toMatch(/DROP\s+TRIGGER/i);
  });

  it('DB-MIG-C-02/03: enables RLS and removes all direct public client privileges', () => {
    expect(c).toMatch(/ALTER\s+TABLE\s+public\.registrazioni_calcolo_fondo\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i);
    expect(c).toMatch(/REVOKE\s+ALL\s+PRIVILEGES\s+ON\s+TABLE\s+public\.registrazioni_calcolo_fondo\s+FROM\s+PUBLIC,\s*anon,\s*authenticated,\s*service_role/i);
    expect(withoutComments(c)).not.toMatch(/CREATE\s+POLICY/i);
  });

  it('DB-MIG-C-04: leaves service_role with direct SELECT only', () => {
    expect(statements(c)).toEqual([
      'ALTER TABLE public.registrazioni_calcolo_fondo DISABLE TRIGGER "Make"',
      'ALTER TABLE public.registrazioni_calcolo_fondo ENABLE ROW LEVEL SECURITY',
      'REVOKE ALL PRIVILEGES ON TABLE public.registrazioni_calcolo_fondo FROM PUBLIC, anon, authenticated, service_role',
      'GRANT SELECT ON TABLE public.registrazioni_calcolo_fondo TO service_role',
    ]);
  });

  it('DB-MIG-C-05: preserves all historical rows and columns and adds no webhook endpoint', () => {
    expect(withoutComments(c)).not.toMatch(/\b(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM|TRUNCATE(?:\s+TABLE)?|DROP\s+TABLE)\s+public\.registrazioni_calcolo_fondo\b/i);
    expect(withoutComments(c)).not.toMatch(/DROP\s+COLUMN/i);
    expect(c).not.toMatch(/https?:\/\/|webhook|token/i);
  });

  it('all three migrations avoid existing-data DML and table removal', () => {
    for (const sql of [a, b, c]) {
      expect(withoutComments(sql)).not.toMatch(/\b(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM|TRUNCATE(?:\s+TABLE)?|DROP\s+TABLE)\s+public\.(?:user_app_state|entities|profiles|registrazioni_calcolo_fondo)\b/i);
      expect(withoutComments(sql)).not.toMatch(/DROP\s+TABLE|DROP\s+COLUMN/i);
      expect(withoutComments(sql)).not.toMatch(/^\s*(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM|TRUNCATE(?:\s+TABLE)?)\b/im);
    }
  });
});
