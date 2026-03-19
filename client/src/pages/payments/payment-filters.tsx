import { Search, X } from "lucide-react";
import type { FilterState, PropertyPaymentGroup } from "./types";

interface PaymentFiltersProps {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  properties: PropertyPaymentGroup[];
  totalCount: number;
}

const STATUSES = ["", "completed", "pending", "partial", "failed"];

// Generate last 12 months options
const getMonthOptions = () => {
  const options = [{ value: "", label: "All months" }];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-KE", {
      month: "long",
      year: "numeric",
    });
    options.push({ value, label });
  }
  return options;
};

export const PaymentFilters = ({
  filters,
  setFilters,
  properties,
  totalCount,
}: PaymentFiltersProps) => {
  const hasActiveFilters =
    filters.status || filters.month_paid_for || filters.property_id;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
      {/* Status filter */}
      <select
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary transition-all"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All statuses"}
          </option>
        ))}
      </select>

      {/* Month filter */}
      <select
        value={filters.month_paid_for}
        onChange={(e) =>
          setFilters({ ...filters, month_paid_for: e.target.value })
        }
        className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary transition-all"
      >
        {getMonthOptions().map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {/* Property filter */}
      <select
        value={filters.property_id}
        onChange={(e) =>
          setFilters({ ...filters, property_id: e.target.value })
        }
        className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary transition-all"
      >
        <option value="">All properties</option>
        {properties.map((p) => (
          <option key={p.property_id} value={p.property_id}>
            {p.property_name}
          </option>
        ))}
      </select>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={() =>
            setFilters({ status: "", month_paid_for: "", property_id: "" })
          }
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="h-3.5 w-3.5" /> Clear
        </button>
      )}

      <span className="ml-auto text-xs text-gray-400">
        {totalCount} record{totalCount !== 1 ? "s" : ""}
      </span>
    </div>
  );
};
