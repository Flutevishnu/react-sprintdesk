import { useEffect, useState } from 'react';
import { http, isAbortError } from '../shared/api/http';

export interface Item {
  id: number;
  name: string;
}

interface SearchProps {
  query: string;
}

export function NaiveSearch({ query }: SearchProps) {
  const [results, setResults] = useState<Item[]>([]);

  useEffect(() => {
    http
      .get<Item[]>(`/api/search?q=${encodeURIComponent(query)}`)
      .then(setResults);
  }, [query]);

  return (
    <ul>
      {results.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}


export function FixedSearch({ query }: SearchProps) {
  const [results, setResults] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    http
      .get<Item[]>(
        `/api/search?q=${encodeURIComponent(query)}`,
        controller.signal,
      )
      .then((items) => {
        setResults(items);
        setError(null);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setError(err instanceof Error ? err.message : 'Something went wrong');
      });

    return () => controller.abort();
  }, [query]);

  return (
    <div>
      {error && <p role="alert">{error}</p>}
      <ul>
        {results.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}