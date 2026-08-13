import { test, expect } from '@playwright/test';

test('Stage D runtime health panel reports authoritative READY state', async ({ page }) => {
  await page.goto('./');
  const panel = page.locator('#runtimeHealthPanel');
  await expect(panel).toBeVisible();
  await expect(page.locator('#runtimeHealthStatus')).toHaveText('READY');
  await expect(page.locator('#runtimeDecisionGate')).toContainText('ALLOW');
  const status = await page.evaluate(() => window.smartTrafficHealth?.current?.status);
  expect(status).toBe('READY');
});

test('Stage D fail-safe gate blocks unsafe policy snapshot without mutating authoritative state', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('#runtimeHealthPanel')).toBeVisible();
  const result = await page.evaluate(async () => {
    const state = window.smartTrafficRuntime.getUnifiedState();
    const originalRevision = state.revision;
    const module = await import('./engine/runtimeHealthEngine.js');
    const unsafe = structuredClone(state);
    unsafe.policy = { ...unsafe.policy, simulationOnly: false, requireHumanApproval: false, autoApplyAllowed: true, productionControlAllowed: true };
    const gate = module.applyFailSafeDecisionGate(unsafe, { selectedCandidateId: 'network_relief' });
    return { allowed: gate.allowed, status: gate.status, originalRevision, currentRevision: window.smartTrafficRuntime.getUnifiedState().revision };
  });
  expect(result.allowed).toBe(false);
  expect(result.status).toBe('BLOCKED');
  expect(result.currentRevision).toBe(result.originalRevision);
});
