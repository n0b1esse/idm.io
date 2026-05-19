import { z } from "zod";

export const submitLeadSchema = z.object({
  form: z.string().min(1).max(64),
  name: z.string().trim().min(2).max(255),
  phone: z.string().trim().max(32).optional().nullable(),
  email: z
    .string()
    .trim()
    .max(255)
    .optional()
    .nullable()
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Invalid email"),
  contact: z.string().trim().max(255).optional().nullable(),
  service: z.string().trim().max(128).optional().nullable(),
  message: z.string().trim().max(5000).optional().nullable(),
  page: z.string().trim().max(512).optional().nullable(),
  utm_source: z.string().trim().max(128).optional().nullable(),
  utm_medium: z.string().trim().max(128).optional().nullable(),
  utm_campaign: z.string().trim().max(128).optional().nullable(),
  utm_content: z.string().trim().max(128).optional().nullable(),
  utm_term: z.string().trim().max(128).optional().nullable(),
});

export type SubmitLeadDto = z.infer<typeof submitLeadSchema>;
