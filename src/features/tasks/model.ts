export type TaskStatus = "todo" | "in_progress" | "done";
export type Priority = "low" | "medium" | "high";

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