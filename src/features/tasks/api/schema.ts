import * as z from "zod";
import { STATUSES, PRIORITIES } from "../model/types";

export const ZTask = z.object({
    id: z.number(),
    description: z.string().optional(),
    name: z.string(),
    status: z.enum(STATUSES),
    priority: z.enum(PRIORITIES),
    createdAt: z.iso.datetime(),
    assignee: z.string().optional()
})

const NAME_MIN = 3;
const NAME_MAX = 100;
const DESCRIPTION_MAX = 1000;
export const taskFormSchema = z.object({
    name: z
      .string()
      .trim()
      .min(NAME_MIN, `Title must be at least ${NAME_MIN} characters`)
      .max(NAME_MAX, `Title must be at most ${NAME_MAX} characters`),
    description: z.string().trim().max(DESCRIPTION_MAX, `Description must be at most ${DESCRIPTION_MAX} characters`).optional(),
    priority: z.enum(PRIORITIES),
    status: z.enum(STATUSES),
});

export const taskPatchSchema = taskFormSchema.partial();

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const ZfetchTask = z.array(ZTask);
export type TaskDto = z.infer<typeof ZTask>;


export function parseResponse<T>(schema: z.ZodType<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new Error(`Invalid API response: ${result.error.issues[0]?.message}`);
    }
    return result.data;
  }