"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [tableData, setTableData] = useState(null);

  useEffect(() => {
    const fetchAndPostData = async () => {
      try {
        // Fetch all data from localStorage
        const historicalData = JSON.parse(
          localStorage.getItem("historicalData") || "{}"
        );
        const revenueProjections = JSON.parse(
          localStorage.getItem("reveuneProjections") || "{}"
        );
        const costProjections = JSON.parse(
          localStorage.getItem("costProjections") || "{}"
        );
        const freeCashFlowProjections = JSON.parse(
          localStorage.getItem("freeCashFlowProjections") || "{}"
        );
        const dcfInputs = JSON.parse(
          localStorage.getItem("dcfInputs") || "{}"
        );

        // Validate required fields before creating payload
        const shareCount = parseFloat(historicalData.shareCount);
        if (!shareCount || shareCount <= 0 || isNaN(shareCount)) {
          throw new Error("Share Count is required and must be greater than 0");
        }

        // Map local storage fields to API required fields
        const apiPayload = {
          // Historical Data mapping
          revenue2024: parseFloat(historicalData.revenue) || 0,
          cogs2024: parseFloat(historicalData.costOfGoodsSold) || 0,
          sgna2024: parseFloat(historicalData.SGNA) || 0,
          rnd2024: parseFloat(historicalData.RND) || 0,
          shareCount: shareCount,

          // Revenue Projections mapping
          commercialGrowthRates: Array.isArray(revenueProjections.commercialProjections)
            ? revenueProjections.commercialProjections.map(v => parseFloat(v) || 0)
            : [],
          governmentGrowthRates: Array.isArray(revenueProjections.governmentProjections)
            ? revenueProjections.governmentProjections.map(v => parseFloat(v) || 0)
            : [],

          // Cost Projections mapping
          grossMargins: Array.isArray(costProjections.grossMargin)
            ? costProjections.grossMargin.map(v => parseFloat(v) || 0)
            : [],
          rndRates: Array.isArray(costProjections.researchAndDevelopment)
            ? costProjections.researchAndDevelopment.map(v => parseFloat(v) || 0)
            : [],
          sgnaRates: Array.isArray(costProjections.sellingGeneralAndAdministrativeExpenses)
            ? costProjections.sellingGeneralAndAdministrativeExpenses.map(v => parseFloat(v) || 0)
            : [],
          taxRates: Array.isArray(costProjections.taxRate)
            ? costProjections.taxRate.map(v => parseFloat(v) || 0)
            : [],

          // Free Cash Flow Projections mapping
          daRates: Array.isArray(freeCashFlowProjections.depreciationAndAmortization)
            ? freeCashFlowProjections.depreciationAndAmortization.map(v => parseFloat(v) || 0)
            : [],
          capexRates: Array.isArray(freeCashFlowProjections.capitalExpenditures)
            ? freeCashFlowProjections.capitalExpenditures.map(v => parseFloat(v) || 0)
            : [],
          nwcRates: Array.isArray(freeCashFlowProjections.changesInNWC)
            ? freeCashFlowProjections.changesInNWC.map(v => parseFloat(v) || 0)
            : [],

          // DCF Inputs mapping
          wacc: parseFloat(dcfInputs.wacc) || 0,
          perpGrowthRate: parseFloat(dcfInputs.perpGrowthRate) || 0,
          exitMultiple: parseFloat(dcfInputs.exitMultiple) || 0,
          cashBalance: parseFloat(dcfInputs.cashBalance) || 0,
          debt: parseFloat(dcfInputs.debt) || 0,
        };

        // Post to API
        const response = await fetch("/api/dcf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiPayload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.details || `Failed to calculate DCF: ${response.status}`);
        }

        const data = await response.json();
        setResults(data);
        
        // Store table calculation data
        setTableData({
          wacc: parseFloat(dcfInputs.wacc) || 0,
          perpGrowthRate: parseFloat(dcfInputs.perpGrowthRate) || 0,
          exitMultiple: parseFloat(dcfInputs.exitMultiple) || 0,
          cashBalance: parseFloat(dcfInputs.cashBalance) || 0,
          debt: parseFloat(dcfInputs.debt) || 0,
          shareCount: parseFloat(historicalData.shareCount) || 0,
          taxRates: Array.isArray(costProjections.taxRate) 
            ? costProjections.taxRate.map(v => parseFloat(v) || 0) 
            : [],
          daRates: Array.isArray(freeCashFlowProjections.depreciationAndAmortization)
            ? freeCashFlowProjections.depreciationAndAmortization.map(v => parseFloat(v) || 0)
            : [],
          capexRates: Array.isArray(freeCashFlowProjections.capitalExpenditures)
            ? freeCashFlowProjections.capitalExpenditures.map(v => parseFloat(v) || 0)
            : [],
          nwcRates: Array.isArray(freeCashFlowProjections.changesInNWC)
            ? freeCashFlowProjections.changesInNWC.map(v => parseFloat(v) || 0)
            : [],
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching or posting data:", err);
        setError(err.message || "An error occurred");
        setLoading(false);
      }
    };

    fetchAndPostData();
  }, []);

  if (loading) {
    return (
      <main className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Calculating DCF results...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 min-h-screen flex items-center justify-center">
        <div className="card bg-base-200 w-full max-w-md">
          <div className="card-body">
            <h2 className="card-title text-error">Error</h2>
            <p>{error}</p>
            <div className="card-actions justify-end mt-4">
              <button
                onClick={() => router.push("/")}
                className="btn btn-primary"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!results) {
    return null;
  }

  return (
    <main className="p-6 min-h-screen">
      <div className="card bg-base-200 w-full max-w-6xl mx-auto">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">DCF Calculation Results</h2>
          
          {results.success && (
            <>
              <div className="space-y-4">
                <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                  <div className="stat">
                    <div className="stat-title">Perpetuity Price</div>
                    <div className="stat-value text-primary">
                      ${results.results?.perpPrice?.toFixed(2) || "N/A"}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Exit Multiple Price</div>
                    <div className="stat-value text-secondary">
                      ${results.results?.exitMultiplePrice?.toFixed(2) || "N/A"}
                    </div>
                  </div>
                </div>

                {results.fullCalculation && tableData && (() => {
                  // Calculate DCF table values
                  const calc = results.fullCalculation;
                  const years = [2025, 2026, 2027, 2028, 2029];
                  const { wacc, taxRates, daRates, capexRates, nwcRates } = tableData;
                  
                  // Calculate table rows
                  const ebitValues = calc.projectedEBIT || [];
                  const revenues = calc.projectedRevenues || [];
                  
                  const taxExpenses = ebitValues.map((ebit, i) => ebit * (taxRates[i] || 0));
                  const daValues = revenues.map((rev, i) => rev * (daRates[i] || 0));
                  const capexValues = revenues.map((rev, i) => rev * (capexRates[i] || 0));
                  const nwcValues = revenues.map((rev, i) => rev * (nwcRates[i] || 0));
                  const ufcfValues = calc.projectedFreeCashFlows || [];
                  
                  // Calculate discount factors
                  const discountFactors = years.map((_, i) => 1 / Math.pow(1 + wacc, i + 1));
                  
                  // Calculate present values
                  const pvValues = ufcfValues.map((fcf, i) => fcf * discountFactors[i]);
                  const sumOfPV = pvValues.reduce((sum, pv) => sum + pv, 0);
                  
                  const formatNumber = (num) => {
                    if (num === null || num === undefined || isNaN(num)) return "N/A";
                    return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                  };
                  
                  const formatCurrency = (num) => {
                    if (num === null || num === undefined || isNaN(num)) return "N/A";
                    return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                  };
                  
                  const formatDecimal = (num) => {
                    if (num === null || num === undefined || isNaN(num)) return "N/A";
                    return num.toFixed(2);
                  };
                  
                  return (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">Discounted Cash Flow</h3>
                      <div className="overflow-x-auto">
                        <table className="table w-full">
                          <thead>
                            <tr>
                              <th></th>
                              {years.map((year, i) => (
                                <th key={year}>
                                  <div>{year}P</div>
                                  <div className="text-xs font-normal">12/31/{year}</div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <th className="font-normal">EBIT</th>
                              {ebitValues.map((value, i) => (
                                <td key={i}>{formatNumber(value)}</td>
                              ))}
                            </tr>
                            <tr>
                              <th className="font-normal">Less: Tax Expense</th>
                              {taxExpenses.map((value, i) => (
                                <td key={i} className="text-red-600">({formatNumber(value)})</td>
                              ))}
                            </tr>
                            <tr>
                              <th className="font-normal">Add: Depreciation & Amortization</th>
                              {daValues.map((value, i) => (
                                <td key={i}>{formatNumber(value)}</td>
                              ))}
                            </tr>
                            <tr>
                              <th className="font-normal">Less: Capital Expenditures</th>
                              {capexValues.map((value, i) => (
                                <td key={i} className="text-red-600">({formatNumber(value)})</td>
                              ))}
                            </tr>
                            <tr>
                              <th className="font-normal">Less: Changes in NWC</th>
                              {nwcValues.map((value, i) => (
                                <td key={i} className="text-red-600">({formatNumber(value)})</td>
                              ))}
                            </tr>
                            <tr className="font-bold">
                              <th>Unlevered Free Cash Flow (UFCF)</th>
                              {ufcfValues.map((value, i) => (
                                <td key={i} className="font-bold">{formatNumber(value)}</td>
                              ))}
                            </tr>
                            <tr>
                              <th className="font-normal">Discount Factor</th>
                              {discountFactors.map((value, i) => (
                                <td key={i}>{formatDecimal(value)}</td>
                              ))}
                            </tr>
                            <tr>
                              <th className="font-normal">Present Value of UFCF</th>
                              {pvValues.map((value, i) => (
                                <td key={i}>{formatNumber(value)}</td>
                              ))}
                            </tr>
                            <tr className="font-bold">
                              <th>Sum of PV</th>
                              <td colSpan={5} className="font-bold">${formatCurrency(sumOfPV)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}

                {results.fullCalculation && tableData && (() => {
                  const calc = results.fullCalculation;
                  const { wacc, perpGrowthRate, exitMultiple, cashBalance, debt, shareCount } = tableData;
                  
                  // Calculate PV sum of UFCF (sum of present values of free cash flows)
                  const ufcfValues = calc.projectedFreeCashFlows || [];
                  const discountFactors = [2025, 2026, 2027, 2028, 2029].map((_, i) => 1 / Math.pow(1 + wacc, i + 1));
                  const pvOfUFCFs = ufcfValues.map((fcf, i) => fcf * discountFactors[i]);
                  const pvSumOfUFCF = pvOfUFCFs.reduce((sum, pv) => sum + pv, 0);
                  
                  // Calculate PV of Terminal Value for perpetuity method
                  const pvOfTerminalValuePerp = calc.terminalValue / Math.pow(1 + wacc, 5);
                  
                  // Calculate PV of Terminal Value for exit multiple method
                  const pvOfTerminalValueExit = calc.terminalValueExitMultiple / Math.pow(1 + wacc, 5);
                  
                  const formatNumber = (num) => {
                    if (num === null || num === undefined || isNaN(num)) return "N/A";
                    return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                  };
                  
                  const formatCurrency = (num) => {
                    if (num === null || num === undefined || isNaN(num)) return "N/A";
                    return `$ ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                  };
                  
                  const formatPercent = (num) => {
                    if (num === null || num === undefined || isNaN(num)) return "N/A";
                    return `${(num * 100).toFixed(2)}%`;
                  };
                  
                  return (
                    <div className="mt-8 space-y-6">
                      {/* Perpetuity Growth Method Table */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Perpetuity Growth Method</h3>
                        <div className="overflow-x-auto">
                          <table className="table w-full">
                            <tbody>
                              <tr>
                                <th className="font-normal">Perpetuity Growth Rate</th>
                                <td className="text-right">{formatPercent(perpGrowthRate)}</td>
                              </tr>
                              <tr>
                                <th className="font-normal">PV sum of UFCF</th>
                                <td className="text-right">{formatNumber(pvSumOfUFCF)}</td>
                              </tr>
                              <tr>
                                <th className="font-normal">Terminal Value</th>
                                <td className="text-right">{formatNumber(calc.terminalValue)}</td>
                              </tr>
                              <tr>
                                <th className="font-normal">PV of Terminal Value</th>
                                <td className="text-right">{formatNumber(pvOfTerminalValuePerp)}</td>
                              </tr>
                              <tr className="border-t-2 border-base-300">
                                <th className="font-bold">Enterprise Value</th>
                                <td className="text-right font-bold">{formatNumber(calc.enterpriseValue)}</td>
                              </tr>
                              <tr>
                                <th className="font-normal">Add: Cash</th>
                                <td className="text-right">{formatNumber(cashBalance)}</td>
                              </tr>
                              <tr>
                                <th className="font-normal">Less: Debt</th>
                                <td className="text-right">({formatNumber(debt)})</td>
                              </tr>
                              <tr>
                                <th className="font-normal">Less: Minority Interest</th>
                                <td className="text-right">(0)</td>
                              </tr>
                              <tr className="border-t-2 border-base-300">
                                <th className="font-bold">Equity Value</th>
                                <td className="text-right font-bold">{formatNumber(calc.equityValue)}</td>
                              </tr>
                              <tr>
                                <th className="font-normal">Shares outstanding</th>
                                <td className="text-right">{formatNumber(shareCount)}</td>
                              </tr>
                              <tr className="border-t-2 border-base-300">
                                <th className="font-bold">Implied Share Price</th>
                                <td className="text-right font-bold">{formatCurrency(calc.perpPrice)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Exit Multiple Method Table */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Exit Multiple Method</h3>
                        <div className="overflow-x-auto">
                          <table className="table w-full">
                            <tbody>
                              <tr>
                                <th className="font-normal">Terminal EV/EBITDA Multiple</th>
                                <td className="text-right">{exitMultiple}X</td>
                              </tr>
                              <tr>
                                <th className="font-normal">PV sum of UFCF</th>
                                <td className="text-right">{formatNumber(pvSumOfUFCF)}</td>
                              </tr>
                              <tr>
                                <th className="font-normal">PV of Terminal Value</th>
                                <td className="text-right">{formatNumber(pvOfTerminalValueExit)}</td>
                              </tr>
                              <tr className="border-t-2 border-base-300">
                                <th className="font-bold">Enterprise Value</th>
                                <td className="text-right font-bold">{formatNumber(calc.enterpriseValueExitMultiple)}</td>
                              </tr>
                              <tr>
                                <th className="font-normal">Add: Cash</th>
                                <td className="text-right">{formatNumber(cashBalance)}</td>
                              </tr>
                              <tr>
                                <th className="font-normal">Less: Debt</th>
                                <td className="text-right">({formatNumber(debt)})</td>
                              </tr>
                              <tr>
                                <th className="font-normal">Less: Minority Interest</th>
                                <td className="text-right">(0)</td>
                              </tr>
                              <tr className="border-t-2 border-base-300">
                                <th className="font-bold">Equity Value</th>
                                <td className="text-right font-bold">{formatNumber(calc.equityValueExitMultiple)}</td>
                              </tr>
                              <tr>
                                <th className="font-normal">Shares outstanding</th>
                                <td className="text-right">{formatNumber(shareCount)}</td>
                              </tr>
                              <tr className="border-t-2 border-base-300">
                                <th className="font-bold">Implied Share Price</th>
                                <td className="text-right font-bold">{formatCurrency(calc.exitMultiplePrice)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {results.id && (
                  <div className="alert alert-info mt-4">
                    <span>DCF saved with ID: {results.id}</span>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="card-actions justify-end mt-6">
            <button
              onClick={() => router.push("/")}
              className="btn btn-primary"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

