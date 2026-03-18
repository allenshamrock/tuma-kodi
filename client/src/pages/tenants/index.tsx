import { useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

import { useTenants } from "./use-tenants";
import { buildColumns } from "./tenant-columns";
import { TenantModal } from "./tenant-modal";
import type { ModalState } from "./types";
import { TenantsSkeleton } from "./tenant-skeleton";
import { TenantsEmptyState } from "./tenant-emtpy-state";
import { useNavigate } from "react-router-dom";

const Tenants = () => {
    const navigate = useNavigate()
  const [modal, setModal] = useState<ModalState>(null);
  const { tenants, loading, error, deleteLoading, fetchTenants, handleDelete } =
    useTenants();
  const columns = buildColumns(setModal);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Tenants
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading
              ? "Loading..."
              : `${tenants.length} tenant${tenants.length === 1 ? "" : "s"} found`}
          </p>
        </div>
        <button
          onClick={() => setModal({ type: "add" })}
          className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-white hover:bg-primary-hover transition text-sm font-medium"
        >
          <Plus className="h-4 w-4" /> Add Tenant
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {loading && <TenantsSkeleton />}

      {!loading && !error && tenants.length === 0 && (
        <TenantsEmptyState setModal={setModal} />
      )}

      {!loading && !error && tenants.length > 0 && (
        <DataTable columns={columns} data={tenants} onRowClick={(row)=> 
            navigate(`/tenants/${row.id}`,{
                state:{tenantName: row.name}
            })
        }  />
    //             <DataTable
    //       columns={columns}
    //       data={properties}
    //       onRowClick={(row) =>
    //         navigate(`/properties/${row.id}`, {
    //           state: { propertyName: row.name },
    //         })
    //       }
    //     />
    //   )}
      )}

      <TenantModal
        modal={modal}
        onClose={() => setModal(null)}
        onSuccess={() => {
          setModal(null);
          fetchTenants();
        }}
        onDeleteConfirm={(tenant) => handleDelete(tenant, () => setModal(null))}
        deleteLoading={deleteLoading}
      />
    </div>
  );
};

export default Tenants;
