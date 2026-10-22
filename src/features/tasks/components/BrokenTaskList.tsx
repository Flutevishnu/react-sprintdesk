import { useState, type FormEvent } from 'react'; 

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: Priority;
}

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

interface BrokenTaskListProps {
  initialTasks: Task[];
}

export function BrokenTaskList({ initialTasks }: BrokenTaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [title, setTitle] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const completedCount = tasks.filter((t) => t.done).length; // D1
  const visibleTasks = showCompleted ? tasks : tasks.filter((t) => !t.done); // D2


  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (title.trim().length < 3) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      done: false,
      priority: 'medium',
    }; 
    setTasks([...tasks, newTask]); 
    setTitle('');
  }

  function toggleTask(id: string) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function deleteTask(id: string) {
    setTasks(tasks.filter((t) => t.id !== id));
  }

  function sortByPriority() {
    setTasks([...tasks].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]));
  }

  return (
    <section aria-labelledby="tasks-heading">
      <h2 id="tasks-heading">Tasks</h2>
      <p>
        {completedCount} of {tasks.length} completed
      </p>

      <form onSubmit={addTask}>
        <label htmlFor="new-task">New task</label>
        <input id="new-task" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button type="submit">Add</button>
      </form>

      <label>
        <input type="checkbox" checked={showCompleted} onChange={(e) => setShowCompleted(e.target.checked)} />
        Show completed
      </label>
      <button type="button" onClick={sortByPriority}>
        Sort by priority
      </button>

      <ul>
        {visibleTasks.map((task) => (
          <li key={task.id}>
            <input
              type="checkbox"
              aria-label={`Complete ${task.title}`}
              checked={task.done}
              onChange={() => toggleTask(task.id)}
            />
            <span>{task.title}</span> <small>({task.priority})</small>
            <input aria-label={`Notes for ${task.title}`} placeholder="Notes" />
            <button type="button" onClick={() => deleteTask(task.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}


























