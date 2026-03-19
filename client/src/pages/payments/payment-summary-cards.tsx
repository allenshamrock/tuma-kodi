import { TrendingUp, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import type { PaymentSummary } from "./types";

interface PaymentSummaryCardsProps {
  summary: PaymentSummary;
}

export const PaymentSummaryCards = ({ summary }: PaymentSummaryCardsProps) => {
  const cards = [
    {
      label: "Total Revenue",
      value: `KES ${parseFloat(summary.total_revenue).toLocaleString()}`,
      sub:
        summary.month_year === "All time"
          ? "All time"
          : `For ${summary.month_year}`,
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Completed",
      value: summary.completed_payments,
      sub: `${summary.collection_rate} collection rate`,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-500/10",
    },
    {
      label: "Pending",
      value: summary.pending_payments,
      sub: "awaiting confirmation",
      icon: Clock,
      color: "text-primary-600 dark:text-primary-400",
      bg: "bg-primary-50 dark:bg-primary-500/10",
    },
    {
      label: "Partial",
      value: summary.partial_payments,
      sub: "underpaid",
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-500/10",
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
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
        </div>
      ))}
    </div>
  );
};
