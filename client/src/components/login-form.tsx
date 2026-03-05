import { useForm } from "@tanstack/react-form";
import { LoginSchema } from "../lib/schema";
import { toast } from "sonner";
import { Button } from "./ui/button";

export const LoginForm = () => {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: LoginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const validatedData = LoginSchema.parse(value);
        console.log("Validated Data:", validatedData);
        toast.success("Login Successful");
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      {/* Email Field */}
      <form.Field name="email">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label
              htmlFor={field.name}
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              id={field.name}
              type="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="you@example.com"
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
            />
            {field.state.meta.isTouched &&
              field.state.meta.errors.length > 0 && (
                <span className="text-xs text-red-500">
                  {typeof field.state.meta.errors[0] === "string"
                    ? field.state.meta.errors[0]
                    : ((field.state.meta.errors[0] as { message?: string })
                        ?.message ?? "Invalid value")}
                </span>
              )}
          </div>
        )}
      </form.Field>

      {/* Password Field */}
      <form.Field name="password">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label
              htmlFor={field.name}
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id={field.name}
              type="password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="••••••••"
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
            />
            {field.state.meta.isTouched &&
              field.state.meta.errors.length > 0 && (
                <span className="text-xs text-red-500">
                  {typeof field.state.meta.errors[0] === "string"
                    ? field.state.meta.errors[0]
                    : ((field.state.meta.errors[0] as { message?: string })
                        ?.message ?? "Invalid value")}
                </span>
              )}
          </div>
        )}
      </form.Field>

      {/* Submit */}
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="w-full mt-2 text-gray-200"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};
