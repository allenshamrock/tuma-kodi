export interface Property {
  id: number;
  name: string;
  address: string;
  city: string;
  total_units: number;
  status: string;
}

export interface Tenant {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export interface Unit {
  id: number;
  apartment_number: string;
  apartment_type?: string;
  rent_amount: number;
  deposit_amount: number;
  size_sqft?: number;
  features?: string;
  status: "vacant" | "occupied";
  tenant?: Tenant | null;
}

export type ModalState =
  | { type: "add" }
  | { type: "edit"; unit: Unit }
  | { type: "delete"; unit: Unit }
  | null;
