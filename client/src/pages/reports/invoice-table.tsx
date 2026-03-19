import { FileText, Circle } from "lucide-react";
import type { InvoiceReport } from "./types";

const statusStyles: Record<string, string> = {
  paid: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  pending:
    "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400",
  overdue: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

const formatDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export const InvoiceTable = ({ report }: { report: InvoiceReport }) => {
  const {
    invoices,
    paid_count,
    pending_count,
    overdue_count,
    total_billed,
    total_collected,
    total_outstanding,
  } = report;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
      {/* Header + stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Invoice Report
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="text-green-600 dark:text-green-400 font-medium">
            {paid_count} paid
          </span>
          <span className="text-primary-600 dark:text-primary-400 font-medium">
            {pending_count} pending
          </span>
          <span className="text-red-600 dark:text-red-400 font-medium">
            {overdue_count} overdue
          </span>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-white/10 border-b border-gray-100 dark:border-white/10">
        {[
          {
            label: "Total Billed",
            value: total_billed,
            color: "text-gray-900 dark:text-gray-100",
          },
          {
            label: "Collected",
            value: total_collected,
            color: "text-green-600 dark:text-green-400",
          },
          {
            label: "Outstanding",
            value: total_outstanding,
            color:
              total_outstanding > 0
                ? "text-red-600 dark:text-red-400"
                : "text-gray-900 dark:text-gray-100",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="px-5 py-3">
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className={`text-sm font-semibold ${color}`}>
              KES {value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-muted-foreground">
            No invoices for this period
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                {[
                  "Invoice #",
                  "Tenant",
                  "Unit",
                  "Month",
                  "Total",
                  "Due Date",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                      {inv.invoice_number}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {inv.tenant_name}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700 dark:text-gray-300">
                      {inv.apartment_number}
                    </p>
                    <p className="text-xs text-gray-400">{inv.property_name}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {inv.month_year}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    KES {inv.total_amount.toLocaleString()}
                    {(inv.late_fee > 0 || inv.other_charges > 0) && (
                      <p className="text-xs text-gray-400 font-normal">
                        +{inv.late_fee > 0 ? ` late fee: ${inv.late_fee}` : ""}
                        {inv.other_charges > 0
                          ? ` charges: ${inv.other_charges}`
                          : ""}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(inv.due_date)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[inv.status] ?? statusStyles.pending}`}
                    >
                      <Circle className="h-1.5 w-1.5 fill-current" />
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
