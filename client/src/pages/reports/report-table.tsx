import { Building2, Circle } from "lucide-react";
import type { PropertyReportRow } from "./types";

export const ReportTable = ({
  properties,
}: {
  properties: PropertyReportRow[];
}) => {
  if (!properties.length) return null;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden mb-6">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-white/10">
        <Building2 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Property Breakdown
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
              {[
                "Property",
                "Units",
                "Occupied",
                "Occupancy",
                "Expected",
                "Collected",
                "Collection Rate",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {properties.map((row) => (
              <tr
                key={row.property_id}
                className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {row.property_name}
                  </p>
                  <p className="text-xs text-gray-400">{row.city}</p>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {row.total_units}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {row.occupied_units}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{ width: `${row.occupancy_rate}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {row.occupancy_rate}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  KES {row.expected.toLocaleString()}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                  KES {row.revenue.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      row.collection_rate >= 80
                        ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                        : row.collection_rate >= 50
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                          : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                    }`}
                  >
                    <Circle className="h-1.5 w-1.5 fill-current" />
                    {row.collection_rate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
