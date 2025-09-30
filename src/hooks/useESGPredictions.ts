import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { apiFetch } from '@/lib/api';

export type Prediction = {
  actual_esg_score: number;
  predicted_esg_score: number;
  [key: string]: string | number;
};

export function useESGPredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/predict-csv', {
      method: 'POST',
      // Send a default CSV file or empty body if backend supports it
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch predictions');
        return response.json();
      })
      .then((data) => {
        setPredictions(data as Prediction[]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { predictions, loading, error };
}
