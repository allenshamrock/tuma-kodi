export interface ReportOverview {
  total_properties: number;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  occupancy_rate: number;
  active_tenants: number;
  current_month_revenue: string;
  total_revenue: string;
  outstanding_amount: string;
  overdue_amount: string;
  overdue_count: number;
  current_month: string;
}

export interface RevenueTrendPoint {
  month: string;
  label: string;
  revenue: number;
  expected: number;
  payment_count: number;
}

export interface InvoiceRow {
  id: number;
  invoice_number: string;
  tenant_name: string;
  apartment_number: string;
  property_name: string;
  month_year: string;
  rent_amount: number;
  late_fee: number;
  other_charges: number;
  total_amount: number;
  due_date: string | null;
  status: "paid" | "pending" | "overdue";
  payment_id: number | null;
  created_at: string;
}

export interface InvoiceReport {
  invoices: InvoiceRow[];
  total_count: number;
  paid_count: number;
  pending_count: number;
  overdue_count: number;
  total_billed: number;
  total_collected: number;
  total_outstanding: number;
}

export interface PropertyReportRow {
  property_id: number;
  property_name: string;
  city: string;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  occupancy_rate: number;
  revenue: number;
  expected: number;
  collection_rate: number;
  payment_count: number;
}
