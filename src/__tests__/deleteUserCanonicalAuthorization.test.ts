// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

const source = readFileSync(resolve(process.cwd(), 'supabase/functions/delete-user/index.ts'), 'utf8');
// Execute the production handler; replace only its two remote import boundaries.
const importLines = /^import \{ (?:serve|createClient) \} from 'https:\/\/[^']+'\r?\n/gm;
const handlerCode = ts.transpileModule(source.replace(importLines, ''), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None },
}).outputText;

const callerId = 'verified-caller-id';
const targetId = 'different-target-id';
const forbidden = 'Unauthorized: Admin access required';
const validBody = { userId: targetId };
type MetadataField = 'user_metadata' | 'app_metadata' | 'raw_user_meta_data' | 'raw_app_meta_data';
type Snapshot = { role: string; snapshotStatus: 'OPEN' | 'CLOSED' };
type LookupResult = { data: { role: string | null } | null; error: Error | null };
type Fixture = {
  role?: string | null;
  missingProfile?: boolean;
  missingUser?: boolean;
  authError?: boolean;
  authRejection?: boolean;
  lookupError?: boolean;
  lookupRejection?: boolean;
  pendingLookup?: Promise<LookupResult>;
  metadata?: Partial<Record<MetadataField, { role: string }>>;
  snapshots?: Snapshot[];
  customRoleClaim?: string;
  targetRole?: string;
  deleteError?: boolean;
};

function harness(fixture: Fixture = {}) {
  const events: string[] = [];
  const user = {
    id: callerId,
    user_metadata: { role: 'GUEST' }, app_metadata: { role: 'GUEST' },
    raw_user_meta_data: { role: 'GUEST' }, raw_app_meta_data: { role: 'GUEST' },
    role: fixture.customRoleClaim ?? 'GUEST',
    ...fixture.metadata,
  };
  const profiles = new Map([
    [callerId, fixture.missingProfile ? null : { role: fixture.role ?? null }],
    [targetId, { role: fixture.targetRole ?? 'GUEST' }],
  ]);
  // Adversarial state fixture is available at the SDK boundary, never to the handler.
  const user_app_state = fixture.snapshots ?? [];
  let queriedId = '';
  const getUser = vi.fn(async () => {
    events.push('verified JWT');
    if (fixture.authRejection) throw new Error('Authentication unavailable');
    return { data: { user: fixture.missingUser ? null : user }, error: fixture.authError ? new Error('private JWT detail') : null };
  });
  // Sole destructive API in this endpoint. DB cascades cannot start if this is uncalled.
  const deleteUser = vi.fn(async (_id: string) => {
    events.push('Auth deletion');
    return { error: fixture.deleteError ? new Error('Deletion failed') : null };
  });
  const maybeSingle = vi.fn(async () => {
    if (fixture.lookupRejection) throw new Error('private SQL connection detail');
    const result = fixture.pendingLookup ? await fixture.pendingLookup : {
      data: profiles.get(queriedId) ?? null,
      error: fixture.lookupError ? new Error('private SQL detail') : null,
    };
    events.push('caller profile resolved');
    return result;
  });
  const eq = vi.fn((_column: string, id: string) => {
    queriedId = id;
    return { maybeSingle };
  });
  const select = vi.fn((_columns: string) => ({ eq }));
  const from = vi.fn((table: string) => {
    if (table === 'user_app_state') throw new Error('Snapshot roles must never be queried');
    expect(table).toBe('profiles');
    return { select };
  });
  const createClient = vi.fn((_url: string, key: string) => {
    if (key === 'test-anon-key') return { auth: { getUser } };
    expect(key).toBe('test-service-key');
    return { from, auth: { admin: { deleteUser } } };
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
    const req = new Request('https://edge.example.invalid/delete-user', {
      method: 'POST', headers: authorization === null ? {} : { Authorization: authorization },
      body: JSON.stringify(body),
    });
    const json = vi.spyOn(req, 'json').mockImplementation(async () => {
      events.push('target body parsed');
      return JSON.parse(await req.text());
    });
    return { req, json };
  };
  return { handler, request, getUser, deleteUser, from, select, eq, maybeSingle, createClient, events, user_app_state };
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
  // Retain the endpoint's existing HTTP 400 denial/error contract.
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error });
  expect(h.deleteUser).not.toHaveBeenCalled();
  expect(json).not.toHaveBeenCalled();
  if (error === 'Unauthorized' || error === 'Authentication unavailable') {
    expect(h.from).not.toHaveBeenCalled();
  } else {
    expectCallerLookup(h);
  }
  return h;
}

async function expectAllowed(fixture: Fixture = {}, body: typeof validBody & Record<string, unknown> = validBody) {
  const h = harness({ role: 'ADMIN', ...fixture });
  const { req, json } = h.request(body);
  const response = await h.handler(req);
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ success: true, message: `User ${body.userId} deleted successfully` });
  expectCallerLookup(h);
  expect(h.deleteUser.mock.calls).toEqual([[body.userId]]);
  expect(json).toHaveBeenCalledOnce();
  expect(h.events).toEqual(['verified JWT', 'caller profile resolved', 'target body parsed', 'Auth deletion']);
  return h;
}

describe('AUTH_ADMIN_02B_DELETE_CANONICAL_AUTH', () => {
  it('denies no Authorization before client creation or any destructive operation', async () => {
    const h = await expectDenied({ role: 'ADMIN' }, 'Unauthorized', validBody, null);
    expect(h.createClient).not.toHaveBeenCalled();
    expect(h.getUser).not.toHaveBeenCalled();
  });

  it('denies invalid JWT / getUser error even with a returned user', async () => {
    await expectDenied({ role: 'ADMIN', authError: true }, 'Unauthorized');
  });

  it('denies getUser without a verified user', async () => {
    await expectDenied({ role: 'ADMIN', missingUser: true }, 'Unauthorized');
  });

  it('denies getUser Promise rejection with zero destructive actions', async () => {
    await expectDenied({ role: 'ADMIN', authRejection: true }, 'Authentication unavailable');
  });

  it('denies a caller without a profile', async () => {
    await expectDenied({ missingProfile: true });
  });

  it.each([null, 'GUEST', 'USER', 'admin', ' ADMIN ', '', 'UNEXPECTED'])('denies canonical role %s with zero destructive mutations', async role => {
    await expectDenied({ role });
  });

  it('allows canonical ADMIN and preserves the one-argument Auth deletion and success response', async () => {
    const h = await expectAllowed();
    expect(h.createClient.mock.calls).toEqual([
      ['https://supabase.example.invalid', 'test-anon-key', { global: { headers: { Authorization: 'Bearer test-jwt' } } }],
      ['https://supabase.example.invalid', 'test-service-key'],
    ]);
  });

  it.each<MetadataField>(['user_metadata', 'app_metadata', 'raw_user_meta_data', 'raw_app_meta_data'])('ignores forged ADMIN in %s when profiles.role is USER', async field => {
    await expectDenied({ role: 'USER', metadata: { [field]: { role: 'ADMIN' } } });
  });

  it('ignores custom ADMIN role claims when profiles.role is USER', async () => {
    await expectDenied({ role: 'USER', customRoleClaim: 'ADMIN' });
  });

  it.each<{ snapshots: Snapshot[] }>([
    { snapshots: [] }, { snapshots: [{ role: 'ADMIN', snapshotStatus: 'OPEN' }] },
    { snapshots: [{ role: 'ADMIN', snapshotStatus: 'CLOSED' }, { role: 'ADMIN', snapshotStatus: 'OPEN' }, { role: 'ADMIN', snapshotStatus: 'CLOSED' }] },
  ])('denies USER regardless of snapshot number, ADMIN mirror, or CLOSED state (%j)', async ({ snapshots }) => {
    const h = await expectDenied({ role: 'USER', snapshots });
    expect(h.user_app_state).toEqual(snapshots);
  });

  it('ignores forged ADMIN body role', async () => {
    await expectDenied({ role: 'USER' }, forbidden, { ...validBody, role: 'ADMIN', callerRole: 'ADMIN' });
  });

  it('ignores a spoofed body callerId and user_id even when they identify an ADMIN profile', async () => {
    await expectDenied({ role: 'USER', targetRole: 'ADMIN' }, forbidden, {
      ...validBody, callerId: targetId, user_id: targetId, role: 'ADMIN',
    });
  });

  it('denies USER deleting self', async () => {
    await expectDenied({ role: 'USER' }, forbidden, { userId: callerId });
  });

  it('denies USER targeting ADMIN; target role never authorizes the caller', async () => {
    await expectDenied({ role: 'USER', targetRole: 'ADMIN' });
  });

  it('preserves ADMIN targeting USER', async () => {
    await expectAllowed({ targetRole: 'USER' });
  });

  it('preserves ADMIN targeting another ADMIN', async () => {
    await expectAllowed({ targetRole: 'ADMIN' });
  });

  it('preserves server-side ADMIN self-deletion', async () => {
    await expectAllowed({}, { userId: callerId });
  });

  it('masks profile lookup errors, including an error returned with an ADMIN row', async () => {
    await expectDenied({ role: 'ADMIN', lookupError: true }, 'Authorization check failed');
  });

  it('masks profile lookup Promise rejection and performs no destructive actions', async () => {
    await expectDenied({ role: 'ADMIN', lookupRejection: true }, 'Authorization check failed');
  });

  it('denies malformed JSON from non-admin before parsing', async () => {
    const h = harness({ role: 'USER' });
    const req = new Request('https://edge.example.invalid/delete-user', {
      method: 'POST', headers: { Authorization: 'Bearer test-jwt' }, body: '{invalid-json',
    });
    const json = vi.spyOn(req, 'json');
    const response = await h.handler(req);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: forbidden });
    expect(json).not.toHaveBeenCalled();
    expect(h.deleteUser).not.toHaveBeenCalled();
    expectCallerLookup(h);
  });

  it.each<{ snapshots: Snapshot[] }>([
    { snapshots: [] }, { snapshots: [{ role: 'USER', snapshotStatus: 'OPEN' }] },
    { snapshots: [{ role: 'GUEST', snapshotStatus: 'CLOSED' }, { role: 'USER', snapshotStatus: 'OPEN' }] },
  ])('allows canonical ADMIN despite non-admin metadata, state and body (%j)', async ({ snapshots }) => {
    await expectAllowed({ snapshots, targetRole: 'USER' }, {
      ...validBody, role: 'USER', callerRole: 'GUEST', callerId: targetId, targetRole: 'GUEST',
    });
  });

  it.each(['ADMIN', 'USER'])('performs no parsing or destruction while canonical %s lookup is pending', async role => {
    let resolveLookup!: (result: LookupResult) => void;
    const pendingLookup = new Promise<LookupResult>(resolveResult => { resolveLookup = resolveResult; });
    const h = harness({ pendingLookup });
    const { req, json } = h.request();
    const responsePromise = h.handler(req);
    // Advance through getUser into the pending external profile read.
    await new Promise<void>(resolveTick => setImmediate(resolveTick));
    expect(h.maybeSingle).toHaveBeenCalledOnce();
    expect(json).not.toHaveBeenCalled();
    expect(h.deleteUser).not.toHaveBeenCalled();
    resolveLookup({ data: { role }, error: null });
    const response = await responsePromise;
    if (role === 'ADMIN') {
      expect(response.status).toBe(200);
      expect(h.deleteUser.mock.calls).toEqual([[targetId]]);
      expect(h.events).toEqual(['verified JWT', 'caller profile resolved', 'target body parsed', 'Auth deletion']);
    } else {
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: forbidden });
      expect(json).not.toHaveBeenCalled();
      expect(h.deleteUser).not.toHaveBeenCalled();
    }
    expectCallerLookup(h);
  });

  it.each([{}, { userId: '' }, { userId: null }])('preserves target validation after ADMIN authorization (%j)', async body => {
    const h = harness({ role: 'ADMIN' });
    const { req, json } = h.request(body);
    const response = await h.handler(req);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'UserId is required' });
    expect(json).toHaveBeenCalledOnce();
    expect(h.deleteUser).not.toHaveBeenCalled();
    expectCallerLookup(h);
  });

  it('preserves Auth deletion errors after authorization (one attempted mutation)', async () => {
    const h = harness({ role: 'ADMIN', deleteError: true });
    const { req } = h.request();
    const response = await h.handler(req);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Deletion failed' });
    expect(h.deleteUser.mock.calls).toEqual([[targetId]]);
    expect(h.events).toEqual(['verified JWT', 'caller profile resolved', 'target body parsed', 'Auth deletion']);
  });

  it('preserves CORS preflight without clients, body parsing or destructive actions', async () => {
    const h = harness();
    const req = new Request('https://edge.example.invalid/delete-user', { method: 'OPTIONS' });
    const json = vi.spyOn(req, 'json');
    const response = await h.handler(req);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('ok');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('authorization, x-client-info, apikey, content-type');
    expect(h.createClient).not.toHaveBeenCalled();
    expect(h.deleteUser).not.toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
  });

  it('has profiles as sole authority and inventories every destructive API', () => {
    expect(source.match(/\.from\('profiles'\)/g)).toHaveLength(1);
    expect(source).toContain(".eq('id', currentUser.id)");
    expect(source).toContain("adminCheck?.role !== 'ADMIN'");
    expect(source).not.toMatch(/raw_user_meta_data|raw_app_meta_data|user_metadata|app_metadata|user_app_state|localStorage|sessionStorage|frontend/);
    expect(source).toContain('const { userId } = await req.json()');
    expect(source.match(/auth\.admin\.deleteUser\(/g)).toHaveLength(1);
    // No explicit DB delete/update/insert/upsert, mutative RPC or other Auth admin API exists.
    expect(source).not.toMatch(/\.(?:delete|update|insert|upsert|rpc)\s*\(|auth\.admin\.(?!deleteUser\b)/);
  });
});


describe('Supabase built-in privileged client configuration', () => {
  it('requires the built-in service role variable and never reads the custom alias', () => {
    expect(source).toContain("Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')");
    expect(source).not.toContain("Deno.env.get('SERVICE_ROLE_KEY')");
  });
});
