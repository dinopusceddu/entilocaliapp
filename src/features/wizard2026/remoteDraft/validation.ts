import { Wizard2026DraftState } from '../types';

export function isValidDraftPayload(payload: any): payload is Wizard2026DraftState {
  if (!payload || typeof payload !== 'object') return false;
  const keys: (keyof Wizard2026DraftState)[] = [
    'meta',
    'ente',
    'art23',
    'dl25',
    'ccnl2026',
    'conglobamentoArt60',
    'straordinario',
    'pnrr',
    'riepilogo'
  ];
  return keys.every(key => payload[key] && typeof payload[key] === 'object');
}
