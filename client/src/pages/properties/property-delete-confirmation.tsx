import { DeleteConfirm } from "@/pages/property-details/delete-confirmation";
import type { Property } from "./types";

interface PropertyDeleteConfirmProps {
  property: Property;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export const PropertyDeleteConfirm = ({
  property,
  onConfirm,
  onCancel,
  loading,
}: PropertyDeleteConfirmProps) => {
  const asUnit = {
    id: property.id,
    apartment_number: property.name,
    rent_amount: 0,
    deposit_amount: 0,
    status: "vacant" as const,
    tenant: null,
  };

  return (
    <DeleteConfirm
      unit={asUnit}
      onConfirm={onConfirm}
      onCancel={onCancel}
      loading={loading}
    />
  );
};
