import { useState } from 'react';

function Counter({ label }: { label: string }) {
  const [n, setN] = useState(0);
  return (
    <button onClick={() => setN(n + 1)}>
      {label}: {n}
    </button>
  );
}

export function PositionExperiment() {
  const [flag, setFlag] = useState(true);

  return (
    <div>
      <button onClick={() => setFlag(!flag)}>Toggle A / B</button>

      <h4>Same wrapper (identity by position)</h4>
      <div>{flag ? <Counter label="A" /> : <Counter label="B" />}</div>

      <h4>Different wrappers (div vs section)</h4>
      {flag ? (
        <div>
          <Counter label="A" />
        </div>
      ) : (
        <section>
          <Counter label="B" />
        </section>
      )}
    </div>
  );
}
