export interface Property {
  id: number;
  name: string;
  address: string;
  city: string;
  total_units: number;
  status: "active" | "inactive";
  created_at: string;
}

export type ModalState =
  | { type: "add" }
  | { type: "edit"; property: Property }
  | { type: "delete"; property: Property }
  | null;
