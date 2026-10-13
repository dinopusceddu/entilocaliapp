import { afterEach, describe, expect, it } from 'vitest';
import { appPath, appRelativePath, restorePagesRoute } from '../utils/appPaths';

afterEach(() => window.history.replaceState(null, '', '/'));

describe('deployment base routing', () => {
  it('preserves root hosting routes and assets', () => {
    expect(appPath('/configurazione-fondo-preview/raccolta-dati', '/')).toBe('/configurazione-fondo-preview/raccolta-dati');
    expect(appPath('/logo.png', '/')).toBe('/logo.png');
    expect(appPath('/', '/')).toBe('/');
  });
  it('prefixes Pages routes and assets exactly once at their call sites', () => {
    expect(appPath('/configurazione-fondo-preview/raccolta-dati', '/entilocaliapp/')).toBe('/entilocaliapp/configurazione-fondo-preview/raccolta-dati');
    expect(appPath('normativa.json', '/entilocaliapp/')).toBe('/entilocaliapp/normativa.json');
    expect(appPath('/', '/entilocaliapp/')).toBe('/entilocaliapp/');
  });
  it('recognizes routes beneath the exact base without matching a similarly named path', () => {
    expect(appRelativePath('/entilocaliapp/configurazione-fondo-preview', '/entilocaliapp/')).toBe('/configurazione-fondo-preview');
    expect(appRelativePath('/entilocaliapp', '/entilocaliapp/')).toBe('/');
    expect(appRelativePath('/entilocaliapp-other/wizard', '/entilocaliapp/')).toBe('/entilocaliapp-other/wizard');
  });
  it('restores deep links with query, encoded characters and fragment', () => {
    const route = 'configurazione-fondo-preview/raccolta-dati?q=a%26b#section';
    window.history.replaceState(null, '', `/entilocaliapp/?__pages_path=${encodeURIComponent(route)}`);
    expect(restorePagesRoute('/entilocaliapp/')).toBe(true);
    expect(window.location.pathname).toBe('/entilocaliapp/configurazione-fondo-preview/raccolta-dati');
    expect(window.location.search).toBe('?q=a%26b');
    expect(window.location.hash).toBe('#section');
  });
  it.each(['https://other.example/path', '//other.example/path', '../outside', '/outside', 'http://['])('rejects an unsafe redirect %s', (route) => {
    window.history.replaceState(null, '', `/entilocaliapp/?__pages_path=${encodeURIComponent(route)}`);
    expect(restorePagesRoute('/entilocaliapp/')).toBe(false);
    expect(window.location.pathname).toBe('/entilocaliapp/');
  });
  it('does not change ordinary root-hosted or Pages requests', () => {
    window.history.replaceState(null, '', '/?__pages_path=wizard');
    expect(restorePagesRoute('/')).toBe(false);
    window.history.replaceState(null, '', '/entilocaliapp/?q=one');
    expect(restorePagesRoute('/entilocaliapp/')).toBe(false);
    expect(window.location.search).toBe('?q=one');
  });
});
