import { useForm } from "@tanstack/react-form";
import { RegisterSchema } from "../lib/schema";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useAuth } from "../context/auth-context";
import { useNavigate } from "react-router-dom";

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    return (error as { message?: string }).message ?? "Invalid value";
  }
  return "Invalid value";
};

export const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
    validators: {
      onSubmit: RegisterSchema,
    },
    onSubmit: async ({ value }) => {

      try {
        const validatedData = RegisterSchema.parse(value);
        console.log("Validated Data:", validatedData);
        toast.success("Account created successfully!");
        await register(validatedData);
        navigate("/dashboard");
         
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
      {/* First Name & Last Name */}
      <div className="flex gap-3">
        <form.Field name="firstName">
          {(field) => (
            <div className="flex flex-1 flex-col gap-1">
              <label
                htmlFor={field.name}
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                First Name
              </label>
              <input
                id={field.name}
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="John"
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              />
              {field.state.meta.isTouched &&
                field.state.meta.errors.length > 0 && (
                  <span className="text-xs text-red-500">
                    {getErrorMessage(field.state.meta.errors[0])}
                  </span>
                )}
            </div>
          )}
        </form.Field>

        <form.Field name="lastName">
          {(field) => (
            <div className="flex flex-1 flex-col gap-1">
              <label
                htmlFor={field.name}
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Last Name
              </label>
              <input
                id={field.name}
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Doe"
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              />
              {field.state.meta.isTouched &&
                field.state.meta.errors.length > 0 && (
                  <span className="text-xs text-red-500">
                    {getErrorMessage(field.state.meta.errors[0])}
                  </span>
                )}
            </div>
          )}
        </form.Field>
      </div>

      {/* Email */}
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
                  {getErrorMessage(field.state.meta.errors[0])}
                </span>
              )}
          </div>
        )}
      </form.Field>

      {/* Password */}
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
                  {getErrorMessage(field.state.meta.errors[0])}
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
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};
