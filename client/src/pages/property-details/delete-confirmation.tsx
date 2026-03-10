import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Unit } from "./types";

interface DeleteConfirmProps {
  unit: Unit;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export const DeleteConfirm = ({
  unit,
  onConfirm,
  onCancel,
  loading,
}: DeleteConfirmProps) => (
  <div className="w-full max-w-sm">
    <div className="flex items-center gap-3 mb-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/10">
        <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Delete Unit
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This action cannot be undone
        </p>
      </div>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
      Are you sure you want to delete unit{" "}
      <span className="font-semibold text-gray-900 dark:text-gray-100">
        {unit.apartment_number}
      </span>
      ?
      {unit.tenant && (
        <span className="block mt-1 text-red-500 dark:text-red-400">
          This unit has an active tenant — {unit.tenant.first_name}{" "}
          {unit.tenant.last_name}.
        </span>
      )}
    </p>
    <div className="flex gap-3">
      <Button
        variant="outline"
        onClick={onCancel}
        className="flex-1"
        disabled={loading}
      >
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        disabled={loading}
        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
      >
        {loading ? "Deleting..." : "Delete Unit"}
      </Button>
    </div>
  </div>
);
