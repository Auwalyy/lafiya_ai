import { useEffect, useState, useCallback } from "react";

export function useQuery<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
}

export function useMutation<TArgs, TResult>(
  mutator: (args: TArgs) => Promise<TResult>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (args: TArgs): Promise<TResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutator(args);
      return result;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      return null;
    } finally {
      setLoading(false);
    }
  }, [mutator]);

  return { mutate, loading, error };
}
