import * as z from "zod";
import { STATUSES, PRIORITIES } from "../../features/tasks/model";

export const ZTask = z.object({
    id: z.number(),
    description: z.string().optional(),
    name: z.string(),
    status: z.enum(STATUSES),
    priority: z.enum(PRIORITIES),
    createdAt: z.iso.datetime(),
    assignee: z.string().optional()
})


export const ZfetchTask = z.array(ZTask);
export type TaskDto = z.infer<typeof ZTask>;


export function parseResponse<T>(schema: z.ZodType<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new Error(`Invalid API response: ${result.error.issues[0]?.message}`);
    }
    return result.data;
  }