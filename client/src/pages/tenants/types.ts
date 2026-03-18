export interface Tenant {
  apartment_id: number;
  lease_start_date: number;
  lease_end_date: number;
  monthly_rent: string;
  name: string;
  email: string;
  phone: number;
  id: number;
  apartment_number?: string;
  property_name?: string;
  security_deposit_paid: string;
  emergency_contact?: string;
  status: "active" | "inactive" | "evicted";
  created_at: string;
  id_number?: string;
}

export type ModalState =
  | { type: "add" }
  | { type: "edit"; tenant: Tenant }
  | { type: "delete"; tenant: Tenant }
  | null;
