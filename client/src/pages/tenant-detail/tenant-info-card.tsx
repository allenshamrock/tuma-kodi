import {
  Mail,
  Phone,
  Building2,
  Hash,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import type { Tenant, TenantSummary } from "./types";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

interface TenantInfoCardProps {
  tenant: Tenant;
  summary: TenantSummary;
}

export const TenantInfoCard = ({ tenant, summary }: TenantInfoCardProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    {/* Personal Details */}
    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
        Personal Info
      </h3>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {tenant.email}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {tenant.phone}
          </span>
        </div>
        {tenant.id_number && (
          <div className="flex items-center gap-3">
            <Hash className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              ID: {tenant.id_number}
            </span>
          </div>
        )}
        {tenant.emergency_contact && (
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Emergency: {tenant.emergency_contact}
            </span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {tenant.apartment_number}
            {tenant.property_name && (
              <span className="text-gray-400 ml-1">
                · {tenant.property_name}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>

    {/* Lease Details */}
    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
        Lease
      </h3>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Start Date</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatDate(tenant.lease_start_date)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">End Date</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {tenant.lease_end_date
              ? formatDate(tenant.lease_end_date)
              : "Month-to-month"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Monthly Rent</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            KES {parseFloat(tenant.monthly_rent).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Deposit Paid</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            KES {parseFloat(tenant.security_deposit_paid).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Duration</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {summary.months_active} month
            {summary.months_active !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Expiry warning */}
        {summary.lease_expiring_soon && summary.days_until_expiry !== null && (
          <div className="flex items-center gap-2 mt-1 rounded-lg bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 px-3 py-2">
            <AlertTriangle className="h-4 w-4 text-primary-500 shrink-0" />
            <span className="text-xs text-primary-700 dark:text-primary-400">
              Lease expires in {summary.days_until_expiry} day
              {summary.days_until_expiry !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
);
