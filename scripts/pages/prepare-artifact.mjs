import { writeFile } from 'node:fs/promises';
await writeFile('dist/404.html', `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Caricamento staging</title></head><body><p>Caricamento applicazione staging...</p><a href="/entilocaliapp/">Apri l'applicazione</a><script>
const base = '/entilocaliapp/';
if (location.pathname.startsWith(base)) {
  const route = location.pathname.slice(base.length) + location.search + location.hash;
  location.replace(base + '?__pages_path=' + encodeURIComponent(route));
}
</script></body></html>`);
await writeFile('dist/.nojekyll', '');
