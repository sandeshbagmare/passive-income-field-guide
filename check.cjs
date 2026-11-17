const fs=require('node:fs');const assert=require('node:assert/strict');const {calculate}=require('./site.js');
const apps=JSON.parse(fs.readFileSync('apps.json','utf8').replace(/^\uFEFF/,''));
assert.equal(apps.length,15);assert.equal(new Set(apps.map(a=>a.name)).size,15);
for(const a of apps){for(const k of ['name','kind','status','india','earnings','payout','limits','risk','confidence'])assert.ok(a[k],a.name+': '+k);assert.ok(a.setup.length);assert.ok(a.sources.length);for(const [label,url] of a.sources){assert.ok(label);assert.equal(new URL(url).protocol,'https:');}}
const input={fx:85,target:30000,gb:50,rate:.1,watts:30,tariff:8,costs:0,gpu:0,util:50,gpuwatts:300};
let r=calculate(input);assert.equal(r.bandwidth,425);assert.ok(Math.abs(r.net-252.2)<1e-8);assert.equal(r.gpu,0);assert.ok(Math.abs(r.requiredGb-3529.4117647058824)<1e-8);
r=calculate({...input,gpu:.48,util:100,watts:0,gpuwatts:0,gb:0});assert.ok(Math.abs(r.gpu-29376)<1e-8);
r=calculate({...input,rate:0,gb:0});assert.equal(r.requiredGb,null);assert.ok(r.net<0);
const html=fs.readFileSync('index.html','utf8');assert.equal((html.match(/class="app-card"/g)||[]).length,15);assert.ok(!html.includes('{{CARDS}}'));const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);for(const [,id] of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(id),'missing anchor '+id);
console.log('PASS: 15 complete candidates, HTTPS source links, static rendering, unique IDs/anchors, calculator costs/zero rate/high-GPU scenarios.');
