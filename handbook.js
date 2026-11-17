function calculateBandwidthPlan(v) {
  const keys = ['target','capacity','rate','fx','costs','fee','loss','devices','observed','minimum'];
  if (keys.some(k => !Number.isFinite(v[k]) || v[k] < 0) || v.fx === 0 ||
      !Number.isInteger(v.devices) || v.devices < 1 || v.loss > 100 || v.observed > v.capacity) {
    throw new RangeError('Use valid nonnegative values, a positive FX rate, whole devices, and observed traffic within capacity.');
  }
  const retention = 1 - v.loss / 100;
  const requiredMonthly = v.rate > 0 && retention > 0
    ? ((v.target + v.costs) / (v.fx * retention) + v.fee) / v.rate : null;
  const requiredDaily = requiredMonthly === null ? null : requiredMonthly / 30;
  const dailyUsd = v.observed * v.rate;
  const monthlyUsd = dailyUsd * 30;
  const gross = monthlyUsd * v.fx;
  const netAccrued = Math.max(0, monthlyUsd - v.fee) * v.fx * retention - v.costs;
  const canRequest = monthlyUsd > v.fee && monthlyUsd >= v.minimum;
  return {
    requiredDaily,
    requiredPerDevice: requiredDaily === null ? null : requiredDaily / v.devices,
    capacityShare: requiredDaily === null || v.capacity === 0 ? null : requiredDaily / v.capacity * 100,
    withinCapacity: requiredDaily !== null && requiredDaily <= v.capacity,
    gross, netAccrued, canRequest,
    netCashScenario: canRequest ? netAccrued : -v.costs,
    payoutDays: dailyUsd > 0 ? Math.ceil(v.minimum / dailyUsd) : null
  };
}
if (typeof module !== 'undefined') module.exports = {calculateBandwidthPlan};
if (typeof document !== 'undefined') {
  const form = document.getElementById('bandwidth-plan');
  const ids = ['target','capacity','rate','fx','costs','fee','loss','devices','observed','minimum'];
  const rupees = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
  const number = n => n.toLocaleString('en-IN',{maximumFractionDigits:2});
  function update() {
    const v = {};
    for (const id of ids) {
      const input = document.getElementById('plan-'+id);
      if (input.value === '' || !input.checkValidity()) {
        document.getElementById('plan-result').textContent = 'Enter a valid value for '+input.labels[0].textContent.trim()+'. Previous results are hidden.';
        return;
      }
      v[id] = Number(input.value);
    }
    let r;
    try { r = calculateBandwidthPlan(v); }
    catch (e) { document.getElementById('plan-result').textContent = e.message; return; }
    const lines = [
      r.requiredDaily === null ? 'The target cannot be reached at a zero paid rate or 100% conversion loss.' :
        'Required paid traffic: '+number(r.requiredDaily)+' GB/day total; '+number(r.requiredPerDevice)+' GB/day per accepted device if equal.',
      r.capacityShare === null ? 'No usable capacity percentage.' :
        'Required share of stated capacity: '+number(r.capacityShare)+'%. '+(r.withinCapacity ? 'Fits the capacity arithmetic; customer demand is still unproven.' : 'Exceeds the stated allowance. This setup cannot meet the target under these inputs.'),
      'At your entered observed traffic, the 30-day gross run rate is '+rupees(r.gross)+'. Modeled net after entered costs and one payout fee would be '+rupees(r.netAccrued)+' if it can be redeemed.',
      r.canRequest ? 'The modeled 30-day accrual reaches the entered minimum. If a payout is requested, approved and clears in that window, modeled net cash is '+rupees(r.netCashScenario)+'. No payment is guaranteed.' :
        'The modeled 30-day accrual does not support a payout after the entered minimum/fee. From zero starting balance, receipts can be ₹0; after entered costs, monthly net cash would be '+rupees(r.netCashScenario)+'.',
      r.payoutDays === null ? 'No threshold timeline without paid traffic.' :
        'From zero balance, at this fixed pace: about '+number(r.payoutDays)+' days to accrue the payout minimum, plus processing/verification time.'
    ];
    const output = document.getElementById('plan-result');
    output.replaceChildren(...lines.map(line => {const p=document.createElement('p');p.textContent=line;return p;}));
  }
  form.addEventListener('input',update);
  form.addEventListener('submit',e=>e.preventDefault());
  update();
}
