import { useContext, type Dispatch } from 'react';
import type { Task } from './model';
import { TasksContext, TasksDispatchContext } from './TasksContexts';
import type { TaskAction } from './model';

export function useTasks(): Task[] {
  const tasks = useContext(TasksContext);
  if (tasks === null) {
    throw new Error('useTasks must be used inside a <TasksProvider>');
  }
  return tasks;
}


export function useTasksDispatch(): Dispatch<TaskAction> {
  const dispatch = useContext(TasksDispatchContext);
  if (dispatch === null) {
    throw new Error('useTasksDispatch must be used inside a <TasksProvider>');
  }
  return dispatch;
}