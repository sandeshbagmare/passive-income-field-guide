const assert = require('node:assert/strict');
const {calculateBandwidthPlan} = require('./handbook.js');
const v = {target:30000, capacity:300, rate:.1, fx:85, costs:1000, fee:2.02, loss:3, devices:3, observed:3, minimum:20};
const result = calculateBandwidthPlan(v);
assert.ok(Math.abs(result.requiredDaily - 126.0019) < .001);
assert.ok(Math.abs(result.requiredPerDevice - 42.0006) < .001);
assert.ok(Math.abs(result.capacityShare - 42.0006) < .001);
assert.ok(Math.abs(result.gross - 765) < 1e-8);
assert.equal(result.canRequest, false);
assert.equal(result.payoutDays, 67);
assert.equal(result.netCashScenario, -1000);
assert.equal(calculateBandwidthPlan({...v, observed:0}).payoutDays, null);
assert.equal(calculateBandwidthPlan({...v, rate:0}).requiredDaily, null);
assert.equal(calculateBandwidthPlan({...v, rate:0}).payoutDays, null);
assert.equal(calculateBandwidthPlan({...v, loss:100}).requiredDaily, null);
const noFee = calculateBandwidthPlan({...v, costs:0, fee:0, loss:0, observed:300});
assert.ok(Math.abs(noFee.requiredDaily - 117.64705882352942) < 1e-9);
assert.equal(noFee.gross, 76500);
assert.equal(noFee.netAccrued, 76500);
assert.equal(noFee.canRequest, true);
assert.equal(calculateBandwidthPlan({...v,target:100000}).withinCapacity, false);
assert.throws(()=>calculateBandwidthPlan({...v,fx:0}), RangeError);
assert.throws(()=>calculateBandwidthPlan({...v,devices:0}), RangeError);
assert.throws(()=>calculateBandwidthPlan({...v,devices:1.5}), RangeError);
assert.throws(()=>calculateBandwidthPlan({...v,observed:-1}), RangeError);
assert.throws(()=>calculateBandwidthPlan({...v,rate:NaN}), RangeError);
console.log('PASS: target traffic, pooled fee, capacity limits, threshold delay, no-demand/zero-rate cases, and input validation.');
const fs = require('node:fs');
const path = require('node:path');
for (const file of ['index.html','android-pilot.html','internet-income-plan.html','pc-agent.html','dashboard.html','pc-work-playbooks.html','more-pc-routes.html']) {
  const html = fs.readFileSync(file,'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,file+': duplicate IDs');
  for (const [,link] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|data:)/.test(link)) continue;
    const [target,hash] = link.split('#');
    const local = target && target !== './' ? path.resolve(target) : path.resolve(target === './' ? 'index.html' : file);
    assert.ok(fs.existsSync(local),file+': missing local asset '+link);
    if (hash) {
      const content = fs.readFileSync(local,'utf8');
      assert.ok(content.includes('id="'+hash+'"'),file+': missing anchor '+link);
    }
  }
}
const handbook = fs.readFileSync('internet-income-plan.html','utf8');
assert.ok(fs.readFileSync('index.html','utf8').includes('class="button" href="pc-agent.html"'), 'Home CTA must open the PC guide');
assert.match(handbook, /id="active-fallback"/);
assert.match(handbook, /participant-support\.usertesting\.com/);
assert.match(handbook, /211062538-Learn-about-the-Freelancer-Service-Fee/);
assert.match(handbook, /9234443621137-Your-earnings-page/);
assert.match(handbook, /open the Peer app.*own Settings/s);
assert.doesNotMatch(handbook, /In Android Settings, enable <strong>Share my bandwidth/);
console.log('PASS: all seven published pages have unique IDs, valid local assets and anchor targets.');
console.log('PASS: active fallback, official payment sources and correct ProxyRack app mode are documented.');
