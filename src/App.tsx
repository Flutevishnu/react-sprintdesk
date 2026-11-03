import { TasksPage } from './features/tasks/components/TasksPage';
import { RouteErrorBoundary } from './shared/ui/RouteErrorBoundary';

function App() {
  return (
    <RouteErrorBoundary>
      <TasksPage />
    </RouteErrorBoundary>
  );
}

export default App;