import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Tenant, SmsResult } from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const useNotifications = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<SmsResult[] | null>(null);

  const fetchTenants = async () => {
    try {
      setLoadingTenants(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/tenants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load tenants");
      // Only active tenants
      setTenants(
        (data.tenants ?? []).filter((t: Tenant) => t.status === "active"),
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load tenants",
      );
    } finally {
      setLoadingTenants(false);
    }
  };

  const sendPaymentReminder = async (tenantIds: number[], dueDate: string) => {
    setSending(true);
    setResults(null);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_BASE}/notifications/sms/payment-reminder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tenant_ids: tenantIds, due_date: dueDate }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.error ?? data.message ?? "Failed to send reminders",
        );
      setResults(data.results ?? []);
      const sent = (data.results ?? []).filter(
        (r: SmsResult) => r.status === "sent",
      ).length;
      toast.success(`Sent ${sent} of ${tenantIds.length} reminders`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  const sendOverdueNotices = async (tenantIds: number[]) => {
    setSending(true);
    setResults(null);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/notifications/sms/overdue-notice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tenant_ids: tenantIds }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error ?? data.message ?? "Failed to send notices");
      setResults(data.results ?? []);
      const sent = (data.results ?? []).filter(
        (r: SmsResult) => r.status === "sent",
      ).length;
      toast.success(`Sent ${sent} overdue notice${sent !== 1 ? "s" : ""}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  const sendCustomSms = async (tenantIds: number[], message: string) => {
    setSending(true);
    setResults(null);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/notifications/send/sms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tenant_ids: tenantIds, message }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error ?? data.message ?? "Failed to send SMS");
      setResults(data.results ?? []);
      const sent = (data.results ?? []).filter(
        (r: SmsResult) => r.status === "sent",
      ).length;
      toast.success(`Sent to ${sent} tenant${sent !== 1 ? "s" : ""}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  return {
    tenants,
    loadingTenants,
    sending,
    results,
    setResults,
    sendPaymentReminder,
    sendOverdueNotices,
    sendCustomSms,
  };
};
