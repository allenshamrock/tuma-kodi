import { useEffect, useState } from "react";
import type {
  Payment,
  PaymentSummary,
  PropertyPaymentGroup,
  FilterState,
} from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const usePayments = (filters: FilterState) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [byProperty, setByProperty] = useState<PropertyPaymentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      // Building query string from filters
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.month_paid_for)
        params.set("month_paid_for", filters.month_paid_for);
      if (filters.property_id) params.set("property_id", filters.property_id);

      const [paymentsRes, summaryRes, byPropertyRes] = await Promise.all([
        fetch(`${API_BASE}/payments/?${params}`, { headers }),
        fetch(
          `${API_BASE}/payments/summary${filters.month_paid_for ? `?month_year=${filters.month_paid_for}` : ""}`,
          { headers },
        ),
        fetch(`${API_BASE}/payments/by-property`, { headers }),
      ]);

      const [paymentsData, summaryData, byPropertyData] = await Promise.all([
        paymentsRes.json(),
        summaryRes.json(),
        byPropertyRes.json(),
      ]);

      if (!paymentsRes.ok)
        throw new Error(paymentsData.error ?? "Failed to fetch payments");
      setPayments(paymentsData.payments ?? []);
      setSummary(summaryData);
      setByProperty(byPropertyData.properties ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [filters.status, filters.month_paid_for, filters.property_id]);

  return { payments, summary, byProperty, loading, error, refetch: fetchAll };
};
