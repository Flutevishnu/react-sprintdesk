import { Profiler, type ProfilerOnRenderCallback  } from 'react';
import TasksPage  from "../features/tasks";
import { RouteErrorBoundary } from '../shared/ui/RouteErrorBoundary';


const onRender: ProfilerOnRenderCallback = (id, phase, actualDuration, baseDuration) => {
  console.log(
    `[perf] ${id} ${phase} actual=${actualDuration.toFixed(1)}ms base=${baseDuration.toFixed(1)}ms`,
  );
};

function App() {
  return (
    <Profiler id="App" onRender={onRender}> 
      <RouteErrorBoundary>
        <TasksPage />
      </RouteErrorBoundary>
    </Profiler>
  );
}

export default App;