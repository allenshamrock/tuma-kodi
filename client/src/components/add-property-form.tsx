import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Building2, MapPin, Hash, X } from "lucide-react";

const AddPropertySchema = z.object({
  name: z
    .string()
    .min(1, "Property name is required")
    .max(100, "Name too long"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  total_units: z
    .number({ invalid_type_error: "Must be a number" })
    .min(1, "At least 1 unit required")
    .max(9999, "Too many units"),
});

type AddPropertyFormData = z.infer<typeof AddPropertySchema>;

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error)
 return (error as { message?: string }).message ?? "Invalid value";
  return "Invalid value";
};

interface AddPropertyProps {
  onSuccess?: (data: AddPropertyFormData) => void;
  onCancel?: () => void;
}

const AddProperty = ({ onSuccess, onCancel }: AddPropertyProps) => {
  const form = useForm({
    defaultValues: {
      name: "",
      address: "",
      city: "",
      total_units: "" as unknown as number,
    },
    validators: { onSubmit: AddPropertySchema as any },
    onSubmit: async ({ value }) => {
      try {
        const API_BASE =
          import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

        const token = localStorage.getItem("access_token");

        const res = await fetch(`${API_BASE}/properties`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(value),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error ?? "Failed to add property");

        toast.success(`"${value.name}" added successfully`);
        onSuccess?.(value);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
        );
      }
    },
  });

  return (
    <div className="w-full max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-400/10 border border-primary-400/20">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Add Property
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Fill in the details below to list a new property
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-5"
      >
        {/* Property Name */}
        <form.Field name="name">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={field.name}
                className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
              >
                Property Name
              </label>
              <input
                id={field.name}
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g. Kilimani Heights"
                className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 focus:outline-none transition-all"
              />
              {field.state.meta.errors.length > 0 && (
                <span className="text-xs text-red-500">
                  {getErrorMessage(field.state.meta.errors[0])}
                </span>
              )}
            </div>
          )}
        </form.Field>

        {/* Address */}
        <form.Field name="address">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={field.name}
                className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
              >
                Street Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  id={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. 14 Ngong Road"
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 focus:outline-none transition-all"
                />
              </div>
              {field.state.meta.errors.length > 0 && (
                <span className="text-xs text-red-500">
                  {getErrorMessage(field.state.meta.errors[0])}
                </span>
              )}
            </div>
          )}
        </form.Field>

        {/* City + Total Units side by side */}
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="city">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={field.name}
                  className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  City
                </label>
                <input
                  id={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Nairobi"
                  className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 focus:outline-none transition-all"
                />
                {field.state.meta.errors.length > 0 && (
                  <span className="text-xs text-red-500">
                    {getErrorMessage(field.state.meta.errors[0])}
                  </span>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="total_units">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={field.name}
                  className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  Total Units
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  <input
                    id={field.name}
                    type="number"
                    min={1}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value === ""
                          ? ("" as unknown as number)
                          : Number(e.target.value),
                      )
                    }
                    placeholder="e.g. 12"
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 focus:outline-none transition-all"
                  />
                </div>
                {field.state.meta.errors.length > 0 && (
                  <span className="text-xs text-red-500">
                    {getErrorMessage(field.state.meta.errors[0])}
                  </span>
                )}
              </div>
            )}
          </form.Field>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="flex-1 bg-primary  text-gray-200 font-medium"
              >
                {isSubmitting ? "Adding..." : "Add Property"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;
