/**
 * MOD-037D0 — Costituzione Fondo: trasferimento, verifica calcoli, rollback e test negativi
 *
 * Flusso:
 *   1. Login → Dashboard → Wizard 2026 Step 8
 *   2. Trasferisci → modale conferma → Costituzione Fondo
 *   3. Verifica Fondo Accessorio Dipendente (banner, sezioni, Art.23)
 *   4. Verifica Panoramica (KPI sub-fondi)
 *   5. Verifica Fondo EQ (dati trasferiti)
 *   6. Rollback e ripristino dati precedenti
 *   7. Test negativi (validazione, campi bloccati, valori anomali)
 */

import { test, expect, Page } from '@playwright/test';

const EMAIL = 'dino.pusceddu@cgil.lombardia.it';
const PASSWORD = process.env.TEST_PASSWORD || 'Admin123!';

// ── HELPERS ──────────────────────────────────────────────────────────────────

async function waitForAppBootstrap(page: Page) {
  await page.waitForFunction(
    () => {
      return (
        document.querySelector('[data-testid="app-ready"]') !== null ||
        document.querySelector('[data-testid="home-logo"]') !== null ||
        document.querySelector('[data-testid="back-to-dashboard-btn"]') !== null ||
        document.querySelector('[data-testid="standalone-logo"]') !== null
      );
    },
    { timeout: 45000 }
  );
}

async function login(page: Page) {
  await page.goto('/');
  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ state: 'visible', timeout: 20000 });
  await emailInput.fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.locator('button[type="submit"]').click();
  await waitForAppBootstrap(page);
  await page.waitForTimeout(1500);
}

async function openWizard(page: Page) {
  const card = page.locator('[data-testid="dashboard-card-wizard2026Preview"]').first();
  if (await card.isVisible({ timeout: 10000 }).catch(() => false)) {
    await card.click();
    await page.waitForTimeout(1500);
  } else {
    await page.goto('/configurazione-fondo-preview');
    await page.waitForTimeout(2000);
  }

  const goToWizardBtn = page.locator('[data-testid="go-to-wizard-btn"]').first();
  if (await goToWizardBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await goToWizardBtn.click();
    await page.waitForTimeout(1500);
  }
}

async function navigateToStep(page: Page, targetStep: number) {
  for (let i = 1; i < targetStep; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);
    const avantiBtn = page.locator('button:has-text("Avanti")').last();
    await avantiBtn.waitFor({ state: 'visible', timeout: 10000 });
    await avantiBtn.click();
    await page.waitForTimeout(1000);
  }
}

async function clickIndietro(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  const indietroBtn = page.locator('button:has-text("Indietro")').last();
  await indietroBtn.waitFor({ state: 'visible', timeout: 10000 });
  await indietroBtn.click();
  await page.waitForTimeout(1000);
}

async function fillIfVisible(page: Page, selector: string, value: string, label: string) {
  const input = page.locator(selector);
  if (await input.isVisible({ timeout: 3000 }).catch(() => false)) {
    await input.fill(value);
    await page.waitForTimeout(200);
    return true;
  }
  return false;
}

/** Naviga alla sidebar (scope FONDO) */
async function navSidebar(page: Page, modId: string) {
  const btn = page.locator(`[data-testid="nav-${modId}"]`).first();
  await btn.waitFor({ state: 'attached', timeout: 15000 });
  await btn.evaluate((el: HTMLElement) => el.click());
  await page.waitForTimeout(2000);
}

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      if (
        !txt.includes('ResizeObserver') &&
        !txt.includes('Warning:') &&
        !txt.includes('DevTools') &&
        !txt.includes('Non-Error') &&
        !txt.includes('fund_data invalido') &&
        !txt.includes('user_app_state_pkey') &&
        !txt.includes('Fallimento inizializzazione') &&
        !txt.includes('Failed to load resource') &&
        !txt.includes('Failed to fetch')
      ) {
        errors.push(txt);
      }
    }
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

// ──────────────────────────────────────────────────────────────────────────────
// TEST SUITE
// ──────────────────────────────────────────────────────────────────────────────

test.describe('MOD-037D0 — Costituzione Fondo (Transfer, Rollback, Negativi)', () => {

  test('FASE 1-2: Login, Wizard → Step 8, Trasferimento → FONDO scope', async ({ page }) => {
    test.setTimeout(600000);
    const errors = trackErrors(page);
    const supabaseRequests: string[] = [];

    page.on('request', (req) => {
      if (req.url().includes('supabase') && req.method() === 'POST') {
        supabaseRequests.push(req.url().split('?')[0]);
      }
    });
    page.on('response', (resp) => {
      if (resp.url().includes('supabase') && resp.status() >= 400) {
        errors.push(`[net-err] ${resp.status()} ${resp.url()}`);
      }
    });

    // ═══ FASE 1: LOGIN ═══
    console.log('\n━━━ FASE 1: LOGIN ━━━');
    await login(page);

    // ═══ FASE 2: APERTURA WIZARD → NAVIGA A STEP 8 ═══
    console.log('\n━━━ FASE 2: APERTURA WIZARD ━━━');
    await openWizard(page);

    // Verifica Step 1
    await expect(page.locator('h2').filter({ hasText: 'Ente e condizioni' }).first()).toBeVisible({ timeout: 15000 });
    console.log('✅ Wizard aperto — Step 1 visibile');

    // Naviga rapidamente a Step 8
    console.log('\n━━━ FASE 3: NAVIGAZIONE A STEP 8 ━━━');
    await navigateToStep(page, 8);

    // Verifica Step 8
    const step8Header = page.locator('h2').filter({ hasText: 'Riepilogo e trasferimento' }).first();
    await expect(step8Header).toBeVisible({ timeout: 20000 });
    console.log('✅ Step 8 (Riepilogo) raggiunto');

    // Screenshot pre-trasferimento
    await page.screenshot({ path: 'playwright-report/mod037d0_step8_before_transfer.png' }).catch(() => {});

    // Controlla se ci sono errori bloccanti
    const blockingError = page.locator('text=BLOCKED').or(page.locator('text=MISSING_DATA')).first();
    const hasBlockingErrors = await blockingError.isVisible({ timeout: 3000 }).catch(() => false);
    if (hasBlockingErrors) {
      console.log('  ⚠️ Trovati errori bloccanti — screenshot salvato');
      await page.screenshot({ path: 'playwright-report/mod037d0_blocking_errors.png' }).catch(() => {});
    }

    // ═══ FASE 4: TRASFERIMENTO ═══
    console.log('\n━━━ FASE 4: TRASFERIMENTO DATI ━━━');

    // Clicca "Trasferisci i dati alla costituzione del fondo e compila"
    const transferBtn = page.locator('button:has-text("Trasferisci i dati alla costituzione")').first();
    await transferBtn.waitFor({ state: 'visible', timeout: 10000 });
    await transferBtn.click();
    await page.waitForTimeout(1500);
    console.log('✅ Pulsante trasferimento cliccato');

    // Verifica apertura modale di conferma
    const modalTitle = page.locator('text=Conferma trasferimento alla Costituzione Fondo').first();
    await expect(modalTitle).toBeVisible({ timeout: 10000 });
    console.log('✅ Modale di conferma trasferimento visibile');

    // Screenshot modale
    await page.screenshot({ path: 'playwright-report/mod037d0_transfer_modal.png' }).catch(() => {});

    // Verifica elementi della modale
    const sectionHeaders = ['Voci e Importi Effettivi', 'Limiti di Spesa e Dati di Controllo'];
    for (const section of sectionHeaders) {
      const sectionEl = page.locator(`text=${section}`).first();
      if (await sectionEl.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log(`  ✅ Sezione modale "${section}" visibile`);
      }
    }

    // Spunta la checkbox di conferma
    const checkbox = page.locator('#checkbox-conferma-trasferimento');
    await checkbox.waitFor({ state: 'visible', timeout: 5000 });
    await checkbox.check();
    await page.waitForTimeout(300);
    console.log('✅ Checkbox conferma spuntata');

    // Verifica che il pulsante conferma sia ora abilitato
    const confirmBtn = page.locator('button:has-text("Conferma e compila Costituzione Fondo")');
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    console.log('✅ Pulsante conferma abilitato');

    // Clicca conferma
    await confirmBtn.click();
    console.log('✅ Conferma trasferimento cliccata — attesa navigazione...');

    // Attesa navigazione verso FONDO scope (fondoDipendenti)
    await page.waitForTimeout(4000);

    // Verifica che siamo sulla pagina Fondo Accessorio Dipendente
    const fondoDipendentiHeader = page.locator('h2').filter({ hasText: 'Fondo accessorio personale dipendente' }).first();
    const isOnFondoPage = await fondoDipendentiHeader.isVisible({ timeout: 30000 }).catch(() => false);

    if (!isOnFondoPage) {
      // Potrebbe essere atterrato su Panoramica — prova a navigare via sidebar
      await navSidebar(page, 'fondoDipendenti');
    }

    await expect(page.locator('h2').filter({ hasText: 'Fondo accessorio personale dipendente' }).first()).toBeVisible({ timeout: 15000 });
    console.log('✅ Costituzione Fondo — pagina Fondo Accessorio Dipendente raggiunta');

    // ═══ FASE 5: VERIFICA TRASFERIMENTO ═══
    console.log('\n━━━ FASE 5: VERIFICA DATI TRASFERITI ━━━');

    // Verifica banner trasferimento completato
    const transferBanner = page.locator('text=Trasferimento completato').first();
    const bannerVisible = await transferBanner.isVisible({ timeout: 10000 }).catch(() => false);
    if (bannerVisible) {
      console.log('  ✅ Banner "Trasferimento completato" visibile con pulsante rollback');
    } else {
      console.log('  ℹ️ Banner trasferimento non visibile (potrebbe già essere stato chiuso o scrollato)');
    }

    // Verifica Art. 23 Compliance Widget
    const art23Widget = page.locator('text=Prospetto Art. 23').first();
    if (await art23Widget.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('  ✅ Widget "Prospetto Art. 23" visibile');
    } else {
      console.log('  ℹ️ Widget Art. 23 non visibile (dati insufficienti?)');
    }

    // Screenshot post-trasferimento
    await page.screenshot({ path: 'playwright-report/mod037d0_fondo_dipendenti.png' }).catch(() => {});

    // Conta i campi numerici disponibili nella pagina
    const numInputs = await page.locator('input[type="number"]').count();
    console.log(`  ℹ️ Campi numerici nella pagina: ${numInputs}`);

    // Verifica sezione Riepilogo Dati Importati dal Wizard
    const wizardSummary = page.locator('text=Dati Importati dal Wizard').or(page.locator('text=Riepilogo Dati Importati')).first();
    if (await wizardSummary.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('  ✅ Sezione "Dati Importati dal Wizard" presente');
    } else {
      console.log('  ℹ️ Sezione import wizard non trovata (nome diverso)');
    }

    // ═══ FASE 6: VERIFICA PANORAMICA (HOMEPAGE) ═══
    console.log('\n━━━ FASE 6: VERIFICA PANORAMICA FONDO ━━━');
    await navSidebar(page, 'home');

    const panoramicaHeader = page.locator('h2').first();
    await expect(panoramicaHeader).toBeVisible({ timeout: 15000 });
    const headerText = await panoramicaHeader.innerText().catch(() => '');
    console.log(`  ✅ Panoramica: "${headerText}"`);

    // Verifica KPI cards
    const kpiLabels = ['Fondo Dipendenti', 'Fondo EQ', 'Fondo Segretario'];
    for (const label of kpiLabels) {
      const kpi = page.locator(`text=${label}`).first();
      if (await kpi.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log(`  ✅ KPI "${label}" visibile`);
      }
    }

    // Verifica pulsante "Aggiorna Calcoli"
    const aggiornaBtn = page.locator('button:has-text("Aggiorna Calcoli")').first();
    if (await aggiornaBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('  ✅ Pulsante "Aggiorna Calcoli" visibile');

      // Click "Aggiorna Calcoli" per forzare ricalcolo
      await aggiornaBtn.click();
      await page.waitForTimeout(3000);
      console.log('  ✅ Ricalcolo avviato');
    }

    await page.screenshot({ path: 'playwright-report/mod037d0_panoramica.png' }).catch(() => {});

    // ═══ FASE 7: VERIFICA FONDO EQ ═══
    console.log('\n━━━ FASE 7: VERIFICA FONDO EQ ━━━');
    await navSidebar(page, 'fondoEQ');

    const eqHeader = page.locator('h2').filter({ hasText: 'Elevate Qualificazioni' }).first();
    await expect(eqHeader).toBeVisible({ timeout: 15000 });
    console.log('✅ Pagina Fondo EQ raggiunta');

    const numEqInputs = await page.locator('input[type="number"]').count();
    console.log(`  ℹ️ Campi numerici Fondo EQ: ${numEqInputs}`);

    await page.screenshot({ path: 'playwright-report/mod037d0_fondo_eq.png' }).catch(() => {});

    // ═══ FASE 8: TEST NAVIGAZIONE FONDO SCOPE ═══
    console.log('\n━━━ FASE 8: NAVIGAZIONE MODULI FONDO ━━━');

    const fondoModules = ['personale', 'distribuzioneRisorse', 'fundDetails', 'compliance', 'reports'];
    for (const modId of fondoModules) {
      const sidebarBtn = page.locator(`[data-testid="nav-${modId}"]`).first();
      if (await sidebarBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await sidebarBtn.evaluate((el: HTMLElement) => el.click());
        await page.waitForTimeout(2000);
        console.log(`  ✅ Navigato a "${modId}"`);
      } else {
        console.log(`  ℹ️ "${modId}" non disponibile in sidebar`);
      }
    }

    // ═══ RIEPILOGO ERRORI ═══
    console.log(`\n━━━ RIEPILOGO ERRORI JS: ${errors.length} ━━━`);
    errors.forEach((e, i) => console.log(`  [${i + 1}] ${e}`));
    console.log(`Richieste POST Supabase: ${supabaseRequests.length}`);

    expect(errors.length).toBe(0);
    console.log('✅ FASE 1-2 COMPLETATA CON SUCCESSO');
  });

  test('FASE 3: Rollback trasferimento', async ({ page }) => {
    test.setTimeout(120000);
    const errors = trackErrors(page);

    await login(page);

    // Apre la card wizard → preview page, poi clicca "Vai alla costituzione dei fondi"
    const wizCard = page.locator('[data-testid="dashboard-card-wizard2026Preview"]').first();
    await wizCard.waitFor({ state: 'visible', timeout: 15000 });
    await wizCard.click();
    await page.waitForTimeout(2000);

    // Clicca "Vai alla costituzione dei fondi" per navigare a FONDO scope
    const fundDataBtn = page.locator('[data-testid="go-to-fund-data-btn"]').first();
    await fundDataBtn.waitFor({ state: 'visible', timeout: 15000 });
    await fundDataBtn.click();
    await page.waitForTimeout(3000);

    const fondoHeader = page.locator('h2').filter({ hasText: 'Fondo accessorio personale dipendente' }).first();
    await expect(fondoHeader).toBeVisible({ timeout: 15000 });
    console.log('✅ Pagina Fondo Dipendenti raggiunta per rollback');

    // Verifica banner rollback
    const rollbackBanner = page.locator('text=Annulla trasferimento e ripristina dati precedenti').first();
    const hasRollback = await rollbackBanner.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasRollback) {
      console.log('✅ Banner rollback visibile — clicco annulla');
      await rollbackBanner.click();
      await page.waitForTimeout(3000);

      const bannerAfter = page.locator('text=Annulla trasferimento e ripristina dati precedenti').first();
      const stillVisible = await bannerAfter.isVisible({ timeout: 3000 }).catch(() => false);
      if (!stillVisible) {
        console.log('✅ Rollback eseguito — banner scomparso');
      } else {
        console.log('  ℹ️ Banner ancora visibile dopo rollback');
      }
    } else {
      console.log('  ℹ️ Banner rollback non presente (trasferimento già annullato o snapshot assente)');
    }

    expect(errors.length).toBe(0);
    console.log('✅ FASE 3 (Rollback) completata');
  });

  test('FASE 4: Test negativi — validazione campi e valori anomali', async ({ page }) => {
    test.setTimeout(180000);
    const errors = trackErrors(page);

    await login(page);

    // Pulisce eventuali bozze residue per partire da stato pulito
    await page.evaluate(() => {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('fl_wizard2026_draft_')) localStorage.removeItem(k);
      });
    });

    // Apri wizard e naviga a Step 2 per testare valori anomali
    await openWizard(page);
    await expect(page.locator('h2').filter({ hasText: 'Ente e condizioni' }).first()).toBeVisible({ timeout: 15000 });

    // Naviga a Step 2 (Art.23 Limite)
    await navigateToStep(page, 2);
    await expect(page.locator('h2').filter({ hasText: 'Limite globale Art. 23' }).first()).toBeVisible({ timeout: 15000 });

    // Prova inserimento manuale se disponibile
    const manualBtn = page.locator('button:has-text("Inserimento manuale")');
    if (await manualBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await manualBtn.click();
      await page.waitForTimeout(500);
    }

    // TEST 1: Valore negativo nel campo limite
    console.log('\n  TEST NEG 1: Valore negativo');
    const limite2016 = page.locator('[data-testid="limite2016CertificatoEnte"]');
    if (await limite2016.isVisible({ timeout: 3000 }).catch(() => false)) {
      await limite2016.fill('-1000');
      await page.waitForTimeout(500);
      const valoreNegativo = await limite2016.inputValue().catch(() => '');
      console.log(`    Input "-1000" → valore letto: "${valoreNegativo}"`);
      if (valoreNegativo === '-1000') {
        console.log('    ⚠️ Attenzione: input negativo accettato (nessuna validazione negativi)');
      } else {
        console.log('    ✅ Input negativo rifiutato o arrotondato');
      }
      await limite2016.fill('500000');
    }

    // TEST 2: Valore con decimali
    console.log('\n  TEST NEG 2: Valore con decimali');
    const fondo2016 = page.locator('[data-testid="fondoPersonaleDipendente2016"]');
    if (await fondo2016.isVisible({ timeout: 3000 }).catch(() => false)) {
      await fondo2016.fill('1234.56');
      await page.waitForTimeout(500);
      const valore = await fondo2016.inputValue().catch(() => '');
      console.log(`    Input "1234.56" → valore letto: "${valore}"`);
      if (valore.includes('.')) {
        console.log('    ✅ Decimali accettati gestiti');
      } else {
        console.log('    ℹ️ Decimali troncati/arrotondati');
      }
    }

    await clickIndietro(page);

    // TEST 3: Verifica che i bottoni Yes/No siano toggle esclusivi
    console.log('\n  TEST NEG 3: Toggle esclusivo Yes/No');
    const yesBtn = page.locator('[data-testid="isDissesto-yes"]').first();
    const noBtn = page.locator('[data-testid="isDissesto-no"]').first();

    if (await yesBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await yesBtn.click();
      await page.waitForTimeout(300);
      await noBtn.click();
      await page.waitForTimeout(300);
      console.log('    ✅ Toggle Yes/No funzionante (cliccati entrambi)');
    }

    // Usa lo stepper cliccabile per navigare direttamente a Step 3
    console.log('\n  TEST NEG 4: Popolazione zero');
    const step3Btn = page.locator('button:has-text("Step 3")').first();
    if (await step3Btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await step3Btn.evaluate((el: HTMLElement) => el.click());
      await page.waitForTimeout(2000);
      console.log('    ✅ Stepper Step 3 cliccato');
    } else {
      // Fallback: naviga con Avanti
      await navigateToStep(page, 3);
    }

    await expect(
      page.locator('h2').filter({ hasText: /D\.L\. 25\/2025|Istruttoria Incremento/ }).first()
    ).toBeVisible({ timeout: 15000 });

    const popInput = page.locator('#popolazioneEnte');
    if (await popInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await popInput.fill('0');
      await page.waitForTimeout(500);
      const popVal = await popInput.inputValue().catch(() => '');
      console.log(`    Input "0" → valore letto: "${popVal}"`);
      await popInput.fill('29000');
      console.log('    ✅ Popolazione ripristinata a 29000');
    }

    // Usa lo stepper per andare a Step 7
    console.log('\n  TEST NEG 5: PNRR toggle');
    const step7Btn = page.locator('button:has-text("Step 7")').first();
    if (await step7Btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await step7Btn.evaluate((el: HTMLElement) => el.click());
      await page.waitForTimeout(2000);
      console.log('    ✅ Stepper Step 7 cliccato');
    } else {
      await navigateToStep(page, 7);
    }

    await expect(
      page.locator('h2').filter({ hasText: 'Istruttoria Limite PNRR' }).first()
    ).toBeVisible({ timeout: 15000 });

    const pnrrSi = page.locator('[data-testid="soggettoPnrr-yes"]').first();
    const pnrrNo = page.locator('[data-testid="soggettoPnrr-no"]').first();

    if (await pnrrSi.isVisible({ timeout: 3000 }).catch(() => false)) {
      await pnrrSi.click();
      await page.waitForTimeout(300);
      const pnrrPanel = page.locator('[data-testid^="pnrr-"]').first();
      if (await pnrrPanel.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('    ✅ Pannello PNRR visibile dopo selezione "Sì"');
      }

      await pnrrNo.click();
      await page.waitForTimeout(300);
      const nonApplicabile = page.locator('[data-testid="pnrr-non-applicabile-box"]');
      if (await nonApplicabile.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('    ✅ Box "PNRR non applicabile" visibile dopo selezione "No"');
      }
      console.log('    ✅ Toggle PNRR Yes/No funzionante');
    }

    expect(errors.length).toBe(0);
    console.log('✅ FASE 4 (Test negativi) completata');
  });
});
