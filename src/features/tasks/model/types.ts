import {type TaskFormValues } from "../api/schema";
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

export type NewTaskInput = Omit<Task, "id" | "createdAt">;

export type TaskChanges = Partial<Omit<Task, "id" | "createdAt">>;



export const STATUS_LABELS: Record<TaskStatus, string> = {
    todo: 'To do',
    in_progress: 'In progress',
    done: 'Done',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
};

export type SortKey = 'priority' | 'date';
  
export type PendingAction =
  | { kind: 'delete'; id: number }
  | { kind: 'complete'; id: number }
  | { kind: 'complete-edit'; id: number; values: TaskFormValues };