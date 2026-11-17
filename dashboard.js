(function(){
 const {validateState,estimateRow,summarize,workloadForGap,statuses}=IncomeDashboard;
 const catalog=window.PC_CATALOG, key='fieldnotes-pc-income-v1';
 const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
 const decimal=n=>n.toLocaleString('en-IN',{maximumFractionDigits:1});
 const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
 const blankRow=a=>({id:a.id,included:false,status:'candidate',basis:'measured',days:7,earnedUsd:null,scenarioUsd:null,costInr:0,actualCostInr:0,feeUsd:0,loss:0,balanceUsd:null,minimumUsd:a.minimumUsd,cashInr:0});
 const blank=()=>({version:2,fx:85,target:30000,month:new Date().toISOString().slice(0,7),weeklyHoursAvailable:null,activeHourlyNetInr:null,rows:catalog.map(blankRow)});
 let state=blank();
 const message=s=>document.getElementById('message').textContent=s;
 function renderWorkload(totals){
  const r=workloadForGap(state,totals),box=document.getElementById('workload');box.replaceChildren(el('h2','Work needed to close the observed gap'));
  if(r.gap===0)box.append(el('p','Selected observed income meets this target; cash clearance may differ.'));
  else if(r.monthlyHours===null)box.append(el('p','Enter your own after-fee active INR/hour rate. Required work hours stay unknown until you enter a rate.'));
  else {let note='Enter an available weekly-hours budget to compare.';if(state.weeklyHoursAvailable!==null)note=r.withinAvailability?'Within entered time as arithmetic only; paid work availability is unproven.':'Exceeds the entered weekly-hours budget.';box.append(el('p','Remaining gap '+money(r.gap)+' at '+money(state.activeHourlyNetInr)+'/hour needs '+decimal(r.monthlyHours)+' billable hours/month ('+decimal(r.weeklyHours)+'/week). '+note));}
  box.append(el('p','Your rate is an assumption, not a platform offer. Allow extra unpaid time for screening, learning, applications and revisions. Selected active income is already subtracted from the gap.'));
 }
 function renderTotals(){
  const t=summarize(state,catalog),box=document.getElementById('totals');box.replaceChildren();
  const entries=[['Observed passive net / 30 days',money(t.passive),'Known subtotal; '+t.unknown+' selected rows lack an estimate.'],['Observed active net / 30 days',money(t.active),'Requires accepted recurring work and your time.'],['Cleared cash minus actual costs',money(t.netCash),'Month '+state.month+': '+money(t.cash)+' receipts minus '+money(t.actualCosts)+' actual costs.'],['Assumed passive scenario',money(t.scenarioPassive),'Excluded from observed totals.'],['Assumed active scenario',money(t.scenarioActive),'Excluded from observed totals.'],['Gap at observed pace',money(Math.max(0,state.target-t.passive-t.active)),'Selected observed passive + active; no income guarantee.']];
  for(const [title,value,note] of entries){const card=el('div',undefined,'metric');card.append(el('span',title),el('strong',value),el('small',note));box.append(card);}renderWorkload(t);
 }
 function renderReport(row){
  const e=estimateRow(row,state.fx),report=document.getElementById(row.id+'-report');let text=row.basis==='scenario'?'ASSUMED SCENARIO: ':'OBSERVED RUN RATE: ';
  text+=e.net===null?'Unknown monthly estimate. ':money(e.net)+' estimated net / 30 days. ';
  text+=e.thresholdDays===null?'Threshold timing unknown. ':e.thresholdDays===0?'Balance meets minimum; other payout conditions apply. ':'About '+e.thresholdDays+' days to minimum at observed pace, plus processing. ';
  report.textContent=text+'Cleared cash this month: '+money(row.cashInr)+'. Keep estimated and actual costs separate.';
 }
 function field(parent,row,name,label,options){
  const l=el('label',label),input=document.createElement(options?'select':'input');input.id=row.id+'-'+name;
  if(options)for(const [value,text] of options){const option=el('option',text);option.value=value;input.append(option);}
  else{input.type='number';input.step='any';input.min=name==='days'?'1':'0';input.max=name==='loss'?'100':name==='days'?'366':'100000000';}
  input.value=row[name]===null?'':row[name];
  input.addEventListener('input',()=>{const old=row[name];row[name]=options?input.value:input.value===''?null:Number(input.value);try{validateState(state);input.removeAttribute('aria-invalid');renderTotals();renderReport(row);message('Unsaved edits. Export or explicitly save to keep them.');}catch(e){row[name]=old;input.setAttribute('aria-invalid','true');message(e.message+' Last valid value retained.');}});l.append(input);parent.append(l);
 }
 function render(){
  for(const id of ['month','fx','target'])document.getElementById(id).value=state[id];document.getElementById('active-hourly').value=state.activeHourlyNetInr??'';document.getElementById('hours').value=state.weeklyHoursAvailable??'';
  const container=document.getElementById('providers');container.replaceChildren();
  for(const row of state.rows){const app=catalog.find(a=>a.id===row.id),card=el('article',undefined,'provider'),head=el('div',undefined,'provider-head'),title=el('div');title.append(el('h2',app.name),el('p',app.connection));const link=el('a','Official provider / setup');link.href=app.setupUrl;title.append(link);head.append(title,el('span',app.mode==='passive'?'Background / passive':'Active / creation work','mode'));card.append(head,el('p',app.caveat,'small'));const grid=el('div',undefined,'provider-grid'),choose=el('label','Include in current earning plan'),checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.id=row.id+'-included';checkbox.checked=row.included;checkbox.addEventListener('change',()=>{row.included=checkbox.checked;renderTotals();message('Select a compatible current configuration; comparison windows are not additive.');});choose.append(checkbox);grid.append(choose);
   field(grid,row,'status','Setup status',statuses.map(s=>[s,s]));field(grid,row,'basis','Estimate basis',[['measured','Observed recurring credits'],['scenario','Hypothetical monthly scenario']]);
   for(const [name,label] of [['days','Observed days'],['earnedUsd','New recurring earned USD in window'],['scenarioUsd','Assumed monthly gross USD (scenario only)'],['costInr','Estimated extra monthly costs INR'],['feeUsd','One estimated withdrawal fee USD'],['loss','Estimated payment / FX reduction %'],['balanceUsd','Current pooled unpaid balance USD'],['minimumUsd','Current payout minimum USD'],['cashInr','Cleared cash this month INR, net of deducted fees'],['actualCostInr','Actual extra costs paid this month INR']])field(grid,row,name,label);
   card.append(grid);const report=el('div',undefined,'provider-report');report.id=row.id+'-report';report.setAttribute('role','status');card.append(report);container.append(card);renderReport(row);
  }renderTotals();
 }
 function accept(value){const checked=validateState(value);if(checked.rows.some(r=>!catalog.some(a=>a.id===r.id)))throw Error('Import contains a provider outside this catalog.');const existing=new Map(checked.rows.map(r=>[r.id,r]));checked.rows=catalog.map(a=>existing.get(a.id)||blankRow(a));state=checked;render();}
 document.getElementById('month').addEventListener('change',e=>{const next=e.target.value;if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(next)){e.target.value=state.month;return;}if(next===state.month)return;if(!confirm('Export the current statement first. Switch month and reset actual cash/costs? Observations/balances remain.')){e.target.value=state.month;return;}state.month=next;state.rows.forEach(r=>{r.cashInr=0;r.actualCostInr=0;});render();message('New month: actual cash/costs reset. Review retained observations/balances.');});
 for(const id of ['fx','target','active-hourly','hours'])document.getElementById(id).addEventListener('input',e=>{const name=({fx:'fx',target:'target','active-hourly':'activeHourlyNetInr',hours:'weeklyHoursAvailable'})[id],old=state[name];if(e.target.value===''&&['active-hourly','hours'].includes(id)){state[name]=null;e.target.removeAttribute('aria-invalid');renderTotals();return;}if(!e.target.checkValidity()||e.target.value===''){e.target.setAttribute('aria-invalid','true');return message('Correct highlighted '+id+' before saving.');}state[name]=Number(e.target.value);try{validateState(state);e.target.removeAttribute('aria-invalid');renderTotals();state.rows.forEach(renderReport);}catch(err){state[name]=old;e.target.setAttribute('aria-invalid','true');message(err.message);}});
 function checkVisible(){if(document.querySelector('[aria-invalid="true"]'))throw Error('Correct highlighted inputs before saving or exporting.');}
 document.getElementById('save').onclick=()=>{try{checkVisible();localStorage.setItem(key,JSON.stringify(validateState(state)));message('Saved in this browser. No network upload occurred.');}catch(e){message('Save failed: '+e.message);}};
 document.getElementById('load').onclick=()=>{try{const raw=localStorage.getItem(key);if(!raw)return message('No browser save.');accept(JSON.parse(raw));message('Loaded browser save; new candidates start unknown/unselected.');}catch(e){message('Not loaded: '+e.message);}};
 document.getElementById('forget').onclick=()=>{try{localStorage.removeItem(key);message('Browser save removed; display unchanged.');}catch(e){message(e.message);}};
 document.getElementById('reset').onclick=()=>{if(confirm('Reset displayed entries? Export first. Browser save is unchanged.')){state=blank();render();message('Display reset; save unchanged.');}};
 document.getElementById('export').onclick=()=>{try{checkVisible();const blob=new Blob([JSON.stringify(validateState(state),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='income-private-'+state.month+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('Exported private JSON; keep outside public repository.');}catch(e){message('Export blocked: '+e.message);}};
 document.getElementById('import').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>200000)throw Error('File exceeds 200 KB.');const value=JSON.parse(await file.text());validateState(value);if(!confirm('Replace displayed entries? Export current edits first if needed.'))return;accept(value);message('Imported valid data; new candidates unknown/unselected. Browser save unchanged.');}catch(err){message('Import rejected: '+err.message);}finally{e.target.value='';}};
 render();
})();
