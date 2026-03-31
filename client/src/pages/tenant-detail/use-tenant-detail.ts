import { useEffect, useState } from "react";
import type { Tenant, Payment, TenantSummary } from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useTenantDetail = (id: string | undefined) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<TenantSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/tenants/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load tenant");
      setTenant(data.tenant);
      setPayments(data.payments ?? []);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return { tenant, payments, summary, loading, error, fetchData };
};
