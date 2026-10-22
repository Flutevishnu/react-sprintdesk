import { useState } from 'react';

export function SnapshotExperiment() {
  const [count, setCount] = useState(0);
  console.log('render, count =', count);

  function addThreeWrong() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    console.log('right after setCount, count is still', count);
  }

  function addThreeRight() {
    setCount((c) => c + 1);
    setCount((c) => c + 1);
    setCount((c) => c + 1);
  }

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={addThreeWrong}>+3 (count + 1, three times)</button>
      <button onClick={addThreeRight}>+3 (updater function)</button>
    </div>
  );
}