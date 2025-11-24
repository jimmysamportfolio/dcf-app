"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function ModelDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    if (id) {
      fetchModel();
    }
  }, [id]);

  const fetchModel = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dcf/${id}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || `Failed to fetch model: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.data) {
        throw new Error("Invalid response from server");
      }
      setModel(data.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching model:", err);
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this model?")) {
      return;
    }

    try {
      const response = await fetch(`/api/dcf/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || `Failed to delete model: ${response.status}`);
      }

      router.push("/models");
    } catch (err) {
      console.error("Error deleting model:", err);
      alert("Failed to delete model: " + err.message);
    }
  };

  const formatCurrency = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "N/A";
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "N/A";
    return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const formatPercent = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "N/A";
    return `${(num * 100).toFixed(2)}%`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <main className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Loading model...</p>
        </div>
      </main>
    );
  }

  if (error || !model) {
    return (
      <main className="p-6 min-h-screen flex items-center justify-center">
        <div className="card bg-base-200 w-full max-w-md">
          <div className="card-body">
            <h2 className="card-title text-error">Error</h2>
            <p>{error || "Model not found"}</p>
            <div className="card-actions justify-end mt-4">
              <Link href="/models" className="btn btn-primary">
                Back to Models
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Parse JSON arrays
  const projectedRevenues = Array.isArray(model.projectedRevenues) 
    ? model.projectedRevenues 
    : JSON.parse(model.projectedRevenues || "[]");
  const projectedEBIT = Array.isArray(model.projectedEBIT)
    ? model.projectedEBIT
    : JSON.parse(model.projectedEBIT || "[]");
  const projectedFreeCashFlows = Array.isArray(model.projectedFreeCashFlows)
    ? model.projectedFreeCashFlows
    : JSON.parse(model.projectedFreeCashFlows || "[]");

  const years = [2025, 2026, 2027, 2028, 2029];
  const wacc = model.wacc || 0;
  const discountFactors = years.map((_, i) => 1 / Math.pow(1 + wacc, i + 1));
  const pvValues = projectedFreeCashFlows.map((fcf, i) => fcf * discountFactors[i]);
  const sumOfPV = pvValues.reduce((sum, pv) => sum + pv, 0);

  return (
    <main className="p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/models" className="btn btn-ghost btn-sm mb-2">
              ← Back to Models
            </Link>
            <h1 className="text-3xl font-bold">DCF Model Details</h1>
            <p className="text-sm text-gray-600 mt-1">
              Created: {formatDate(model.createdAt)}
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="btn btn-error"
          >
            Delete Model
          </button>
        </div>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
            <div className="stat">
              <div className="stat-title">Perpetuity Price</div>
              <div className="stat-value text-primary">
                {formatCurrency(model.perpPrice)}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Exit Multiple Price</div>
              <div className="stat-value text-secondary">
                {formatCurrency(model.exitMultiplePrice)}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Enterprise Value (Perp)</div>
              <div className="stat-value">
                {formatCurrency(model.enterpriseValue)}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Enterprise Value (Exit)</div>
              <div className="stat-value">
                {formatCurrency(model.enterpriseValueExitMultiple)}
              </div>
            </div>
          </div>

          {/* DCF Table */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Discounted Cash Flow</h2>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th></th>
                      {years.map((year) => (
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
                      {projectedEBIT.map((value, i) => (
                        <td key={i}>{formatNumber(value)}</td>
                      ))}
                    </tr>
                    <tr className="font-bold">
                      <th>Unlevered Free Cash Flow (UFCF)</th>
                      {projectedFreeCashFlows.map((value, i) => (
                        <td key={i} className="font-bold">{formatNumber(value)}</td>
                      ))}
                    </tr>
                    <tr>
                      <th className="font-normal">Discount Factor</th>
                      {discountFactors.map((value, i) => (
                        <td key={i}>{value.toFixed(2)}</td>
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
                      <td colSpan={5} className="font-bold">
                        ${formatNumber(sumOfPV)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Valuation Summary Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Perpetuity Growth Method */}
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title">Perpetuity Growth Method</h3>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <tbody>
                      <tr>
                        <th className="font-normal">Perpetuity Growth Rate</th>
                        <td className="text-right">{formatPercent(model.perpGrowthRate)}</td>
                      </tr>
                      <tr>
                        <th className="font-normal">PV sum of UFCF</th>
                        <td className="text-right">{formatNumber(sumOfPV)}</td>
                      </tr>
                      <tr>
                        <th className="font-normal">Terminal Value</th>
                        <td className="text-right">{formatNumber(model.terminalValue)}</td>
                      </tr>
                      <tr>
                        <th className="font-normal">PV of Terminal Value</th>
                        <td className="text-right">
                          {formatNumber(model.terminalValue / Math.pow(1 + wacc, 5))}
                        </td>
                      </tr>
                      <tr className="border-t-2 border-base-300">
                        <th className="font-bold">Enterprise Value</th>
                        <td className="text-right font-bold">{formatNumber(model.enterpriseValue)}</td>
                      </tr>
                      <tr>
                        <th className="font-normal">Add: Cash</th>
                        <td className="text-right">{formatNumber(model.cashBalance)}</td>
                      </tr>
                      <tr>
                        <th className="font-normal">Less: Debt</th>
                        <td className="text-right">({formatNumber(model.debt)})</td>
                      </tr>
                      <tr className="border-t-2 border-base-300">
                        <th className="font-bold">Equity Value</th>
                        <td className="text-right font-bold">{formatNumber(model.equityValue)}</td>
                      </tr>
                      <tr>
                        <th className="font-normal">Shares outstanding</th>
                        <td className="text-right">{formatNumber(model.shareCount)}</td>
                      </tr>
                      <tr className="border-t-2 border-base-300">
                        <th className="font-bold">Implied Share Price</th>
                        <td className="text-right font-bold">{formatCurrency(model.perpPrice)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Exit Multiple Method */}
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title">Exit Multiple Method</h3>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <tbody>
                      <tr>
                        <th className="font-normal">Terminal EV/EBITDA Multiple</th>
                        <td className="text-right">{model.exitMultiple}X</td>
                      </tr>
                      <tr>
                        <th className="font-normal">PV sum of UFCF</th>
                        <td className="text-right">{formatNumber(sumOfPV)}</td>
                      </tr>
                      <tr>
                        <th className="font-normal">PV of Terminal Value</th>
                        <td className="text-right">
                          {formatNumber(model.terminalValueExitMultiple / Math.pow(1 + wacc, 5))}
                        </td>
                      </tr>
                      <tr className="border-t-2 border-base-300">
                        <th className="font-bold">Enterprise Value</th>
                        <td className="text-right font-bold">
                          {formatNumber(model.enterpriseValueExitMultiple)}
                        </td>
                      </tr>
                      <tr>
                        <th className="font-normal">Add: Cash</th>
                        <td className="text-right">{formatNumber(model.cashBalance)}</td>
                      </tr>
                      <tr>
                        <th className="font-normal">Less: Debt</th>
                        <td className="text-right">({formatNumber(model.debt)})</td>
                      </tr>
                      <tr className="border-t-2 border-base-300">
                        <th className="font-bold">Equity Value</th>
                        <td className="text-right font-bold">
                          {formatNumber(model.equityValueExitMultiple)}
                        </td>
                      </tr>
                      <tr>
                        <th className="font-normal">Shares outstanding</th>
                        <td className="text-right">{formatNumber(model.shareCount)}</td>
                      </tr>
                      <tr className="border-t-2 border-base-300">
                        <th className="font-bold">Implied Share Price</th>
                        <td className="text-right font-bold">{formatCurrency(model.exitMultiplePrice)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

