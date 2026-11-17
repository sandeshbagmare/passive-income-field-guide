(function(){
  const {validateState,estimateRow,summarize,statuses}=IncomeDashboard;
  const catalog=window.PC_CATALOG;
  const key='fieldnotes-pc-income-v1';
  const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
  const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
  function blank(){return {version:1,fx:85,target:30000,month:new Date().toISOString().slice(0,7),rows:catalog.map(a=>({id:a.id,included:false,status:'candidate',basis:'measured',days:7,earnedUsd:null,scenarioUsd:null,costInr:0,actualCostInr:0,feeUsd:0,loss:0,balanceUsd:null,minimumUsd:a.minimumUsd,cashInr:0}))};}
  let state=blank();
  const message=s=>document.getElementById('message').textContent=s;
  function field(parent,row,name,label,options){
    const l=el('label',label), input=document.createElement(options?'select':'input');
    input.id=row.id+'-'+name;
    if(options)for(const [value,text] of options){const option=el('option',text);option.value=value;input.append(option);}
    else {input.type='number';input.step='any';input.min=['days'].includes(name)?'1':'0';input.max=name==='loss'?'100':name==='days'?'366':'100000000';}
    input.value=row[name]===null?'':row[name];
    input.addEventListener('input',()=>{const before=row[name];row[name]=options?input.value:input.value===''?null:Number(input.value);try{validateState(state);input.removeAttribute('aria-invalid');renderTotals();renderReport(row);message('Unsaved local edits. Export or explicitly save to keep them.');}catch(e){row[name]=before;input.setAttribute('aria-invalid','true');message(e.message+' The last valid value is retained; correct the highlighted field.');}});
    l.append(input);parent.append(l);
  }
  function renderReport(row){
    const report=document.getElementById(row.id+'-report');const e=estimateRow(row,state.fx);const rate=e.net===null?'Unknown monthly net estimate':money(e.net)+' estimated net / 30 days';
    report.textContent=(row.basis==='scenario'?'ASSUMED SCENARIO: ':'OBSERVED RUN RATE: ')+rate+'. '+(e.thresholdDays===null?'Threshold timing unknown.':e.thresholdDays===0?'Entered balance meets the minimum; other payout conditions still apply.':'About '+e.thresholdDays+' days from the entered balance to minimum at the observed pace, plus processing.')+' Cleared cash this reporting month: '+money(row.cashInr)+'. Estimated costs and actual paid costs are different fields.';
  }
  function renderTotals(){
    const t=summarize(state,catalog);const box=document.getElementById('totals');box.replaceChildren();
    const entries=[['Observed passive net / 30 days',money(t.passive),'Known subtotal; '+t.unknown+' testing rows lack an estimate.'],['Observed active net / 30 days',money(t.active),'Needs recurring accepted work and your time.'],['Cash actually received − actual costs',money(t.netCash),'Reporting month '+state.month+'; '+money(t.cash)+' receipts less '+money(t.actualCosts)+' entered actual costs.'],['Assumed passive scenario',money(t.scenarioPassive),'Excluded from the observed subtotal.'],['Assumed active scenario',money(t.scenarioActive),'Excluded from the observed subtotal.'],['Gap to target at observed pace',money(Math.max(0,state.target-t.passive-t.active)),'Combines observed passive and active only; no income guarantee.']];
    for(const [title,value,note] of entries){const card=el('div',undefined,'metric');card.append(el('span',title),el('strong',value),el('small',note));box.append(card);}
  }
  function render(){
    for(const id of ['month','fx','target'])document.getElementById(id).value=state[id];
    const container=document.getElementById('providers');container.replaceChildren();
    for(const row of state.rows){const app=catalog.find(a=>a.id===row.id);const card=el('article',undefined,'provider');const head=el('div',undefined,'provider-head'), title=el('div');title.append(el('h2',app.name),el('p',app.connection));const link=el('a','Official setup / provider ↗');link.href=app.setupUrl;title.append(link);head.append(title,el('span',app.mode==='passive'?'Background / passive':'Active work','mode'));card.append(head,el('p',app.caveat,'small'));const grid=el('div',undefined,'provider-grid');
      const choose=el('label','Include in current earning plan'),checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.id=row.id+'-included';checkbox.checked=row.included;checkbox.addEventListener('change',()=>{row.included=checkbox.checked;renderTotals();message('Include only a compatible current configuration; comparison windows are not additive.');});choose.append(checkbox);grid.append(choose);
      field(grid,row,'status','Setup status',statuses.map(s=>[s,s]));field(grid,row,'basis','Estimate basis',[['measured','Observed recurring credits'],['scenario','Hypothetical monthly scenario']]);
      for(const [name,label] of [['days','Observed days'],['earnedUsd','New recurring earned USD in that window'],['scenarioUsd','Assumed monthly gross USD (scenario only)'],['costInr','Estimated extra monthly costs INR'],['feeUsd','One estimated withdrawal fee USD'],['loss','Estimated payout / FX reduction %'],['balanceUsd','Current pooled unpaid balance USD'],['minimumUsd','Current payout minimum USD'],['cashInr','Cleared cash this month INR (net of deducted fees)'],['actualCostInr','Actual extra costs paid this month INR']])field(grid,row,name,label);
      card.append(grid);const report=el('div',undefined,'provider-report');report.id=row.id+'-report';report.setAttribute('role','status');card.append(report);container.append(card);renderReport(row);
    }
    renderTotals();
  }
  function accept(value){const checked=validateState(value);if(checked.rows.some(r=>!catalog.some(a=>a.id===r.id)))throw Error('Import contains a provider outside this catalog.');state=checked;render();}
  document.getElementById('month').addEventListener('change',e=>{const next=e.target.value;if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(next)){e.target.value=state.month;return;}if(next===state.month)return;if(!confirm('Export the current statement first if needed. Switch month and reset all cleared-cash and actual-cost fields? Observations, balances and scenario costs remain.')){e.target.value=state.month;return;}state.month=next;state.rows.forEach(r=>{r.cashInr=0;r.actualCostInr=0;});render();message('New reporting month; actual cash and actual costs reset. Observations/balances remain and should be reviewed.');});
  for(const id of ['fx','target'])document.getElementById(id).addEventListener('input',e=>{const before=state[id];if(!e.target.checkValidity()||e.target.value===''){e.target.setAttribute('aria-invalid','true');return message('Correct the highlighted '+id+' value before saving.');}state[id]=Number(e.target.value);try{validateState(state);e.target.removeAttribute('aria-invalid');renderTotals();state.rows.forEach(renderReport);}catch(err){state[id]=before;e.target.setAttribute('aria-invalid','true');message(err.message);}});
  function checkVisible(){if(document.querySelector('[aria-invalid="true"]'))throw Error('Correct highlighted inputs before saving or exporting.');}
  document.getElementById('save').onclick=()=>{try{checkVisible();localStorage.setItem(key,JSON.stringify(validateState(state)));message('Saved locally in this browser. No network upload occurred.');}catch(e){message('Browser save failed: '+e.message);}};
  document.getElementById('load').onclick=()=>{try{const raw=localStorage.getItem(key);if(!raw)return message('No saved dashboard in this browser.');accept(JSON.parse(raw));message('Loaded local browser save.');}catch(e){message('Save not loaded: '+e.message);}};
  document.getElementById('forget').onclick=()=>{try{localStorage.removeItem(key);message('Removed browser save; current display remains.');}catch(e){message(e.message);}};
  document.getElementById('reset').onclick=()=>{if(confirm('Reset displayed entries? Export first if you need them. The browser save is unchanged.')){state=blank();render();message('Displayed entries reset. Browser save was not changed.');}};
  document.getElementById('export').onclick=()=>{try{checkVisible();const blob=new Blob([JSON.stringify(validateState(state),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='income-private-'+state.month+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('Exported private JSON. Keep it outside the public repository.');}catch(e){message('Export blocked: '+e.message);}};
  document.getElementById('import').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>200000)throw Error('File exceeds 200 KB limit.');const value=JSON.parse(await file.text());validateState(value);if(!confirm('Replace displayed entries with this private file? Export current edits first if needed.'))return;accept(value);message('Imported valid private data. Browser save unchanged.');}catch(err){message('Import rejected: '+err.message);}finally{e.target.value='';}};
  render();
})();
