import { useState } from 'react';

export function BatchingExperiment() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  console.log('render, a =', a, ', b =', b);

  function updateBoth() {
    setA(a + 1);
    setB(b + 1);
    console.log('handler finished');
  }

  return (
    <div>
      <p>a: {a}, b: {b}</p>
      <button onClick={updateBoth}>Update a and b</button>
    </div>
  );
}