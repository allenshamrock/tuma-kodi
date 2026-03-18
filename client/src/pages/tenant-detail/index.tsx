import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Circle } from "lucide-react";

import { useTenantDetail } from "./use-tenant-detail";
import { TenantInfoCard } from "./tenant-info-card";
import { RentSummaryCards } from "./rent-summary-cards";
import { PaymentHistory } from "./payment-history";
import { LeaseExpiryBadge } from "./lease-expiry-badge";

const statusStyles: Record<string, string> = {
  active: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  inactive: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400",
  evicted: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

const TenantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenant, payments, summary, loading, error } = useTenantDetail(id);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-white/10 animate-pulse mb-6" />
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-40 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
            <div className="h-3.5 w-24 rounded bg-gray-100 dark:bg-white/5 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 dark:border-white/10 p-4"
            >
              <div className="h-3 w-20 rounded bg-gray-200 dark:bg-white/10 animate-pulse mb-2" />
              <div className="h-6 w-28 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !tenant)
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <button
          onClick={() => navigate("/tenants")}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Tenants
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error ?? "Tenant not found"}
        </div>
      </div>
    );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Back */}
      <button
        onClick={() => navigate("/tenants")}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Tenants
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {tenant.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[tenant.status] ?? statusStyles.inactive}`}
              >
                <Circle className="h-1.5 w-1.5 fill-current" />
                {tenant.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {tenant.apartment_number}
              {tenant.property_name && ` · ${tenant.property_name}`}
            </p>
          </div>
        </div>

        {/* Lease expiry badge */}
        {summary && (
          <LeaseExpiryBadge
            daysUntilExpiry={summary.days_until_expiry}
            leaseExpiringSoon={summary.lease_expiring_soon}
          />
        )}
      </div>

      {/* Rent summary cards */}
      {summary && (
        <RentSummaryCards summary={summary} monthlyRent={tenant.monthly_rent} />
      )}

      {/* Info cards */}
      {summary && <TenantInfoCard tenant={tenant} summary={summary} />}

      {/* Payment history */}
      <PaymentHistory payments={payments} />
    </div>
  );
};

export default TenantDetail;
