import AddProperty from "@/components/add-property-form";
import { EditPropertyForm } from "./edit-property-form";
// import { PropertyDeleteConfirm } from "./property-delete-confirm";
import type { ModalState, Property } from "./types";
import { PropertyDeleteConfirm } from "./property-delete-confirmation";

interface PropertyModalProps {
  modal: ModalState;
  onClose: () => void;
  onSuccess: () => void;
  onDeleteConfirm: (property: Property) => void;
  deleteLoading: boolean;
}

export const PropertyModal = ({
  modal,
  onClose,
  onSuccess,
  onDeleteConfirm,
  deleteLoading,
}: PropertyModalProps) => {
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
          <AddProperty onSuccess={onSuccess} onCancel={onClose} />
        )}
        {modal.type === "edit" && (
          <EditPropertyForm
            property={modal.property}
            onSuccess={onSuccess}
            onCancel={onClose}
          />
        )}
        {modal.type === "delete" && (
          <PropertyDeleteConfirm
            property={modal.property}
            onConfirm={() => onDeleteConfirm(modal.property)}
            onCancel={onClose}
            loading={deleteLoading}
          />
        )}
      </div>
    </div>
  );
};
