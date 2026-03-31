import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Property } from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      
      const res = await fetch(`${API_BASE}/properties`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch properties");
      const list: Property[] = data.properties ?? data;
      setProperties(
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

  const handleDelete = async (property: Property, onSuccess: () => void) => {
    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/properties/${property.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete property");
      toast.success(`"${property.name}" deleted`);
      onSuccess();
      fetchProperties();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return {
    properties,
    loading,
    error,
    deleteLoading,
    fetchProperties,
    handleDelete,
  };
};
