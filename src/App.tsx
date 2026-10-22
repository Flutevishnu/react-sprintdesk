// import { Experiments } from './experiments/Experiments';
import { BrokenTaskList, type Task } from './features/tasks/components/BrokenTaskList';

const sampleTasks: Task[] = [
  { id: 't1', title: 'Write defects doc', done: false, priority: 'low' },
  { id: 't2', title: 'Fix state mutation', done: false, priority: 'high' },
  { id: 't3', title: 'Set up Vitest', done: true, priority: 'medium' },
  { id: 't4', title: 'Push to GitHub', done: false, priority: 'high' },
];


function App() {
  return <BrokenTaskList initialTasks={sampleTasks}/>;
  // return <Experiments />;
}

export default App;
