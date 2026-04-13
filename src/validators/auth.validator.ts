import { z } from "zod";

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password cannot exceed 128 characters");

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(60),
    email: z.string().email(),
    password: passwordSchema,
    avatar: z.string().url().optional()
  }),
  query: z.object({}).default({}),
  params: z.object({}).default({})
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: passwordSchema
  }),
  query: z.object({}).default({}),
  params: z.object({}).default({})
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1)
  }),
  query: z.object({}).default({}),
  params: z.object({}).default({})
});
