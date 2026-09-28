import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = (name: string) =>
  readFileSync(resolve(process.cwd(), 'supabase', 'migrations', name), 'utf8');

const a = migration('20260928000000_harden_user_app_state_closed_boundary.sql');
const b = migration('20260928000001_restrict_atomic_closure_execute.sql');
const c = migration('20260928000002_quarantine_registrazioni_calcolo_fondo.sql');

const withoutComments = (sql: string) => sql.replace(/--[^\r\n]*/g, '');
const statements = (sql: string) => withoutComments(sql).split(';').map(part => part.trim()).filter(Boolean);

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
