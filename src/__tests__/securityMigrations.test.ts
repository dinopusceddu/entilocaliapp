import { existsSync, readFileSync, readdirSync } from 'node:fs';
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

const requiredReleaseMigrationHashes: Readonly<Record<string, string>> = {
  '20260928000000_harden_user_app_state_closed_boundary.sql': '89726EA86CC5032729C5E2ECB0B5D8882973BB3797F7EFCA3437254C8DD4A454',
  '20260928000001_restrict_atomic_closure_execute.sql': '3A5A569F502A62698256B7E0810EDFECAB9F42E69E261387C15999A4DB73D23D',
  '20260928000002_quarantine_registrazioni_calcolo_fondo.sql': '3A239DB6383D12AC38A4AA054053D6A6A01C9B0CE0184D30D908DABC1D20621D',
};

// Only these two RELEASE=NO bootstrap artifacts may be absent. If present,
// their original byte-for-byte audit remains mandatory.
const optionalLocalHistoricalMigrationHashes: Readonly<Record<string, string>> = {
  '20260220000001_init_user_profiles.sql': 'CF63DDE75A0EAE4F8929CFCB9EE27E588F12AE0B3AFDA33129DCF0B33DCFE8A6',
  '20260220000004_fix_profiles_recursion.sql': '73D58EBC0C606BF178D9A24EEE9D5063C349C7DDF209C84841B6FB7C1BCA2124',
};

const readMigrationBytes = (name: string): Buffer | undefined => {
  const path = resolve(process.cwd(), 'supabase', 'migrations', name);
  return existsSync(path) ? readFileSync(path) : undefined;
};

const verifyFrozenMigration = (
  name: string,
  readBytes: (name: string) => Buffer | undefined = readMigrationBytes,
) => {
  const required = Object.prototype.hasOwnProperty.call(requiredReleaseMigrationHashes, name);
  const historical = Object.prototype.hasOwnProperty.call(optionalLocalHistoricalMigrationHashes, name);
  if (!required && !historical) throw new Error(`Unknown frozen migration: ${name}`);

  const expectedHash = required
    ? requiredReleaseMigrationHashes[name]
    : optionalLocalHistoricalMigrationHashes[name];
  const bytes = readBytes(name);
  if (bytes === undefined) {
    expect(historical, `Missing required release migration: ${name}`).toBe(true);
  } else {
    expect(createHash('sha256').update(bytes).digest('hex').toUpperCase(), `Frozen migration hash: ${name}`)
      .toBe(expectedHash);
  }
};

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

  it('T-STATIC-10: freezes required release migrations and audits excluded local history when present', () => {
    // The profile-role migration is required above and its exact function/body
    // contract is independently covered by T-STATIC-01 through T-STATIC-09.
    for (const name of Object.keys(requiredReleaseMigrationHashes)) verifyFrozenMigration(name);
    for (const name of Object.keys(optionalLocalHistoricalMigrationHashes)) verifyFrozenMigration(name);
  });

  it('T-STATIC-10-PROBE-A: missing required release migrations fail', () => {
    for (const name of Object.keys(requiredReleaseMigrationHashes)) {
      expect(() => verifyFrozenMigration(name, () => undefined)).toThrow('Missing required release migration');
    }
  });

  it('T-STATIC-10-PROBE-B: missing explicitly excluded historical migrations are allowed', () => {
    for (const name of Object.keys(optionalLocalHistoricalMigrationHashes)) {
      expect(() => verifyFrozenMigration(name, () => undefined)).not.toThrow();
    }
  });

  it('T-STATIC-10-PROBE-C: historical migrations present with a wrong hash fail', () => {
    for (const name of Object.keys(optionalLocalHistoricalMigrationHashes)) {
      expect(() => verifyFrozenMigration(name, () => Buffer.from('wrong historical bytes')))
        .toThrow('Frozen migration hash');
    }
  });

  it('T-STATIC-10-PROBE-D: release migrations present with a wrong hash fail', () => {
    for (const name of Object.keys(requiredReleaseMigrationHashes)) {
      expect(() => verifyFrozenMigration(name, () => Buffer.from('wrong release bytes')))
        .toThrow('Frozen migration hash');
    }
  });

  it('T-STATIC-10-PROBE-E: arbitrary missing migrations are never implicitly optional', () => {
    expect(() => verifyFrozenMigration('unexpected_missing_migration.sql', () => undefined))
      .toThrow('Unknown frozen migration');
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


// POST-ASTRA release hardening: current objects only. Managed-role defaults
// are deliberately unchanged. New application DDL must carry explicit ACLs.
const specialAclName = '20261009000000_harden_client_special_privileges.sql';
const specialAcl = migration(specialAclName);
const specialAclTables = [
  'document_chunks', 'entities', 'knowledge_documents', 'message_reads', 'messages',
  'notification_reads', 'notifications', 'pareri_aran_staging', 'profiles', 'wizard2026_drafts',
].map(name => 'public.' + name);
const registrationSequence = 'public.registrazioni_calcolo_fondo_id_registrazione_seq';
const aclSource = (sql: string) => withoutComments(sql.replace(/\/\*[\s\S]*?\*\//g, ''));
const aclStatements = (sql: string) => aclSource(sql).split(';').map(s => s.trim()).filter(Boolean);
const revokeContracts = (sql: string) => aclStatements(sql).flatMap(statement => {
  const match = statement.match(/^REVOKE\s+([\w,\s]+)\s+ON\s+(TABLE|SEQUENCE)\s+([\w.,\s]+)\s+FROM\s+([\w,\s]+)$/i);
  return match ? [{
    kind: match[2].toUpperCase(),
    privileges: match[1].toUpperCase().split(',').map(s => s.trim()),
    targets: match[3].toLowerCase().split(',').map(s => s.trim()),
    roles: match[4].toLowerCase().split(',').map(s => s.trim()),
  }] : [];
});

// This is a fail-closed static DDL guard, not a PostgreSQL parser/runtime
// simulation. Complex/quoted/dynamic CREATE and implicit sequences require
// an explicit reviewed extension to this contract before release.
const futureClientAclViolations = (sql: string): string[] => {
  const source = aclSource(sql);
  const violations: string[] = [];
  const revokes = revokeContracts(sql);
  if (/\bGRANT\s+[^;]*\b(?:ALL|TRUNCATE|TRIGGER|REFERENCES)\b[^;]*\bTO\s+[^;]*\b(?:anon|authenticated|public)\b/i.test(source)) {
    violations.push('Unreviewed broad or special client GRANT');
  }
  for (const kind of ['TABLE', 'SEQUENCE'] as const) {
    const creates = source.match(new RegExp('\\bCREATE\\s+(?:(?:UNLOGGED|TEMPORARY|TEMP)\\s+)?' + kind + '\\b', 'gi')) ?? [];
    const names = Array.from(source.matchAll(new RegExp(
      '\\bCREATE\\s+(?:(?:UNLOGGED|TEMPORARY|TEMP)\\s+)?' + kind + '\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?((?:public\\.)?[a-z_][a-z_0-9]*)\\s*(?=\\(|;|\\bAS\\b|\\bSTART\\b|\\bINCREMENT\\b)', 'gi',
    )), m => m[1].includes('.') ? m[1].toLowerCase() : 'public.' + m[1].toLowerCase());
    if (names.length !== creates.length) violations.push('Unsupported CREATE ' + kind + ' requires reviewed ACL contract');
    const required = kind === 'TABLE' ? ['TRUNCATE', 'TRIGGER', 'REFERENCES'] : ['SELECT', 'UPDATE', 'USAGE'];
    for (const name of names) for (const role of ['anon', 'authenticated']) {
      if (!revokes.some(r => r.kind === kind && r.targets.includes(name) && r.roles.includes(role)
        && required.every(p => r.privileges.includes(p)))) {
        violations.push('Missing explicit ' + kind + ' ACL for ' + name + '/' + role);
      }
    }
  }
  if (/\b(?:SMALLSERIAL|SERIAL|BIGSERIAL|IDENTITY)\b/i.test(source)) {
    violations.push('Implicit sequence requires reviewed ACL contract');
  }
  return violations;
};

describe('POST-ASTRA client special ACL hardening (static contracts)', () => {
  it('ACL-01: requires the new forward migration after the pending Auth migration', () => {
    expect(specialAcl.trim()).not.toBe('');
    expect(specialAclName.slice(0, 14) > roleFixName.slice(0, 14)).toBe(true);
  });

  it.each(['anon', 'authenticated'])('ACL-02: revokes only special table privileges for %s on exactly ten tables', role => {
    const contracts = revokeContracts(specialAcl).filter(r => r.kind === 'TABLE');
    expect(contracts).toHaveLength(1);
    expect(contracts[0].privileges).toEqual(['TRUNCATE', 'TRIGGER', 'REFERENCES']);
    expect(contracts[0].targets).toEqual(specialAclTables);
    expect(contracts[0].roles).toContain(role);
    expect(contracts[0].roles).toEqual(['anon', 'authenticated']);
  });

  it.each(['anon', 'authenticated'])('ACL-03: revokes the three sequence privileges for %s', role => {
    const contracts = revokeContracts(specialAcl).filter(r => r.kind === 'SEQUENCE');
    expect(contracts).toHaveLength(1);
    expect(contracts[0].privileges).toEqual(['SELECT', 'UPDATE', 'USAGE']);
    expect(contracts[0].targets).toEqual([registrationSequence]);
    expect(contracts[0].roles).toContain(role);
    expect(contracts[0].roles).toEqual(['anon', 'authenticated']);
  });

  it('ACL-04: contains exactly two REVOKEs and preserves table CRUD', () => {
    expect(aclStatements(specialAcl)).toHaveLength(2);
    expect(revokeContracts(specialAcl)).toHaveLength(2);
    expect(sqlTokens(specialAcl)).toEqual(sqlTokens(
      'REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLE ' + specialAclTables.join(', ') + ' FROM anon, authenticated;'
      + ' REVOKE SELECT, UPDATE, USAGE ON SEQUENCE ' + registrationSequence + ' FROM anon, authenticated;',
    ));
    expect(revokeContracts(specialAcl).filter(r => r.kind === 'TABLE').flatMap(r => r.privileges))
      .not.toEqual(expect.arrayContaining(['SELECT', 'INSERT', 'UPDATE', 'DELETE']));
  });

  it('ACL-05: does not touch service_role, PUBLIC, defaults, RLS, functions, triggers or rows', () => {
    expect(aclSource(specialAcl)).not.toMatch(/\b(?:service_role|ALTER|CREATE|DROP|INSERT|DELETE|GRANT|POLICY|FUNCTION|DEFAULT)\b/i);
    expect(aclSource(specialAcl)).not.toMatch(/\buser_app_state\b|\bhandle_new_user_profile\b|\bclose_annual_snapshot_atomic\b/i);
    expect(aclStatements(specialAcl).every(s => /^REVOKE\b/i.test(s))).toBe(true);
  });

  it('ACL-06: preserves the Auth migration byte for byte', () => {
    expect(createHash('sha256').update(readFileSync(resolve(process.cwd(), 'supabase/migrations', roleFixName))).digest('hex'))
      .toBe('8670e439cd6fa8ae969652445637168491afd3388de710ce2ae9e2752ef2614d');
  });

  it('ACL-07: excluded historical migrations stay optional and frozen when present', () => {
    const historical: Record<string, string> = {
      '20260220000000_init_user_app_state.sql': 'f46d6e0a646dafa96ee4534732c508d97df31752891e8b2d65db7e70a3b588c1',
      '20260220000001_init_user_profiles.sql': 'cf63dde75a0eae4f8929cfcb9ee27e588f12ae0b3afda33129dcf0b33dcfe8a6',
      '20260220000002_init_multi_entity.sql': '95f929934a991a5cdc7cd5ba57de6f3df303fd6fa4259de99b38ed8504fc3cb9',
      '20260220000003_init_fix_admin_access.sql': '5a924bd7584b3fe6929a0a8388d75add51af87579f8c888ba847e7342a86ed9d',
      '20260220000004_fix_profiles_recursion.sql': '73d58ebc0c606bf178d9a24eee9d5063c349c7ddf209c84841b6fb7c1bca2124',
      '20260220000005_confirm_email.sql': '54749ce0a3c871bd0e303a4dc9c9fc28b814544b8b3c44b2c91d83cba543b108',
      '20260220000006_make_admin.sql': 'd5c66ca93d86bba97635d12ed4c81a2ef74c98eec3e6a8a4e6644fbec82c3715',
      '20260220000007_seed_guest_user.sql': '79dbd04b765728936cd149985fce22fd89d0948b33192c2b5f1a6d17a0b6ed6b',
      '20260220000022_remote_baseline.sql': '1521cff930edfe26c7cb26109233d0bfd8f29833806d667a981c8f3cc7285830',
    };
    for (const [name, hash] of Object.entries(historical)) {
      const bytes = readMigrationBytes(name);
      if (bytes !== undefined) expect(createHash('sha256').update(bytes).digest('hex'), name).toBe(hash);
    }
  });

  it('ACL-08: guards every forward application migration while defaults are deferred', () => {
    // No exemptions. A future exception must change this reviewed test contract.
    for (const name of readdirSync(resolve(process.cwd(), 'supabase/migrations'))
      .filter(name => name.endsWith('.sql') && name.split('_')[0] >= '20261009000000')) {
      expect(futureClientAclViolations(migration(name)), name).toEqual([]);
    }
  });

  it.each([
    'GRANT ALL ON TABLE public.example TO anon;',
    'GRANT ALL PRIVILEGES ON TABLE public.example TO authenticated;',
    'GRANT ALL ON TABLE public.example TO PUBLIC;',
    'GRANT TRUNCATE ON TABLE public.example TO authenticated;',
  ])('ACL-GUARD-01: rejects broad/special grants: %s', sql => {
    expect(futureClientAclViolations(sql)).toContain('Unreviewed broad or special client GRANT');
  });

  it('ACL-GUARD-02: rejects a future table without explicit special-ACL revokes', () => {
    expect(futureClientAclViolations('CREATE TABLE public.example (id uuid PRIMARY KEY);')).toHaveLength(2);
  });

  it('ACL-GUARD-03: accepts CRUD plus explicit table revokes for both clients', () => {
    expect(futureClientAclViolations(
      'CREATE TABLE public.example (id uuid PRIMARY KEY);'
      + ' GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.example TO authenticated;'
      + ' REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLE public.example FROM anon, authenticated;',
    )).toEqual([]);
  });

  it('ACL-GUARD-04: rejects future sequence or unsupported implicit sequence contracts', () => {
    expect(futureClientAclViolations('CREATE SEQUENCE public.example_seq;')).toHaveLength(2);
    expect(futureClientAclViolations('CREATE TABLE public.example (id bigint GENERATED ALWAYS AS IDENTITY);'))
      .toContain('Implicit sequence requires reviewed ACL contract');
  });

  it('ACL-GUARD-05: accepts an explicitly hardened future sequence', () => {
    expect(futureClientAclViolations(
      'CREATE SEQUENCE public.example_seq;'
      + ' REVOKE SELECT, UPDATE, USAGE ON SEQUENCE public.example_seq FROM anon, authenticated;',
    )).toEqual([]);
  });

  it('ACL-GUARD-06: rejects unsupported quoted/dynamic table DDL for review', () => {
    expect(futureClientAclViolations('CREATE TABLE "public"."example" (id uuid);'))
      .toContain('Unsupported CREATE TABLE requires reviewed ACL contract');
  });
});
