import type { Task, TaskAction } from './model';

export function TaskReducer(state: Task[], action: TaskAction) : Task[] {
    switch(action.type) {
        case "added": {
            return [...state, action.task];
        }
            
        case "updated": {
            return state.map((task) => task.id === action.id ? {...task, ...action.changes} : task);
        }
            
        case "deleted": {
            return state.filter((task) => task.id !== action.id);
        }

        case "status_moved":{
            return state.map((task) =>
                task.id == action.id ? {...task, status: action.status}: task
            );
        }
            
        case "toggled": {
            return state.map((task) =>
                task.id === action.id
                  ? { ...task, status: task.status === 'done' ? 'todo' : 'done' }
                  : task,
              );
        }

        default:  {
            const unhandled: never = action;
            return unhandled;
        }
    }
}