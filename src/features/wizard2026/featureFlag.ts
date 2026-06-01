/**
 * [MOD-033] Feature flag rimosso.
 * Il Wizard 2026 è ora sempre attivo — non dipende più da VITE_ENABLE_WIZARD_2026_PREVIEW.
 */
export const featureFlags = {
  get ENABLE_WIZARD_2026_PREVIEW() {
    return true;
  }
};

export const ENABLE_WIZARD_2026_PREVIEW = true;
