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
  status: "completed" | "pending" | "partial" | "failed";
  phone_number: string;
  property_name?: string;
  property_address?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentSummary {
  total_properties: number;
  total_apartments: number;
  total_payments: number;
  completed_payments: number;
  pending_payments: number;
  partial_payments: number;
  total_revenue: string;
  expected_revenue: string;
  collection_rate: string;
  month_year: string;
}

export interface PropertyPaymentGroup {
  property_id: number;
  property_name: string;
  property_address: string;
  total_units: number;
  total_payments: number;
  completed_payments: number;
  total_revenue: string;
}

export type FilterState = {
  status: string;
  month_paid_for: string;
  property_id: string;
};
