import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/ui/data-table";

import { useProperties } from "./use-properties";
import { buildColumns } from "./property-columns";
import { PropertyModal } from "./property-modal";
import type { ModalState } from "./types";
import { Skeleton } from "@/lib/skeleton";
import { PropertiesEmptyState } from "./properties-empty-state";

const Properties = () => {
  const navigate = useNavigate();
  const [modal, setModal] = useState<ModalState>(null);
  const {
    properties,
    loading,
    error,
    deleteLoading,
    fetchProperties,
    handleDelete,
  } = useProperties();
  const columns = buildColumns(setModal);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Properties
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading
              ? "Loading..."
              : `${properties.length} propert${properties.length === 1 ? "y" : "ies"} found`}
          </p>
        </div>
        <button
          onClick={() => setModal({ type: "add" })}
          className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-white hover:bg-primary-hover transition text-sm font-medium"
        >
          <Plus className="h-4 w-4" /> Add Property
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {loading && <Skeleton />}

      {!loading && !error && properties.length === 0 && (
        <PropertiesEmptyState setModal={setModal} />
      )}

      {!loading && !error && properties.length > 0 && (
        <DataTable
          columns={columns}
          data={properties}
          onRowClick={(row) =>
            navigate(`/properties/${row.id}`, {
              state: { propertyName: row.name },
            })
          }
        />
      )}

      <PropertyModal
        modal={modal}
        onClose={() => setModal(null)}
        onSuccess={() => {
          setModal(null);
          fetchProperties();
        }}
        onDeleteConfirm={(property) =>
          handleDelete(property, () => setModal(null))
        }
        deleteLoading={deleteLoading}
      />
    </div>
  );
};

export default Properties;
