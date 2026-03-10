import {
  Building2,
  MapPin,
  Hash,
  Calendar,
  Circle,
  Edit2,
  Trash2,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import type { Property, ModalState } from "./types";

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const buildColumns = (
  setModal: (state: ModalState) => void,
): ColumnDef<Property>[] => [
  {
    accessorKey: "name",
    header: () => (
      <span className="flex items-center gap-1.5">
        <Building2 className="h-3.5 w-3.5" /> Property
      </span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Building2 className="h-4 w-4 text-primary" />
        </div>
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.getValue("name")}
        </span>
      </div>
    ),
  },
  {
    id: "location",
    header: () => (
      <span className="flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5" /> Location
      </span>
    ),
    cell: ({ row }) => (
      <div>
        <div className="text-gray-600 dark:text-gray-400">
          {row.original.address}
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500">
          {row.original.city}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "total_units",
    header: () => (
      <span className="flex items-center gap-1.5">
        <Hash className="h-3.5 w-3.5" /> Units
      </span>
    ),
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
        {row.getValue("total_units")} units
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
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            status === "active"
              ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
              : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400"
          }`}
        >
          <Circle className="h-1.5 w-1.5 fill-current" />
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: () => (
      <span className="flex items-center gap-1.5">
        <Calendar className="h-3.5 w-3.5" /> Added
      </span>
    ),
    cell: ({ row }) => (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {formatDate(row.getValue("created_at"))}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
        
      <div className="flex items-center gap-1 justify-end">
    
        <button
          onClick={(e) => {
            e.stopPropagation();
            setModal({ type: "edit", property: row.original });
          }}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200 transition-colors"
          title="Edit property"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setModal({ type: "delete", property: row.original });
          }}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
          title="Delete property"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    ),
  },
];
