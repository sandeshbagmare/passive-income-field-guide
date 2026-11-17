function calculate(v){
 const bandwidth=v.gb*v.rate*v.fx, gpu=v.gpu*720*v.util/100*v.fx;
 const electricity=(v.watts*720+v.gpuwatts*720*v.util/100*(v.gpu>0?1:0))/1000*v.tariff;
 const expenses=electricity+v.costs;
 return {bandwidth,gpu,expenses,net:bandwidth+gpu-expenses,requiredGb:v.rate>0?v.target/(v.rate*v.fx):null};
}
if(typeof module!=='undefined')module.exports={calculate};
if(typeof document!=='undefined'){
 let active='all';const cards=[...document.querySelectorAll('.app-card')];
 function filter(){const query=document.querySelector('#search').value.trim().toLowerCase();let n=0;
 cards.forEach(c=>{const matches=active==='all'||(active==='pilot'?['pilot','conditional'].includes(c.dataset.status):active==='windows'?c.dataset.windows==='true':c.dataset.status===active);c.hidden=!(matches&&c.dataset.search.includes(query));if(!c.hidden)n++;});document.querySelector('#result-count').textContent=n+' candidate'+(n===1?'':'s');}
 document.querySelector('#search').addEventListener('input',filter);
 document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});filter();}));
 const ids=['fx','target','gb','rate','watts','tariff','costs','gpu','util','gpuwatts'];
 const money=x=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(x);
 function update(){const v={};for(const id of ids){const el=document.getElementById(id);if(!el.checkValidity()||el.value===''){document.getElementById('net').textContent='Check inputs';return;}v[id]=Number(el.value);}const r=calculate(v);for(const [id,val] of Object.entries({net:r.net,bw:r.bandwidth,'gpu-gross':r.gpu,expenses:r.expenses,gap:Math.max(0,v.target-r.net)}))document.getElementById(id).textContent=money(val);
 document.getElementById('volume').textContent=r.requiredGb===null?'At a zero bandwidth rate, the target cannot be reached through bandwidth.':'For the target from bandwidth alone, before costs: '+Math.ceil(r.requiredGb).toLocaleString('en-IN')+' purchased GB/month. This is a demand requirement, not a forecast.';
 document.getElementById('days-left').textContent='Nov 17–30 upper-bound gross for these assumptions: '+money((r.bandwidth+r.gpu)*14/30)+'. Assumes the full 14 days and identical demand; withdrawal may happen later.';}
 document.getElementById('calculator').addEventListener('input',update);document.getElementById('calculator').addEventListener('submit',e=>e.preventDefault());update();
}
