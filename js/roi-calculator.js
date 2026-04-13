/* IDM: ROI-калькулятор */
(function () {
  const channelInput = document.getElementById("idm-new-roi-channel");
  const budgetInput = document.getElementById("idm-new-roi-budget");
  const goalInput = document.getElementById("idm-new-roi-goal");

  if (!channelInput || !budgetInput || !goalInput) {
    return;
  }

  const budgetValueNode = document.getElementById("idm-new-roi-budget-value");
  const reachNode = document.getElementById("idm-new-roi-reach");
  const clicksNode = document.getElementById("idm-new-roi-clicks");
  const leadsNode = document.getElementById("idm-new-roi-leads");
  const cplNode = document.getElementById("idm-new-roi-cpl");

  const channelFactors = {
    target: { reach: 1000, ctr: 0.025, cpl: 8 },
    context: { reach: 720, ctr: 0.045, cpl: 10 },
    seo: { reach: 480, ctr: 0.055, cpl: 6 },
    smm: { reach: 1250, ctr: 0.018, cpl: 7 }
  };

  const goalModifiers = {
    leads: { reach: 1, ctr: 1, cpl: 1 },
    sales: { reach: 0.85, ctr: 0.95, cpl: 1.18 },
    awareness: { reach: 1.35, ctr: 0.75, cpl: 1.25 }
  };

  const formatNumber = (value) => new Intl.NumberFormat("ru-RU").format(Math.round(value));

  function recalc() {
    const budget = Number(budgetInput.value);
    const channel = channelFactors[channelInput.value];
    const goal = goalModifiers[goalInput.value];

    const reach = (budget / 100) * channel.reach * goal.reach;
    const clicks = reach * channel.ctr * goal.ctr;
    const cpl = channel.cpl * goal.cpl;
    const leadBase = budget / cpl;
    const leadMin = Math.max(1, Math.floor(leadBase * 0.85));
    const leadMax = Math.max(leadMin + 1, Math.ceil(leadBase * 1.2));

    budgetValueNode.textContent = "$" + formatNumber(budget);
    reachNode.textContent = formatNumber(reach);
    clicksNode.textContent = formatNumber(clicks);
    leadsNode.textContent = formatNumber(leadMin) + " - " + formatNumber(leadMax);
    cplNode.textContent = "$" + cpl.toFixed(1);
  }

  channelInput.addEventListener("change", recalc);
  budgetInput.addEventListener("input", recalc);
  goalInput.addEventListener("change", recalc);

  recalc();
})();
