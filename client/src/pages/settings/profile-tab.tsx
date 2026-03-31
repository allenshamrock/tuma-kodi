import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { User, Lock, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfile } from "./use-profile";

const ProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone is required"),
});

const PasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "Must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error)
    return (error as { message?: string }).message ?? "Invalid value";
  return "Invalid value";
};

const inputClass =
  "rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 focus:outline-none transition-all w-full";

export const ProfileTab = () => {
  const { profile, loading, saving, updateProfile } = useProfile();

  const profileForm = useForm({
    defaultValues: { first_name: "", last_name: "", phone: "" },
    validators: { onSubmit: ProfileSchema as any },
    onSubmit: async ({ value }) => {
      await updateProfile(value);
    },
  });

  useEffect(() => {
    if (profile) {
      profileForm.setFieldValue("first_name", profile.first_name ?? "");
      profileForm.setFieldValue("last_name", profile.last_name ?? "");
      profileForm.setFieldValue("phone", profile.phone ?? "");
    }
  }, [profile]);

  const passwordForm = useForm({
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
    validators: { onSubmit: PasswordSchema as any },
    onSubmit: async ({ value }) => {
      const ok = await updateProfile({
        current_password: value.current_password,
        new_password: value.new_password,
      });
      if (ok) passwordForm.reset();
    },
  });

  if (loading)
    return (
      <div className="space-y-4 max-w-lg">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-12 rounded-xl bg-gray-100 dark:bg-white/10 animate-pulse"
          />
        ))}
      </div>
    );

  return (
    <div className="space-y-8 max-w-lg">
      <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Mail className="h-3 w-3" /> {profile?.email}
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-0.5 font-medium capitalize">
            {profile?.role}
          </span>
          <span className="ml-2">
            Member since{" "}
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString("en-KE", {
                  month: "long",
                  year: "numeric",
                })
              : "—"}
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Personal Details
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            profileForm.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            {(["first_name", "last_name"] as const).map((name) => (
              <profileForm.Field key={name} name={name}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {name === "first_name" ? "First Name" : "Last Name"}
                    </label>
                    <input
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(e.target.value as never)
                      }
                      className={inputClass}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <span className="text-xs text-red-500">
                        {getErrorMessage(field.state.meta.errors[0])}
                      </span>
                    )}
                  </div>
                )}
              </profileForm.Field>
            ))}
          </div>
          <profileForm.Field name="phone">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value as never)
                    }
                    placeholder="+254 7XX XXX XXX"
                    className={`${inputClass} pl-9`}
                  />
                </div>
                {field.state.meta.errors.length > 0 && (
                  <span className="text-xs text-red-500">
                    {getErrorMessage(field.state.meta.errors[0])}
                  </span>
                )}
              </div>
            )}
          </profileForm.Field>
          <profileForm.Subscribe
            selector={(s) => [s.canSubmit, s.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting || saving}
                className="self-start bg-primary text-white"
              >
                {isSubmitting || saving ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </profileForm.Subscribe>
        </form>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4 text-gray-400" /> Change Password
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            passwordForm.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          {(
            ["current_password", "new_password", "confirm_password"] as const
          ).map((name) => (
            <passwordForm.Field key={name} name={name}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {name === "current_password"
                      ? "Current Password"
                      : name === "new_password"
                        ? "New Password"
                        : "Confirm New Password"}
                  </label>
                  <input
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value as never)
                    }
                    className={inputClass}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <span className="text-xs text-red-500">
                      {getErrorMessage(field.state.meta.errors[0])}
                    </span>
                  )}
                </div>
              )}
            </passwordForm.Field>
          ))}
          <passwordForm.Subscribe
            selector={(s) => [s.canSubmit, s.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting || saving}
                className="self-start bg-primary text-white"
              >
                {isSubmitting || saving ? "Updating..." : "Update Password"}
              </Button>
            )}
          </passwordForm.Subscribe>
        </form>
      </div>
    </div>
  );
};
