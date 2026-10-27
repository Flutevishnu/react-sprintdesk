import { describe, expect, it } from 'vitest';
import type { Task, TaskAction } from './model';
import { TaskReducer} from './TasksProvider';
import { makeTasks, newTask } from '../../lib/utils';


describe('TaskReducer: added', () => {
    it("adds the task at the end of the list", () => {
        const result = TaskReducer(makeTasks(), {
            type: "added",
            task: newTask
        })
        expect(result).toHaveLength(4);
        expect(result[3]).toEqual(newTask)
    })

    it('keeps the existing tasks in the same order', () => {
        const state = makeTasks();
        const result = TaskReducer(state, { type: 'added', task: newTask });
     
        expect(result.slice(0, 3)).toEqual(state);
      });

    it('adds a task to an empty list', () => {
    const result = TaskReducer([], { type: 'added', task: newTask });
    
    expect(result).toEqual([newTask]);
    });
})




describe('tasksReducer: updated', () => {

    it('changes only the given fields of the matching task', () => {
      const result = TaskReducer(makeTasks(), {
        type: 'updated',
        id: 2,
        changes: { name: 'Review the form PR', priority: 'high' },
      });
   
      expect(result[1]).toEqual({
        ...makeTasks()[1],
        name: 'Review the form PR',
        priority: 'high',
      });
    });
   
    it('leaves the other tasks untouched (same object references)', () => {
      const state = makeTasks();
      const result = TaskReducer(state, {
        type: 'updated',
        id: 2,
        changes: { name: 'New name' },
      });
   
      expect(result[0]).toBe(state[0]);
      expect(result[2]).toBe(state[2]);
    });
   
    it('does nothing when the id does not exist', () => {
      const state = makeTasks();
      const result = TaskReducer(state, {
        type: 'updated',
        id: 999,
        changes: { name: 'Ghost' },
      });
   
      expect(result).toEqual(state);
    });
});



describe('tasksReducer: deleted', () => {

    it('removes the matching task', () => {
      const result = TaskReducer(makeTasks(), { type: 'deleted', id: 2 });
   
      expect(result.map((task) => task.id)).toEqual([1, 3]);
    });
   
    it('does nothing when the id does not exist', () => {
      const state = makeTasks();
      const result = TaskReducer(state, { type: 'deleted', id: 999 });
   
      expect(result).toEqual(state);
    });
});



describe('tasksReducer: status_moved', () => {
    
    it('sets the status of the matching task', () => {
      const result = TaskReducer(makeTasks(), {
        type: 'status_moved',
        id: 1,
        status: 'in_progress',
      });
   
      expect(result[0].status).toBe('in_progress');
    });
   
    it('does not change the other tasks', () => {
      const state = makeTasks();
      const result = TaskReducer(state, {
        type: 'status_moved',
        id: 1,
        status: 'done',
      });
   
      expect(result[1]).toBe(state[1]);
      expect(result[2]).toBe(state[2]);
    });
   
    it('does nothing when the id does not exist', () => {
      const state = makeTasks();
      const result = TaskReducer(state, {
        type: 'status_moved',
        id: 999,
        status: 'done',
      });
   
      expect(result).toEqual(state);
    });
});



describe('tasksReducer: toggled', () => {
    it('moves a todo task to done', () => {
      const result = TaskReducer(makeTasks(), { type: 'toggled', id: 1 });
   
      expect(result[0].status).toBe('done');
    });
   
    it('moves an in_progress task to done', () => {
      const result = TaskReducer(makeTasks(), { type: 'toggled', id: 2 });
   
      expect(result[1].status).toBe('done');
    });
   
    it('moves a done task back to todo', () => {
      const result = TaskReducer(makeTasks(), { type: 'toggled', id: 3 });
   
      expect(result[2].status).toBe('todo');
    });
   
    it('returns to the starting status after toggling a done task twice', () => {
      const once = TaskReducer(makeTasks(), { type: 'toggled', id: 3 });
      const twice = TaskReducer(once, { type: 'toggled', id: 3 });

      expect(twice[2].status).toBe('done');
    });
});
  



describe('tasksReducer: does not mutate its input', () => {
    const actions: [string, TaskAction][] = [
      ['added', { type: 'added', task: newTask }],
      ['updated', { type: 'updated', id: 1, changes: { name: 'Changed' } }],
      ['deleted', { type: 'deleted', id: 1 }],
      ['status_moved', { type: 'status_moved', id: 1, status: 'done' }],
      ['toggled', { type: 'toggled', id: 1 }],
    ];
   
    it.each(actions)('%s leaves the original state unchanged', (_name, action) => {
      const state = makeTasks();
      const snapshot = structuredClone(state);
   
      TaskReducer(state, action);
   
      expect(state).toEqual(snapshot);
    });
   
    it.each(actions)('%s returns a new array', (_name, action) => {
      const state = makeTasks();
   
      const result = TaskReducer(state, action);
   
      expect(result).not.toBe(state);
    });
   
    it.each(actions)('%s works on a frozen state without throwing', (_name, action) => {
      const state = Object.freeze(makeTasks()) as Task[];
   
      expect(() => TaskReducer(state, action)).not.toThrow();
    });
});
  






