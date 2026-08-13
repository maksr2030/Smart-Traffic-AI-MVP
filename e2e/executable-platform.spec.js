import { test, expect } from '@playwright/test';

async function waitForPlatform(page) {
  await page.goto('/?e2e=190', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.smartTrafficAppReady === true, null, { timeout: 18_000 });
  await expect(page.locator('#acquisitionEntry')).toBeVisible();
  await expect(page.locator('#acqEnter')).toBeVisible();
}

async function enterPlatform(page) {
  await page.locator('#acqEnter').click();
  await expect(page.locator('#acquisitionEntry')).toHaveCount(0, { timeout: 5_000 });
  await page.waitForFunction(() => window.smartTrafficAcquisitionReady === true, null, { timeout: 12_000 });
}

test('entry gate is usable and mobile actions remain reachable', async ({ page }, testInfo) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await waitForPlatform(page);

  if (testInfo.project.name === 'mobile-webkit') {
    const overlay = page.locator('#acquisitionEntry');
    const overflowY = await overlay.evaluate(el => getComputedStyle(el).overflowY);
    expect(['auto', 'scroll']).toContain(overflowY);
    const actions = page.locator('.acq-entry-actions');
    await expect(actions).toBeVisible();
    expect(await actions.evaluate(el => getComputedStyle(el).position)).toBe('fixed');
    const box = await actions.boundingBox();
    expect(box).not.toBeNull();
    expect(box.y + box.height).toBeLessThanOrEqual(844);
  }

  await enterPlatform(page);
  await expect(page.locator('#acquisitionDashboard')).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('decision room and guided demo load from the executable build', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await waitForPlatform(page);
  await enterPlatform(page);

  await expect(page.locator('#acquisitionDecisionRoom')).toHaveCount(1);
  await page.waitForFunction(() => window.smartTrafficHardeningReady === true, null, { timeout: 18_000 });
  await expect(page.locator('#runtimeIntegrityPanel')).toHaveCount(1);
  await expect(page.locator('#guidedDemoStart')).toBeVisible();
  await page.locator('#guidedDemoStart').click();
  await expect(page.locator('#guidedDemoController')).toHaveClass(/visible/, { timeout: 10_000 });
  await expect(page.locator('#guidedStepCount')).toContainText('1 / 11');
  await page.locator('#guidedClose').click();
  expect(pageErrors).toEqual([]);
});

test('hardening runtime captures, verifies and exactly replays a decision', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await waitForPlatform(page);
  await enterPlatform(page);
  await page.waitForFunction(() => window.smartTrafficHardeningReady === true, null, { timeout: 18_000 });

  await page.locator('#captureDecisionBtn').click();
  await expect(page.locator('#hardeningLedgerCount')).toHaveText('1', { timeout: 20_000 });
  await expect(page.locator('#hardeningChainStatus')).toHaveText('VERIFIED');
  await expect(page.locator('#hardeningStateHash')).not.toHaveText('—');

  await page.locator('#verifyLedgerBtn').click();
  await expect(page.locator('#hardeningResult')).toContainText(/سليم|Ledger valid/);

  await page.locator('#replayLatestBtn').click();
  await expect(page.locator('#hardeningReplayStatus')).toContainText(/مطابق|MATCH/, { timeout: 20_000 });
  await expect(page.locator('#hardeningReplayStatus')).toContainText('output=true');

  const evidence = await page.locator('.hardening-boundary').textContent();
  expect(evidence).toContain('digitalSignature=false');
  expect(evidence).toContain('blockchainAnchored=false');
  expect(evidence).toContain('nonRepudiation=false');
  expect(evidence).toContain('production_verified=0');
  expect(pageErrors).toEqual([]);
});

test('incident mutation is reflected in captured hardening state', async ({ page }) => {
  await waitForPlatform(page);
  await enterPlatform(page);
  await page.waitForFunction(() => window.smartTrafficHardeningReady === true, null, { timeout: 18_000 });

  await page.evaluate(async () => {
    window.smartTrafficRuntime.setRunning(false);
    window.smartTrafficRuntime.resetNetwork();
    window.smartTrafficRuntime.injectIncident('E09', false);
    await window.smartTrafficHardening.sync();
  });

  const incident = await page.evaluate(() => window.smartTrafficHardening.getState().activeIncidents.find(item => item.edgeId === 'E09'));
  expect(incident).toBeTruthy();
  expect(incident.closed).toBe(false);
  expect(incident.severity).toBeGreaterThan(0);
});
