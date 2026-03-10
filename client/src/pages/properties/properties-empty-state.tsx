import { Building2, Plus } from "lucide-react";
import type { ModalState } from "./types";

export const PropertiesEmptyState = ({
  setModal,
}: {
  setModal: (s: ModalState) => void;
}) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="p-5 rounded-full bg-primary/10 mb-4">
      <Building2 className="h-8 w-8 text-primary" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
      No properties yet
    </h3>
    <p className="text-sm text-muted-foreground mb-6 max-w-xs">
      Add your first property to start managing your rental units.
    </p>
    <button
      onClick={() => setModal({ type: "add" })}
      className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-white hover:bg-primary-hover transition text-sm font-medium"
    >
      <Plus className="h-4 w-4" /> Add Your First Property
    </button>
  </div>
);
