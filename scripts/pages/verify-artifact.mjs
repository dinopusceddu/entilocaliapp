import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
const expectedRef = 'mcasgpaivyosaroxrodm';
const expectedUrl = 'https://' + expectedRef + '.supabase.co';
if (process.env.VITE_SUPABASE_URL !== expectedUrl) throw new Error('Staging URL must be exact');
const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const parts = key.split('.');
if (parts.length !== 3) throw new Error('Legacy public anon key required');
const publicClaims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
if (publicClaims.role !== 'anon' || publicClaims.ref !== expectedRef) throw new Error('Public key staging identity mismatch');
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, {withFileTypes:true})) {
    const full = join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Artifact symlink forbidden');
    if (entry.isDirectory()) await walk(full);
    else files.push(full);
  }
}
await walk('dist');
let foundUrl = false;
for (const file of files) {
  const bytes = await readFile(file);
  const text = bytes.toString('utf8');
  if (text.includes('yggokplxleredipknfbq')) throw new Error('Production reference in artifact');
  if (/sb_secret_[A-Za-z0-9_-]{20,}/.test(text)) throw new Error('Privileged secret key in artifact');
  for (const match of text.matchAll(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)) {
    if (match[0] !== key) throw new Error('Unexpected JWT in artifact');
  }
  if (text.includes(expectedUrl)) foundUrl = true;
}
if (!foundUrl) throw new Error('Staging URL missing in artifact');
const html = await readFile('dist/index.html', 'utf8');
if (!html.includes('/entilocaliapp/assets/') || !html.includes('/entilocaliapp/logo.png')) throw new Error('Wrong Pages asset base');
for (const match of html.matchAll(/(?:src|href)=["'](\/entilocaliapp\/[^"'?#]+)["']/g)) {
  await readFile(join('dist', match[1].slice('/entilocaliapp/'.length)));
}
if (!files.includes(join('dist', '404.html')) || !files.includes(join('dist', '.nojekyll'))) throw new Error('Pages fallback missing');
const manifest = [];
for (const file of files.sort()) {
  manifest.push({path:relative('dist',file).replaceAll('\\','/'),sha256:createHash('sha256').update(await readFile(file)).digest('hex')});
}
const digest = createHash('sha256').update(manifest.map(f=>f.path+' '+f.sha256).join('\n')).digest('hex');
await writeFile('pages-artifact-manifest.json', JSON.stringify({stagingRef:expectedRef,artifactSha256:digest,files:manifest},null,2));
console.log('PAGES_ARTIFACT_CHECK=PASS; PRODUCTION_REF=ABSENT; PRIVILEGED_OR_SESSION_JWT=ABSENT; ARTIFACT_SHA256='+digest);
