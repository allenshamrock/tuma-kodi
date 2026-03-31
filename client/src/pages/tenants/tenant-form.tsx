import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";
import { User, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import type { Tenant } from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TenantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  apartment_id: z
    .number({ invalid_type_error: "Please select a unit" })
    .min(1, "Unit is required"),
  lease_start_date: z.string().min(1, "Lease start date is required"),
  lease_end_date: z.string().optional(),
  monthly_rent: z
    .number({ invalid_type_error: "Must be a number" })
    .min(1, "Monthly rent is required"),
  security_deposit_paid: z.number().min(0).optional(),
  id_number: z.string().optional(),
  emergency_contact: z.string().optional(),
});

type TenantFormData = z.infer<typeof TenantSchema>;

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error)
    return (error as { message?: string }).message ?? "Invalid value";
  return "Invalid value";
};

interface Property {
  id: number;
  name: string;
}
interface VacantUnit {
  id: number;
  apartment_number: string;
  rent_amount: string;
}

interface TenantFormProps {
  tenant?: Tenant;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TenantForm = ({
  tenant,
  onSuccess,
  onCancel,
}: TenantFormProps) => {
  const isEditing = !!tenant;

  const [properties, setProperties] = useState<Property[]>([]);
  const [vacantUnits, setVacantUnits] = useState<VacantUnit[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    null,
  );
  const [loadingUnits, setLoadingUnits] = useState(false);

  // Fetch properties for the dropdown
  useEffect(() => {
    if (isEditing) return;
    const token = localStorage.getItem("access_token");
    fetch(`${API_BASE}/properties`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setProperties(data.properties ?? data))
      .catch(() => toast.error("Failed to load properties"));
  }, [isEditing]);

  // Fetch vacant units when property is selected
  useEffect(() => {
    if (!selectedPropertyId) {
      setVacantUnits([]);
      return;
    }
    setLoadingUnits(true);
    const token = localStorage.getItem("access_token");
    fetch(`${API_BASE}/properties/${selectedPropertyId}/vacant-units`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setVacantUnits(data.units ?? []))
      .catch(() => toast.error("Failed to load units"))
      .finally(() => setLoadingUnits(false));
  }, [selectedPropertyId]);

  const form = useForm({
    defaultValues: {
      name: tenant?.name ?? "",
      email: tenant?.email ?? "",
      phone: tenant?.phone ?? "",
      apartment_id: tenant?.apartment_id ?? ("" as unknown as number),
      lease_start_date: (tenant?.lease_start_date ?? "")
        .toString()
        .slice(0, 10),
      lease_end_date: (tenant?.lease_end_date ?? "").toString().slice(0, 10),
      monthly_rent: tenant?.monthly_rent
        ? parseFloat(tenant.monthly_rent)
        : ("" as unknown as number),
      security_deposit_paid: tenant?.security_deposit_paid
        ? parseFloat(tenant.security_deposit_paid)
        : ("" as unknown as number),
      id_number: tenant?.id_number ?? "",
      emergency_contact: tenant?.emergency_contact ?? "",
    },
    validators: { onSubmit: TenantSchema as any },
    onSubmit: async ({ value }) => {
      try {
        const token = localStorage.getItem("access_token");
        const url = isEditing
          ? `${API_BASE}/tenants/${tenant!.id}`
          : `${API_BASE}/tenants`;
        const method = isEditing ? "PUT" : "POST";

        const payload: Record<string, unknown> = { ...value };
        if (!value.lease_end_date) delete payload.lease_end_date;
        if (!value.id_number) delete payload.id_number;
        if (!value.emergency_contact) delete payload.emergency_contact;

        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(
            data.error ?? `Failed to ${isEditing ? "update" : "add"} tenant`,
          );
        toast.success(
          `${value.name} ${isEditing ? "updated" : "added"} successfully`,
        );
        onSuccess();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
        );
      }
    },
  });

  const Field = ({
    name,
    label,
    type = "text",
    placeholder,
    optional,
  }: {
    name: keyof TenantFormData;
    label: string;
    type?: string;
    placeholder?: string;
    optional?: boolean;
  }) => (
    <form.Field name={name}>
      {(field) => (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {label}
            {optional && (
              <span className="normal-case ml-1 text-gray-400">(optional)</span>
            )}
          </label>
          <input
            id={field.name}
            type={type}
            value={field.state.value as string}
            onBlur={field.handleBlur}
            onChange={(e) => {
              const v = e.target.value;
              if (type === "number") {
                field.handleChange(
                  v === "" ? ("" as unknown as number) : (Number(v) as never),
                );
              } else {
                field.handleChange(v as never);
              }
            }}
            placeholder={placeholder}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 focus:outline-none transition-all"
          />
          {field.state.meta.errors.length > 0 && (
            <span className="text-xs text-red-500">
              {getErrorMessage(field.state.meta.errors[0])}
            </span>
          )}
        </div>
      )}
    </form.Field>
  );

  return (
    <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto pr-1">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            {isEditing ? (
              <Edit2 className="h-5 w-5 text-primary" />
            ) : (
              <User className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isEditing ? `Edit ${tenant!.name}` : "Add Tenant"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isEditing
                ? "Update tenant details below"
                : "Fill in the tenant's details"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        {/* Personal Info */}
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Personal Info
        </p>
        <Field name="name" label="Full Name" placeholder="e.g. Jane Wanjiru" />
        <div className="grid grid-cols-2 gap-4">
          <Field
            name="email"
            label="Email"
            type="email"
            placeholder="jane@email.com"
          />
          <Field name="phone" label="Phone" placeholder="+254 7XX XXX XXX" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field
            name="id_number"
            label="ID Number"
            placeholder="e.g. 12345678"
            optional
          />
          <Field
            name="emergency_contact"
            label="Emergency Contact"
            placeholder="+254 7XX XXX XXX"
            optional
          />
        </div>

        {/* Unit Assignment — only on create */}
        {!isEditing && (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mt-2">
              Unit Assignment
            </p>

            {/* Step 1: Property selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Property
              </label>
              <select
                value={selectedPropertyId ?? ""}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSelectedPropertyId(val || null);
                  // reset apartment_id when property changes
                  form.setFieldValue("apartment_id", "" as unknown as number);
                  form.setFieldValue("monthly_rent", "" as unknown as number);
                }}
                className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 focus:outline-none transition-all"
              >
                <option value="">Select a property...</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Unit selector */}
            <form.Field name="apartment_id">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Unit
                  </label>
                  <select
                    value={field.state.value as number | ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const unitId = Number(e.target.value);
                      field.handleChange(unitId as never);
                      // Auto-fill monthly rent from selected unit
                      const unit = vacantUnits.find((u) => u.id === unitId);
                      if (unit)
                        form.setFieldValue(
                          "monthly_rent",
                          parseFloat(unit.rent_amount) as never,
                        );
                    }}
                    disabled={!selectedPropertyId || loadingUnits}
                    className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 focus:outline-none transition-all disabled:opacity-50"
                  >
                    <option value="">
                      {!selectedPropertyId
                        ? "Select a property first..."
                        : loadingUnits
                          ? "Loading units..."
                          : vacantUnits.length === 0
                            ? "No vacant units available"
                            : "Select a unit..."}
                    </option>
                    {vacantUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.apartment_number} — KES{" "}
                        {parseFloat(u.rent_amount).toLocaleString()}
                      </option>
                    ))}
                  </select>
                  {field.state.meta.errors.length > 0 && (
                    <span className="text-xs text-red-500">
                      {getErrorMessage(field.state.meta.errors[0])}
                    </span>
                  )}
                </div>
              )}
            </form.Field>
          </>
        )}

        {/* Lease Info */}
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mt-2">
          Lease
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Field name="lease_start_date" label="Start Date" type="date" />
          <Field name="lease_end_date" label="End Date" type="date" optional />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field
            name="monthly_rent"
            label="Monthly Rent (KES)"
            type="number"
            placeholder="Auto-filled from unit"
          />
          <Field
            name="security_deposit_paid"
            label="Deposit Paid (KES)"
            type="number"
            placeholder="e.g. 50000"
            optional
          />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="flex-1 bg-primary text-gray-200 font-medium"
              >
                {isSubmitting
                  ? isEditing
                    ? "Saving..."
                    : "Adding..."
                  : isEditing
                    ? "Save Changes"
                    : "Add Tenant"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
};
