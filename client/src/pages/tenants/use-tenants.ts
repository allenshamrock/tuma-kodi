import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Tenant } from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const useTenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      console.log("token",token)
      console.log("url", `${API_BASE}/tenants`);
      const res = await fetch(`${API_BASE}/tenants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch Tenants");
      const list: Tenant[] = data.tenants ?? data;
      setTenants(
        list.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tenant: Tenant, onSuccess: () => void) => {
    try {
      setDeleteLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/tenants/${tenant.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete tenant");
      toast.success(`"${tenant.name}" has been deleted`);
      onSuccess();
      fetchTenants();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  return { tenants, loading, error, deleteLoading, fetchTenants, handleDelete };
};
