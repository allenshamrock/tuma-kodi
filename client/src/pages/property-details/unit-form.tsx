import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";
import { Hash, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Unit } from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const UnitSchema = z.object({
  apartment_number: z.string().min(1, "Unit number is required"),
  apartment_type: z.string().optional(),
  rent_amount: z
    .number({ error: "Must be a number" })
    .min(1, "Rent amount is required"),
  deposit_amount: z.number().min(0).optional(),
  size_sqft: z.number().min(1).optional(),
  features: z.string().optional(),
});

type UnitFormData = z.infer<typeof UnitSchema>;

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error)
    return (error as { message?: string }).message ?? "Invalid value";
  return "Invalid value";
};

interface UnitFormProps {
  propertyId: number;
  unit?: Unit;
  onSuccess: () => void;
  onCancel: () => void;
}

export const UnitForm = ({
  propertyId,
  unit,
  onSuccess,
  onCancel,
}: UnitFormProps) => {
  const isEditing = !!unit;

  const form = useForm({
    defaultValues: {
      apartment_number: unit?.apartment_number ?? "",
      apartment_type: unit?.apartment_type ?? "",
      rent_amount: unit?.rent_amount ?? ("" as unknown as number),
      deposit_amount: unit?.deposit_amount ?? ("" as unknown as number),
      size_sqft: unit?.size_sqft ?? ("" as unknown as number),
      features: unit?.features ?? "",
    },
    validators: { onSubmit: UnitSchema },
    onSubmit: async ({ value }) => {
      try {
        const token = localStorage.getItem("access_token");
        const payload: Record<string, unknown> = {
          apartment_number: value.apartment_number,
          rent_amount: value.rent_amount,
        };
        if (value.apartment_type) payload.apartment_type = value.apartment_type;
        if (value.deposit_amount) payload.deposit_amount = value.deposit_amount;
        if (value.size_sqft) payload.size_sqft = value.size_sqft;
        if (value.features) payload.features = value.features;

        const url = isEditing
          ? `${API_BASE}/apartments/${unit!.id}`
          : `${API_BASE}/properties/${propertyId}/units`;

        const res = await fetch(url, {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(
            data.error ?? `Failed to ${isEditing ? "update" : "add"} unit`,
          );
        toast.success(
          `Unit ${value.apartment_number} ${isEditing ? "updated" : "added"} successfully`,
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
    name: keyof UnitFormData;
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
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all"
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
    <div className="w-full max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            {isEditing ? (
              <Edit2 className="h-5 w-5 text-primary" />
            ) : (
              <Hash className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isEditing ? `Edit Unit ${unit!.apartment_number}` : "Add Unit"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isEditing
                ? "Update the unit details below"
                : "Add a new apartment unit to this property"}
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
        <div className="grid grid-cols-2 gap-4">
          <Field
            name="apartment_number"
            label="Unit Number"
            placeholder="e.g. A1"
          />
          <Field
            name="apartment_type"
            label="Type"
            placeholder="e.g. 1 Bedroom"
            optional
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field
            name="rent_amount"
            label="Rent (KES)"
            type="number"
            placeholder="e.g. 25000"
          />
          <Field
            name="deposit_amount"
            label="Deposit (KES)"
            type="number"
            placeholder="e.g. 50000"
            optional
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field
            name="size_sqft"
            label="Size (sqft)"
            type="number"
            placeholder="e.g. 650"
            optional
          />
          <Field
            name="features"
            label="Features"
            placeholder="e.g. Parking, WiFi"
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
                    : "Add Unit"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
};
