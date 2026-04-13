import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const getMessagesSchema = z.object({
  body: z.object({}).default({}),
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional()
  }),
  params: z.object({
    conversationId: objectIdSchema
  })
});

export const sendMessageSchema = z.object({
  body: z
    .object({
      conversationId: objectIdSchema.optional(),
      receiverId: objectIdSchema,
      text: z.string().trim().min(1).max(5000),
      type: z.enum(["text"]).default("text")
    })
    .refine((data) => Boolean(data.receiverId), {
      message: "receiverId is required",
      path: ["receiverId"]
    }),
  query: z.object({}).default({}),
  params: z.object({}).default({})
});

export const markReadSchema = z.object({
  body: z.object({}).default({}),
  query: z.object({}).default({}),
  params: z.object({
    messageId: objectIdSchema
  })
});
