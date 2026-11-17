(function(root) {
  const fields = ['id','included','status','basis','days','earnedUsd','scenarioUsd','costInr','actualCostInr','feeUsd','loss','balanceUsd','minimumUsd','cashInr'];
  const statuses = ['candidate','downloaded','installed','needs-sign-in','testing','paid','paused','excluded'];
  function strictKeys(value, allowed) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(k=>!allowed.includes(k))) throw Error('Unexpected object or field in import.');
  }
  function numeric(value,name,min,max,nullable=false) {
    if (nullable && value === null) return;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw Error('Invalid '+name+'.');
  }
  function validateState(s) {
    strictKeys(s,['version','fx','target','month','rows','activeHourlyNetInr','weeklyHoursAvailable']);
    if (![1,2].includes(s.version)) throw Error('Unsupported data version.');
    if (s.version === 1) {
      s={...s,version:2,activeHourlyNetInr:null,weeklyHoursAvailable:null};
    }
    numeric(s.fx,'fx',.01,1000); numeric(s.target,'target',0,1e8);
    numeric(s.activeHourlyNetInr,'active hourly assumption',.01,1e7,true);
    numeric(s.weeklyHoursAvailable,'weekly hours available',0,168,true);
    if (typeof s.month !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(s.month)) throw Error('Invalid month.');
    if (!Array.isArray(s.rows) || s.rows.length>100) throw Error('Invalid rows.');
    const ids = new Set();
    for (const r of s.rows) {
      strictKeys(r,fields);
      if (typeof r.included !== 'boolean') throw Error('Invalid current-plan selection.');
      if (typeof r.id !== 'string' || !/^[a-z0-9-]{1,60}$/.test(r.id)) throw Error('Invalid row id.');
      if (ids.has(r.id)) throw Error('Duplicate provider row: '+r.id); ids.add(r.id);
      if (!statuses.includes(r.status)) throw Error('Invalid status.');
      if (!['measured','scenario'].includes(r.basis)) throw Error('Invalid basis.');
      numeric(r.days,'days',1,366);
      for (const k of ['earnedUsd','scenarioUsd','balanceUsd','minimumUsd']) numeric(r[k],k,0,1e8,true);
      for (const k of ['costInr','actualCostInr','feeUsd','cashInr']) numeric(r[k],k,0,1e8);
      numeric(r.loss,'loss',0,100);
    }
    return JSON.parse(JSON.stringify(s));
  }
  function estimateRow(r,fx) {
    const daily = r.earnedUsd === null ? null : r.earnedUsd/r.days;
    const grossUsd = r.basis === 'scenario' ? r.scenarioUsd : daily === null ? null : daily*30;
    const net = grossUsd === null ? null : Math.max(0,grossUsd-r.feeUsd)*fx*(1-r.loss/100)-r.costInr;
    let thresholdDays = null;
    if (r.minimumUsd !== null && r.balanceUsd !== null) {
      if (r.balanceUsd >= r.minimumUsd) thresholdDays=0;
      else if (daily>0) thresholdDays=Math.ceil((r.minimumUsd-r.balanceUsd)/daily);
    }
    return {grossUsd,net,thresholdDays};
  }
  function summarize(state,catalog) {
    const result={passive:0,active:0,scenarioPassive:0,scenarioActive:0,cash:0,actualCosts:0,netCash:0,unknown:0};
    for(const r of state.rows) {
      result.cash+=r.cashInr;
      result.actualCosts+=r.actualCostInr;
      const app=catalog.find(a=>a.id===r.id);
      if (!app || !r.included || !['testing','paid'].includes(r.status)) continue;
      const e=estimateRow(r,state.fx);
      if(e.net===null){result.unknown++;continue;}
      const key=(r.basis==='scenario'?'scenario':'')+(r.basis==='scenario'?(app.mode==='passive'?'Passive':'Active'):(app.mode==='passive'?'passive':'active'));
      result[key]+=e.net;
    }
    result.netCash=result.cash-result.actualCosts;
    return result;
  }
  function workloadForGap(state,totals){
    const gap=Math.max(0,state.target-totals.passive-totals.active);
    if(gap===0)return {monthlyHours:0,weeklyHours:0,withinAvailability:true,gap};
    if(state.activeHourlyNetInr===null)return {monthlyHours:null,weeklyHours:null,withinAvailability:null,gap};
    const monthlyHours=gap/state.activeHourlyNetInr;
    const weeklyHours=monthlyHours/4.33;
    return {monthlyHours,weeklyHours,withinAvailability:state.weeklyHoursAvailable===null?null:weeklyHours<=state.weeklyHoursAvailable,gap};
  }
  const api={validateState,estimateRow,summarize,workloadForGap,statuses};
  if(typeof module!=='undefined')module.exports=api;
  else root.IncomeDashboard=api;
})(typeof window!=='undefined'?window:globalThis);
