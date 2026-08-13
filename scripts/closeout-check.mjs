import fs from 'node:fs';

const files={
  runtime:'closeoutRuntime.js',
  engine:'engine/closeoutReadinessEngine.js',
  css:'closeoutRuntime.css',
  e2e:'e2e/closeout.spec.js'
};
for(const path of Object.values(files))if(!fs.existsSync(path))throw new Error(`Closeout file missing: ${path}`);
const runtime=fs.readFileSync(files.runtime,'utf8');
for(const contract of ['mvpCloseoutRoom','ENGINEERING_MVP_CLOSEOUT','Run local performance baseline','runFailureInjectionSuite','productionReadiness','physicalIPhoneValidated=false'])if(!runtime.includes(contract))throw new Error(`Closeout runtime contract missing: ${contract}`);
const engine=fs.readFileSync(files.engine,'utf8');
for(const contract of ['ENGINEERING_MVP_CLOSEOUT_READY','NOT_VERIFIED','production_verification','sameBuildForE2EAndPages'])if(!engine.includes(contract))throw new Error(`Closeout engine contract missing: ${contract}`);
const e2e=fs.readFileSync(files.e2e,'utf8');
for(const contract of ['production remains unverified','iterations).toBe(25)','scenarioCount).toBe(7)','authoritativeStateUnchanged'])if(!e2e.includes(contract))throw new Error(`Closeout E2E contract missing: ${contract}`);
console.log('Buyer-grade engineering closeout contract passed.');
