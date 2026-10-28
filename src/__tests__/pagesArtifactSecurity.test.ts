// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
const temporaryRoots: string[] = [];
const script = resolve('scripts/pages/verify-artifact.mjs');
const stagingRef = 'mcasgpaivyosaroxrodm';
const stagingUrl = 'https://' + stagingRef + '.supabase.co';
const jwt = (role: string) => Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url') + '.' + Buffer.from(JSON.stringify({role,ref:stagingRef})).toString('base64url') + '.testsignature';
const publicKey = jwt('anon');
afterEach(() => {
  for (const directory of temporaryRoots.splice(0)) {
    if (!resolve(directory).startsWith(resolve(tmpdir()) + '/') && !resolve(directory).startsWith(resolve(tmpdir()) + '\\')) throw new Error('Unexpected cleanup path');
    if (!basename(directory).startsWith('pages-artifact-test-')) throw new Error('Unexpected cleanup target');
    rmSync(directory, {recursive:true,force:true});
  }
});
function fixture(extra = '') {
  const root = mkdtempSync(join(tmpdir(), 'pages-artifact-test-'));
  temporaryRoots.push(root);
  mkdirSync(join(root,'dist','assets'), {recursive:true});
  writeFileSync(join(root,'dist','index.html'), '<script src="/entilocaliapp/assets/app.js"></script><link href="/entilocaliapp/logo.png">');
  writeFileSync(join(root,'dist','assets','app.js'), JSON.stringify({url:stagingUrl,key:publicKey}) + extra);
  writeFileSync(join(root,'dist','logo.png'), '');
  writeFileSync(join(root,'dist','404.html'), 'fallback');
  writeFileSync(join(root,'dist','.nojekyll'), '');
  return root;
}
function inspect(root: string, key = publicKey) {
  return spawnSync(process.execPath, [script], {cwd:root,env:{...process.env,VITE_SUPABASE_URL:stagingUrl,VITE_SUPABASE_ANON_KEY:key},encoding:'utf8'});
}
describe('Pages artifact publication guard', () => {
  it('accepts only the expected public staging bundle and records a file fingerprint', () => {
    const root = fixture();
    expect(inspect(root).status).toBe(0);
    const manifest = JSON.parse(readFileSync(join(root,'pages-artifact-manifest.json'),'utf8'));
    expect(manifest.artifactSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(manifest.files).toHaveLength(5);
  });
  it('rejects a production backend reference anywhere in the artifact', () => {
    expect(inspect(fixture('yggokplxleredipknfbq')).status).not.toBe(0);
  });
  it('rejects an embedded session JWT', () => {
    expect(inspect(fixture(jwt('authenticated'))).status).not.toBe(0);
  });
  it('rejects a privileged Supabase secret key', () => {
    expect(inspect(fixture('sb_secret_' + 'x'.repeat(32))).status).not.toBe(0);
  });
  it('rejects a service role key presented as a build public key', () => {
    expect(inspect(fixture(), jwt('service_role')).status).not.toBe(0);
  });
});
