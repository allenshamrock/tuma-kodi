import * as z from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(
      8,
      "Password must be at least 8 characters and contain at least one uppercase letter, and one special character",
    ),
});

export const RegisterSchema = z.object({
  firstName: z
    .string()
    .min(1, " First Name is required")
    .max(30, "First Name must not exceed 30 characters")
    .regex(
      /^[a-zA-Z\s\-']+$/,
      "First name can only contain letters, spaces, hyphens, and apostrophes",
    ),
  lastName: z
    .string()
    .min(1, "Last Name is required")
    .max(30, "Last Name must not exceed 30 characters")
    .regex(
      /^[a-zA-Z\s\-']+$/,
      "Last name can only contain letters, spaces, hyphens, and apostrophes",
    ),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(
      8,
      "Password must be at least 8 characters and contain at least one uppercase letter, and one special character",
    )
    .regex(
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
    ),
});


export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;