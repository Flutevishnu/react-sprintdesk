
import { useEffect, useState } from 'react';

// Expected: shows "Online" or "Offline" and stays correct as the browser goes offline and back
// online. Mounting and unmounting the component many times must not leave listeners behind.
export function ConnectionStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);

    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };

  }, []);

  return <p role="status">{online ? 'Online' : 'Offline'}</p>;
}

// Expected: while running, the counter increases by 1 every second (0, 1, 2, 3, ...).
// "Stop" pauses it and "Start" resumes from the current value.
export function FocusTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((s) => s+1);
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div>
      <p>{seconds}s focused</p>
      <button type="button" onClick={() => setRunning((r) => !r)}>
        {running ? 'Stop' : 'Start'}
      </button>
    </div>
  );
}

interface TaskSummary {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
}

// Expected: lists the tasks whose title contains the query (case-insensitive) and shows how many
// match. Typing must stay responsive, and the component must not re-render in a loop.
export function TaskQuickFind({ tasks }: { tasks: TaskSummary[] }) {
  const [query, setQuery] = useState('');


  const normalizedQuery = query.trim().toLowerCase();
  const matches = tasks.filter((t) => t.title.toLowerCase().includes(normalizedQuery));

  // const [matches, setMatches] = useState<TaskSummary[]>([]);
  // const options = { query: query.trim().toLowerCase() };

  // useEffect(() => {
  //   setMatches(tasks.filter((t) => t.title.toLowerCase().includes(options.query)));
  // }, [tasks, options]);

  return (
    <div>
      <label htmlFor="quick-find">Find a task</label>
      <input id="quick-find" value={query} onChange={(e) => setQuery(e.target.value)} />
      <p>{matches.length} matching</p>
      <ul>
        {matches.map((t) => (
          <li key={t.id}>{t.title}</li>
        ))}
      </ul>
    </div>
  );
}