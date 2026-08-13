import { test, expect } from '@playwright/test';

async function waitForCloseout(page){
  await page.goto('/?e2e=193',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.smartTrafficAppReady===true,null,{timeout:18000});
  await expect(page.locator('#mvpCloseoutRoom')).toBeVisible({timeout:18000});
}

test('engineering closeout room is ready while production remains unverified', async ({page})=>{
  await waitForCloseout(page);
  await expect(page.locator('#closeoutStatus')).toHaveText('ENGINEERING_MVP_CLOSEOUT_READY');
  await expect(page.locator('#closeoutProduction')).toContainText('NOT_VERIFIED');
  const result=await page.evaluate(()=>window.smartTrafficCloseout.getScorecard());
  expect(result.engineeringCloseoutReady).toBe(true);
  expect(result.productionReadiness).toBe('NOT_VERIFIED');
  expect(result.productionVerifiedCount).toBe(0);
  expect(result.evidenceBoundary.physicalIPhoneValidated).toBe(false);
});

test('local benchmark and isolated resilience drill produce evidence without mutating authority', async ({page})=>{
  await waitForCloseout(page);
  const result=await page.evaluate(async()=>{
    const before=window.smartTrafficRuntime.getUnifiedState().revision;
    const benchmark=await window.smartTrafficCloseout.runBenchmark();
    const recovery=window.smartTrafficCloseout.runRecovery();
    const after=window.smartTrafficRuntime.getUnifiedState().revision;
    return {before,after,benchmark,recovery};
  });
  expect(result.benchmark.iterations).toBe(25);
  expect(result.benchmark.p50Ms).toBeGreaterThanOrEqual(0);
  expect(result.benchmark.p95Ms).toBeGreaterThanOrEqual(result.benchmark.p50Ms);
  expect(result.benchmark.productionBenchmark).toBe(false);
  expect(result.recovery.scenarioCount).toBe(7);
  expect(result.recovery.authoritativeStateUnchanged).toBe(true);
  expect(result.recovery.allInjectionsIsolated).toBe(true);
  expect(result.before).toBe(result.after);
});
