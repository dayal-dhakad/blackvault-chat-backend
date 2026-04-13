import { z } from "zod";

export const searchUsersSchema = z.object({
  body: z.object({}).default({}),
  query: z.object({
    q: z.string().min(1).max(100)
  }),
  params: z.object({}).default({})
});
