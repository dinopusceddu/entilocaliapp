// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

const source = readFileSync(resolve(process.cwd(), 'supabase/functions/create-user/index.ts'), 'utf8');
// Execute the actual Edge handler. Replace only its two remote import boundaries;
// no URL import, real Supabase client, HTTP server or network request is executed.
const importLines = /^import \{ (?:serve|createClient) \} from 'https:\/\/[^']+'\r?\n/gm;
const handlerCode = ts.transpileModule(source.replace(importLines, ''), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None },
}).outputText;

type Fixture = {
  role?: string | null;
  missingProfile?: boolean;
  missingUser?: boolean;
  authError?: boolean;
  profileError?: boolean;
  metadataRole?: string;
  stateRole?: string;
  createError?: boolean;
};

function harness(fixture: Fixture = {}) {
  const events: string[] = [];
  const user = {
    id: 'verified-caller-id',
    user_metadata: { role: fixture.metadataRole ?? 'GUEST' },
    app_metadata: { role: fixture.metadataRole ?? 'GUEST' },
    raw_user_meta_data: { role: fixture.metadataRole ?? 'GUEST' },
    raw_app_meta_data: { role: fixture.metadataRole ?? 'GUEST' },
  };
  const tables = {
    profiles: fixture.missingProfile ? null : { role: fixture.role ?? null },
    user_app_state: { role: fixture.stateRole ?? 'GUEST' },
  };
  const getUser = vi.fn(async () => {
    events.push('verified JWT');
    return { data: { user: fixture.missingUser ? null : user }, error: fixture.authError ? new Error('invalid token secret') : null };
  });
  const newUser = { user: { id: 'created-user-id', email: 'new@example.invalid' } };
  const createUser = vi.fn(async () => {
    events.push('admin mutation');
    return { data: newUser, error: fixture.createError ? new Error('Create failed') : null };
  });
  const maybeSingle = vi.fn(async () => {
    events.push('canonical role resolved');
    return { data: tables.profiles, error: fixture.profileError ? new Error('private DB detail') : null };
  });
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn((table: string) => {
    // An attempted alternative authority fails immediately, even if its fixture says ADMIN.
    expect(table).toBe('profiles');
    return { select };
  });
  const createClient = vi.fn((_url: string, key: string) => {
    if (key === 'test-anon-key') return { auth: { getUser } };
    expect(key).toBe('test-service-key');
    return { from, auth: { admin: { createUser } } };
  });
  let handler!: (request: Request) => Promise<Response>;
  runInNewContext(handlerCode, {
    serve: (callback: typeof handler) => { handler = callback; },
    createClient,
    Response,
    Deno: { env: { get: (key: string) => ({
      SUPABASE_URL: 'https://supabase.example.invalid',
      SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    } as Record<string, string>)[key] } },
  });
  const request = (authorization: string | null = 'Bearer test-jwt', body: unknown = {
    email: 'new@example.invalid', password: 'test-password',
  }) => {
    const req = new Request('https://edge.example.invalid/create-user', {
      method: 'POST',
      headers: authorization === null ? {} : { Authorization: authorization },
      body: JSON.stringify(body),
    });
    const json = vi.spyOn(req, 'json');
    return { req, json };
  };
  return { handler, request, getUser, createClient, createUser, from, select, eq, maybeSingle, events, newUser, tables };
}

async function expectDenied(fixture: Fixture, status: number, authorization: string | null = 'Bearer test-jwt') {
  const h = harness(fixture);
  const { req, json } = h.request(authorization, {
    email: 'new@example.invalid', password: 'test-password', role: 'ADMIN',
  });
  const response = await h.handler(req);
  expect(response.status).toBe(status);
  expect(await response.json()).toEqual({ error: status === 401 ? 'Unauthorized' : 'Forbidden' });
  expect(h.createUser).not.toHaveBeenCalled();
  expect(json).not.toHaveBeenCalled();
  if (status === 403) {
    expect(h.getUser).toHaveBeenCalledOnce();
    expect(h.from.mock.calls).toEqual([['profiles']]);
    expect(h.select.mock.calls).toEqual([['role']]);
    expect(h.eq.mock.calls).toEqual([['id', 'verified-caller-id']]);
  } else {
    expect(h.from).not.toHaveBeenCalled();
  }
  return h;
}

describe('AUTH_ADMIN_01_SERVER_ADMIN_CHECK', () => {
  it('denies no JWT with 401 and zero admin mutations', async () => {
    const h = await expectDenied({ role: 'ADMIN' }, 401, null);
    expect(h.createClient).not.toHaveBeenCalled();
    expect(h.getUser).not.toHaveBeenCalled();
  });

  it('denies invalid JWT / getUser error even when a user is returned', async () => {
    await expectDenied({ role: 'ADMIN', authError: true }, 401);
  });

  it('denies getUser returning no verified user', async () => {
    await expectDenied({ role: 'ADMIN', missingUser: true }, 401);
  });

  it('denies an authenticated caller without a profile', async () => {
    await expectDenied({ missingProfile: true }, 403);
  });

  it.each([null, 'GUEST', 'USER', 'admin', ' ADMIN ', ''])('denies canonical role %s with zero admin mutations', async role => {
    await expectDenied({ role }, 403);
  });

  it('allows canonical ADMIN exactly once and preserves create-user payload/success/CORS', async () => {
    const h = harness({ role: 'ADMIN' });
    const { req } = h.request();
    const response = await h.handler(req);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(h.newUser);
    expect(h.createUser.mock.calls).toEqual([[{
      email: 'new@example.invalid', password: 'test-password', email_confirm: true,
    }]]);
    expect(h.eq.mock.calls).toEqual([['id', 'verified-caller-id']]);
    expect(h.events).toEqual(['verified JWT', 'canonical role resolved', 'admin mutation']);
    expect(h.createClient.mock.calls[0]).toEqual([
      'https://supabase.example.invalid', 'test-anon-key',
      { global: { headers: { Authorization: 'Bearer test-jwt' } } },
    ]);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('authorization, x-client-info, apikey, content-type');
  });

  it('ignores forged ADMIN in user/app metadata when profiles.role is USER', async () => {
    await expectDenied({ role: 'USER', metadataRole: 'ADMIN' }, 403);
  });

  it('ignores user_app_state.role ADMIN when profiles.role is USER', async () => {
    const h = await expectDenied({ role: 'USER', stateRole: 'ADMIN' }, 403);
    expect(h.tables.user_app_state.role).toBe('ADMIN');
  });

  it('allows profiles ADMIN despite non-admin metadata, state and request body role', async () => {
    const h = harness({ role: 'ADMIN', metadataRole: 'USER', stateRole: 'GUEST' });
    const { req } = h.request('Bearer test-jwt', {
      email: 'new@example.invalid', password: 'test-password', role: 'GUEST',
      user_id: 'forged-caller-id', id: 'forged-caller-id',
    });
    expect((await h.handler(req)).status).toBe(200);
    expect(h.createUser).toHaveBeenCalledOnce();
    expect(h.from.mock.calls).toEqual([['profiles']]);
    expect(h.eq.mock.calls).toEqual([['id', 'verified-caller-id']]);
  });

  it('fails closed on lookup errors, hides DB details, and preserves internal-error status', async () => {
    const h = harness({ role: 'ADMIN', profileError: true });
    const { req, json } = h.request();
    const response = await h.handler(req);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Authorization check failed' });
    expect(h.createUser).not.toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
  });

  it('does not parse malformed JSON before a non-ADMIN denial', async () => {
    const h = harness({ role: 'USER' });
    const req = new Request('https://edge.example.invalid/create-user', {
      method: 'POST', headers: { Authorization: 'Bearer test-jwt' }, body: '{',
    });
    expect((await h.handler(req)).status).toBe(403);
    expect(h.createUser).not.toHaveBeenCalled();
  });

  it('preserves existing Admin Auth error behavior after ADMIN authorization', async () => {
    const h = harness({ role: 'ADMIN', createError: true });
    const response = await h.handler(h.request().req);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Create failed' });
    expect(h.createUser).toHaveBeenCalledOnce();
  });

  it('preserves unauthenticated CORS preflight with zero admin mutations', async () => {
    const h = harness();
    const response = await h.handler(new Request('https://edge.example.invalid/create-user', { method: 'OPTIONS' }));
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('ok');
    expect(h.createClient).not.toHaveBeenCalled();
    expect(h.createUser).not.toHaveBeenCalled();
  });

  it('PROFILES_ROLE_IS_CANONICAL: production reads no metadata, state, body or frontend role', () => {
    expect(source.match(importLines)).toHaveLength(2);
    expect(source).not.toMatch(/raw_user_meta_data|raw_app_meta_data|user_metadata|app_metadata|user_app_state|localStorage|sessionStorage/);
    expect(source).toMatch(/const \{ email, password \} = await req\.json\(\)/);
  });
});


describe('Supabase built-in privileged client configuration', () => {
  it('requires the built-in service role variable and never reads the custom alias', () => {
    expect(source).toContain("Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')");
    expect(source).not.toContain("Deno.env.get('SERVICE_ROLE_KEY')");
  });
});
