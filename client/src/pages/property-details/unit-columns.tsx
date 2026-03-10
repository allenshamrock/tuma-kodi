import {
  Hash,
  DollarSign,
  Ruler,
  Star,
  Circle,
  User,
  Edit2,
  Trash2,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import type { Unit, ModalState } from "./types";

export const buildColumns = (
  setModal: (state: ModalState) => void,
): ColumnDef<Unit>[] => [
  {
    accessorKey: "apartment_number",
    header: () => (
      <span className="flex items-center gap-1.5">
        <Hash className="h-3.5 w-3.5" /> Unit
      </span>
    ),
    cell: ({ row }) => (
      <span className="font-semibold text-gray-900 dark:text-gray-100">
        {row.getValue("apartment_number")}
      </span>
    ),
  },
  {
    accessorKey: "apartment_type",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-gray-600 dark:text-gray-400">
        {row.getValue("apartment_type") ?? (
          <span className="text-gray-300 dark:text-gray-600">—</span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "rent_amount",
    header: () => (
      <span className="flex items-center gap-1.5">
        <DollarSign className="h-3.5 w-3.5" /> Rent
      </span>
    ),
    cell: ({ row }) => (
      <span className="font-medium text-gray-900 dark:text-gray-100">
        KES {Number(row.getValue("rent_amount")).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "size_sqft",
    header: () => (
      <span className="flex items-center gap-1.5">
        <Ruler className="h-3.5 w-3.5" /> Size
      </span>
    ),
    cell: ({ row }) => {
      const val = row.getValue("size_sqft");
      return val ? (
        <span className="text-gray-600 dark:text-gray-400">
          {val as number} sqft
        </span>
      ) : (
        <span className="text-gray-300 dark:text-gray-600">—</span>
      );
    },
  },
  {
    accessorKey: "features",
    header: () => (
      <span className="flex items-center gap-1.5">
        <Star className="h-3.5 w-3.5" /> Features
      </span>
    ),
    cell: ({ row }) => {
      const val = row.getValue<string>("features");
      return val ? (
        <span className="text-xs text-gray-500 dark:text-gray-400 max-w-[140px] truncate block">
          {val}
        </span>
      ) : (
        <span className="text-gray-300 dark:text-gray-600">—</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue<string>("status");
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            status === "occupied"
              ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
              : "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
          }`}
        >
          <Circle className="h-1.5 w-1.5 fill-current" />
          {status}
        </span>
      );
    },
  },
  {
    id: "tenant",
    header: () => (
      <span className="flex items-center gap-1.5">
        <User className="h-3.5 w-3.5" /> Tenant
      </span>
    ),
    cell: ({ row }) => {
      const tenant = row.original.tenant;
      return tenant ? (
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {tenant.first_name} {tenant.last_name}
          </p>
          <p className="text-xs text-gray-400">{tenant.email}</p>
        </div>
      ) : (
        <span className="text-xs text-gray-400 dark:text-gray-500 italic">
          No tenant
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
            setModal({ type: "edit", unit: row.original });
          }}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200 transition-colors"
          title="Edit unit"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setModal({ type: "delete", unit: row.original });
          }}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
          title="Delete unit"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    ),
  },
];
