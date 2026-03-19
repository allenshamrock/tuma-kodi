import type { RevenueTrendPoint } from "./types";

export const RevenueChart = ({
  trend,
}: {
  trend: RevenueTrendPoint[];
}) => {
  if (!trend.length) return null;

  const maxValue = Math.max(
    ...trend.map((t) => Math.max(t.revenue, t.expected)),
    1,
  );

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Revenue Trend
        </h3>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" />{" "}
            Collected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-gray-200 dark:bg-white/20" />{" "}
            Expected
          </span>
        </div>
      </div>

      <div className="flex items-end gap-3 h-40">
        {trend.map((point) => {
          const revPct = (point.revenue / maxValue) * 100;
          const expPct = (point.expected / maxValue) * 100;

          return (
            <div
              key={point.month}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div className="w-full flex items-end gap-1 h-32">
                <div className="flex-1 flex flex-col justify-end">
                  <div
                    className="w-full rounded-t bg-gray-100 dark:bg-white/10 transition-all duration-500"
                    style={{
                      height: `${expPct}%`,
                      minHeight: point.expected > 0 ? "4px" : "0",
                    }}
                  />
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <div
                    className="w-full rounded-t bg-primary transition-all duration-500"
                    style={{
                      height: `${revPct}%`,
                      minHeight: point.revenue > 0 ? "4px" : "0",
                    }}
                    title={`KES ${point.revenue.toLocaleString()}`}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-400 text-center">
                {point.label.split(" ")[0]}
              </span>
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                {point.revenue > 0
                  ? `${(point.revenue / 1000).toFixed(0)}k`
                  : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
