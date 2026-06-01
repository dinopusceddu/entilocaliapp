import { describe, it, expect } from 'vitest';
import { getFadEffectiveValueHelper } from './calculation/fundCalculations';



describe('Fondo accessorio dipendenti - Micro-correzioni Closeout', () => {
  it('should filter getFadEffectiveValueHelper based on TipologiaEnte (A4 & A8)', () => {
    // A4: st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig è attivo solo per REGIONE
    const valRegione = getFadEffectiveValueHelper(
      'st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig',
      1000,
      false,
      false,
      undefined,
      undefined,
      false,
      'REGIONE'
    );
    expect(valRegione).toBe(1000);

    const valComune = getFadEffectiveValueHelper(
      'st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig',
      1000,
      false,
      false,
      undefined,
      undefined,
      false,
      'COMUNE'
    );
    expect(valComune).toBe(0);

    // A8: vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale è attivo per REGIONE o CITTA_METROPOLITANA
    const valMetro = getFadEffectiveValueHelper(
      'vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale',
      2000,
      false,
      false,
      undefined,
      undefined,
      false,
      'CITTA_METROPOLITANA'
    );
    expect(valMetro).toBe(2000);

    const valComune2 = getFadEffectiveValueHelper(
      'vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale',
      2000,
      false,
      false,
      undefined,
      undefined,
      false,
      'COMUNE'
    );
    expect(valComune2).toBe(0);
  });

  it('should read reduction from EQ into st_art67c1_decurtazionePO_AP_EntiDirigenza or st_riduzionePerIncrementoEQ based on hasDirigenza (A2)', () => {
    // Se ha dirigenza, decurtazione va su st_art67c1_decurtazionePO_AP_EntiDirigenza
    const withDir = getFadEffectiveValueHelper(
      'st_art67c1_decurtazionePO_AP_EntiDirigenza',
      0,
      false,
      false,
      undefined,
      5000,
      true, // hasDirigenza
      'COMUNE'
    );
    expect(withDir).toBe(5000);

    const withDirEQ = getFadEffectiveValueHelper(
      'st_riduzionePerIncrementoEQ',
      0,
      false,
      false,
      undefined,
      5000,
      true, // hasDirigenza
      'COMUNE'
    );
    expect(withDirEQ).toBe(0);

    // Se non ha dirigenza, decurtazione va su st_riduzionePerIncrementoEQ
    const withoutDir = getFadEffectiveValueHelper(
      'st_art67c1_decurtazionePO_AP_EntiDirigenza',
      0,
      false,
      false,
      undefined,
      5000,
      false, // hasDirigenza
      'COMUNE'
    );
    expect(withoutDir).toBe(0);

    const withoutDirEQ = getFadEffectiveValueHelper(
      'st_riduzionePerIncrementoEQ',
      0,
      false,
      false,
      undefined,
      5000,
      false, // hasDirigenza
      'COMUNE'
    );
    expect(withoutDirEQ).toBe(5000);
  });

  it('should treat year 2026 correctly when passed as a string or number', () => {
    // st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig is active only for REGIONE and in 2026
    const valRegioneString = getFadEffectiveValueHelper(
      'st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig',
      1000,
      false,
      false,
      undefined,
      undefined,
      false,
      'REGIONE'
    );
    expect(valRegioneString).toBe(1000);
  });
});
