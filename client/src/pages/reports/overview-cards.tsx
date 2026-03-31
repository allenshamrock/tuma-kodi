import {
  Home,
  Users,
  TrendingUp,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import type { ReportOverview } from "./types";

export const OverviewCards = ({ overview }: { overview: ReportOverview }) => {
  const cards = [
    {
      label: "Total Revenue",
      value: `KES ${parseFloat(overview.total_revenue).toLocaleString()}`,
      sub: `KES ${parseFloat(overview.current_month_revenue).toLocaleString()} this month`,
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Occupancy Rate",
      value: `${overview.occupancy_rate}%`,
      sub: `${overview.occupied_units} of ${overview.total_units} units occupied`,
      icon: Home,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-500/10",
    },
    {
      label: "Active Tenants",
      value: overview.active_tenants,
      sub: `across ${overview.total_properties} propert${overview.total_properties !== 1 ? "ies" : "y"}`,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      label: "Outstanding",
      value: `KES ${parseFloat(overview.outstanding_amount).toLocaleString()}`,
      sub:
        overview.overdue_count > 0
          ? `${overview.overdue_count} overdue invoice${overview.overdue_count !== 1 ? "s" : ""}`
          : "No overdue invoices",
      icon: overview.overdue_count > 0 ? AlertTriangle : TrendingUp,
      color:
        overview.overdue_count > 0
          ? "text-red-600 dark:text-red-400"
          : "text-gray-600 dark:text-gray-400",
      bg:
        overview.overdue_count > 0
          ? "bg-red-50 dark:bg-red-500/10"
          : "bg-gray-100 dark:bg-white/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map(({ label, value, sub, icon: Icon, color, bg }) => (
        <div
          key={label}
          className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {label}
            </p>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}
            >
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
          </div>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
        </div>
      ))}
    </div>
  );
};
