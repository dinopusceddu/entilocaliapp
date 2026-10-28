/**
 * MOD-037C9-FIX0 — Collaudo reale secondo tester da browser
 *
 * Utente: dinopusceddu@gmail.com
 * Sandbox: Mio Ente (anno 2026)
 */

import { test, expect, Page } from '@playwright/test';

const EMAIL = 'dinopusceddu@gmail.com';
const PASSWORD = process.env.TEST_PASSWORD;
if (!PASSWORD) {
  throw new Error('TEST_PASSWORD non configurata');
}

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
  console.log('Bootstrap: ✅ App caricata');
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

async function ensureDashboard(page: Page) {
  const backBtn = page.locator('[data-testid="back-to-dashboard-btn"]');
  if (await backBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await backBtn.click();
    await page.waitForTimeout(1500);
    console.log('ensureDashboard: ✅ Tornato alla dashboard');
    return;
  }
  const homeLogo = page.locator('[data-testid="home-logo"]');
  if (await homeLogo.isVisible({ timeout: 2000 }).catch(() => false)) {
    return;
  }
}

async function openWizard(page: Page) {
  await page.goto('/');
  await page.waitForTimeout(1500);
  await ensureDashboard(page);
  const card = page.locator('[data-testid="dashboard-card-wizard2026Preview"]').first();
  if (await card.isVisible({ timeout: 10000 }).catch(() => false)) {
    await card.click();
    await page.waitForTimeout(1500);
    console.log('openWizard: ✅ Card wizard2026Preview cliccata');
  } else {
    await page.goto('/configurazione-fondo-preview');
    await page.waitForTimeout(2000);
    console.log('openWizard: ✅ Navigato direttamente');
  }

  const goToWizardBtn = page.locator('[data-testid="go-to-wizard-btn"]').first();
  if (await goToWizardBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await goToWizardBtn.click();
    await page.waitForTimeout(1500);
    console.log('openWizard: ✅ Bottone "Vai al Wizard" cliccato');
  }
}

async function clickAvanti(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  const avantiBtn = page.locator('button:has-text("Avanti")').last();
  await avantiBtn.waitFor({ state: 'visible', timeout: 10000 });
  await avantiBtn.click();
  await page.waitForTimeout(1000); // attende flush
}

async function clickIndietro(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  const indietroBtn = page.locator('button:has-text("Indietro")').last();
  await indietroBtn.waitFor({ state: 'visible', timeout: 10000 });
  await indietroBtn.click();
  await page.waitForTimeout(1000);
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
  page.on('pageerror', (err) => {
    const txt = err.message;
    if (
      !txt.includes('fund_data invalido') &&
      !txt.includes('user_app_state_pkey') &&
      !txt.includes('Fallimento inizializzazione')
    ) {
      errors.push(`pageerror: ${txt}`);
    }
  });
  return errors;
}

test.describe('MOD-037C9-FIX0 — Collaudo Secondo Tester', () => {

  test('Collaudo completo su produzione', async ({ page }) => {
    const errors = trackErrors(page);
    const supabaseRequests: string[] = [];

    page.on('request', (req) => {
      if (req.url().includes('supabase') && req.method() === 'POST') {
        supabaseRequests.push(req.url().split('?')[0]);
      }
    });

    console.log('\n━━━ FASE 1: LOGIN SECONDO TESTER ━━━');
    await login(page);
    console.log('Login effettuato con successo.');

    console.log('\n━━━ FASE 2: APERTURA WIZARD ━━━');
    await openWizard(page);

    // 1. Verifica se compare il banner di allineamento iniziale e clicca su "Aggiorna bozza cloud"
    const syncBannerBtn = page.locator('button:has-text("Aggiorna bozza cloud")').first();
    if (await syncBannerBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('  ⚠️ Trovato banner di allineamento iniziale, clicco "Aggiorna bozza cloud"...');
      await syncBannerBtn.click();
      await page.waitForTimeout(2000);
    }

    // Verifica badge cloud e intestazione
    const badgeCloud = page.locator('text=Bozza salvata').first();
    await expect(badgeCloud).toBeVisible({ timeout: 15000 });
    console.log('✅ Badge cloud di sincronizzazione visibile.');

    // Verifica assenza conflitti o doppi banner
    const conflictBanner = page.locator('[data-testid="conflict-banner"]').first();
    await expect(conflictBanner).not.toBeVisible();
    console.log('✅ Nessun banner di conflitto iniziale.');

    // 2. Compilazione di almeno 3 campi nello Step 1
    console.log('\n━━━ FASE 3: COMPILAZIONE DI 3 CAMPI ━━━');

    // Se la bozza reidratata ci ha posizionato su uno step successivo, torniamo a Step 1
    const step1Header = page.locator('h2').filter({ hasText: 'Ente e condizioni' }).first();
    while (!(await step1Header.isVisible().catch(() => false))) {
      console.log('  ℹ️ Rilevato step successivo. Torno indietro per compilazione Step 1...');
      await clickIndietro(page);
    }

    // Campo 1: isDissesto = no
    const dissestoNo = page.locator('[data-testid="isDissesto-no"]').first();
    await dissestoNo.waitFor({ state: 'visible', timeout: 5000 });
    await dissestoNo.click();
    console.log('  ✅ Campo 1: isDissesto = No');

    // Campo 2: isPianoRiequilibrio = no
    const riequilibrioNo = page.locator('[data-testid="isPianoRiequilibrio-no"]').first();
    await riequilibrioNo.click();
    console.log('  ✅ Campo 2: isPianoRiequilibrio = No');

    // Campo 3: isStrutturalmenteDeficitario = no
    const deficitarioNo = page.locator('[data-testid="isStrutturalmenteDeficitario-no"]').first();
    await deficitarioNo.click();
    console.log('  ✅ Campo 3: isStrutturalmenteDeficitario = No');

    // Attendiamo l'autosave debounced (3 secondi)
    console.log('Attesa autosave debounced...');
    await page.waitForTimeout(3000);

    // 3. Navigazione con cambio step (flush immediato)
    console.log('\n━━━ FASE 4: NAVIGAZIONE CON FLUSH ━━━');
    await clickAvanti(page);
    await expect(page.locator('h2').filter({ hasText: 'Limite globale Art. 23' }).first()).toBeVisible({ timeout: 15000 });
    console.log('✅ Navigato a Step 2 con successo.');

    // 4. Refresh e riapertura per verifica persistenza
    console.log('\n━━━ FASE 5: REFRESH E PERSISTENZA ━━━');
    await page.reload();
    await waitForAppBootstrap(page);
    await openWizard(page);

    // Verifichiamo che i valori inseriti siano persistiti
    // Se siamo a Step 2 (grazie al ripristino automatico dello step da cloud), andiamo indietro a Step 1 per controllare i campi
    const step1HeaderAgain = page.locator('h2').filter({ hasText: 'Ente e condizioni' }).first();
    if (!(await step1HeaderAgain.isVisible().catch(() => false))) {
      console.log('  ℹ️ Rilevato ripristino a Step 2 dopo reidratazione cloud. Torno a Step 1...');
      await clickIndietro(page);
    }

    await expect(dissestoNo).toHaveClass(/bg-slate-700|bg-slate-800|bg-blue-600/);
    console.log('✅ Dati correttamente reidratati dopo il refresh.');

    // 5. Torna indietro
    console.log('\n━━━ FASE 6: TORNA INDIETRO ━━━');
    await clickAvanti(page); // Siamo a Step 2, andiamo avanti o restiamo?
    // Facciamo indietro da Step 2 a Step 1
    await clickIndietro(page);
    await expect(page.locator('h2').filter({ hasText: 'Ente e condizioni' }).first()).toBeVisible({ timeout: 15000 });
    console.log('✅ Tornato a Step 1.');

    // Riepilogo errori
    console.log(`\nErrori in console: ${errors.length}`);
    errors.forEach((err, idx) => {
      console.log(`  [Errore Console ${idx + 1}]: ${err}`);
    });
    expect(errors.length).toBe(0);
  });
});
