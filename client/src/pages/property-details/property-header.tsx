import { Building2, Plus } from "lucide-react";
import type { Property, ModalState } from "./types";

interface PropertyHeaderProps {
  property: Property;
  setModal: (state: ModalState) => void;
}

export const PropertyHeader = ({ property, setModal }: PropertyHeaderProps) => (
  <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
        <Building2 className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {property.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {property.address}, {property.city}
        </p>
      </div>
    </div>
    <button
      onClick={() => setModal({ type: "add" })}
      className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-white hover:bg-primary-hover transition text-sm font-medium self-start sm:self-auto"
    >
      <Plus className="h-4 w-4" /> Add Unit
    </button>
  </div>
);
