import { Building2, TrendingUp } from "lucide-react";
import type { PropertyPaymentGroup } from "./types";

interface PropertyBreakdownProps {
  properties: PropertyPaymentGroup[];
}

export const PropertyBreakdown = ({ properties }: PropertyBreakdownProps) => {
  const maxRevenue = Math.max(
    ...properties.map((p) => parseFloat(p.total_revenue)),
    1,
  );

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Revenue by Property
        </h3>
      </div>

      {properties.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No data available
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {properties.map((property) => {
            const revenue = parseFloat(property.total_revenue);
            const pct = (revenue / maxRevenue) * 100;
            const collectionRate =
              property.total_payments > 0
                ? Math.round(
                    (property.completed_payments / property.total_payments) *
                      100,
                  )
                : 0;

            return (
              <div key={property.property_id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {property.property_name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {property.total_units} units
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {collectionRate}% collected
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      KES {revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
