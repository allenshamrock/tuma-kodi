export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  created_at: string;
  is_active: boolean;
}

export interface Tenant {
  id: number;
  name: string;
  phone: string;
  apartment_number?: string;
  property_name?: string;
  status: string;
}

export interface SmsResult {
  tenant_id: number;
  tenant_name?: string;
  phone: string;
  status: "sent" | "failed";
  error?: string;
}

export type SettingsTab = "profile" | "notifications";
