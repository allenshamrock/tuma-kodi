import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";
import { Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Property } from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

const EditPropertySchema = z.object({
  name: z
    .string()
    .min(1, "Property name is required")
    .max(100, "Name too long"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  total_units: z
    .number({ invalid_type_error: "Must be a number" })
    .min(1, "At least 1 unit required"),
});

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error)
    return (error as { message?: string }).message ?? "Invalid value";
  return "Invalid value";
};

interface EditPropertyFormProps {
  property: Property;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditPropertyForm = ({
  property,
  onSuccess,
  onCancel,
}: EditPropertyFormProps) => {
  const form = useForm({
    defaultValues: {
      name: property.name,
      address: property.address,
      city: property.city,
      total_units: property.total_units,
    },
    validators: { onSubmit: EditPropertySchema as any },
    onSubmit: async ({ value }) => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_BASE}/properties/${property.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(value),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to update property");
        toast.success(`"${value.name}" updated successfully`);
        onSuccess();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
        );
      }
    },
  });

  type FieldName = "name" | "address" | "city" | "total_units";

  const Field = ({
    name,
    label,
    type = "text",
    placeholder,
  }: {
    name: FieldName;
    label: string;
    type?: string;
    placeholder?: string;
  }) => (
    <form.Field name={name}>
      {(field) => (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {label}
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
    <div className="w-full max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Edit2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Edit Property
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Update the property details below
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
        <Field
          name="name"
          label="Property Name"
          placeholder="e.g. Kilimani Heights"
        />
        <Field
          name="address"
          label="Street Address"
          placeholder="e.g. 14 Ngong Road"
        />
        <div className="grid grid-cols-2 gap-4">
          <Field name="city" label="City" placeholder="e.g. Nairobi" />
          <Field
            name="total_units"
            label="Total Units"
            type="number"
            placeholder="e.g. 12"
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
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
};
