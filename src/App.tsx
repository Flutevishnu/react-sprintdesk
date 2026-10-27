import { TasksProvider } from './features/tasks/TasksProvider';
import { TaskListView } from './features/tasks/components/TaskListView';

function App() {
  return (
    <TasksProvider>
      <TaskListView />
    </TasksProvider>
  );
}

export default App;