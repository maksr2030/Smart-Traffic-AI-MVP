import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCoverage, capabilityStatus, coverageSummary, coverageToCsv } from '../coverage/coverageModel.js';

test('coverage statuses preserve evidence boundary', () => {
  assert.equal(capabilityStatus('2'),'implemented_demo');
  assert.equal(capabilityStatus('QTOS-02'),'implemented_demo');
  assert.equal(capabilityStatus('QTOS-18'),'represented_demo');
  assert.equal(capabilityStatus('AR-05'),'catalogued_only');
});

test('QCS proxy execution separates implemented, represented and catalogued records', () => {
  assert.equal(capabilityStatus('QCS-92'),'implemented_demo');
  assert.equal(capabilityStatus('QCS-101'),'implemented_demo');
  assert.equal(capabilityStatus('QCS-93'),'represented_demo');
  assert.equal(capabilityStatus('QCS-102'),'catalogued_only');
});

test('coverage summary counts all rows without production claims', () => {
  const rows = buildCoverage([
    {id:'QTOS-02',group:'qtos',title_ar:'a',title_en:'b'},
    {id:'QTOS-18',group:'qtos',title_ar:'c',title_en:'d'},
    {id:'AR-05',group:'additional_history',title_ar:'e',title_en:'f'}
  ]);
  const summary = coverageSummary(rows);
  assert.deepEqual(summary,{total:3,implemented_demo:1,represented_demo:1,catalogued_only:1,production_verified:0});
});

test('coverage CSV contains dynamic twin module label and evidence fields', () => {
  const csv = coverageToCsv(buildCoverage([{id:'QCS-101',group:'qcs_recovered',title_ar:'خطر',title_en:'Risk'}]));
  assert.match(csv,/production_verified/);
  assert.match(csv,/implemented_demo/);
  assert.match(csv,/dynamic-twin-risk-routing-and-command-plan/);
});
