import { useState } from 'react';
import { SnapshotExperiment } from './SnapshotExperiment';
import { BatchingExperiment } from './BatchingExperiment';
import { KeyResetExperiment } from './KeyResetExperiment';
import { PositionExperiment } from './PositionExperiment';
import { StrictModeExperiment } from './StrictModeExperiment';

const EXPERIMENTS = {
  '1 State snapshot': SnapshotExperiment,
  '2 Batching': BatchingExperiment,
  '3 Key reset': KeyResetExperiment,
  '4 Identity by position': PositionExperiment,
  '5 Strict Mode': StrictModeExperiment,
};

export function Experiments() {
  const [name, setName] = useState<keyof typeof EXPERIMENTS>('4 Identity by position');
  const Current = EXPERIMENTS[name];

  return (
    <section>
      <label>
        Experiment:{' '}
        <select
          value={name}
          onChange={(e) => setName(e.target.value as keyof typeof EXPERIMENTS)}
        >
          {Object.keys(EXPERIMENTS).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </label>
      <Current />
    </section>
  );
}
