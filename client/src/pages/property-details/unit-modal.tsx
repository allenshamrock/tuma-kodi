import { UnitForm } from "./unit-form";
import type { Property, ModalState, Unit } from "./types";
import { DeleteConfirm } from "./delete-confirmation";

interface UnitModalProps {
  modal: ModalState;
  property: Property;
  onClose: () => void;
  onSuccess: () => void;
  onDeleteConfirm: (unit: Unit) => void;
  deleteLoading: boolean;
}

export const UnitModal = ({
  modal,
  property,
  onClose,
  onSuccess,
  onDeleteConfirm,
  deleteLoading,
}: UnitModalProps) => {
  if (!modal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 p-6">
        {modal.type === "add" && (
          <UnitForm
            propertyId={property.id}
            onSuccess={onSuccess}
            onCancel={onClose}
          />
        )}
        {modal.type === "edit" && (
          <UnitForm
            propertyId={property.id}
            unit={modal.unit}
            onSuccess={onSuccess}
            onCancel={onClose}
          />
        )}
        {modal.type === "delete" && (
          <DeleteConfirm
            unit={modal.unit}
            onConfirm={() => onDeleteConfirm(modal.unit)}
            onCancel={onClose}
            loading={deleteLoading}
          />
        )}
      </div>
    </div>
  );
};
