/** Keep application routes and public assets inside the Vite deployment base. */
export const appPath = (path: string = '/', base: string = import.meta.env.BASE_URL): string =>
  `${base.endsWith('/') ? base : `${base}/`}${path.replace(/^\/+/, '')}`;

export const appRelativePath = (pathname: string, base: string = import.meta.env.BASE_URL): string => {
  const prefix = base.replace(/\/$/, '');
  if (!prefix) return pathname;
  if (pathname === prefix) return '/';
  return pathname.startsWith(`${prefix}/`) ? pathname.slice(prefix.length) : pathname;
};

/** Restore a Pages 404 redirect without accepting an external or out-of-base URL. */
export const restorePagesRoute = (base: string = import.meta.env.BASE_URL): boolean => {
  if (base === '/') return false;
  const route = new URLSearchParams(window.location.search).get('__pages_path');
  if (route === null) return false;
  let target: URL;
  try {
    target = new URL(route, `${window.location.origin}${base}`);
  } catch {
    return false;
  }
  if (target.origin !== window.location.origin || !target.pathname.startsWith(base)) return false;
  window.history.replaceState(window.history.state, '', `${target.pathname}${target.search}${target.hash}`);
  return true;
};
