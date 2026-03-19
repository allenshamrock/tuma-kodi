import { CreditCard } from "lucide-react";

export const PaymentsEmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="p-5 rounded-full bg-primary/10 mb-4">
      <CreditCard className="h-8 w-8 text-primary" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
      No payments yet
    </h3>
    <p className="text-sm text-muted-foreground max-w-xs">
      Payments will appear here once tenants pay via M-Pesa Paybill.
    </p>
  </div>
);
