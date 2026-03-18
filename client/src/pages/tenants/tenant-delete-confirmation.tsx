import { DeleteConfirm } from "@/pages/property-details/delete-confirmation";
import type { Tenant } from "./types";

interface TenantDeleteConfirmProps {
  tenant: Tenant;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export const TenantDeleteConfirm = ({
  tenant,
  onConfirm,
  onCancel,
  loading,
}: TenantDeleteConfirmProps) => {
  const asUnit = {
    id: tenant.id,
    apartment_number: tenant.name,
    rent_amount: tenant.monthly_rent,
    deposit_amount: tenant.security_deposit_paid,
    status: "occupied" as const,
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
