import { useState } from "react";
import { useReports } from "./use-reports";
import { OverviewCards } from "./overview-cards";
import { ReportSkeleton } from "./report-skeleton";
import { RevenueChart } from "./revenue-chart";
import { ReportTable } from "./report-table";
import { InvoiceTable } from "./invoice-table";

// Generating last 12 months options
const getMonthOptions = () => {
  const options = [{ value: "", label: "All time" }];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-KE", {
      month: "long",
      year: "numeric",
    });
    options.push({ value, label });
  }
  return options;
};

const Reports = () => {
  const [monthYear, setMonthYear] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const { overview, trend, invoiceReport, byProperty, loading, error } =
    useReports(monthYear);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Financial overview and invoice tracking
          </p>
        </div>

        <select
          value={monthYear}
          onChange={(e) => setMonthYear(e.target.value)}
          className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary transition-all"
        >
          {getMonthOptions().map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <ReportSkeleton />
      ) : (
        <>
          {overview && <OverviewCards overview={overview} />}
          {trend.length > 0 && <RevenueChart trend={trend} />}
          {byProperty.length > 0 && (
            <ReportTable properties={byProperty} />
          )}
          {invoiceReport && <InvoiceTable report={invoiceReport} />}
        </>
      )}
    </div>
  );
};

export default Reports;
