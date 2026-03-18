export interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string;
  apartment_id: number;
  apartment_number?: string;
  property_name?: string;
  lease_start_date: string;
  lease_end_date?: string | null;
  monthly_rent: string;
  security_deposit_paid: string;
  emergency_contact?: string;
  id_number?: string;
  status: "active" | "inactive" | "evicted";
  created_at: string;
}

export interface Payment {
  id: number;
  tenant_id: number;
  apartment_id: number;
  payment_date: string;
  tenant_name: string;
  apartment_number: string;
  amount: string;
  mpesa_receipt_number?: string;
  payment_method: string;
  month_paid_for?: string;
  status: string;
  phone_number: string;
}

export interface TenantSummary {
  total_paid: string;
  total_expected: string;
  outstanding: string;
  months_active: number;
  days_until_expiry: number | null;
  lease_expiring_soon: boolean;
}
