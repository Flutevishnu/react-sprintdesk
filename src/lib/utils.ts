
import type {Task, Priority, TaskStatus} from "../features/tasks/model";

export function makeTasks(): Task[] {
    return [
      {
        id: 1,
        name: 'Write report',
        description: 'Quarterly report',
        status: 'todo',
        priority: 'high',
        createdAt: new Date('2026-01-01T00:00:00Z'),
      },
      {
        id: 2,
        name: 'Review pull request',
        description: 'Check the new form',
        status: 'in_progress',
        priority: 'medium',
        createdAt: new Date('2026-01-02T00:00:00Z'),
      },
      {
        id: 3,
        name: 'Fix login bug',
        description: 'Users cannot sign in',
        status: 'done',
        priority: 'low',
        createdAt: new Date('2026-01-03T00:00:00Z'),
      },
    ];
  }
  

export const newTask: Task = {
    id: 4,
    name: 'Deploy app',
    description: 'Deploy to staging',
    status: 'todo',
    priority: 'medium',
    createdAt: new Date('2026-01-04T00:00:00Z'),
  };


export const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];
export const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

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
  


  