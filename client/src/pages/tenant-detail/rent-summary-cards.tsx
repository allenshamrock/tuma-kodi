import type { TenantSummary } from "./types";

interface RentSummaryCardsProps {
  summary: TenantSummary;
  monthlyRent: string;
}

export const RentSummaryCards = ({
  summary,
  monthlyRent,
}: RentSummaryCardsProps) => {
  const totalPaid = parseFloat(summary.total_paid);
  const totalExpected = parseFloat(summary.total_expected);
  const outstanding = parseFloat(summary.outstanding);
  const paidPercent =
    totalExpected > 0 ? Math.min((totalPaid / totalExpected) * 100, 100) : 0;

  const cards = [
    {
      label: "Total Paid",
      value: `KES ${totalPaid.toLocaleString()}`,
      color: "text-green-600 dark:text-green-400",
      sub: `across ${summary.months_active} month${summary.months_active !== 1 ? "s" : ""}`,
    },
    {
      label: "Monthly Rent",
      value: `KES ${parseFloat(monthlyRent).toLocaleString()}`,
      color: "text-gray-900 dark:text-gray-100",
      sub: "current rate",
    },
    {
      label: "Outstanding",
      value: `KES ${outstanding.toLocaleString()}`,
      color:
        outstanding > 0
          ? "text-red-600 dark:text-red-400"
          : "text-green-600 dark:text-green-400",
      sub: outstanding > 0 ? "balance due" : "fully paid",
    },
  ];

  return (
    <div className="mb-6">
      <div className="grid grid-cols-3 gap-4 mb-3">
        {cards.map(({ label, value, color, sub }) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              {label}
            </p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Payment progress bar */}
      <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Payment progress</span>
          <span>
            {paidPercent.toFixed(0)}% of KES {totalExpected.toLocaleString()}{" "}
            expected
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${paidPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
