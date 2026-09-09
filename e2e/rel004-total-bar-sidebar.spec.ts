import { test, expect } from '@playwright/test';

const BASE_URL =
  process.env.REL004_BASE_URL ||
  process.env.PLAYWRIGHT_BASE_URL ||
  'http://localhost:5000';

const mockToken = {
  access_token: 'dummy-token',
  refresh_token: 'dummy-refresh',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 86400,
  token_type: 'bearer',
  user: {
    id: '11111111-1111-1111-1111-111111111111',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'dino.pusceddu@cgil.lombardia.it',
    email_confirmed_at: '2026-01-01T00:00:00Z',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { role: 'ADMIN' },
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  }
};

const currentFundData = {
  metadata: { snapshotStatus: 'OPEN' },
  annualData: {
    annoRiferimento: 2026,
    denominazioneEnte: 'Comune Test Gate REL-004',
    tipologiaEnte: 'COMUNE',
    hasDirigenza: true
  },
  historicalData: {
    fondoSalarioAccessorioPersonaleNonDirEQ2016: 150000,
    fondoPersonaleNonDirEQ2018_Art23: 160000
  },
  fondoAccessorioDipendenteData: {
    st_art79c1_art67c1_costituzioneBase: 100000
  },
  fondoElevateQualificazioniData: {
    ris_fondoPO2017: 25000
  },
  fondoSegretarioComunaleData: {
    st_art3c6_CCNL2011_retribuzionePosizione: 12000
  },
  fondoDirigenzaData: {
    st_art57c2a_CCNL2020_unicoImporto2020: 30000
  },
  distribuzioneRisorseData: {},
  personaleServizio: { dettagli: [] }
};

async function setupPage(page) {
  await page.route('https://yggokplxleredipknfbq.supabase.co/**', async (route) => {
    const url = route.request().url();
    if (
      url.includes('/rest/v1/notifications') ||
      url.includes('/rest/v1/notification_reads') ||
      url.includes('/rest/v1/messages') ||
      url.includes('/rest/v1/message_reads')
    ) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }
    if (url.includes('/auth/v1/user') || url.includes('/auth/v1/token')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockToken) });
    }
    if (url.includes('/rest/v1/user_profiles')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '11111111-1111-1111-1111-111111111111',
            email: 'dino.pusceddu@cgil.lombardia.it',
            role: 'ADMIN',
            raw_user_meta_data: { role: 'ADMIN' },
            selected_entity_id: 'e1'
          }
        ])
      });
    }
    if (url.includes('/rest/v1/entities')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 'e1', name: 'Comune Test Gate REL-004', entity_type: 'COMUNE' }])
      });
    }
    if (url.includes('/rest/v1/app_state')) {
      const method = route.request().method();
      if (method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              user_id: '11111111-1111-1111-1111-111111111111',
              entity_id: 'e1',
              year: 2026,
              state: currentFundData
            }
          ])
        });
      } else {
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });

  await page.addInitScript((token) => {
    window.localStorage.setItem('sb-yggokplxleredipknfbq-auth-token', JSON.stringify(token));
    window.localStorage.setItem('entilocaliapp_last_active_year_e1', '2026');
  }, mockToken);

  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);

  // Transition to FONDO scope
  const wizardCard = page.locator('[data-testid="dashboard-card-wizard2026Preview"]');
  if (await wizardCard.isVisible()) {
    await wizardCard.click();
    await page.waitForTimeout(1000);
    const goToFundBtn = page.locator('[data-testid="go-to-fund-data-btn"]');
    if (await goToFundBtn.isVisible()) {
      await goToFundBtn.click();
      await page.waitForTimeout(1000);
    }
  }
}

async function navigateToFundPage(page, pageId: string) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(200);
  const btn = page.locator(`[data-testid="nav-${pageId}"]`).filter({ visible: true });
  await btn.waitFor({ state: 'visible', timeout: 5000 });
  await btn.click();
  await page.waitForTimeout(800);
}

const fundPages = [
  { id: 'fondoDipendenti', label: 'Fondo Accessorio Dipendente' },
  { id: 'fondoEQ', label: 'Fondo Elevate Qualificazioni' },
  { id: 'fondoSegretario', label: 'Fondo Segretario Comunale' },
  { id: 'fondoDirigenza', label: 'Fondo Dirigenza' }
];

const desktopViewports = [
  { width: 768, height: 900 },
  { width: 1024, height: 900 },
  { width: 1280, height: 900 },
  { width: 1440, height: 900 },
  { width: 1536, height: 900 }
];

test.describe('REL-004 E2E Real Browser Geometry — Total Bar & Sidebar Hover Clearance', () => {
  test.describe.configure({ mode: 'serial' });

  for (const fund of fundPages) {
    test.describe(`${fund.label} (${fund.id})`, () => {
      for (const vp of desktopViewports) {
        test(`desktop viewport ${vp.width}x${vp.height}: compact, hover clearance >= 12px, unhover return`, async ({ page }) => {
          await setupPage(page);
          await navigateToFundPage(page, fund.id);

          await page.setViewportSize(vp);
          await page.mouse.move(vp.width - 10, 100);
          await page.waitForTimeout(400);

          const desktopAside = page.locator('aside.hidden.md\\:flex, aside.md\\:flex').filter({ visible: true }).first();
          const bottomBar = page.locator('div.fixed.bottom-0').first();
          await expect(desktopAside).toBeVisible();
          await expect(bottomBar).toBeVisible();

          const totalLabel = bottomBar.locator('span').filter({ hasText: /TOTALE/i }).first();
          const totalValue = bottomBar.locator('span').filter({ hasText: /€/i }).first();
          await expect(totalLabel).toBeVisible();
          await expect(totalValue).toBeVisible();

          // 1. Compact state
          const compactSidebarBox = await desktopAside.boundingBox();
          const compactBottomBarBox = await bottomBar.boundingBox();
          expect(compactSidebarBox).not.toBeNull();
          expect(compactBottomBarBox).not.toBeNull();

          // Sidebar width ~ 64px, bottom bar aligned at x ~ 64px
          expect(Math.abs(compactSidebarBox!.width - 64)).toBeLessThanOrEqual(2);
          expect(Math.abs(compactBottomBarBox!.x - 64)).toBeLessThanOrEqual(2);

          // 2. Real Hover state
          await desktopAside.hover();
          await page.waitForTimeout(400);

          const hoverSidebarBox = await desktopAside.boundingBox();
          const labelBox = await totalLabel.boundingBox();
          const valueBox = await totalValue.boundingBox();

          expect(hoverSidebarBox).not.toBeNull();
          expect(labelBox).not.toBeNull();
          expect(valueBox).not.toBeNull();

          // Sidebar expanded ~ 256px
          expect(hoverSidebarBox!.width).toBeGreaterThanOrEqual(250);
          expect(hoverSidebarBox!.width).toBeLessThanOrEqual(262);

          const sidebarRightEdge = hoverSidebarBox!.x + hoverSidebarBox!.width;
          const labelClearance = Math.round(labelBox!.x - sidebarRightEdge);
          const valueClearance = Math.round(valueBox!.x - sidebarRightEdge);

          console.log(`[E2E] ${fund.id} @ ${vp.width}px hover: sidebarRight=${sidebarRightEdge}px, label.x=${labelBox!.x}px (clearance=${labelClearance}px), value.x=${valueBox!.x}px (clearance=${valueClearance}px)`);

          // Geometric invariant: clearance >= 12px from sidebar
          expect(labelBox!.x).toBeGreaterThanOrEqual(sidebarRightEdge + 12);
          expect(valueBox!.x).toBeGreaterThanOrEqual(sidebarRightEdge + 12);

          // No collision between label and value
          expect(labelBox!.x + labelBox!.width).toBeLessThanOrEqual(valueBox!.x);

          // 3. Unhover / return state
          await page.mouse.move(vp.width - 10, 100);
          await page.waitForTimeout(400);

          const returnSidebarBox = await desktopAside.boundingBox();
          const returnBottomBarBox = await bottomBar.boundingBox();
          expect(Math.abs(returnSidebarBox!.width - 64)).toBeLessThanOrEqual(2);
          expect(Math.abs(returnBottomBarBox!.x - 64)).toBeLessThanOrEqual(2);
        });
      }

      test('mobile viewport 640x900: bar x=0, full width, no desktop sidebar, no collision', async ({ page }) => {
        await setupPage(page);
        await navigateToFundPage(page, fund.id);

        await page.setViewportSize({ width: 640, height: 900 });
        await page.waitForTimeout(400);

        const desktopAside = page.locator('aside.hidden.md\\:flex, aside.md\\:flex');
        await expect(desktopAside).toBeHidden();

        const bottomBar = page.locator('div.fixed.bottom-0').first();
        await expect(bottomBar).toBeVisible();

        const barBox = await bottomBar.boundingBox();
        expect(barBox).not.toBeNull();
        expect(Math.abs(barBox!.x)).toBeLessThanOrEqual(2);
        expect(Math.abs(barBox!.width - 640)).toBeLessThanOrEqual(2);

        const totalLabel = bottomBar.locator('span').filter({ hasText: /TOTALE/i }).first();
        const totalValue = bottomBar.locator('span').filter({ hasText: /€/i }).first();
        await expect(totalLabel).toBeVisible();
        await expect(totalValue).toBeVisible();

        const labelBox = await totalLabel.boundingBox();
        const valueBox = await totalValue.boundingBox();
        expect(labelBox).not.toBeNull();
        expect(valueBox).not.toBeNull();

        expect(labelBox!.x).toBeGreaterThanOrEqual(0);
        expect(labelBox!.x + labelBox!.width).toBeLessThanOrEqual(valueBox!.x);
      });
    });
  }
});
