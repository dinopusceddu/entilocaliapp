// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

const source = readFileSync(resolve(process.cwd(), 'supabase/functions/update-password/index.ts'), 'utf8');
// Execute the real Edge handler, replacing only its two remote import boundaries.
const importLines = /^import \{ (?:serve|createClient) \} from 'https:\/\/[^']+'\r?\n/gm;
const handlerCode = ts.transpileModule(source.replace(importLines, ''), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None },
}).outputText;

const callerId = 'verified-caller-id';
const targetId = 'different-target-id';
const forbidden = 'Forbidden: Only Admins can change passwords';
const validBody = { targetUserId: targetId, newPassword: 'test-password' };
type MetadataField = 'user_metadata' | 'app_metadata' | 'raw_user_meta_data' | 'raw_app_meta_data';
type Snapshot = { role: string; snapshotStatus: 'OPEN' | 'CLOSED' };
type Fixture = {
  role?: string | null;
  missingProfile?: boolean;
  missingUser?: boolean;
  authError?: boolean;
  lookupError?: boolean;
  lookupRejection?: boolean;
  metadata?: Partial<Record<MetadataField, { role: string }>>;
  snapshots?: Snapshot[];
  targetRole?: string;
  updateError?: boolean;
};

function harness(fixture: Fixture = {}) {
  const events: string[] = [];
  const user = {
    id: callerId,
    user_metadata: { role: 'GUEST' }, app_metadata: { role: 'GUEST' },
    raw_user_meta_data: { role: 'GUEST' }, raw_app_meta_data: { role: 'GUEST' },
    ...fixture.metadata,
  };
  const profiles = new Map([
    [callerId, fixture.missingProfile ? null : { role: fixture.role ?? null }],
    [targetId, { role: fixture.targetRole ?? 'GUEST' }],
  ]);
  const user_app_state = fixture.snapshots ?? [];
  let queriedId = '';
  const getUser = vi.fn(async () => {
    events.push('verified JWT');
    return { data: { user: fixture.missingUser ? null : user }, error: fixture.authError ? new Error('private JWT detail') : null };
  });
  const updateUserById = vi.fn(async (_id: string, _attributes: { password: string }) => {
    events.push('password mutation');
    return { error: fixture.updateError ? new Error('Update failed') : null };
  });
  const maybeSingle = vi.fn(async () => {
    events.push('caller profile resolved');
    if (fixture.lookupRejection) throw new Error('private SQL connection detail');
    return { data: profiles.get(queriedId) ?? null, error: fixture.lookupError ? new Error('private SQL detail') : null };
  });
  const eq = vi.fn((_column: string, id: string) => {
    queriedId = id;
    return { maybeSingle };
  });
  const select = vi.fn((_columns: string) => ({ eq }));
  const from = vi.fn((_table: string) => ({ select }));
  const createClient = vi.fn((_url: string, key: string) => {
    if (key === 'test-anon-key') return { auth: { getUser } };
    expect(key).toBe('test-service-key');
    return { from, auth: { admin: { updateUserById } } };
  });
  let handler!: (req: Request) => Promise<Response>;
  const env: Record<string, string> = {
    SUPABASE_URL: 'https://supabase.example.invalid',
    SUPABASE_ANON_KEY: 'test-anon-key', SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
  };
  runInNewContext(handlerCode, {
    serve: (callback: typeof handler) => { handler = callback; },
    createClient, Response, Deno: { env: { get: (key: string) => env[key] } },
  });
  const request = (body: unknown = validBody, authorization: string | null = 'Bearer test-jwt') => {
    const req = new Request('https://edge.example.invalid/update-password', {
      method: 'POST', headers: authorization === null ? {} : { Authorization: authorization },
      body: JSON.stringify(body),
    });
    return { req, json: vi.spyOn(req, 'json') };
  };
  return { handler, request, getUser, updateUserById, from, select, eq, maybeSingle, createClient, events, user_app_state };
}

function expectCallerLookup(h: ReturnType<typeof harness>) {
  expect(h.from.mock.calls).toEqual([['profiles']]);
  expect(h.select.mock.calls).toEqual([['role']]);
  expect(h.eq.mock.calls).toEqual([['id', callerId]]);
  expect(h.maybeSingle).toHaveBeenCalledOnce();
}

async function expectDenied(fixture: Fixture, error: string = forbidden, body: unknown = validBody, authorization: string | null = 'Bearer test-jwt') {
  const h = harness(fixture);
  const { req, json } = h.request(body, authorization);
  const response = await h.handler(req);
  // Preserve this endpoint's existing HTTP 400 error contract.
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error });
  expect(h.updateUserById).not.toHaveBeenCalled();
  expect(json).not.toHaveBeenCalled();
  if (error === 'Unauthorized') {
    expect(h.from).not.toHaveBeenCalled();
  } else {
    expectCallerLookup(h);
  }
  return h;
}

describe('AUTH_ADMIN_02A_PASSWORD_CANONICAL_AUTH', () => {
  it('denies missing Authorization without creating a client or mutating passwords', async () => {
    const h = await expectDenied({ role: 'ADMIN' }, 'Unauthorized', validBody, null);
    expect(h.createClient).not.toHaveBeenCalled();
    expect(h.getUser).not.toHaveBeenCalled();
  });

  it('denies invalid JWT / getUser error even if a user is returned', async () => {
    await expectDenied({ role: 'ADMIN', authError: true }, 'Unauthorized');
  });

  it('denies getUser with no verified user', async () => {
    await expectDenied({ role: 'ADMIN', missingUser: true }, 'Unauthorized');
  });

  it('denies a verified caller without a profile', async () => {
    await expectDenied({ missingProfile: true });
  });

  it.each([null, 'GUEST', 'USER', 'admin', ' ADMIN ', '', 'UNEXPECTED'])('denies canonical role %s with zero password mutations', async role => {
    await expectDenied({ role });
  });

  it.each([callerId, targetId])('preserves ADMIN password update for target %s', async targetUserId => {
    const h = harness({ role: 'ADMIN', targetRole: 'USER' });
    const response = await h.handler(h.request({ ...validBody, targetUserId }).req);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, message: 'Password updated successfully' });
    expect(h.updateUserById.mock.calls).toEqual([[targetUserId, { password: validBody.newPassword }]]);
    expectCallerLookup(h);
    expect(h.events).toEqual(['verified JWT', 'caller profile resolved', 'password mutation']);
    expect(h.createClient.mock.calls[0]).toEqual([
      'https://supabase.example.invalid', 'test-anon-key',
      { global: { headers: { Authorization: 'Bearer test-jwt' } } },
    ]);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('authorization, x-client-info, apikey, content-type');
  });

  it('does not add USER self-service password changes', async () => {
    await expectDenied({ role: 'USER' }, forbidden, { ...validBody, targetUserId: callerId });
  });

  it.each<MetadataField>(['user_metadata', 'app_metadata', 'raw_user_meta_data', 'raw_app_meta_data'])('ignores forged ADMIN in %s', async field => {
    await expectDenied({ role: 'USER', metadata: { [field]: { role: 'ADMIN' } } });
  });

  it('ignores ADMIN snapshot mirror, body role and spoofed caller ID for a USER caller', async () => {
    const h = await expectDenied({
      role: 'USER', targetRole: 'ADMIN', snapshots: [{ role: 'ADMIN', snapshotStatus: 'CLOSED' }],
    }, forbidden, {
      ...validBody, role: 'ADMIN', callerRole: 'ADMIN', callerId: targetId, userId: targetId, user_id: targetId, id: targetId,
    });
    expect(h.user_app_state[0].role).toBe('ADMIN');
  });

  it.each([0, 1, 3])('snapshot count %s and CLOSED/mixed roles cannot affect USER denial or ADMIN allow', async count => {
    const snapshots: Snapshot[] = Array.from({ length: count }, (_, i) => ({
      role: i % 2 ? 'USER' : 'ADMIN', snapshotStatus: i % 2 ? 'OPEN' : 'CLOSED',
    }));
    await expectDenied({ role: 'USER', snapshots });
    const h = harness({ role: 'ADMIN', snapshots });
    expect((await h.handler(h.request().req)).status).toBe(200);
    expect(h.updateUserById).toHaveBeenCalledOnce();
    expectCallerLookup(h);
  });

  it('allows canonical ADMIN despite non-admin metadata, state, body and target role', async () => {
    const h = harness({
      role: 'ADMIN', targetRole: 'GUEST', snapshots: [{ role: 'USER', snapshotStatus: 'CLOSED' }],
      metadata: {
        user_metadata: { role: 'USER' }, app_metadata: { role: 'GUEST' },
        raw_user_meta_data: { role: 'USER' }, raw_app_meta_data: { role: 'GUEST' },
      },
    });
    const response = await h.handler(h.request({ ...validBody, role: 'GUEST', callerId: targetId }).req);
    expect(response.status).toBe(200);
    expectCallerLookup(h);
    expect(h.updateUserById.mock.calls).toEqual([[targetId, { password: validBody.newPassword }]]);
  });

  it('does not authorize a USER caller from the different ADMIN target profile', async () => {
    await expectDenied({ role: 'USER', targetRole: 'ADMIN' });
  });

  it.each(['lookupError', 'lookupRejection'] as const)('fails closed on %s and hides database details even with ADMIN data', async field => {
    await expectDenied({ role: 'ADMIN', [field]: true }, 'Authorization check failed');
  });

  it.each([
    { targetUserId: '', newPassword: 'test-password' },
    { targetUserId: targetId, newPassword: '' },
    { targetUserId: targetId, newPassword: '12345' },
  ])('preserves invalid-input denial after ADMIN authorization: %j', async body => {
    const h = harness({ role: 'ADMIN' });
    const { req, json } = h.request(body);
    const response = await h.handler(req);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid input: Password must be at least 6 characters' });
    expect(json).toHaveBeenCalledOnce();
    expect(h.updateUserById).not.toHaveBeenCalled();
    expectCallerLookup(h);
  });

  it('preserves the existing six-character minimum', async () => {
    const h = harness({ role: 'ADMIN' });
    expect((await h.handler(h.request({ ...validBody, newPassword: '123456' }).req)).status).toBe(200);
    expect(h.updateUserById.mock.calls).toEqual([[targetId, { password: '123456' }]]);
  });

  it('denies USER before parsing malformed JSON', async () => {
    const h = harness({ role: 'USER' });
    const req = new Request('https://edge.example.invalid/update-password', {
      method: 'POST', headers: { Authorization: 'Bearer test-jwt' }, body: '{',
    });
    const json = vi.spyOn(req, 'json');
    expect((await h.handler(req)).status).toBe(400);
    expect(h.updateUserById).not.toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
  });

  it('preserves Admin Auth failure behavior after authorization', async () => {
    const h = harness({ role: 'ADMIN', updateError: true });
    const response = await h.handler(h.request().req);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Update failed' });
    expect(h.updateUserById).toHaveBeenCalledOnce();
  });

  it('preserves preflight with no authentication or mutation', async () => {
    const h = harness();
    const response = await h.handler(new Request('https://edge.example.invalid/update-password', { method: 'OPTIONS' }));
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('ok');
    expect(h.createClient).not.toHaveBeenCalled();
    expect(h.updateUserById).not.toHaveBeenCalled();
  });

  it('PROFILES_ROLE_IS_CANONICAL: no competing metadata, snapshot, body or frontend authority', () => {
    expect(source.match(importLines)).toHaveLength(2);
    expect(source).not.toMatch(/raw_user_meta_data|raw_app_meta_data|user_metadata|app_metadata|user_app_state|localStorage|sessionStorage/);
    expect(source).toMatch(/const \{ targetUserId, newPassword \} = await req\.json\(\)/);
  });
});


describe('Supabase built-in privileged client configuration', () => {
  it('requires the built-in service role variable and never reads the custom alias', () => {
    expect(source).toContain("Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')");
    expect(source).not.toContain("Deno.env.get('SERVICE_ROLE_KEY')");
  });
});
