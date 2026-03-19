import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load profile");
      setProfile(data.user);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load profile",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (
    payload: Partial<UserProfile> & {
      current_password?: string;
      new_password?: string;
    },
  ) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update profile");
      setProfile(data.user);
      toast.success("Profile updated successfully");
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, saving, updateProfile, refetch: fetchProfile };
};
