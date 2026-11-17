const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');
const apps=JSON.parse(read('apps.json'));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cards=apps.map((a,i)=>`<article class="app-card" data-status="${a.status.toLowerCase()}" data-windows="${a.windows}" data-search="${esc((a.name+' '+a.kind).toLowerCase())}"><div class="card-top"><span class="card-number">${String(i+1).padStart(2,'0')}</span><span class="badge ${a.status.toLowerCase()}">${esc(a.status)}</span></div><p class="category">${esc(a.kind)} · ${a.windows?'Windows supported':'Mobile / platform check'}</p><h3>${esc(a.name)}</h3><p>${esc(a.summary)}</p><p class="eligibility"><strong>India:</strong> ${esc(a.india)}</p><details><summary>Economics, setup & evidence</summary><h4>Earnings</h4><p>${esc(a.earnings)}</p><h4>Payout</h4><p>${esc(a.payout)}</p><h4>Device and account limits</h4><p>${esc(a.limits)}</p><h4>Setup / next action</h4><ol>${a.setup.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><h4>Tradeoff</h4><p>${esc(a.risk)}</p><p class="evidence"><strong>Evidence:</strong> ${esc(a.confidence)}</p><ul class="sources">${a.sources.map(([label,url])=>`<li><a href="${esc(url)}">${esc(label)} ↗</a></li>`).join('')}</ul></details></article>`).join('\n');
fs.writeFileSync('index.html',read('page.html').replace('{{CARDS}}',cards));
fs.writeFileSync('pc-catalog.js','window.PC_CATALOG = '+JSON.stringify(JSON.parse(read('pc-catalog.json')),null,2)+';\n');
console.log('Built '+apps.length+' static app cards.');
