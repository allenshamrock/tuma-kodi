import { Circle } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
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
  partial:
    "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  failed: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

export const paymentColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: "tenant_name",
    header: "Tenant",
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {row.getValue("tenant_name")}
        </p>
        <p className="text-xs text-gray-400">{row.original.phone_number}</p>
      </div>
    ),
  },
  {
    id: "unit",
    header: "Unit",
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {row.original.apartment_number}
        </p>
        {row.original.property_name && (
          <p className="text-xs text-gray-400">{row.original.property_name}</p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-900 dark:text-gray-100">
        KES {parseFloat(row.getValue("amount")).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "month_paid_for",
    header: "Month",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {row.getValue("month_paid_for") ?? (
          <span className="text-gray-300 dark:text-gray-600">—</span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "payment_date",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {formatDate(row.getValue("payment_date"))}
      </span>
    ),
  },
  {
    accessorKey: "mpesa_receipt_number",
    header: "Receipt",
    cell: ({ row }) => {
      const receipt = row.getValue<string>("mpesa_receipt_number");
      return receipt ? (
        <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
          {receipt}
        </span>
      ) : (
        <span className="text-gray-300 dark:text-gray-600">—</span>
      );
    },
  },
  {
    accessorKey: "payment_method",
    header: "Method",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
        {row.getValue("payment_method")}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue<string>("status");
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status] ?? statusStyles.pending}`}
        >
          <Circle className="h-1.5 w-1.5 fill-current" />
          {status}
        </span>
      );
    },
  },
];
