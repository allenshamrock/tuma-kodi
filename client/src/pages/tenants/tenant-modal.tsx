import { TenantDeleteConfirm } from "./tenant-delete-confirmation";
import { TenantForm } from "./tenant-form";
import type { ModalState, Tenant } from "./types";

interface TenantModalProps {
  modal: ModalState;
  onClose: () => void;
  onSuccess: () => void;
  onDeleteConfirm: (tenant: Tenant) => void;
  deleteLoading: boolean;
}

export const TenantModal = ({
  modal,
  onClose,
  onSuccess,
  onDeleteConfirm,
  deleteLoading,
}: TenantModalProps) => {
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
          <TenantForm onSuccess={onSuccess} onCancel={onClose} />
        )}
        {modal.type === "edit" && (
          <TenantForm
            tenant={modal.tenant}
            onSuccess={onSuccess}
            onCancel={onClose}
          />
        )}
        {modal.type === "delete" && (
          <TenantDeleteConfirm
            tenant={modal.tenant}
            onConfirm={() => onDeleteConfirm(modal.tenant)}
            onCancel={onClose}
            loading={deleteLoading}
          />
        )}
      </div>
    </div>
  );
};
