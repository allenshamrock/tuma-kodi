import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Property, Unit } from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const usePropertyDetail = (id: string | undefined) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/properties/${id}/units`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load property");
      setProperty(data.property);
      setUnits(data.units ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (unit: Unit, onSuccess: () => void) => {
    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/apartments/${unit.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete unit");
      toast.success(`Unit ${unit.apartment_number} deleted`);
      onSuccess();
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const occupied = units.filter((u) => u.status === "occupied").length;
  const vacant = units.filter((u) => u.status === "vacant").length;

  return {
    property,
    units,
    loading,
    error,
    deleteLoading,
    occupied,
    vacant,
    fetchData,
    handleDelete,
  };
};
