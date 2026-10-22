import { useState } from 'react';

function Draft({ label }: { label: string }) {
  const [text, setText] = useState('');
  return (
    <label>
      Draft for {label}:{' '}
      <input value={text} onChange={(e) => setText(e.target.value)} />
    </label>
  );
}

export function KeyResetExperiment() {
  const [user, setUser] = useState('Vishnu');

  return (
    <div>
      <button onClick={() => setUser(user === 'Vishnu' ? 'Vignesh' : 'Vishnu')}>
        Switch user
      </button>

      <h4>Without a key</h4>
      <Draft label={user} />

      <h4>With a key</h4>
      <Draft key={user} label={user} />
    </div>
  );
}