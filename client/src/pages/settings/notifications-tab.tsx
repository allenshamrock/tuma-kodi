import { useState } from "react";
import {
  Bell,
  Clock,
  AlertTriangle,
  MessageSquare,
  Send,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "./use-notifications";
import type { Tenant } from "./types";
import { SmsResults } from "./sms-results";

type NotifMode = "reminder" | "overdue" | "custom";

const TenantSelector = ({
  tenants,
  selected,
  setSelected,
  loading,
}: {
  tenants: Tenant[];
  selected: number[];
  setSelected: (ids: number[]) => void;
  loading: boolean;
}) => {
  const allSelected = tenants.length > 0 && selected.length === tenants.length;

  const toggle = (id: number) =>
    setSelected(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );

  if (loading)
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-10 rounded-lg bg-gray-100 dark:bg-white/10 animate-pulse"
          />
        ))}
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Select Tenants ({selected.length} selected)
        </label>
        <button
          type="button"
          onClick={() =>
            setSelected(allSelected ? [] : tenants.map((t) => t.id))
          }
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          {allSelected ? (
            <CheckSquare className="h-3.5 w-3.5" />
          ) : (
            <Square className="h-3.5 w-3.5" />
          )}
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </div>
      <div className="rounded-xl border border-gray-200 dark:border-white/10 max-h-52 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5">
        {tenants.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No active tenants found
          </p>
        ) : (
          tenants.map((t) => {
            const checked = selected.includes(t.id);
            return (
              <label
                key={t.id}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(t.id)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t.apartment_number ?? "—"}
                    {t.property_name && ` · ${t.property_name}`}
                  </p>
                </div>
                <span className="text-xs text-gray-400">{t.phone}</span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
};

export const NotificationsTab = () => {
  const {
    tenants,
    loadingTenants,
    sending,
    results,
    setResults,
    sendPaymentReminder,
    sendOverdueNotices,
    sendCustomSms,
  } = useNotifications();

  const [mode, setMode] = useState<NotifMode>("reminder");
  const [selected, setSelected] = useState<number[]>([]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-10`;
  });
  const [customMessage, setCustomMessage] = useState("");

  const handleSend = async () => {
    if (!selected.length) return;
    if (mode === "reminder") await sendPaymentReminder(selected, dueDate);
    else if (mode === "overdue") await sendOverdueNotices(selected);
    else if (mode === "custom" && customMessage.trim())
      await sendCustomSms(selected, customMessage.trim());
  };

  const modes: {
    id: NotifMode;
    label: string;
    icon: typeof Bell;
    description: string;
  }[] = [
    {
      id: "reminder",
      label: "Payment Reminder",
      icon: Clock,
      description: "Remind tenants that rent is due",
    },
    {
      id: "overdue",
      label: "Overdue Notice",
      icon: AlertTriangle,
      description: "Notify tenants with overdue rent",
    },
    {
      id: "custom",
      label: "Custom Message",
      icon: MessageSquare,
      description: "Send any message to selected tenants",
    },
  ];

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
          SMS Notifications
        </h3>
        <p className="text-xs text-gray-400">
          Messages are sent via Africa's Talking to tenants' registered phone
          numbers.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {modes.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMode(id);
              setResults(null);
            }}
            className={`rounded-xl border p-3 text-left transition-all ${
              mode === id
                ? "border-primary bg-primary/5 dark:bg-primary/10"
                : "border-gray-200 dark:border-white/10 hover:border-primary/50"
            }`}
          >
            <Icon
              className={`h-5 w-5 mb-2 ${mode === id ? "text-primary" : "text-gray-400"}`}
            />
            <p
              className={`text-xs font-semibold ${mode === id ? "text-primary" : "text-gray-700 dark:text-gray-300"}`}
            >
              {label}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 leading-tight">
              {description}
            </p>
          </button>
        ))}
      </div>

      {mode === "reminder" && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 focus:outline-none transition-all"
          />
        </div>
      )}

      {mode === "overdue" && (
        <div className="rounded-lg border border-primary-200 dark:border-primary-500/20 bg-primary-50 dark:bg-primary-500/10 px-4 py-3 text-xs text-primary-700 dark:text-primary-400">
          This will send overdue notices only to tenants who have{" "}
          <strong>not paid</strong> for the current month and are past the 10th.
        </div>
      )}

      {mode === "custom" && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Message
          </label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Type your message here..."
            rows={4}
            maxLength={160}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 focus:outline-none transition-all resize-none"
          />
          <p className="text-xs text-gray-400 text-right">
            {customMessage.length}/160 characters
          </p>
        </div>
      )}

      <TenantSelector
        tenants={tenants}
        selected={selected}
        setSelected={setSelected}
        loading={loadingTenants}
      />

      <Button
        onClick={handleSend}
        disabled={
          sending ||
          selected.length === 0 ||
          (mode === "custom" && !customMessage.trim())
        }
        className="w-full bg-primary text-white flex items-center justify-center gap-2"
      >
        <Send className="h-4 w-4" />
        {sending
          ? "Sending..."
          : `Send to ${selected.length} tenant${selected.length !== 1 ? "s" : ""}`}
      </Button>

      {results && (
        <SmsResults results={results} onClose={() => setResults(null)} />
      )}
    </div>
  );
};
