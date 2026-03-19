import { CreditCard, Circle } from "lucide-react";
import type { Payment } from "./types";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const statusStyles: Record<string, string> = {
  completed:
    "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  pending:
    "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400",
  failed: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

interface PaymentHistoryProps {
  payments: Payment[];
}

export const PaymentHistory = ({ payments }: PaymentHistoryProps) => (
  <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-white/10">
      <CreditCard className="h-4 w-4 text-primary" />
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Payment History
      </h3>
      <span className="ml-auto text-xs text-gray-400">
        {payments.length} record{payments.length !== 1 ? "s" : ""}
      </span>
    </div>

    {payments.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CreditCard className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm text-muted-foreground">
          No payments recorded yet
        </p>
      </div>
    ) : (
      <div className="divide-y divide-gray-100 dark:divide-white/5">
        {payments.map((payment) => (
          <div key={payment.id} className="flex items-center gap-4 px-5 py-3.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  KES {parseFloat(payment.amount).toLocaleString()}
                </p>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[payment.status] ?? statusStyles.pending}`}
                >
                  <Circle className="h-1.5 w-1.5 fill-current" />
                  {payment.status}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-xs text-gray-400">
                  {formatDate(payment.payment_date)}
                </p>
                {payment.month_paid_for && (
                  <p className="text-xs text-gray-400">
                    · For {payment.month_paid_for}
                  </p>
                )}
                {payment.mpesa_receipt_number && (
                  <p className="text-xs text-gray-400 font-mono">
                    · {payment.mpesa_receipt_number}
                  </p>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-400 capitalize shrink-0">
              {payment.payment_method}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);
