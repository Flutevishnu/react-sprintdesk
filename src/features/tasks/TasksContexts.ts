import { createContext, type Dispatch } from 'react';
import type { Task } from './model';
import type { TaskAction } from './model';



export const TasksContext = createContext<Task[] | null>(null);
export const TasksDispatchContext = createContext<Dispatch<TaskAction> | null>(null);


