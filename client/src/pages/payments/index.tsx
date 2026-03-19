import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";

import { paymentColumns } from "./payment-columns";
import { PaymentSummaryCards } from "./payment-summary-cards";
import { PropertyBreakdown } from "./property-breakdown";
import { PaymentFilters } from "./payment-filters";
import type { FilterState } from "./types";
import { usePayments } from "./use-payment";
import { PaymentsSkeleton } from "./payment-skeleton";
import { PaymentsEmptyState } from "./payment-empty-state";

const Payments = () => {
  const [filters, setFilters] = useState<FilterState>({
    status: "",
    month_paid_for: "",
    property_id: "",
  });

  const { payments, summary, byProperty, loading, error } =
    usePayments(filters);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Payments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading
              ? "Loading..."
              : `${payments.length} payment${payments.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <PaymentsSkeleton />
      ) : (
        <>
          {summary && <PaymentSummaryCards summary={summary} />}

          {byProperty.length > 0 && (
            <PropertyBreakdown properties={byProperty} />
          )}

          <PaymentFilters
            filters={filters}
            setFilters={setFilters}
            properties={byProperty}
            totalCount={payments.length}
          />

          {payments.length === 0 ? (
            <PaymentsEmptyState />
          ) : (
            <DataTable columns={paymentColumns} data={payments} />
          )}
        </>
      )}
    </div>
  );
};

export default Payments;
