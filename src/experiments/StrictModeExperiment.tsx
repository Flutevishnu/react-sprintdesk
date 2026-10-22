import { useEffect } from 'react';

export function StrictModeExperiment() {
  console.log('[5] render');
  useEffect(() => {
    console.log('[5] effect ran');
    return () => console.log('[5] effect cleanup');
  }, []);
  return <p>Strict mode Test.</p>;
}
