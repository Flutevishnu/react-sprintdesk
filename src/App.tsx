import { TasksProvider } from './features/tasks/TasksProvider';
import { TaskListView } from './features/tasks/components/TaskListView';
import { AddTaskForm } from './features/tasks/components/AddTaskForm';
import { RouteErrorBoundary } from './shared/ui/RouteErrorBoundary';

function App() {
  return (
    <TasksProvider>
      <TaskListView />
      <RouteErrorBoundary>
        <AddTaskForm />
      </RouteErrorBoundary>
    </TasksProvider>
  );
}

export default App;