export function calculateDCF(historical, revenueProj, costProj, fcfProj, dcfInputs) {
    // Validate critical inputs
    if (dcfInputs.wacc <= dcfInputs.perpGrowthRate) {
      throw new Error(`WACC (${dcfInputs.wacc}) must be greater than perpetuity growth rate (${dcfInputs.perpGrowthRate})`);
    }
    
    if (dcfInputs.wacc <= 0 || !isFinite(dcfInputs.wacc)) {
      throw new Error(`WACC must be a positive number. Received: ${dcfInputs.wacc}`);
    }
    
    const projectedRevenues = projectRevenues(
      historical.revenue2024,
      revenueProj.commercialGrowthRates,
      revenueProj.governmentGrowthRates
    );
  
    const projectedEBIT = projectedRevenues.map((revenue, i) => {
      const cogs = revenue * (1 - costProj.grossMargins[i]);
      const rnd = revenue * costProj.rndRates[i];
      const sgna = revenue * costProj.sgnaRates[i];
      const ebit = revenue - cogs - rnd - sgna;
      return ebit;
    });
  
    const projectedFreeCashFlows = projectedEBIT.map((ebit, i) => {
      const revenue = projectedRevenues[i];
      const taxRate = costProj.taxRates[i];
      const nopat = ebit * (1 - taxRate);
      
      const da = revenue * fcfProj.daRates[i];
      const capex = revenue * fcfProj.capexRates[i];
      const changeInNWC = revenue * fcfProj.nwcRates[i];
      
      const fcf = nopat + da - capex - changeInNWC;
      return fcf;
    });
  
    const finalYearFCF = projectedFreeCashFlows[4];
    const terminalValue = calculateTerminalValuePerpetuity(
      finalYearFCF,
      dcfInputs.perpGrowthRate,
      dcfInputs.wacc
    );
  
    const finalYearEBIT = projectedEBIT[4];
    const terminalValueExitMultiple = finalYearEBIT * dcfInputs.exitMultiple;
  
    const pvOfFCFs = projectedFreeCashFlows.map((fcf, i) => {
      return discountToPresent(fcf, dcfInputs.wacc, i + 1);
    });
    const pvOfTerminalValue = discountToPresent(terminalValue, dcfInputs.wacc, 5);
    const enterpriseValue = pvOfFCFs.reduce((sum, pv) => sum + pv, 0) + pvOfTerminalValue;
  
    const pvOfTerminalValueExitMultiple = discountToPresent(terminalValueExitMultiple, dcfInputs.wacc, 5);
    const enterpriseValueExitMultiple = pvOfFCFs.reduce((sum, pv) => sum + pv, 0) + pvOfTerminalValueExitMultiple;
  
    const equityValue = enterpriseValue + dcfInputs.cashBalance - dcfInputs.debt;
    
    // Validate shareCount before division
    if (!historical.shareCount || historical.shareCount <= 0) {
      throw new Error('shareCount must be greater than 0 to calculate share price');
    }
    
    const sharePrice = equityValue / historical.shareCount;
    const perpPrice = sharePrice;

    const equityValueExitMultiple = enterpriseValueExitMultiple + dcfInputs.cashBalance - dcfInputs.debt;
    const exitMultiplePrice = equityValueExitMultiple / historical.shareCount;
  
    return {
      sharePrice,
      perpPrice,
      exitMultiplePrice,
      projectedRevenues,
      projectedEBIT,
      projectedFreeCashFlows,
      terminalValue,
      terminalValueExitMultiple,
      enterpriseValue,
      enterpriseValueExitMultiple,
      equityValue,
      equityValueExitMultiple
    };
  }
  
  function projectRevenues(baseRevenue, commercialGrowthRates, governmentGrowthRates) {
    const projectedRevenues = [];
    let commercialRevenue = baseRevenue * 0.5;
    let governmentRevenue = baseRevenue * 0.5;
    
    for (let i = 0; i < 5; i++) {
      commercialRevenue = commercialRevenue * (1 + commercialGrowthRates[i]);
      governmentRevenue = governmentRevenue * (1 + governmentGrowthRates[i]);
      projectedRevenues.push(commercialRevenue + governmentRevenue);
    }
    
    return projectedRevenues;
  }
  
  function calculateTerminalValuePerpetuity(finalYearFCF, perpGrowthRate, wacc) {
    // Validate inputs
    if (wacc <= perpGrowthRate) {
      throw new Error(`WACC (${wacc}) must be greater than perpetuity growth rate (${perpGrowthRate}) for the terminal value calculation to be valid.`);
    }
    
    const denominator = wacc - perpGrowthRate;
    if (denominator <= 0 || !isFinite(denominator)) {
      throw new Error(`Invalid denominator in terminal value calculation: WACC (${wacc}) - Growth Rate (${perpGrowthRate}) = ${denominator}`);
    }
    
    const terminalValue = (finalYearFCF * (1 + perpGrowthRate)) / denominator;
    
    if (!isFinite(terminalValue)) {
      throw new Error(`Invalid terminal value calculated: ${terminalValue}. Check your WACC and growth rate inputs.`);
    }
    
    return terminalValue;
  }
  
  function discountToPresent(cashFlow, discountRate, year) {
    if (discountRate <= -1) {
      throw new Error(`Discount rate (${discountRate}) must be greater than -1`);
    }
    const result = cashFlow / Math.pow(1 + discountRate, year);
    if (!isFinite(result)) {
      throw new Error(`Invalid present value calculated: ${result}`);
    }
    return result;
  }