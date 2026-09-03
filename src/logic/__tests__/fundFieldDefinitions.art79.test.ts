import { describe, it, expect } from 'vitest';
import { getFadFieldDefinitions } from '../fundFieldDefinitions';
import { NormativeData } from '../../domain';

describe('fundFieldDefinitions - Art. 79 c.1 lett. c metadata verification', () => {
  const mockNormativeData: NormativeData = {
    riferimenti_normativi: {},
  } as unknown as NormativeData;

  it('B1. returns tipoDato manuale for st_art79c1c_incrementoStabileConsistenzaPers', () => {
    const definitions = getFadFieldDefinitions(mockNormativeData);
    const art79Def = definitions.find(d => d.key === 'st_art79c1c_incrementoStabileConsistenzaPers');

    expect(art79Def).toBeDefined();
    expect(art79Def?.tipoDato).toBe('manuale');
  });

  it('B2. fonteDato does not contain "Da wizard" and reflects manual entity determination', () => {
    const definitions = getFadFieldDefinitions(mockNormativeData);
    const art79Def = definitions.find(d => d.key === 'st_art79c1c_incrementoStabileConsistenzaPers');

    expect(art79Def).toBeDefined();
    expect(art79Def?.fonteDato).not.toContain('Da wizard');
    expect(art79Def?.fonteDato).toBe(
      "Dato inserito dall'ente sulla base dell'istruttoria relativa all'incremento stabile della consistenza di personale."
    );
  });

  it('B3. verifies that key, section, isRelevantToArt23Limit, effettoLimiti and riferimento remain unchanged', () => {
    const definitions = getFadFieldDefinitions(mockNormativeData);
    const art79Def = definitions.find(d => d.key === 'st_art79c1c_incrementoStabileConsistenzaPers');

    expect(art79Def).toBeDefined();
    expect(art79Def?.key).toBe('st_art79c1c_incrementoStabileConsistenzaPers');
    expect(art79Def?.section).toBe('stabili');
    expect(art79Def?.isRelevantToArt23Limit).toBe(true);
    expect(art79Def?.effettoLimiti).toBe('Inserito nel limite Art. 23 c. 2.');
    expect(art79Def?.riferimento).toBe('Art. 79 c. 1 lett. c) CCNL 16.11.2022');
  });
});
