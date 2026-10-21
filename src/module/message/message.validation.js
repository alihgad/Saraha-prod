import { z } from "zod";
import { GF } from "../../common/index.js";

export const sendMessageSchema = (lang) => z.object({
  body: z.object({
    content: z.string().min(5).max(5000).optional(),
    receiverId: GF.id(lang),
    senderId: GF.id(lang).optional()
  }),
  files: z.array(GF.file(lang)).optional()
})