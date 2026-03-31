import { useForm } from "@tanstack/react-form";
import { LoginSchema } from "../lib/schema";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useAuth } from "../context/auth-context";
import { useNavigate } from "react-router-dom";

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error)
    return (error as { message?: string }).message ?? "Invalid value";
  return "Invalid value";
};

export const LoginForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: LoginSchema as any },
    onSubmit: async ({ value }) => {
      try {
        await login(value.email, value.password);
        toast.success("Login successful");
        onSuccess?.();
        navigate("/dashboard");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Login failed.Check ");
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
      <form.Field name="email">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor={field.name}>Email</label>
            <input
              id={field.name}
              type="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="you@example.com"
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
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

      <form.Field name="password">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor={field.name}>Password</label>
            <input
              id={field.name}
              type="password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="••••••••"
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
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
