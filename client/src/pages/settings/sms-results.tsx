import { CheckCircle, XCircle, X } from "lucide-react";
import type { SmsResult } from "./types";

interface SmsResultsProps {
  results: SmsResult[];
  onClose: () => void;
}

export const SmsResults = ({ results, onClose }: SmsResultsProps) => {
  const sent = results.filter((r) => r.status === "sent").length;
  const failed = results.filter((r) => r.status === "failed").length;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
            <CheckCircle className="h-4 w-4" /> {sent} sent
          </span>
          {failed > 0 && (
            <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
              <XCircle className="h-4 w-4" /> {failed} failed
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5">
        {results.map((r, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5">
            {r.status === "sent" ? (
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {r.tenant_name ?? `Tenant #${r.tenant_id}`}
              </p>
              <p className="text-xs text-gray-400">{r.phone}</p>
            </div>
            {r.error && (
              <p className="text-xs text-red-500 truncate max-w-[160px]">
                {r.error}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
