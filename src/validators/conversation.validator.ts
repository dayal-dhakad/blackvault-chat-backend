import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const accessConversationSchema = z.object({
  body: z.object({
    targetUserId: objectIdSchema
  }),
  query: z.object({}).default({}),
  params: z.object({}).default({})
});
