import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }, testInfo) => {
  page.on('pageerror', error => console.error(`[${testInfo.project.name}] PAGE ERROR STACK:\n${error.stack || error.message}`));
  page.on('requestfailed', request => console.error(`[${testInfo.project.name}] REQUEST FAILED: ${request.method()} ${request.url()} :: ${request.failure()?.errorText || 'unknown'}`));
  page.on('console', message => {
    if (message.type() === 'error') console.error(`[${testInfo.project.name}] CONSOLE ERROR: ${message.text()}`);
  });
});

async function waitForPlatform(page) {
  await page.goto('/?e2e=192', { waitUntil: 'domcontentloaded' });
  try {
    await page.waitForFunction(() => window.smartTrafficAppReady === true, null, { timeout: 18_000 });
  } catch (error) {
    const diagnostic = await page.evaluate(() => ({
      appReady: window.smartTrafficAppReady ?? null,
      appFailed: window.smartTrafficAppFailed ?? null,
      runtimePublished: Boolean(window.smartTrafficRuntime),
      runtimeReady: window.smartTrafficRuntime?.isReady?.() ?? false,
      hardeningReady: window.smartTrafficHardeningReady ?? null,
      healthStatus: window.smartTrafficHealth?.current?.status ?? null,
      href: location.href
    })).catch(diagnosticError => ({ diagnosticError: diagnosticError.message }));
    console.error(`PLATFORM STARTUP DIAGNOSTIC: ${JSON.stringify(diagnostic)}`);
    throw error;
  }
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

test('decision room and guided demo load from the authoritative executable build', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await waitForPlatform(page);
  await enterPlatform(page);

  await expect(page.locator('#acquisitionDecisionRoom')).toHaveCount(1);
  await page.waitForFunction(() => window.smartTrafficHardeningReady === true, null, { timeout: 18_000 });
  await expect(page.locator('#runtimeIntegrityPanel')).toHaveCount(1);
  expect(await page.evaluate(() => window.smartTrafficRuntime.stateAuthority)).toBe('unified-state-bus');
  expect(await page.evaluate(() => window.smartTrafficRuntime.version)).toBe('1.9.1');
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
  expect(evidence).toContain('stateAuthority=unified-state-bus');
  expect(evidence).toContain('digitalSignature=false');
  expect(evidence).toContain('blockchainAnchored=false');
  expect(evidence).toContain('nonRepudiation=false');
  expect(evidence).toContain('production_verified=0');
  expect(pageErrors).toEqual([]);
});

test('incident mutation is authoritative and requires no reconciliation poll', async ({ page }) => {
  await waitForPlatform(page);
  await enterPlatform(page);
  await page.waitForFunction(() => window.smartTrafficHardeningReady === true, null, { timeout: 18_000 });

  const result = await page.evaluate(() => {
    window.smartTrafficRuntime.setRunning(false);
    window.smartTrafficRuntime.resetNetwork();
    const before = window.smartTrafficRuntime.getUnifiedState();
    window.smartTrafficRuntime.injectIncident('E09', false);
    const after = window.smartTrafficRuntime.getUnifiedState();
    const hardening = window.smartTrafficHardening.getState();
    return {
      beforeRevision: before.revision,
      afterRevision: after.revision,
      hardeningRevision: hardening.revision,
      incident: after.activeIncidents.find(item => item.edgeId === 'E09'),
      eventTypes: after.eventLog.map(item => item.type)
    };
  });

  expect(result.afterRevision).toBeGreaterThan(result.beforeRevision);
  expect(result.hardeningRevision).toBe(result.afterRevision);
  expect(result.incident).toBeTruthy();
  expect(result.incident.closed).toBe(false);
  expect(result.incident.severity).toBeGreaterThan(0);
  expect(result.eventTypes).toContain('incident_injected');
  expect(result.eventTypes).not.toContain('runtime_reconciled');
});

test('route and emergency inputs are governed by authoritative state events', async ({ page }) => {
  await waitForPlatform(page);
  await enterPlatform(page);
  await page.waitForFunction(() => window.smartTrafficHardeningReady === true, null, { timeout: 18_000 });
  await page.evaluate(() => window.smartTrafficRuntime.setRunning(false));

  await page.locator('#routeOrigin').selectOption('N2');
  await page.locator('#routeDestination').selectOption('N9');
  await page.locator('#emergencyTarget').selectOption('N11');
  await page.locator('#riskWeight').selectOption('3.5');

  await page.waitForFunction(() => {
    const state = window.smartTrafficRuntime.getUnifiedState();
    return state.routeParameters.origin === 'N2' && state.routeParameters.destination === 'N9' && state.emergencyTarget === 'N11' && Number(state.routeParameters.routeRiskWeight) === 3.5;
  });

  const authority = await page.evaluate(() => {
    const state = window.smartTrafficRuntime.getUnifiedState();
    return {
      routeParameters: state.routeParameters,
      emergencyTarget: state.emergencyTarget,
      eventTypes: state.eventLog.map(item => item.type),
      hardeningRevision: window.smartTrafficHardening.getState().revision,
      revision: state.revision
    };
  });
  expect(authority.routeParameters.origin).toBe('N2');
  expect(authority.routeParameters.destination).toBe('N9');
  expect(authority.routeParameters.routeRiskWeight).toBe(3.5);
  expect(authority.emergencyTarget).toBe('N11');
  expect(authority.eventTypes).toContain('decision_inputs_updated');
  expect(authority.hardeningRevision).toBe(authority.revision);
});

test('traffic drift can be replayed as an explicit authoritative event', async ({ page }) => {
  await waitForPlatform(page);
  await enterPlatform(page);
  await page.waitForFunction(() => window.smartTrafficHardeningReady === true, null, { timeout: 18_000 });

  const result = await page.evaluate(() => {
    window.smartTrafficRuntime.setRunning(false);
    const before = window.smartTrafficRuntime.getUnifiedState();
    const edgeBefore = before.network.edges.find(edge => edge.id === 'E01').load;
    window.smartTrafficRuntime.dispatch({
      type: 'traffic_drift_applied',
      source: 'e2e_explicit_drift',
      payload: { tick: before.tick + 1, deltas: { E01: 3 } }
    });
    const after = window.smartTrafficRuntime.getUnifiedState();
    return {
      beforeRevision: before.revision,
      afterRevision: after.revision,
      beforeTick: before.tick,
      afterTick: after.tick,
      edgeBefore,
      edgeAfter: after.network.edges.find(edge => edge.id === 'E01').load,
      lastEvent: after.lastEvent,
      hardeningRevision: window.smartTrafficHardening.getState().revision
    };
  });

  expect(result.afterRevision).toBe(result.beforeRevision + 1);
  expect(result.afterTick).toBe(result.beforeTick + 1);
  expect(result.edgeAfter).toBe(result.edgeBefore + 3);
  expect(result.lastEvent.type).toBe('traffic_drift_applied');
  expect(result.lastEvent.source).toBe('e2e_explicit_drift');
  expect(result.hardeningRevision).toBe(result.afterRevision);
});
