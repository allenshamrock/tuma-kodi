import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

import { usePropertyDetail } from "./use-property-detail";
import { buildColumns } from "./unit-columns";
import { PropertyHeader } from "./property-header";
import { PropertyStats } from "./property-stats";
// import { UnitsTableSkeleton } from "./units-table-skeleton";
import { UnitModal } from "./unit-modal";
import type { ModalState } from "./types";
import { UnitsEmptyState } from "./units-empty-states";
import { Skeleton } from "@/lib/skeleton";

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [modal, setModal] = useState<ModalState>(null);

  const {
    property,
    units,
    loading,
    error,
    deleteLoading,
    occupied,
    vacant,
    fetchData,
    handleDelete,
  } = usePropertyDetail(id);

  const columns = buildColumns(setModal);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <button
        onClick={() => navigate("/properties")}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Properties
      </button>

      {property && <PropertyHeader property={property} setModal={setModal} />}

      {!loading && property && (
        <PropertyStats
          totalUnits={property.total_units}
          occupied={occupied}
          vacant={vacant}
        />
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {loading && <Skeleton/>}

      {!loading && !error && units.length === 0 && (
        <UnitsEmptyState setModal={setModal} />
      )}

      {!loading && !error && units.length > 0 && (
        <DataTable columns={columns} data={units} />
      )}

      {modal && property && (
        <UnitModal
          modal={modal}
          property={property}
          onClose={() => setModal(null)}
          onSuccess={() => {
            setModal(null);
            fetchData();
          }}
          onDeleteConfirm={(unit) => handleDelete(unit, () => setModal(null))}
          deleteLoading={deleteLoading}
        />
      )}
    </div>
  );
};

export default PropertyDetail;
