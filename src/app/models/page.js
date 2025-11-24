"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ModelsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [models, setModels] = useState([]);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dcf?limit=100");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || `Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      setModels(data.data || []);
      setPagination(data.pagination);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching models:", err);
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
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

      // Refresh the list
      fetchModels();
    } catch (err) {
      console.error("Error deleting model:", err);
      alert("Failed to delete model: " + err.message);
    }
  };

  const formatCurrency = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "N/A";
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
          <p className="mt-4">Loading models...</p>
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

  return (
    <main className="p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Saved DCF Models</h1>
          <Link href="/create" className="btn btn-primary">
            Create New Model
          </Link>
        </div>

        {models.length === 0 ? (
          <div className="card bg-base-200">
            <div className="card-body text-center">
              <h2 className="card-title justify-center">No models found</h2>
              <p>Create your first DCF model to get started.</p>
              <div className="card-actions justify-center mt-4">
                <Link href="/create" className="btn btn-primary">
                  Create Model
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {pagination && (
              <div className="text-sm text-gray-600 mb-4">
                Showing {models.length} of {pagination.total} models
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Created</th>
                    <th>Perpetuity Price</th>
                    <th>Exit Multiple Price</th>
                    <th>Enterprise Value (Perp)</th>
                    <th>Enterprise Value (Exit)</th>
                    <th>Equity Value (Perp)</th>
                    <th>Equity Value (Exit)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((model) => (
                    <tr key={model.id}>
                      <td>{formatDate(model.createdAt)}</td>
                      <td className="font-semibold">{formatCurrency(model.perpPrice)}</td>
                      <td className="font-semibold">{formatCurrency(model.exitMultiplePrice)}</td>
                      <td>{formatCurrency(model.enterpriseValue)}</td>
                      <td>{formatCurrency(model.enterpriseValueExitMultiple)}</td>
                      <td>{formatCurrency(model.equityValue)}</td>
                      <td>{formatCurrency(model.equityValueExitMultiple)}</td>
                      <td>
                        <div className="flex gap-2">
                          <Link
                            href={`/models/${model.id}`}
                            className="btn btn-sm btn-primary"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete(model.id)}
                            className="btn btn-sm btn-error"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

