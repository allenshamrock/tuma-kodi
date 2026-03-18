import { AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface LeaseExpiryBadgeProps {
  daysUntilExpiry: number | null;
  leaseExpiringSoon: boolean;
}

export const LeaseExpiryBadge = ({
  daysUntilExpiry,
  leaseExpiringSoon,
}: LeaseExpiryBadgeProps) => {
  if (daysUntilExpiry === null) return null;

  if (daysUntilExpiry < 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-400">
        <AlertTriangle className="h-3.5 w-3.5" />
        Lease expired {Math.abs(daysUntilExpiry)} days ago
      </span>
    );
  }

  if (leaseExpiringSoon) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
        <Clock className="h-3.5 w-3.5" />
        Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? "s" : ""}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400">
      <CheckCircle className="h-3.5 w-3.5" />
      Active lease
    </span>
  );
};
