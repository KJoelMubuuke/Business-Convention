import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const attendeeSchema = z.object({
  id: z.string().uuid().optional(),
  convention_id: z.string().uuid(),
  full_name: z.string().min(2, "Full name is required"),
  occupation: z.string().default(""),
  district: z.string().min(2, "District is required"),
  church: z.string().min(2, "Church is required"),
  gender: z.enum(["Male", "Female"], { message: "Select a gender" }),
  residency: z.enum(["Resident", "Non-Resident"], { message: "Select residency" }),
  amount_paid: z.coerce.number().min(0, "Amount must be 0 or more"),
  payment_method: z.enum(["Cash", "MoMo", "Waived"]).default("Cash"),
  phone: z.string().default(""),
  notes: z.string().default(""),
  allow_duplicate: z.string().optional(),
});

export const lookupSchema = z.object({
  category: z.enum(["district", "church", "occupation"]),
  value: z.string().min(1, "Value is required"),
});

export type AttendeeInput = z.infer<typeof attendeeSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type LookupInput = z.infer<typeof lookupSchema>;
