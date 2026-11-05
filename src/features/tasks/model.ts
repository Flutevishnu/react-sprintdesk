export const STATUSES = ['todo', 'in_progress', 'done'] as const;
export type TaskStatus = (typeof STATUSES)[number];

export const PRIORITIES = ['low', 'medium', 'high'] as const;
export type Priority = (typeof PRIORITIES)[number];

export interface Task {
    readonly id : number,
    description? : string,
    name : string,
    status : TaskStatus,
    priority : Priority,
    readonly createdAt : Date,
    assignee? : string
}

export type NewTaskInput = Omit<Task, "id" | "status" | "createdAt">;

export type TaskChanges = Partial<Omit<Task, "id" | "createdAt">>;

export type TaskAction = {type: "added", task: Task} 
                        | { type: 'updated'; id: number; changes: TaskChanges } 
                        | { type: 'deleted'; id: number } 
                        | { type: 'status_moved'; id: number; status: TaskStatus }
                        | { type: 'toggled'; id: number };


type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';


export interface RequestOptions {
    method?: HttpMethod;
    body?: unknown;
    signal?: AbortSignal;
}
