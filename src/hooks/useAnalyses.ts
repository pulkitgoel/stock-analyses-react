import { useState, useEffect } from 'react';
import { Analysis } from '../types/analysis';
import { fetchAnalyses } from '../services/analysisService';

export function useAnalyses() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyses()
      .then(setAnalyses)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { analyses, loading, error };
}
