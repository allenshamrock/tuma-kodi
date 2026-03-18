import {
  User,
  Building2,
  Phone,
  Calendar,
  Circle,
  Edit2,
  Trash2,
} from "lucide-react";

import { type ColumnDef } from "@tanstack/react-table";
import type { Tenant, ModalState } from "./types";

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const statusStyles: Record<string, string> = {
  active: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  inactive: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400",
  evicted: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

export const buildColumns = (
  setModal: (state: ModalState) => void,
): ColumnDef<Tenant>[] => [
  {
    accessorKey: "name",
    header: () => (
      <span className="flex items-center gap-1.5">
        <User className="h-3.5 w-3.5" /> Tenant
      </span>
    ),
    cell: ({ row }) => {
      const t = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {t.name}
            </p>
            <p className="text-xs text-gray-400">{t.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: () => (
      <span className="flex items-center gap-1.5">
        <Phone className="h-3.5 w-3.5" /> Phone
      </span>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {row.getValue("phone")}
      </span>
    ),
  },
  {
    id: "unit",
    header: () => (
      <span className="flex items-center gap-1.5">
        <Building2 className="h-3.5 w-3.5" /> Unit
      </span>
    ),
    cell: ({ row }) => {
      const t = row.original;
      return t.apartment_number ? (
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t.apartment_number}
          </p>
          {t.property_name && (
            <p className="text-xs text-gray-400">{t.property_name}</p>
          )}
        </div>
      ) : (
        <span className="text-gray-300 dark:text-gray-600">—</span>
      );
    },
  },
  {
    accessorKey: "monthly_rent",
    header: "Rent",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900 dark:text-gray-100">
        KES {Number(row.getValue("monthly_rent")).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "lease_start_date",
    header: () => (
      <span className="flex items-center gap-1.5">
        <Calendar className="h-3.5 w-3.5" /> Lease Start
      </span>
    ),
    cell: ({ row }) => (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {formatDate(row.getValue("lease_start_date"))}
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
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status] ?? statusStyles.inactive}`}
        >
          <Circle className="h-1.5 w-1.5 fill-current" />
          {status}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setModal({ type: "edit", tenant: row.original });
          }}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200 transition-colors"
          title="Edit tenant"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setModal({ type: "delete", tenant: row.original });
          }}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
          title="Remove tenant"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    ),
  },
];
