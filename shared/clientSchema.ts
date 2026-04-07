import { z } from "zod";

export const ClientSchema = z.object({
  id: z.number().int().positive(),
  full_name: z.string().min(1, "Full name is required"),
  email: z.email("Must be a valid email"),
  phone: z.string().nullable(),
  company: z.string().min(1, "Company is required"),
  created_at: z.string().nullable(),
});

export const ClientInputSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.email("Must be a valid email"),
  phone: z.string().optional().nullable(),
  company: z.string().min(1, "Company is required"),
});

export type Client = z.infer<typeof ClientSchema>;
export type ClientInput = z.infer<typeof ClientInputSchema>;
