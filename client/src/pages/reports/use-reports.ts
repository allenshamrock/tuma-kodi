import { useEffect, useState } from "react";
import type {
  ReportOverview,
  RevenueTrendPoint,
  InvoiceReport,
  PropertyReportRow,
} from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useReports = (monthYear: string) => {
  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [trend, setTrend] = useState<RevenueTrendPoint[]>([]);
  const [invoiceReport, setInvoiceReport] = useState<InvoiceReport | null>(
    null,
  );
  const [byProperty, setByProperty] = useState<PropertyReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };
      const month = monthYear ? `?month_year=${monthYear}` : "";

      const [ovRes, trendRes, invRes, propRes] = await Promise.all([
        fetch(`${API_BASE}/reports/overview`, { headers }),
        fetch(`${API_BASE}/reports/revenue-trend`, { headers }),
        fetch(`${API_BASE}/reports/invoices${month}`, { headers }),
        fetch(`${API_BASE}/reports/by-property${month}`, { headers }),
      ]);

      const [ovData, trendData, invData, propData] = await Promise.all([
        ovRes.json(),
        trendRes.json(),
        invRes.json(),
        propRes.json(),
      ]);

      if (!ovRes.ok) throw new Error(ovData.error ?? "Failed to load reports");

      setOverview(ovData);
      setTrend(trendData.trend ?? []);
      setInvoiceReport(invData);
      setByProperty(propData.properties ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [monthYear]);

  return {
    overview,
    trend,
    invoiceReport,
    byProperty,
    loading,
    error,
    refetch: fetchAll,
  };
};
